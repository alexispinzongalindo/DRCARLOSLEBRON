#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { decrypt } from '../src/lib/encryption.js';

const DATABASE_URL = process.env.DATABASE_URL;
const RESEND_API_KEY = process.env.VITE_RESEND_API_KEY;

if (!DATABASE_URL || !RESEND_API_KEY) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// Create PostgreSQL client for Render
import pkg from 'pg';
const { Client } = pkg;

async function sendEmailReminders() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Get appointments for tomorrow (48 hours ahead)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const query = `
      SELECT 
        a.id,
        a.patient_id,
        a.staff_id,
        a.appointment_date,
        a.start_time,
        a.end_time,
        a.type,
        a.reminder_email_sent,
        p.first_name_encrypted,
        p.last_name_encrypted,
        p.email_encrypted,
        s.first_name as staff_first_name,
        s.last_name as staff_last_name,
        f.name as facility_name,
        f.address as facility_address,
        f.phone as facility_phone
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN staff s ON a.staff_id = s.id
      JOIN facilities f ON a.facility_id = f.id
      WHERE a.appointment_date = $1
        AND a.reminder_email_sent = false
        AND p.email_encrypted IS NOT NULL
    `;

    const result = await client.query(query, [tomorrowStr]);
    const appointments = result.rows;

    if (appointments.length === 0) {
      console.log('No appointments found for email reminders');
      return;
    }

    let sentCount = 0;
    const errors = [];

    for (const appointment of appointments) {
      try {
        // Decrypt patient information
        const patientEmail = decrypt(appointment.email_encrypted);
        const patientName = `${decrypt(appointment.first_name_encrypted)} ${decrypt(appointment.last_name_encrypted)}`;
        
        if (!patientEmail) continue;

        // Format appointment time
        const appointmentTime = new Date(`${appointment.appointment_date}T${appointment.start_time}`);
        const timeStr = appointmentTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        const dateStr = appointmentTime.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        // Send email via Resend
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Optimum Therapy <noreply@optimumtherapy.pr>',
            to: [patientEmail],
            subject: 'Recordatorio de Cita / Appointment Reminder - Optimum Therapy',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #3B82F6; color: white; padding: 20px; text-align: center;">
                  <h1>Optimum Therapy</h1>
                  <p>Recordatorio de Cita / Appointment Reminder</p>
                </div>
                
                <div style="padding: 20px;">
                  <h2>Estimado/a ${patientName} / Dear ${patientName},</h2>
                  
                  <p><strong>Español:</strong><br>
                  Le recordamos que tiene una cita programada para mañana en Optimum Therapy.</p>
                  
                  <p><strong>English:</strong><br>
                  This is a reminder that you have an appointment scheduled for tomorrow at Optimum Therapy.</p>
                  
                  <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3>Detalles de la Cita / Appointment Details:</h3>
                    <p><strong>Fecha / Date:</strong> ${dateStr}</p>
                    <p><strong>Hora / Time:</strong> ${timeStr}</p>
                    <p><strong>Terapeuta / Therapist:</strong> ${appointment.staff_first_name} ${appointment.staff_last_name}</p>
                    <p><strong>Tipo / Type:</strong> ${appointment.type || 'Physical Therapy'}</p>
                  </div>
                  
                  <div style="background-color: #EFF6FF; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3>Ubicación / Location:</h3>
                    <p><strong>${appointment.facility_name}</strong></p>
                    <p>${appointment.facility_address}</p>
                    <p>Teléfono / Phone: ${appointment.facility_phone}</p>
                  </div>
                  
                  <div style="background-color: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3>Instrucciones Importantes / Important Instructions:</h3>
                    <ul>
                      <li><strong>Español:</strong> Por favor llegue 15 minutos antes de su cita</li>
                      <li><strong>English:</strong> Please arrive 15 minutes before your appointment</li>
                      <li><strong>Español:</strong> Traiga su identificación y tarjeta de seguro</li>
                      <li><strong>English:</strong> Bring your ID and insurance card</li>
                      <li><strong>Español:</strong> Use ropa cómoda para ejercicios</li>
                      <li><strong>English:</strong> Wear comfortable exercise clothing</li>
                    </ul>
                  </div>
                  
                  <p><strong>Español:</strong> Si necesita cancelar o reprogramar, por favor llámenos al ${appointment.facility_phone} con al menos 24 horas de anticipación.</p>
                  
                  <p><strong>English:</strong> If you need to cancel or reschedule, please call us at ${appointment.facility_phone} at least 24 hours in advance.</p>
                  
                  <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
                    <p style="color: #6B7280; font-size: 12px;">
                      Optimum Therapy - Terapia Física Profesional<br>
                      ${appointment.facility_address}<br>
                      ${appointment.facility_phone}
                    </p>
                  </div>
                </div>
              </div>
            `
          })
        });

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          throw new Error(`Resend API error: ${errorText}`);
        }

        // Mark email as sent
        await client.query(
          'UPDATE appointments SET reminder_email_sent = true WHERE id = $1',
          [appointment.id]
        );

        sentCount++;
        console.log(`Email sent to ${patientName} for appointment ${appointment.id}`);

      } catch (error) {
        console.error(`Failed to send email reminder for appointment ${appointment.id}:`, error);
        errors.push(`Appointment ${appointment.id}: ${error.message}`);
      }
    }

    console.log(`Email reminders completed: ${sentCount}/${appointments.length} sent`);
    if (errors.length > 0) {
      console.error('Errors:', errors);
    }

  } catch (error) {
    console.error('Email reminder script error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the script
sendEmailReminders().catch(console.error);
