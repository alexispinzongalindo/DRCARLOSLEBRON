import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured')
    }

    const { messages, context } = await req.json()

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

You can help with:
- Answering questions about the clinic schedule and patients
- Drafting SOAP clinical notes (ask for patient name, diagnosis, treatment)
- Suggesting ICD-10 and CPT codes for physical therapy
- Helping document patient progress
- Answering physical therapy clinical questions
- Explaining app features and navigation
- Spanish or English — match the language of the user

Be concise, professional, and clinically accurate. You are HIPAA-aware — never store or repeat sensitive patient info beyond what's needed for the task.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Claude API error: ${err}`)
    }

    const data = await response.json()

    return new Response(
      JSON.stringify({ content: data.content[0].text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('AI assistant error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
