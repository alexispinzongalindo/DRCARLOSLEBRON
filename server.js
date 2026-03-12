import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

// AI proxy endpoint
app.post('/api/ai-chat', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'AI not configured' });
  }

  try {
    const { messages, context } = req.body;

    const isSpanish = context?.lang === 'es';

    const systemPrompt = `${isSpanish
      ? 'INSTRUCCIÓN CRÍTICA DE IDIOMA: Responde SIEMPRE y ÚNICAMENTE en español, sin excepción. No importa el idioma en que el usuario escriba — tu respuesta DEBE ser completamente en español. Nunca mezcles inglés y español en la misma respuesta.'
      : 'CRITICAL LANGUAGE INSTRUCTION: Always respond in English only. Do not mix languages.'}

You are OptimumAI, the intelligent assistant and trainer for Optimum Therapy — a physical therapy clinic in Aguadilla, Puerto Rico, operated by Dr. Carlos Lebron-Quiñones PT DPT.

You are embedded inside the clinic's management app.

CLINIC: Optimum Therapy | Edificio Roman Carr 107 km 1.1, Aguadilla PR 00603 | (787) 930-0174
NPI: 1477089696 | PT License: 4521 | PTAN: LG520

CURRENT SESSION:
- User: ${context?.userName ?? 'Staff'} (${context?.userRole ?? 'staff'})
- Page: ${context?.currentPage ?? 'dashboard'}
- Date: ${context?.today ?? new Date().toLocaleDateString('en-US')}
- Today's appointments: ${context?.appointmentCount ?? 0}
- Pending notes: ${context?.pendingNotes ?? 0}
- Active patients: ${context?.activePatients ?? 0}
- Training mode: ${context?.trainingMode ? 'YES — provide detailed step-by-step visual walkthroughs' : 'standard'}
- Active language: ${isSpanish ? 'ESPAÑOL — respond in Spanish only' : 'ENGLISH — respond in English only'}

APP FEATURES (8 sections in top nav):
Dashboard | Patients | Appointments | Time Clock | Reminders | Staff | Payroll | Training
+ EN/ES language toggle in header
+ OptimumAI assistant: floating lightbulb button, bottom-right of every screen

KEY FEATURE NOTES:
- APPOINTMENTS: Clicking any appointment opens the full edit form pre-filled with all existing data.
- REMINDERS: Shows next 7 days. Red=within 2h, Yellow=within 24h, Blue=24h+. SMS (ClickSend), email, or call.
- TIME CLOCK: Clock In → Start Break → End Break → Clock Out. Feeds payroll automatically.
- PAYROLL: 3-step wizard. Regular ≤40h/wk, overtime >40h at 1.5×. Status: Draft → Approved → Paid.

CPT CODES: 97110 Therapeutic Exercise | 97112 Neuromuscular Reeducation | 97116 Gait Training | 97530 Therapeutic Activities | 97140 Manual Therapy | 97161/97162/97163 PT Eval | 97164 PT Re-eval | 97035 Ultrasound | 97014 E-Stim | 97010 Hot/Cold Packs

You can help with ANYTHING: SOAP notes, ICD-10/CPT codes, patient letters, insurance appeals, billing, staff training, HIPAA, scheduling, payroll, and any clinic workflow.

TRAINING MODE: When asked to train on a feature, give numbered step-by-step walkthroughs describing what the user sees and exactly what to click.

${isSpanish
  ? 'RECUERDA: Toda tu respuesta debe ser en español. Esto incluye instrucciones paso a paso, nombres de botones, términos clínicos y cualquier otra parte del texto.'
  : 'REMEMBER: Your entire response must be in English.'}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: err });
    }

    const data = await response.json();
    res.json({ content: data.content[0].text });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ClickSend SMS
app.post('/api/sms/send', async (req, res) => {
  const { to, message } = req.body;
  const username = process.env.CLICKSEND_USERNAME;
  const apiKey = process.env.CLICKSEND_API_KEY;

  if (!username || !apiKey) {
    return res.status(500).json({ error: 'SMS not configured' });
  }

  try {
    const credentials = Buffer.from(`${username}:${apiKey}`).toString('base64');
    const response = await fetch('https://rest.clicksend.com/v3/sms/send', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{
          source: 'optimum-therapy',
          from: 'OptimumPT',
          body: message,
          to: to,
        }]
      }),
    });

    const data = await response.json();
    if (data.response_code === 'SUCCESS') {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: data.response_msg || 'SMS failed' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Resend Email
app.post('/api/email/send', async (req, res) => {
  const { to, subject, message } = req.body;
  const apiKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Email not configured' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Optimum Therapy <noreply@optimumtherapypr.com>',
        to: [to],
        subject: subject || 'Appointment Reminder - Optimum Therapy',
        text: message,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      res.json({ success: true, id: data.id });
    } else {
      res.status(400).json({ error: data.message || 'Email failed' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Google OAuth token exchange
app.post('/api/google/auth/token', async (req, res) => {
  const { code } = req.body;
  const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.VITE_GOOGLE_REDIRECT_URI;

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(400).json({ error: err });
    }

    const data = await response.json();
    res.json({ access_token: data.access_token, refresh_token: data.refresh_token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Google OAuth token refresh
app.post('/api/google/auth/refresh', async (req, res) => {
  const { refresh_token } = req.body;
  const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token,
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
      }),
    });

    const data = await response.json();
    res.json({ access_token: data.access_token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve static files
app.use(express.static(join(__dirname, 'dist')));

// SPA fallback
app.get('/{*splat}', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Optimum Therapy running on port ${PORT}`);
});
