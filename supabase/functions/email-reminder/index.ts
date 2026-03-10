import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AppointmentReminder {
  id: string;
  patient_id: string;
  staff_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  type: string;
  patient_name: string;
  patient_email: string;
  staff_name: string;
  facility_name: string;
  facility_address: string;
  facility_phone: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get appointments for tomorrow (48 hours ahead)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 2)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    // Query appointments with patient and staff details
    const { data: appointments, error: appointmentsError } = await supabaseClient
      .from('appointments')
      .select(`
        id,
        patient_id,
        staff_id,
        appointment_date,
        start_time,
        end_time,
        type,
        reminder_email_sent,
        patients!inner (
          first_name_encrypted,
          last_name_encrypted,
          email_encrypted
        ),
        staff!inner (
          first_name,
          last_name
        ),
        facilities!inner (
          name,
          address,
          phone
        )
      `)
      .eq('appointment_date', tomorrowStr)
      .eq('reminder_email_sent', false)
      .not('patients.email_encrypted', 'is', null)

    if (appointmentsError) {
      throw appointmentsError
    }

    if (!appointments || appointments.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No appointments found for email reminders' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured')
    }

    let sentCount = 0
    const errors: string[] = []

    for (const appointment of appointments) {
      try {
        // Decrypt patient email (in production, implement proper decryption)
        const patientEmail = appointment.patients.email_encrypted // TODO: Decrypt
        const patientName = `${appointment.patients.first_name_encrypted} ${appointment.patients.last_name_encrypted}` // TODO: Decrypt
        
        if (!patientEmail) continue

        // Format appointment time
        const appointmentTime = new Date(`${appointment.appointment_date}T${appointment.start_time}`)
        const timeStr = appointmentTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
        const dateStr = appointmentTime.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })

        // Send email via Resend
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
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
                    <p><strong>Terapeuta / Therapist:</strong> ${appointment.staff.first_name} ${appointment.staff.last_name}</p>
                    <p><strong>Tipo / Type:</strong> ${appointment.type || 'Physical Therapy'}</p>
                  </div>
                  
                  <div style="background-color: #EFF6FF; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3>Ubicación / Location:</h3>
                    <p><strong>${appointment.facilities.name}</strong></p>
                    <p>${appointment.facilities.address}</p>
                    <p>Teléfono / Phone: ${appointment.facilities.phone}</p>
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
                  
                  <p><strong>Español:</strong> Si necesita cancelar o reprogramar, por favor llámenos al ${appointment.facilities.phone} con al menos 24 horas de anticipación.</p>
                  
                  <p><strong>English:</strong> If you need to cancel or reschedule, please call us at ${appointment.facilities.phone} at least 24 hours in advance.</p>
                  
                  <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
                    <p style="color: #6B7280; font-size: 12px;">
                      Optimum Therapy - Terapia Física Profesional<br>
                      ${appointment.facilities.address}<br>
                      ${appointment.facilities.phone}
                    </p>
                  </div>
                </div>
              </div>
            `
          })
        })

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text()
          throw new Error(`Resend API error: ${errorText}`)
        }

        // Mark email as sent
        await supabaseClient
          .from('appointments')
          .update({ reminder_email_sent: true })
          .eq('id', appointment.id)

        sentCount++

      } catch (error) {
        console.error(`Failed to send email reminder for appointment ${appointment.id}:`, error)
        errors.push(`Appointment ${appointment.id}: ${error.message}`)
      }
    }

    return new Response(
      JSON.stringify({
        message: `Email reminders processed`,
        sent: sentCount,
        total: appointments.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Email reminder function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
