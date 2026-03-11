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

    const systemPrompt = `You are OptimumAI, the intelligent assistant for Optimum Therapy — a physical therapy clinic in Aguadilla, Puerto Rico.

You are embedded inside the clinic's management app used by Dr. Carlos Lebron and staff.

Current context:
- Clinic: Optimum Therapy, Edificio Roman Carr 107 km 1.1, Aguadilla PR 00603
- Current user: ${context?.userName ?? 'Staff'} (${context?.userRole ?? 'staff'})
- Current page: ${context?.currentPage ?? 'dashboard'}
- Today's date: ${context?.today ?? new Date().toLocaleDateString('en-US')}
- Today's appointments: ${context?.appointmentCount ?? 0}
- Pending clinical notes: ${context?.pendingNotes ?? 0}
- Active patients: ${context?.activePatients ?? 0}

You can help with ANYTHING the clinic needs, including:

CLINICAL:
- Draft SOAP notes (ask for patient name, diagnosis, treatment performed)
- Suggest ICD-10 and CPT codes for physical therapy
- Document patient progress and functional goals
- Answer physical therapy clinical questions

CLERICAL & ADMIN:
- Draft patient letters (discharge summaries, referral letters, authorization requests, missed appointment notices)
- Write professional emails to insurance companies, doctors, or patients
- Create intake forms, consent forms, or policy documents
- Draft clinic announcements or notices

STAFF TRAINING:
- Create training materials and quizzes for front desk, billing, or therapy staff
- Explain HIPAA policies, billing procedures, or clinic protocols
- Generate onboarding checklists for new employees
- Answer questions about PT regulations in Puerto Rico

BILLING & PAYMENTS:
- Help identify correct CPT codes and modifiers for billing
- Draft appeal letters for denied insurance claims
- Explain Medicare/Medicaid PT billing rules
- Create a list of outstanding items or reminders for bills to pay
- Help write prior authorization requests

GENERAL:
- Answer questions about the clinic schedule
- Summarize or organize information
- Translate between English and Spanish
- Draft any document the clinic needs

Always respond in the same language the user writes in (English or Spanish).
Be professional, efficient, and practical — you are a full clinic assistant, not just a clinical tool.`;

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

// Serve static files
app.use(express.static(join(__dirname, 'dist')));

// SPA fallback
app.get('/{*splat}', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Optimum Therapy running on port ${PORT}`);
});
