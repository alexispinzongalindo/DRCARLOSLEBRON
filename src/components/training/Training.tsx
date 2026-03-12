import React, { useState } from 'react';
import { useLanguage } from '../../lib/i18n';

type Section = 'overview' | 'dashboard' | 'patients' | 'appointments' | 'timeclock' | 'reminders' | 'staff' | 'payroll' | 'optimumai';

const CONTENT = {
  en: {
    sidebarTitle: 'Training',
    sidebarSubtitle: 'User Manual',
    nav: [
      { id: 'overview' as Section,      label: 'Overview',        icon: '📋' },
      { id: 'dashboard' as Section,     label: 'Dashboard',       icon: '🏠' },
      { id: 'patients' as Section,      label: 'Patients',        icon: '👥' },
      { id: 'appointments' as Section,  label: 'Appointments',    icon: '📅' },
      { id: 'timeclock' as Section,     label: 'Time Clock',      icon: '⏱' },
      { id: 'reminders' as Section,     label: 'Reminders',       icon: '🔔' },
      { id: 'staff' as Section,         label: 'Staff',           icon: '🧑‍⚕️' },
      { id: 'payroll' as Section,       label: 'Payroll',         icon: '💰' },
      { id: 'optimumai' as Section,     label: 'OptimumAI Guide', icon: '🤖' },
    ],
    overview: {
      title: 'User Manual — Optimum Therapy',
      subtitle: 'Complete guide to using all features of the clinic management system',
      intro: 'Welcome to',
      introName: 'Optimum Therapy',
      introRest: '— the all-in-one clinic management platform for Dr. Carlos Lebron-Quiñones PT DPT. This manual walks you through every section of the system. Use the left menu to jump to any topic.',
      features: [
        { icon: '🏠', title: 'Dashboard',    desc: 'Daily overview, stats, and quick actions' },
        { icon: '👥', title: 'Patients',     desc: 'Register, search, and manage patient records' },
        { icon: '📅', title: 'Appointments', desc: 'Schedule and track appointments on a calendar' },
        { icon: '⏱',  title: 'Time Clock',  desc: 'Staff clock in/out and break tracking' },
        { icon: '🔔', title: 'Reminders',   desc: 'Send SMS, email, or call reminders to patients' },
        { icon: '🧑‍⚕️', title: 'Staff',    desc: 'Manage employees, roles, and licenses' },
        { icon: '💰', title: 'Payroll',     desc: 'Generate and approve payroll from time entries' },
        { icon: '🤖', title: 'OptimumAI',  desc: 'AI assistant — ask anything, anytime' },
        { icon: '🌐', title: 'EN / ES',    desc: 'Language toggle — switch the entire app between English and Spanish instantly' },
      ],
      rolesTitle: 'User Roles & Permissions',
      roles: [
        { role: 'Admin',      desc: 'Full access to all sections including staff and payroll' },
        { role: 'Therapist',  desc: 'Patients, appointments, encounters, SOAP notes, time clock' },
        { role: 'Front Desk', desc: 'Patients, appointments, reminders, time clock' },
        { role: 'Billing',    desc: 'Patient records, insurance data, payroll review' },
      ],
      aiTip: 'The OptimumAI assistant (lightbulb button, bottom-right) is available on every screen. You can type or speak your question at any time — no need to navigate to a specific page first.',
      langTip: 'The EN/ES toggle in the header switches the entire app — all menus, labels, forms, and AI responses — between English and Spanish. Your language preference is saved automatically.',
    },
    dashboard: {
      subtitle: 'Your daily command center — everything at a glance',
      step1Title: 'Reading the Summary Cards',
      step1Intro: 'The four cards at the top show your current clinic status:',
      card1: "Today's Appointments", card1Desc: 'total appointments scheduled for today',
      card2: 'Pending Notes',        card2Desc: 'encounters that still need a SOAP note completed',
      card3: 'Active Patients',      card3Desc: 'total non-deleted patients in the system',
      card4: 'Sync Status',          card4Desc: 'whether the app is connected to the network (On Line / Off Line)',
      step2Title: "Today's Appointments Panel",
      step2Intro: 'Shows up to 5 appointments for today. Each entry displays:',
      step2Li1: 'Patient name, time range, and appointment type',
      step2Li2: 'Color-coded status badge: confirmed (green), scheduled (blue), checked in (yellow), completed (gray), cancelled / no-show (red)',
      step3Title: 'Pending Notes Panel (Therapist / Admin only)',
      step3Text: 'Lists encounters that have not yet been documented. Click Complete to open the SOAP note form directly.',
      step4Title: 'Quick Actions',
      step4Text: 'Use the New Patient and New Appointment buttons in the top-right of the dashboard to create records without leaving the home screen.',
      tip: 'If Sync Status shows "Off Line", data is saved locally and will sync automatically once the connection is restored.',
    },
    patients: {
      subtitle: 'Register new patients, search records, and manage clinical information',
      registerTitle: 'Registering a New Patient',
      s1Title: 'Open the New Patient form',
      s1Text: 'Click Patients in the top navigation, then click the New Patient button (top-right).',
      s2Title: 'Fill in Personal Information',
      s2Items: [
        'First Name and Last Name — required',
        'Date of Birth — required; use the date picker',
        'Sex — select Male, Female, or Other',
        'Phone — format: (787) 123-4567',
        'Email — optional but recommended for reminders',
      ],
      s3Title: 'Fill in Address & Emergency Contact',
      s3Text: 'Enter the complete address (street, city, state, zip) and an emergency contact with name and phone number.',
      s4Title: 'Enter Insurance Information',
      s4Text: 'Enter the Insurance Member ID. This will appear in evaluations and billing documents.',
      s5Title: 'Save the patient',
      s5Text: 'Click Save Patient. A unique MRN (Medical Record Number) is generated automatically.',
      searchTitle: 'Searching for a Patient',
      srch1Title: 'Use the search bar',
      srch1Text: 'Type any of the following in the search box: patient name, MRN, date of birth, or phone number. Results appear automatically after a short pause.',
      srch2Title: 'Select a patient',
      srch2Text: 'Click any patient row to open their Patient Detail view.',
      tabsTitle: 'Patient Detail Tabs',
      tabs: [
        { tab: 'Overview',     desc: 'Demographics, contact info, quick stats, recent activity' },
        { tab: 'Appointments', desc: 'Full appointment history for this patient' },
        { tab: 'Encounters',   desc: 'Clinical encounters and SOAP note completion status' },
        { tab: 'Evaluations',  desc: 'Physical therapy evaluation reports' },
        { tab: 'Notes',        desc: 'Clinical notes: progress, phone calls, physician communication, discharge, and more' },
      ],
      editTitle: 'Editing a Patient',
      e1Title: 'Open the patient record',
      e1Text: 'Go to Patients, search for the patient, and click their name.',
      e2Title: 'Click Edit Patient',
      e2Text: 'The button is in the top-right of the patient header. The form opens pre-filled with all existing data.',
      e3Title: 'Make changes and save',
      e3Text: 'Update any fields and click Update Patient. Changes are saved immediately.',
      notesTitle: 'Adding Clinical Notes',
      n1Title: 'Open the Notes tab in Patient Detail',
      n2Title: 'Click + Add Note',
      n2Text: 'Select the note type from the dropdown:',
      n2Types: [
        'Progress Note, Phone Call, Treatment Session',
        'Physician Communication, Insurance / Auth',
        'Missed Appointment, Discharge Note, General Note',
      ],
      n3Title: 'Enter the date and note content, then click Save Note',
      tip: 'All notes are date-stamped and color-coded by type for easy identification.',
    },
    appointments: {
      subtitle: 'Schedule, view, and manage all clinic appointments on an interactive calendar',
      navTitle: 'Navigating the Calendar',
      n1Title: 'Choose a view',
      n1Text: 'Use the Day / Week / Month buttons (top-right of calendar) to switch views.',
      n2Title: 'Move between dates',
      n2Text: 'Click the ← → arrows to go back or forward. Click Today to return to the current date.',
      n3Title: 'Read the appointment colors',
      colors: [
        { color: 'text-blue-600',   label: 'Blue',   status: 'Scheduled' },
        { color: 'text-green-600',  label: 'Green',  status: 'Confirmed' },
        { color: 'text-yellow-600', label: 'Yellow', status: 'Checked In' },
        { color: 'text-gray-600',   label: 'Gray',   status: 'Completed' },
        { color: 'text-red-600',    label: 'Red',    status: 'Cancelled or No-Show' },
      ],
      schedTitle: 'Scheduling a New Appointment',
      sc1Title: 'Click New Appointment',
      sc1Text: 'From the Appointments page or from the Dashboard quick-action button.',
      sc2Title: 'Select the patient',
      sc2Text: 'Search by name or MRN to find the patient.',
      sc3Title: 'Set date, time, and type',
      sc3Text: 'Choose the appointment date, start time, end time, and appointment type (e.g., PT Evaluation, PT Follow-up, PT Re-evaluation).',
      sc4Title: 'Assign a staff member',
      sc4Text: 'Select the therapist or provider from the staff dropdown.',
      sc5Title: 'Add notes (optional) and save',
      sc5Text: 'Click Save Appointment. The appointment appears immediately on the calendar.',
      editTitle: 'Editing an Existing Appointment',
      ed1Title: 'Click the appointment on the calendar',
      ed1Text: 'Clicking any appointment opens the full edit form pre-filled with all existing data — patient, date, time, type, staff, and notes.',
      ed2Title: 'Update any field',
      ed2Text: 'Change the date, time, type, staff, notes, or status as needed.',
      ed3Title: 'Save your changes',
      ed3Text: 'Click Save Appointment. The calendar updates immediately.',
      statusTitle: 'Changing Appointment Status',
      st1Title: 'Open the appointment edit form',
      st1Text: 'Click the appointment on the calendar to open the pre-filled edit form.',
      st2Title: 'Select the new status from the dropdown',
      st2Text: 'Options: Scheduled → Confirmed → Checked In → Completed. You can also mark as Cancelled or No-Show.',
      tip: 'You can call the patient directly from the appointment card — look for the phone link next to their number.',
    },
    timeclock: {
      subtitle: 'Track your work hours, breaks, and weekly totals',
      s1Title: 'Clock In',
      s1Text: 'Navigate to Time Clock in the top navigation. Click the Clock In button. Optionally add a note (e.g., "Opening shift"). The button changes to Clock Out and a timer starts.',
      s2Title: 'Start a Break',
      s2Text: 'Click Start Break when you leave for a break. The break timer starts automatically and break time is tracked separately.',
      s3Title: 'End a Break',
      s3Text: 'Click End Break when you return. Break duration is recorded and subtracted from total hours worked.',
      s4Title: 'Clock Out',
      s4Text: 'Click Clock Out at the end of your shift. Total hours (minus breaks) are calculated and saved.',
      s5Title: 'Review your entries',
      s5Text: 'The Recent Time Entries section shows your last 10 entries with clock-in/out times, break times, total hours, and notes.',
      s6Title: 'Check your weekly summary',
      s6Text: 'The Weekly Summary at the bottom shows total hours this week, days worked, and average hours per day.',
      cardTitle: 'What is tracked per entry:',
      cardItems: [
        'Clock-in timestamp',
        'Clock-out timestamp',
        'Break start and end times',
        'Total hours worked (net of break time)',
        'Optional shift note',
      ],
      tip: 'Time entries are used automatically by Payroll to calculate hours for each pay period — no manual entry needed.',
    },
    reminders: {
      subtitle: 'Send appointment reminders to patients via SMS, email, or phone call',
      s1Title: 'Open the Reminders section',
      s1Text: 'Click Reminders in the top navigation. The screen shows all appointments from today through the next 7 days that are Scheduled or Confirmed.',
      s2Title: 'Read the urgency indicators',
      urgency: [
        { color: 'text-red-600',    label: 'Red',    desc: 'Appointment is within 2 hours (urgent)' },
        { color: 'text-yellow-600', label: 'Yellow', desc: 'Appointment is within 24 hours' },
        { color: 'text-blue-600',   label: 'Blue',   desc: 'Appointment is more than 24 hours away' },
      ],
      s3Title: 'Send a reminder to a specific patient',
      s3Text: 'Find the appointment card and click one of: SMS, Email, or Call. The call button opens your device\'s dialer.',
      s4Title: 'Send all reminders at once',
      s4Text: 'Click Send All Reminders (top-right) to send reminders to all upcoming appointments in one action.',
      s5Title: 'Confirm an appointment',
      s5Text: 'After contacting the patient, click Confirm on their appointment card to update the status to Confirmed.',
      s6Title: 'Configure reminder settings',
      s6Intro: 'Use the Settings panel to:',
      s6Items: [
        'Enable or disable automatic reminders',
        'Set how many days in advance to send (1–3 days)',
        'Choose methods: SMS, Email, Call',
        'Customize the reminder message template using {patient}, {date}, and {time} placeholders',
      ],
      tip: 'The summary cards at the top show how many appointments need reminders, how many are confirmed, and how many are urgent.',
    },
    staff: {
      subtitle: 'Manage clinic employees, roles, and contact information',
      s1Title: 'View the staff list',
      s1Text: 'Click Staff in the navigation. The list shows all employees. Use the filter tabs to view by status (Active / Inactive) or by role (Admin, Therapist, Front Desk, Billing).',
      s2Title: 'Add a new staff member',
      s2Intro: 'Click Add Staff Member. Fill in:',
      s2Items: [
        'First and last name',
        'Role (Admin / Therapist / Front Desk / Billing)',
        'Position/title',
        'Phone and email',
        'License number (for therapists)',
        'Hourly rate (used in payroll calculations)',
      ],
      s3Title: 'Edit a staff member',
      s3Text: 'Click the staff member\'s name to open their detail page, then click Edit to update their information.',
      s4Title: 'Deactivate a staff member',
      s4Text: 'Click the Toggle Active/Inactive button. The employee is deactivated (not deleted) to preserve historical records such as time entries and payroll.',
      cardTitle: 'Important notes about staff roles:',
      cardItems: [
        'Role determines which sections of the app the employee can access',
        'Only Admins can manage staff and view payroll',
        'Hourly rate is private and only visible to Admins',
      ],
    },
    payroll: {
      subtitle: 'Generate, review, approve, and pay staff payroll from time clock entries',
      generateTitle: 'Generating Payroll',
      g1Title: 'Open Payroll and click Generate Payroll',
      g1Text: 'Navigate to Payroll in the top navigation. Click the Generate Payroll button.',
      g2Title: 'Step 1 — Select Pay Period',
      g2Text: 'Choose the start and end dates. You can also click one of the quick-select buttons for the last 4 bi-weekly periods.',
      g3Title: 'Step 2 — Select Staff',
      g3Text: 'Check the employees to include. Click Select All to include everyone, or select individually. Each row shows the employee\'s role and hourly rate.',
      g4Title: 'Step 3 — Review and Adjust',
      g4Intro: 'The system calculates hours automatically from Time Clock entries:',
      g4Items: [
        'Regular hours — up to 40 hours/week',
        'Overtime hours — above 40 hours at 1.5× the hourly rate',
        'Deductions — editable field for tax withholdings, etc.',
        'Net Pay — calculated automatically (gross − deductions)',
      ],
      g4Outro: 'Review totals, adjust deductions if needed, then click Save Payroll.',
      approveTitle: 'Approving & Paying',
      a1Title: 'Approve a draft payroll',
      a1Text: 'In the payroll list, find a record with status Draft and click Approve. This locks the record from further edits.',
      a2Title: 'Mark as Paid',
      a2Text: 'After issuing payment, click Mark as Paid on an Approved record. Status changes to Paid.',
      printTitle: 'Printing Payroll',
      p1Title: 'Click Print All',
      p1Text: 'A printable payroll report opens with the clinic name, date, all employee records, and a grand total row.',
      cardTitle: 'Payroll status flow:',
      cardFlow: 'Draft → Approved → Paid',
      cardNote: 'Only Admins can generate, approve, and mark payroll as paid.',
      tip: 'Make sure all staff have clocked in and out for the full pay period before generating payroll — missing time entries will result in lower calculated hours.',
    },
    optimumai: {
      subtitle: 'Your intelligent clinic assistant, available on every screen, 24/7',
      whatTitle: 'What is OptimumAI?',
      whatText: 'OptimumAI is a built-in artificial intelligence assistant trained to help you manage the clinic efficiently. It understands the context of your current screen (which patient you are viewing, how many appointments you have today, your role, etc.) and provides answers, guidance, and support instantly — without you having to leave the page.',
      openTitle: 'How to Open OptimumAI',
      o1Title: 'Find the lightbulb button',
      o1Text: 'Look for the lightbulb icon (💡) floating in the bottom-right corner of every screen.',
      o2Title: 'Click to open the chat panel',
      o2Text: 'A chat window appears. OptimumAI greets you by name and is ready to help.',
      o3Title: 'Type your question or use voice',
      o3TypeLabel: 'Type:',
      o3TypeText: 'Click the text field, type your question, and press Enter (or click the send button).',
      o3VoiceLabel: 'Voice:',
      o3VoiceText: 'Click the microphone button 🎤, speak your question, and it will be transcribed automatically. Then press Enter to send.',
      o4Title: 'Read the response',
      o4Text: 'OptimumAI replies in seconds. You can continue the conversation naturally — it remembers the full chat history within the session.',
      o5Title: 'Close the assistant',
      o5Text: 'Click the X button to close the chat panel. Your history is saved for the current session.',
      voiceTip: 'You can use voice input in English or Spanish. Just click the mic and speak naturally.',
      bilingualTitle: 'Bilingual AI — EN / ES Mode',
      b1Title: 'Switch the language toggle in the header',
      b1Text: 'Click the EN/ES pill switch in the top navigation bar. The entire app switches language immediately.',
      b2Title: 'OptimumAI responds in the active language',
      b2Text: 'When the app is set to Spanish (ES), OptimumAI automatically responds in Spanish — even if you type in English. When set to English (EN), it responds in English.',
      b3Title: 'Voice recognition switches automatically',
      b3Text: 'The microphone language switches to es-PR (Spanish Puerto Rico) in Spanish mode and en-US in English mode.',
      b4Title: 'Greeting resets in the new language',
      b4Text: 'When you toggle the language, the conversation resets and OptimumAI greets you again in the new language.',
      bilingualTip: 'Your language preference is saved to the browser and remembered the next time you open the app.',
      ttsTitle: 'Text-to-Speech — Oral Training',
      t1Title: 'Find the speaker button in the AI header',
      t1Text: 'When the AI chat is open, look at the teal header bar. There is a speaker icon (🔊) on the right side of the header.',
      t2Title: 'Click the speaker to enable Voice Output',
      t2Text: 'The button turns white to indicate voice is ON. From this point, every AI response will be read aloud automatically as soon as it arrives.',
      t3Title: 'Listen to the training',
      t3Text: 'Ask the AI to train you on any topic. It will speak the full step-by-step walkthrough aloud while you follow along on screen.',
      t4Title: 'Re-read any message',
      t4Text: 'Below every AI message you will see a small 🔊 Read aloud link. Click it to replay that specific response at any time.',
      t5Title: 'Mute voice output',
      t5Text: 'Click the speaker button again to turn voice OFF. The button returns to its gray/dim state.',
      trainingCardTitle: 'Training Mode — this page',
      trainingCardText: 'When you are on the Training page, OptimumAI automatically enters Training Mode. You will see a green pulsing dot and the label "Training Mode Active" in the AI header. In this mode the AI provides longer, more detailed visual walkthroughs — describing exactly what you will see on screen and what to click.',
      tasksTitle: 'All Tasks OptimumAI Can Help With',
      taskCategories: [
        { category: 'Patient Information & Records', tasks: [
          'What are the demographics for patient Roberto Gonzalez?',
          'What insurance does Alexis Pinzon-Galindo have?',
          'When was Carmen Rivera-Santos last seen?',
          'How do I add an emergency contact for a patient?',
          'How do I edit a patient\'s address?',
          'What does MRN stand for and how is it generated?',
          'How many active patients do we have?',
          'How do I search for a patient by date of birth?',
        ]},
        { category: 'Appointments & Scheduling', tasks: [
          'How many appointments do I have today?',
          'How do I schedule a new appointment?',
          'What appointment types are available?',
          'How do I change an appointment from Scheduled to Confirmed?',
          'What does "no-show" status mean and how do I set it?',
          'How do I view the weekly calendar?',
          'Can I see all appointments for a specific patient?',
          'How do I cancel an appointment?',
        ]},
        { category: 'Clinical Notes & SOAP Documentation', tasks: [
          'How do I complete a pending SOAP note?',
          'What is a SOAP note?',
          'How do I add a Progress Note for a patient?',
          'What types of clinical notes can I write?',
          'How do I document a phone call with a patient?',
          'How do I write a discharge note?',
          'Where do I find pending notes for today?',
          'How do I record a missed appointment in the notes?',
        ]},
        { category: 'Physical Therapy & Clinical Guidance', tasks: [
          'What CPT codes are typically used for PT evaluations?',
          'What does the TUG test measure?',
          'What is the Ashworth Scale used for?',
          'What is the normal grip strength for a 60-year-old male?',
          'What does ICD-10 code I69.351 mean?',
          'How do I document neuromuscular re-education?',
          'What is the difference between PT Evaluation and PT Re-evaluation?',
          'What is 97110 and 97112 used for?',
          'What goals should I set for a patient with hemiplegia?',
          'How do I document gait training (CPT 97116)?',
        ]},
        { category: 'Reminders & Patient Communication', tasks: [
          'How do I send a reminder to a patient?',
          'How do I confirm an appointment after calling the patient?',
          'What does the urgency color mean on reminders?',
          'How do I send all reminders at once?',
          'How do I customize the reminder message template?',
          'Can reminders be sent by email instead of SMS?',
          'Which patients need reminders for tomorrow?',
        ]},
        { category: 'Staff Management', tasks: [
          'How do I add a new staff member?',
          'How do I change a staff member\'s role?',
          'What is the difference between Therapist and Front Desk roles?',
          'How do I deactivate an employee who left?',
          'Where do I enter a staff member\'s license number?',
          'How do I update an employee\'s hourly rate?',
        ]},
        { category: 'Time Clock & Attendance', tasks: [
          'How do I clock in?',
          'How do I record a break?',
          'How many hours did I work this week?',
          'What happens if I forget to clock out?',
          'Does break time count toward my total hours?',
          'Where can I see my recent time entries?',
          'How does the system calculate overtime?',
        ]},
        { category: 'Payroll & Compensation', tasks: [
          'How do I generate payroll for this pay period?',
          'How does the system calculate overtime pay?',
          'How do I approve a payroll record?',
          'How do I mark payroll as paid?',
          'How do I print a payroll report?',
          'What is the difference between gross pay and net pay?',
          'Can I adjust deductions before approving payroll?',
          'What pay periods are available for quick selection?',
        ]},
        { category: 'Insurance & Billing Information', tasks: [
          'Where do I find a patient\'s insurance ID?',
          'What is the clinic\'s NPI number?',
          'What is the clinic\'s PTAN number?',
          'What is Dr. Lebron\'s PT license number?',
          'How do I add insurance information to a new patient?',
          'What CPT codes does the clinic commonly use?',
        ]},
        { category: 'System Help & Navigation', tasks: [
          'How do I get back to the dashboard?',
          'What is the difference between Encounters and Notes?',
          'Why is the Sync Status showing Off Line?',
          'What does "Pending" sync status mean on a patient record?',
          'How do I sign out?',
          'Will I be logged out automatically?',
          'What permissions does the Front Desk role have?',
          'How do I use the voice input feature?',
        ]},
        { category: 'Clinic Information', tasks: [
          'What is the clinic\'s address?',
          'What is the clinic\'s phone number?',
          'Who is the treating provider?',
          'What are the clinic\'s service specialties?',
          'What is Dr. Lebron\'s NPI?',
        ]},
      ],
      tipsTitle: 'Tips for best results with OptimumAI',
      tips: [
        'Ask in complete sentences for the most accurate answers',
        'You can ask follow-up questions — OptimumAI remembers the conversation',
        'Use voice input when your hands are occupied',
        'Ask "how do I..." for step-by-step guidance on any feature',
        'Ask clinical questions during patient encounters for quick reference',
        'OptimumAI knows your role — it will tailor answers to what you have access to',
      ],
      contextTip: 'OptimumAI is context-aware. When you are on the Patients page it knows you are working with patients. When you are on the Dashboard it knows your appointment count for today. This means you can ask short questions like "how many pending notes do I have?" and it will answer with your actual data.',
    },
    banner: {
      title: 'OptimumAI Training Mode is Active on This Page',
      subtitle: 'The AI assistant (💡 bottom-right) is in Training Mode — it provides full visual & oral step-by-step walkthroughs. Enable the 🔊 speaker button to hear responses read aloud.',
      quickStart: 'Click any topic below — it opens the AI assistant and sends the training request automatically:',
      topics: [
        { emoji: '🏠', label: 'Dashboard',    desc: 'Walk me through the dashboard' },
        { emoji: '👥', label: 'Patients',     desc: 'Train me on patient management' },
        { emoji: '📅', label: 'Appointments', desc: 'Show me the appointments calendar' },
        { emoji: '⏱',  label: 'Time Clock',  desc: 'Explain how to clock in and out' },
        { emoji: '🔔', label: 'Reminders',   desc: 'How do I send patient reminders?' },
        { emoji: '💰', label: 'Payroll',     desc: 'Walk me through generating payroll' },
        { emoji: '🤖', label: 'OptimumAI',  desc: 'Train me on all AI features' },
      ],
      orType: 'Or open the AI (💡 bottom-right) and type',
      orTypeQuote: '"Train me on [any topic]"',
      orTypeRest: '— it knows this entire manual.',
      micNote: 'Use the 🎤 mic button to speak your question instead of typing.',
      copyPromptTemplate: 'Train me on {label} — give me a complete visual and oral step-by-step walkthrough.',
      copied: '✓ Sent to AI!',
      clickToCopy: 'Click to train with AI',
      step1: 'Open AI (💡 bottom-right)',
      step2: 'Enable 🔊 speaker for oral training',
      step3: 'Type or say "Train me on Patients"',
      step4: 'Follow the step-by-step walkthrough',
    },
  },

  es: {
    sidebarTitle: 'Capacitación',
    sidebarSubtitle: 'Manual de Usuario',
    nav: [
      { id: 'overview' as Section,      label: 'Resumen',          icon: '📋' },
      { id: 'dashboard' as Section,     label: 'Panel',            icon: '🏠' },
      { id: 'patients' as Section,      label: 'Pacientes',        icon: '👥' },
      { id: 'appointments' as Section,  label: 'Citas',            icon: '📅' },
      { id: 'timeclock' as Section,     label: 'Reloj',            icon: '⏱' },
      { id: 'reminders' as Section,     label: 'Recordatorios',    icon: '🔔' },
      { id: 'staff' as Section,         label: 'Personal',         icon: '🧑‍⚕️' },
      { id: 'payroll' as Section,       label: 'Nómina',           icon: '💰' },
      { id: 'optimumai' as Section,     label: 'Guía OptimumAI',   icon: '🤖' },
    ],
    overview: {
      title: 'Manual de Usuario — Optimum Therapy',
      subtitle: 'Guía completa para usar todas las funciones del sistema de gestión clínica',
      intro: 'Bienvenido a',
      introName: 'Optimum Therapy',
      introRest: '— la plataforma integral de gestión clínica para el Dr. Carlos Lebrón-Quiñones PT DPT. Este manual le guía por cada sección del sistema. Use el menú de la izquierda para ir a cualquier tema.',
      features: [
        { icon: '🏠', title: 'Panel',           desc: 'Resumen diario, estadísticas y acciones rápidas' },
        { icon: '👥', title: 'Pacientes',       desc: 'Registrar, buscar y gestionar expedientes de pacientes' },
        { icon: '📅', title: 'Citas',           desc: 'Programar y dar seguimiento a citas en un calendario' },
        { icon: '⏱',  title: 'Reloj',          desc: 'Registro de entrada/salida y descansos del personal' },
        { icon: '🔔', title: 'Recordatorios',  desc: 'Enviar recordatorios por SMS, correo o llamada a pacientes' },
        { icon: '🧑‍⚕️', title: 'Personal',    desc: 'Gestionar empleados, roles y licencias' },
        { icon: '💰', title: 'Nómina',         desc: 'Generar y aprobar nómina desde las entradas de tiempo' },
        { icon: '🤖', title: 'OptimumAI',      desc: 'Asistente de IA — pregunte cualquier cosa, en cualquier momento' },
        { icon: '🌐', title: 'EN / ES',        desc: 'Cambio de idioma — cambia toda la aplicación entre inglés y español al instante' },
      ],
      rolesTitle: 'Roles y Permisos de Usuario',
      roles: [
        { role: 'Admin',      desc: 'Acceso completo a todas las secciones incluyendo personal y nómina' },
        { role: 'Terapeuta',  desc: 'Pacientes, citas, encuentros, notas SOAP, reloj de tiempo' },
        { role: 'Recepción',  desc: 'Pacientes, citas, recordatorios, reloj de tiempo' },
        { role: 'Facturación',desc: 'Expedientes de pacientes, datos de seguro, revisión de nómina' },
      ],
      aiTip: 'El asistente OptimumAI (botón de bombilla, parte inferior derecha) está disponible en cada pantalla. Puede escribir o hablar su pregunta en cualquier momento — no necesita navegar a una página específica primero.',
      langTip: 'El botón EN/ES en el encabezado cambia toda la aplicación — menús, etiquetas, formularios y respuestas de IA — entre inglés y español. Su preferencia de idioma se guarda automáticamente.',
    },
    dashboard: {
      subtitle: 'Su centro de mando diario — todo de un vistazo',
      step1Title: 'Leyendo las Tarjetas de Resumen',
      step1Intro: 'Las cuatro tarjetas en la parte superior muestran el estado actual de la clínica:',
      card1: 'Citas de Hoy',         card1Desc: 'total de citas programadas para hoy',
      card2: 'Notas Pendientes',     card2Desc: 'encuentros que aún necesitan una nota SOAP completada',
      card3: 'Pacientes Activos',    card3Desc: 'total de pacientes no eliminados en el sistema',
      card4: 'Estado de Conexión',   card4Desc: 'si la aplicación está conectada a la red (En Línea / Sin Conexión)',
      step2Title: 'Panel de Citas de Hoy',
      step2Intro: 'Muestra hasta 5 citas para hoy. Cada entrada muestra:',
      step2Li1: 'Nombre del paciente, rango de tiempo y tipo de cita',
      step2Li2: 'Insignia de estado con código de color: confirmada (verde), programada (azul), registrado (amarillo), completada (gris), cancelada / no se presentó (rojo)',
      step3Title: 'Panel de Notas Pendientes (Solo Terapeuta / Admin)',
      step3Text: 'Lista encuentros que aún no han sido documentados. Haga clic en Completar para abrir el formulario de nota SOAP directamente.',
      step4Title: 'Acciones Rápidas',
      step4Text: 'Use los botones Nuevo Paciente y Nueva Cita en la parte superior derecha del panel para crear registros sin salir de la pantalla principal.',
      tip: 'Si el Estado de Conexión muestra "Sin Conexión", los datos se guardan localmente y se sincronizarán automáticamente cuando se restaure la conexión.',
    },
    patients: {
      subtitle: 'Registrar nuevos pacientes, buscar expedientes y gestionar información clínica',
      registerTitle: 'Registrar un Nuevo Paciente',
      s1Title: 'Abrir el formulario de Nuevo Paciente',
      s1Text: 'Haga clic en Pacientes en la navegación superior, luego haga clic en el botón Nuevo Paciente (parte superior derecha).',
      s2Title: 'Completar Información Personal',
      s2Items: [
        'Nombre y Apellido — requeridos',
        'Fecha de Nacimiento — requerida; use el selector de fecha',
        'Sexo — seleccione Masculino, Femenino u Otro',
        'Teléfono — formato: (787) 123-4567',
        'Correo — opcional pero recomendado para recordatorios',
      ],
      s3Title: 'Completar Dirección y Contacto de Emergencia',
      s3Text: 'Ingrese la dirección completa (calle, ciudad, estado, código postal) y un contacto de emergencia con nombre y teléfono.',
      s4Title: 'Ingresar Información de Seguro',
      s4Text: 'Ingrese el ID de Miembro del Seguro. Aparecerá en evaluaciones y documentos de facturación.',
      s5Title: 'Guardar el paciente',
      s5Text: 'Haga clic en Guardar Paciente. Se genera automáticamente un MRN (Número de Expediente Médico) único.',
      searchTitle: 'Buscar un Paciente',
      srch1Title: 'Usar la barra de búsqueda',
      srch1Text: 'Escriba cualquiera de los siguientes en el cuadro de búsqueda: nombre del paciente, MRN, fecha de nacimiento o número de teléfono. Los resultados aparecen automáticamente después de una breve pausa.',
      srch2Title: 'Seleccionar un paciente',
      srch2Text: 'Haga clic en cualquier fila de paciente para abrir su vista de Detalle del Paciente.',
      tabsTitle: 'Pestañas del Detalle del Paciente',
      tabs: [
        { tab: 'Resumen',      desc: 'Datos demográficos, información de contacto, estadísticas rápidas, actividad reciente' },
        { tab: 'Citas',        desc: 'Historial completo de citas de este paciente' },
        { tab: 'Encuentros',   desc: 'Encuentros clínicos y estado de completación de notas SOAP' },
        { tab: 'Evaluaciones', desc: 'Informes de evaluación de terapia física' },
        { tab: 'Notas',        desc: 'Notas clínicas: progreso, llamadas telefónicas, comunicación médica, alta y más' },
      ],
      editTitle: 'Editar un Paciente',
      e1Title: 'Abrir el expediente del paciente',
      e1Text: 'Vaya a Pacientes, busque el paciente y haga clic en su nombre.',
      e2Title: 'Haga clic en Editar Paciente',
      e2Text: 'El botón está en la parte superior derecha del encabezado del paciente. El formulario se abre con todos los datos existentes.',
      e3Title: 'Realizar cambios y guardar',
      e3Text: 'Actualice cualquier campo y haga clic en Actualizar Paciente. Los cambios se guardan inmediatamente.',
      notesTitle: 'Agregar Notas Clínicas',
      n1Title: 'Abrir la pestaña Notas en el Detalle del Paciente',
      n2Title: 'Haga clic en + Agregar Nota',
      n2Text: 'Seleccione el tipo de nota del menú desplegable:',
      n2Types: [
        'Nota de Progreso, Llamada Telefónica, Sesión de Tratamiento',
        'Comunicación Médica, Seguro / Autorización',
        'Cita Perdida, Nota de Alta, Nota General',
      ],
      n3Title: 'Ingrese la fecha y el contenido de la nota, luego haga clic en Guardar Nota',
      tip: 'Todas las notas tienen marca de fecha y código de color por tipo para fácil identificación.',
    },
    appointments: {
      subtitle: 'Programar, ver y gestionar todas las citas de la clínica en un calendario interactivo',
      navTitle: 'Navegando el Calendario',
      n1Title: 'Elegir una vista',
      n1Text: 'Use los botones Día / Semana / Mes (parte superior derecha del calendario) para cambiar de vista.',
      n2Title: 'Moverse entre fechas',
      n2Text: 'Haga clic en las flechas ← → para ir hacia atrás o adelante. Haga clic en Hoy para volver a la fecha actual.',
      n3Title: 'Leer los colores de las citas',
      colors: [
        { color: 'text-blue-600',   label: 'Azul',     status: 'Programada' },
        { color: 'text-green-600',  label: 'Verde',    status: 'Confirmada' },
        { color: 'text-yellow-600', label: 'Amarillo', status: 'Registrado' },
        { color: 'text-gray-600',   label: 'Gris',     status: 'Completada' },
        { color: 'text-red-600',    label: 'Rojo',     status: 'Cancelada o No se Presentó' },
      ],
      schedTitle: 'Programar una Nueva Cita',
      sc1Title: 'Haga clic en Nueva Cita',
      sc1Text: 'Desde la página de Citas o desde el botón de acción rápida del Panel.',
      sc2Title: 'Seleccionar el paciente',
      sc2Text: 'Busque por nombre o MRN para encontrar el paciente.',
      sc3Title: 'Establecer fecha, hora y tipo',
      sc3Text: 'Elija la fecha de la cita, hora de inicio, hora de fin y tipo de cita (ej., Evaluación de TF, Seguimiento de TF, Re-evaluación de TF).',
      sc4Title: 'Asignar un miembro del personal',
      sc4Text: 'Seleccione el terapeuta o proveedor del menú desplegable de personal.',
      sc5Title: 'Agregar notas (opcional) y guardar',
      sc5Text: 'Haga clic en Guardar Cita. La cita aparece inmediatamente en el calendario.',
      editTitle: 'Editar una Cita Existente',
      ed1Title: 'Haga clic en la cita en el calendario',
      ed1Text: 'Al hacer clic en cualquier cita se abre el formulario de edición completo con todos los datos existentes — paciente, fecha, hora, tipo, personal y notas.',
      ed2Title: 'Actualice cualquier campo',
      ed2Text: 'Cambie la fecha, hora, tipo, personal, notas o estado según sea necesario.',
      ed3Title: 'Guarde los cambios',
      ed3Text: 'Haga clic en Guardar Cita. El calendario se actualiza inmediatamente.',
      statusTitle: 'Cambiar el Estado de la Cita',
      st1Title: 'Abrir el formulario de edición de la cita',
      st1Text: 'Haga clic en la cita en el calendario para abrir el formulario pre-completado.',
      st2Title: 'Seleccione el nuevo estado del menú desplegable',
      st2Text: 'Opciones: Programada → Confirmada → Registrado → Completada. También puede marcar como Cancelada o No se Presentó.',
      tip: 'Puede llamar al paciente directamente desde la tarjeta de cita — busque el enlace de teléfono junto a su número.',
    },
    timeclock: {
      subtitle: 'Registre sus horas de trabajo, descansos y totales semanales',
      s1Title: 'Marcar Entrada',
      s1Text: 'Navegue a Reloj en la navegación superior. Haga clic en el botón Marcar Entrada. Opcionalmente agregue una nota (ej., "Turno de apertura"). El botón cambia a Marcar Salida y comienza un temporizador.',
      s2Title: 'Iniciar un Descanso',
      s2Text: 'Haga clic en Iniciar Descanso cuando salga al descanso. El temporizador de descanso comienza automáticamente y el tiempo de descanso se registra por separado.',
      s3Title: 'Terminar un Descanso',
      s3Text: 'Haga clic en Terminar Descanso cuando regrese. La duración del descanso se registra y se resta del total de horas trabajadas.',
      s4Title: 'Marcar Salida',
      s4Text: 'Haga clic en Marcar Salida al final de su turno. El total de horas (menos descansos) se calcula y guarda.',
      s5Title: 'Revisar sus entradas',
      s5Text: 'La sección Entradas Recientes muestra sus últimas 10 entradas con tiempos de entrada/salida, tiempos de descanso, horas totales y notas.',
      s6Title: 'Verificar su resumen semanal',
      s6Text: 'El Resumen Semanal en la parte inferior muestra el total de horas esta semana, días trabajados y promedio de horas por día.',
      cardTitle: 'Qué se registra por entrada:',
      cardItems: [
        'Marca de tiempo de entrada',
        'Marca de tiempo de salida',
        'Tiempos de inicio y fin de descanso',
        'Horas totales trabajadas (neto de tiempo de descanso)',
        'Nota de turno opcional',
      ],
      tip: 'Las entradas de tiempo son utilizadas automáticamente por Nómina para calcular las horas de cada período de pago — no se requiere entrada manual.',
    },
    reminders: {
      subtitle: 'Enviar recordatorios de citas a pacientes por SMS, correo o llamada telefónica',
      s1Title: 'Abrir la sección de Recordatorios',
      s1Text: 'Haga clic en Recordatorios en la navegación superior. La pantalla muestra todas las citas desde hoy hasta los próximos 7 días que están Programadas o Confirmadas.',
      s2Title: 'Leer los indicadores de urgencia',
      urgency: [
        { color: 'text-red-600',    label: 'Rojo',     desc: 'La cita es dentro de 2 horas (urgente)' },
        { color: 'text-yellow-600', label: 'Amarillo', desc: 'La cita es dentro de 24 horas' },
        { color: 'text-blue-600',   label: 'Azul',     desc: 'La cita es a más de 24 horas de distancia' },
      ],
      s3Title: 'Enviar un recordatorio a un paciente específico',
      s3Text: 'Encuentre la tarjeta de cita y haga clic en: SMS, Correo o Llamar. El botón de llamada abre el marcador de su dispositivo.',
      s4Title: 'Enviar todos los recordatorios a la vez',
      s4Text: 'Haga clic en Enviar Todos los Recordatorios (parte superior derecha) para enviar recordatorios a todas las citas próximas en una sola acción.',
      s5Title: 'Confirmar una cita',
      s5Text: 'Después de contactar al paciente, haga clic en Confirmar en su tarjeta de cita para actualizar el estado a Confirmada.',
      s6Title: 'Configurar los ajustes de recordatorios',
      s6Intro: 'Use el panel de Configuración para:',
      s6Items: [
        'Activar o desactivar recordatorios automáticos',
        'Establecer con cuántos días de anticipación enviar (1–3 días)',
        'Elegir métodos: SMS, Correo, Llamada',
        'Personalizar la plantilla del mensaje usando los marcadores {paciente}, {fecha} y {hora}',
      ],
      tip: 'Las tarjetas de resumen en la parte superior muestran cuántas citas necesitan recordatorios, cuántas están confirmadas y cuántas son urgentes.',
    },
    staff: {
      subtitle: 'Gestionar empleados de la clínica, roles e información de contacto',
      s1Title: 'Ver la lista de personal',
      s1Text: 'Haga clic en Personal en la navegación. La lista muestra todos los empleados. Use las pestañas de filtro para ver por estado (Activo / Inactivo) o por rol (Admin, Terapeuta, Recepción, Facturación).',
      s2Title: 'Agregar un nuevo miembro del personal',
      s2Intro: 'Haga clic en Agregar Personal. Complete:',
      s2Items: [
        'Nombre y apellido',
        'Rol (Admin / Terapeuta / Recepción / Facturación)',
        'Posición/título',
        'Teléfono y correo',
        'Número de licencia (para terapeutas)',
        'Tarifa por hora (usada en cálculos de nómina)',
      ],
      s3Title: 'Editar un miembro del personal',
      s3Text: 'Haga clic en el nombre del miembro del personal para abrir su página de detalle, luego haga clic en Editar para actualizar su información.',
      s4Title: 'Desactivar un miembro del personal',
      s4Text: 'Haga clic en el botón Activar/Desactivar. El empleado se desactiva (no se elimina) para preservar registros históricos como entradas de tiempo y nómina.',
      cardTitle: 'Notas importantes sobre los roles del personal:',
      cardItems: [
        'El rol determina qué secciones de la aplicación puede acceder el empleado',
        'Solo los Admins pueden gestionar el personal y ver la nómina',
        'La tarifa por hora es privada y solo visible para los Admins',
      ],
    },
    payroll: {
      subtitle: 'Generar, revisar, aprobar y pagar la nómina del personal desde las entradas del reloj de tiempo',
      generateTitle: 'Generar Nómina',
      g1Title: 'Abrir Nómina y hacer clic en Generar Nómina',
      g1Text: 'Navegue a Nómina en la navegación superior. Haga clic en el botón Generar Nómina.',
      g2Title: 'Paso 1 — Seleccionar Período de Pago',
      g2Text: 'Elija las fechas de inicio y fin. También puede hacer clic en uno de los botones de selección rápida para los últimos 4 períodos quincenales.',
      g3Title: 'Paso 2 — Seleccionar Personal',
      g3Text: 'Marque los empleados a incluir. Haga clic en Seleccionar Todo para incluir a todos, o seleccione individualmente. Cada fila muestra el rol y la tarifa por hora del empleado.',
      g4Title: 'Paso 3 — Revisar y Ajustar',
      g4Intro: 'El sistema calcula las horas automáticamente desde las entradas del Reloj de Tiempo:',
      g4Items: [
        'Horas regulares — hasta 40 horas/semana',
        'Horas extra — más de 40 horas a 1.5× la tarifa por hora',
        'Deducciones — campo editable para retenciones de impuestos, etc.',
        'Salario Neto — calculado automáticamente (bruto − deducciones)',
      ],
      g4Outro: 'Revise los totales, ajuste las deducciones si es necesario, luego haga clic en Guardar Nómina.',
      approveTitle: 'Aprobar y Pagar',
      a1Title: 'Aprobar un borrador de nómina',
      a1Text: 'En la lista de nómina, encuentre un registro con estado Borrador y haga clic en Aprobar. Esto bloquea el registro de ediciones adicionales.',
      a2Title: 'Marcar como Pagado',
      a2Text: 'Después de emitir el pago, haga clic en Marcar como Pagado en un registro Aprobado. El estado cambia a Pagado.',
      printTitle: 'Imprimir Nómina',
      p1Title: 'Haga clic en Imprimir Todo',
      p1Text: 'Se abre un informe de nómina imprimible con el nombre de la clínica, fecha, todos los registros de empleados y una fila de total general.',
      cardTitle: 'Flujo de estado de nómina:',
      cardFlow: 'Borrador → Aprobado → Pagado',
      cardNote: 'Solo los Admins pueden generar, aprobar y marcar la nómina como pagada.',
      tip: 'Asegúrese de que todo el personal haya marcado entrada y salida durante el período de pago completo antes de generar la nómina — las entradas de tiempo faltantes resultarán en horas calculadas menores.',
    },
    optimumai: {
      subtitle: 'Su asistente inteligente de clínica, disponible en cada pantalla, las 24 horas',
      whatTitle: '¿Qué es OptimumAI?',
      whatText: 'OptimumAI es un asistente de inteligencia artificial integrado entrenado para ayudarle a gestionar la clínica de manera eficiente. Comprende el contexto de su pantalla actual (qué paciente está viendo, cuántas citas tiene hoy, su rol, etc.) y proporciona respuestas, orientación y apoyo instantáneamente — sin que usted tenga que salir de la página.',
      openTitle: 'Cómo Abrir OptimumAI',
      o1Title: 'Encontrar el botón de bombilla',
      o1Text: 'Busque el ícono de bombilla (💡) flotando en la esquina inferior derecha de cada pantalla.',
      o2Title: 'Haga clic para abrir el panel de chat',
      o2Text: 'Aparece una ventana de chat. OptimumAI le saluda por su nombre y está listo para ayudar.',
      o3Title: 'Escriba su pregunta o use voz',
      o3TypeLabel: 'Escribir:',
      o3TypeText: 'Haga clic en el campo de texto, escriba su pregunta y presione Enter (o haga clic en el botón de enviar).',
      o3VoiceLabel: 'Voz:',
      o3VoiceText: 'Haga clic en el botón de micrófono 🎤, hable su pregunta y se transcribirá automáticamente. Luego presione Enter para enviar.',
      o4Title: 'Leer la respuesta',
      o4Text: 'OptimumAI responde en segundos. Puede continuar la conversación naturalmente — recuerda el historial completo del chat durante la sesión.',
      o5Title: 'Cerrar el asistente',
      o5Text: 'Haga clic en el botón X para cerrar el panel de chat. Su historial se guarda para la sesión actual.',
      voiceTip: 'Puede usar la entrada de voz en inglés o español. Solo haga clic en el micrófono y hable naturalmente.',
      bilingualTitle: 'IA Bilingüe — Modo EN / ES',
      b1Title: 'Cambie el botón de idioma en el encabezado',
      b1Text: 'Haga clic en el botón EN/ES en la barra de navegación superior. Toda la aplicación cambia de idioma inmediatamente.',
      b2Title: 'OptimumAI responde en el idioma activo',
      b2Text: 'Cuando la aplicación está en español (ES), OptimumAI responde automáticamente en español — aunque escriba en inglés. En inglés (EN), responde en inglés.',
      b3Title: 'El reconocimiento de voz cambia automáticamente',
      b3Text: 'El idioma del micrófono cambia a es-PR (español de Puerto Rico) en modo español y en-US en modo inglés.',
      b4Title: 'El saludo se reinicia en el nuevo idioma',
      b4Text: 'Al cambiar el idioma, la conversación se reinicia y OptimumAI le saluda nuevamente en el nuevo idioma.',
      bilingualTip: 'Su preferencia de idioma se guarda en el navegador y se recuerda la próxima vez que abra la aplicación.',
      ttsTitle: 'Texto a Voz — Capacitación Oral',
      t1Title: 'Encontrar el botón de altavoz en el encabezado de IA',
      t1Text: 'Cuando el chat de IA esté abierto, mire la barra de encabezado verde azulado. Hay un ícono de altavoz (🔊) en el lado derecho del encabezado.',
      t2Title: 'Haga clic en el altavoz para activar la Salida de Voz',
      t2Text: 'El botón se vuelve blanco para indicar que la voz está ACTIVADA. A partir de este punto, cada respuesta de IA se leerá en voz alta automáticamente tan pronto como llegue.',
      t3Title: 'Escuche la capacitación',
      t3Text: 'Pida a la IA que le capacite sobre cualquier tema. Hablará la guía paso a paso completa en voz alta mientras usted la sigue en pantalla.',
      t4Title: 'Releer cualquier mensaje',
      t4Text: 'Debajo de cada mensaje de IA verá un pequeño enlace 🔊 Leer en voz alta. Haga clic en él para reproducir esa respuesta específica en cualquier momento.',
      t5Title: 'Silenciar la salida de voz',
      t5Text: 'Haga clic en el botón de altavoz nuevamente para desactivar la voz. El botón vuelve a su estado gris/tenue.',
      trainingCardTitle: 'Modo de Capacitación — esta página',
      trainingCardText: 'Cuando está en la página de Capacitación, OptimumAI entra automáticamente en Modo de Capacitación. Verá un punto verde parpadeante y la etiqueta "Modo de Capacitación Activo" en el encabezado de la IA. En este modo la IA proporciona guías visuales más largas y detalladas — describiendo exactamente lo que verá en pantalla y en qué hacer clic.',
      tasksTitle: 'Todas las Tareas con las que OptimumAI Puede Ayudar',
      taskCategories: [
        { category: 'Información y Expedientes de Pacientes', tasks: [
          '¿Cuáles son los datos demográficos del paciente Roberto González?',
          '¿Qué seguro tiene Alexis Pinzón-Galindo?',
          '¿Cuándo fue vista por última vez Carmen Rivera-Santos?',
          '¿Cómo agrego un contacto de emergencia para un paciente?',
          '¿Cómo edito la dirección de un paciente?',
          '¿Qué significa MRN y cómo se genera?',
          '¿Cuántos pacientes activos tenemos?',
          '¿Cómo busco un paciente por fecha de nacimiento?',
        ]},
        { category: 'Citas y Programación', tasks: [
          '¿Cuántas citas tengo hoy?',
          '¿Cómo programo una nueva cita?',
          '¿Qué tipos de cita están disponibles?',
          '¿Cómo cambio una cita de Programada a Confirmada?',
          '¿Qué significa el estado "no se presentó" y cómo lo configuro?',
          '¿Cómo veo el calendario semanal?',
          '¿Puedo ver todas las citas de un paciente específico?',
          '¿Cómo cancelo una cita?',
        ]},
        { category: 'Notas Clínicas y Documentación SOAP', tasks: [
          '¿Cómo completo una nota SOAP pendiente?',
          '¿Qué es una nota SOAP?',
          '¿Cómo agrego una Nota de Progreso para un paciente?',
          '¿Qué tipos de notas clínicas puedo escribir?',
          '¿Cómo documento una llamada telefónica con un paciente?',
          '¿Cómo escribo una nota de alta?',
          '¿Dónde encuentro las notas pendientes de hoy?',
          '¿Cómo registro una cita perdida en las notas?',
        ]},
        { category: 'Terapia Física y Orientación Clínica', tasks: [
          '¿Qué códigos CPT se usan típicamente para evaluaciones de terapia física?',
          '¿Qué mide la prueba TUG?',
          '¿Para qué se usa la Escala de Ashworth?',
          '¿Cuál es la fuerza de agarre normal para un hombre de 60 años?',
          '¿Qué significa el código ICD-10 I69.351?',
          '¿Cómo documento la re-educación neuromuscular?',
          '¿Cuál es la diferencia entre Evaluación de TF y Re-evaluación de TF?',
          '¿Para qué se usa el 97110 y 97112?',
          '¿Qué objetivos debo establecer para un paciente con hemiplejia?',
          '¿Cómo documento el entrenamiento de marcha (CPT 97116)?',
        ]},
        { category: 'Recordatorios y Comunicación con Pacientes', tasks: [
          '¿Cómo envío un recordatorio a un paciente?',
          '¿Cómo confirmo una cita después de llamar al paciente?',
          '¿Qué significa el color de urgencia en los recordatorios?',
          '¿Cómo envío todos los recordatorios a la vez?',
          '¿Cómo personalizo la plantilla del mensaje de recordatorio?',
          '¿Se pueden enviar recordatorios por correo en lugar de SMS?',
          '¿Qué pacientes necesitan recordatorios para mañana?',
        ]},
        { category: 'Gestión de Personal', tasks: [
          '¿Cómo agrego un nuevo miembro del personal?',
          '¿Cómo cambio el rol de un miembro del personal?',
          '¿Cuál es la diferencia entre los roles de Terapeuta y Recepción?',
          '¿Cómo desactivo a un empleado que se fue?',
          '¿Dónde ingreso el número de licencia de un miembro del personal?',
          '¿Cómo actualizo la tarifa por hora de un empleado?',
        ]},
        { category: 'Reloj de Tiempo y Asistencia', tasks: [
          '¿Cómo marco mi entrada?',
          '¿Cómo registro un descanso?',
          '¿Cuántas horas trabajé esta semana?',
          '¿Qué pasa si olvido marcar mi salida?',
          '¿El tiempo de descanso cuenta en mis horas totales?',
          '¿Dónde puedo ver mis entradas de tiempo recientes?',
          '¿Cómo calcula el sistema las horas extra?',
        ]},
        { category: 'Nómina y Compensación', tasks: [
          '¿Cómo genero la nómina para este período de pago?',
          '¿Cómo calcula el sistema el pago de horas extra?',
          '¿Cómo apruebo un registro de nómina?',
          '¿Cómo marco la nómina como pagada?',
          '¿Cómo imprimo un informe de nómina?',
          '¿Cuál es la diferencia entre salario bruto y neto?',
          '¿Puedo ajustar las deducciones antes de aprobar la nómina?',
          '¿Qué períodos de pago están disponibles para selección rápida?',
        ]},
        { category: 'Seguro e Información de Facturación', tasks: [
          '¿Dónde encuentro el ID de seguro de un paciente?',
          '¿Cuál es el número NPI de la clínica?',
          '¿Cuál es el número PTAN de la clínica?',
          '¿Cuál es el número de licencia PT del Dr. Lebrón?',
          '¿Cómo agrego información de seguro a un nuevo paciente?',
          '¿Qué códigos CPT usa comúnmente la clínica?',
        ]},
        { category: 'Ayuda del Sistema y Navegación', tasks: [
          '¿Cómo vuelvo al panel?',
          '¿Cuál es la diferencia entre Encuentros y Notas?',
          '¿Por qué el Estado de Conexión muestra Sin Conexión?',
          '¿Qué significa el estado de sincronización "Pendiente" en un expediente de paciente?',
          '¿Cómo cierro sesión?',
          '¿Se cerrará mi sesión automáticamente?',
          '¿Qué permisos tiene el rol de Recepción?',
          '¿Cómo uso la función de entrada de voz?',
        ]},
        { category: 'Información de la Clínica', tasks: [
          '¿Cuál es la dirección de la clínica?',
          '¿Cuál es el número de teléfono de la clínica?',
          '¿Quién es el proveedor tratante?',
          '¿Cuáles son las especialidades de servicio de la clínica?',
          '¿Cuál es el NPI del Dr. Lebrón?',
        ]},
      ],
      tipsTitle: 'Consejos para mejores resultados con OptimumAI',
      tips: [
        'Haga preguntas completas para obtener las respuestas más precisas',
        'Puede hacer preguntas de seguimiento — OptimumAI recuerda la conversación',
        'Use la entrada de voz cuando tenga las manos ocupadas',
        'Pregunte "¿cómo...?" para obtener orientación paso a paso sobre cualquier función',
        'Haga preguntas clínicas durante los encuentros con pacientes para referencia rápida',
        'OptimumAI conoce su rol — adaptará las respuestas a lo que usted tiene acceso',
      ],
      contextTip: 'OptimumAI tiene conciencia del contexto. Cuando está en la página de Pacientes, sabe que está trabajando con pacientes. Cuando está en el Panel, conoce el número de citas para hoy. Esto significa que puede hacer preguntas cortas como "¿cuántas notas pendientes tengo?" y responderá con sus datos reales.',
    },
    banner: {
      title: 'El Modo de Capacitación de OptimumAI Está Activo en Esta Página',
      subtitle: 'El asistente de IA (💡 parte inferior derecha) está en Modo de Capacitación — proporciona guías visuales y orales paso a paso completas. Active el botón 🔊 de altavoz para escuchar las respuestas en voz alta.',
      quickStart: 'Haga clic en cualquier tema — abre el asistente de IA y envía la capacitación automáticamente:',
      topics: [
        { emoji: '🏠', label: 'Panel',          desc: 'Guíame por el panel' },
        { emoji: '👥', label: 'Pacientes',      desc: 'Capacítame sobre gestión de pacientes' },
        { emoji: '📅', label: 'Citas',          desc: 'Muéstrame el calendario de citas' },
        { emoji: '⏱',  label: 'Reloj',         desc: 'Explícame cómo marcar entrada y salida' },
        { emoji: '🔔', label: 'Recordatorios', desc: '¿Cómo envío recordatorios a pacientes?' },
        { emoji: '💰', label: 'Nómina',        desc: 'Guíame para generar la nómina' },
        { emoji: '🤖', label: 'OptimumAI',     desc: 'Capacítame sobre todas las funciones de IA' },
      ],
      orType: 'O abra la IA (💡 parte inferior derecha) y escriba',
      orTypeQuote: '"Capacítame sobre [cualquier tema]"',
      orTypeRest: '— conoce todo este manual.',
      micNote: 'Use el botón 🎤 de micrófono para hablar su pregunta en lugar de escribirla.',
      copyPromptTemplate: 'Capacítame sobre {label} — dame una guía visual y oral completa paso a paso.',
      copied: '✓ ¡Enviado a IA!',
      clickToCopy: 'Clic para capacitar con IA',
      step1: 'Abrir IA (💡 parte inferior derecha)',
      step2: 'Activar 🔊 altavoz para capacitación oral',
      step3: 'Escriba o diga "Capacítame sobre Pacientes"',
      step4: 'Siga la guía paso a paso',
    },
  },
};

// ─── HELPER COMPONENTS ───────────────────────────────────────────────────────

function SectionHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div className="mb-6 pb-4 border-b border-gray-200">
      <div className="flex items-center gap-3 mb-1">
        <span className="text-3xl">{icon}</span>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>
      <p className="text-gray-500 ml-12">{subtitle}</p>
    </div>
  );
}

function Step({ number, title, children }: { number: number; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex gap-4 mb-5">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
        {number}
      </div>
      <div className="flex-1 pt-0.5">
        <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
        {children && <div className="text-sm text-gray-600 space-y-1">{children}</div>}
      </div>
    </div>
  );
}

function Card({ title, children, color = 'blue' }: { title: string; children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    blue:   'border-blue-200 bg-blue-50',
    teal:   'border-teal-200 bg-teal-50',
    green:  'border-green-200 bg-green-50',
    yellow: 'border-yellow-200 bg-yellow-50',
    purple: 'border-purple-200 bg-purple-50',
    orange: 'border-orange-200 bg-orange-50',
    red:    'border-red-200 bg-red-50',
  };
  return (
    <div className={`border rounded-lg p-4 mb-4 ${colors[color] ?? colors.blue}`}>
      <h4 className="font-semibold text-gray-800 mb-2">{title}</h4>
      <div className="text-sm text-gray-700 space-y-1">{children}</div>
    </div>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm text-amber-800">
      <span className="flex-shrink-0">💡</span>
      <div>{children}</div>
    </div>
  );
}

function AITask({ category, tasks }: { category: string; tasks: string[] }) {
  return (
    <div className="mb-5">
      <h4 className="font-semibold text-teal-700 text-sm uppercase tracking-wide mb-2">{category}</h4>
      <ul className="space-y-1.5">
        {tasks.map((t, i) => (
          <li key={i} className="flex gap-2 text-sm text-gray-700">
            <span className="flex-shrink-0 text-teal-500">›</span>
            <span>"{t}"</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── SECTION COMPONENTS ──────────────────────────────────────────────────────

type C = typeof CONTENT.en;

function OverviewSection({ c }: { c: C }) {
  const ov = c.overview;
  return (
    <div>
      <SectionHeader icon="📋" title={ov.title} subtitle={ov.subtitle} />
      <div className="prose max-w-none">
        <p className="text-gray-600 mb-6">
          {ov.intro} <strong>{ov.introName}</strong> {ov.introRest}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {ov.features.map(item => (
            <div key={item.title} className="flex gap-3 border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <div>
                <div className="font-semibold text-gray-900">{item.title}</div>
                <div className="text-xs text-gray-500">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <Card title={ov.rolesTitle} color="purple">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ov.roles.map(r => (
              <div key={r.role} className="bg-white rounded p-2 border border-purple-100">
                <span className="font-semibold text-purple-700">{r.role}: </span>
                <span className="text-gray-600">{r.desc}</span>
              </div>
            ))}
          </div>
        </Card>
        <Tip>{ov.aiTip}</Tip>
        <Tip>{ov.langTip}</Tip>
      </div>
    </div>
  );
}

function DashboardSection({ c }: { c: C }) {
  const d = c.dashboard;
  return (
    <div>
      <SectionHeader icon="🏠" title={c.nav[1].label} subtitle={d.subtitle} />
      <Step number={1} title={d.step1Title}>
        <p>{d.step1Intro}</p>
        <ul className="list-disc ml-4 mt-1 space-y-0.5">
          <li><strong>{d.card1}</strong> — {d.card1Desc}</li>
          <li><strong>{d.card2}</strong> — {d.card2Desc}</li>
          <li><strong>{d.card3}</strong> — {d.card3Desc}</li>
          <li><strong>{d.card4}</strong> — {d.card4Desc}</li>
        </ul>
      </Step>
      <Step number={2} title={d.step2Title}>
        <p>{d.step2Intro}</p>
        <ul className="list-disc ml-4 mt-1 space-y-0.5">
          <li>{d.step2Li1}</li>
          <li>{d.step2Li2}</li>
        </ul>
      </Step>
      <Step number={3} title={d.step3Title}>
        <p>{d.step3Text}</p>
      </Step>
      <Step number={4} title={d.step4Title}>
        <p>{d.step4Text}</p>
      </Step>
      <Tip>{d.tip}</Tip>
    </div>
  );
}

function PatientsSection({ c }: { c: C }) {
  const p = c.patients;
  return (
    <div>
      <SectionHeader icon="👥" title={c.nav[2].label} subtitle={p.subtitle} />
      <h3 className="font-semibold text-gray-800 text-lg mb-3">{p.registerTitle}</h3>
      <Step number={1} title={p.s1Title}><p>{p.s1Text}</p></Step>
      <Step number={2} title={p.s2Title}>
        <ul className="list-disc ml-4 space-y-0.5">
          {p.s2Items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: item.replace(/^([^—]+)—/, '<strong>$1</strong>—') }} />)}
        </ul>
      </Step>
      <Step number={3} title={p.s3Title}><p>{p.s3Text}</p></Step>
      <Step number={4} title={p.s4Title}><p>{p.s4Text}</p></Step>
      <Step number={5} title={p.s5Title}><p>{p.s5Text}</p></Step>

      <h3 className="font-semibold text-gray-800 text-lg mb-3 mt-6">{p.searchTitle}</h3>
      <Step number={1} title={p.srch1Title}><p>{p.srch1Text}</p></Step>
      <Step number={2} title={p.srch2Title}><p>{p.srch2Text}</p></Step>

      <h3 className="font-semibold text-gray-800 text-lg mb-3 mt-6">{p.tabsTitle}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {p.tabs.map(t => (
          <div key={t.tab} className="border border-gray-200 rounded-lg p-3 bg-white">
            <span className="font-semibold text-teal-700">{t.tab}: </span>
            <span className="text-sm text-gray-600">{t.desc}</span>
          </div>
        ))}
      </div>

      <h3 className="font-semibold text-gray-800 text-lg mb-3 mt-6">{p.editTitle}</h3>
      <Step number={1} title={p.e1Title}><p>{p.e1Text}</p></Step>
      <Step number={2} title={p.e2Title}><p>{p.e2Text}</p></Step>
      <Step number={3} title={p.e3Title}><p>{p.e3Text}</p></Step>

      <h3 className="font-semibold text-gray-800 text-lg mb-3 mt-6">{p.notesTitle}</h3>
      <Step number={1} title={p.n1Title} />
      <Step number={2} title={p.n2Title}>
        <p>{p.n2Text}</p>
        <ul className="list-disc ml-4 space-y-0.5 mt-1">
          {p.n2Types.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      </Step>
      <Step number={3} title={p.n3Title} />
      <Tip>{p.tip}</Tip>
    </div>
  );
}

function AppointmentsSection({ c }: { c: C }) {
  const a = c.appointments;
  return (
    <div>
      <SectionHeader icon="📅" title={c.nav[3].label} subtitle={a.subtitle} />
      <h3 className="font-semibold text-gray-800 text-lg mb-3">{a.navTitle}</h3>
      <Step number={1} title={a.n1Title}><p>{a.n1Text}</p></Step>
      <Step number={2} title={a.n2Title}><p>{a.n2Text}</p></Step>
      <Step number={3} title={a.n3Title}>
        <ul className="list-disc ml-4 space-y-0.5 mt-1">
          {a.colors.map(col => (
            <li key={col.label}><span className={`${col.color} font-medium`}>{col.label}</span> — {col.status}</li>
          ))}
        </ul>
      </Step>

      <h3 className="font-semibold text-gray-800 text-lg mb-3 mt-6">{a.schedTitle}</h3>
      <Step number={1} title={a.sc1Title}><p>{a.sc1Text}</p></Step>
      <Step number={2} title={a.sc2Title}><p>{a.sc2Text}</p></Step>
      <Step number={3} title={a.sc3Title}><p>{a.sc3Text}</p></Step>
      <Step number={4} title={a.sc4Title}><p>{a.sc4Text}</p></Step>
      <Step number={5} title={a.sc5Title}><p>{a.sc5Text}</p></Step>

      <h3 className="font-semibold text-gray-800 text-lg mb-3 mt-6">{a.editTitle}</h3>
      <Step number={1} title={a.ed1Title}><p>{a.ed1Text}</p></Step>
      <Step number={2} title={a.ed2Title}><p>{a.ed2Text}</p></Step>
      <Step number={3} title={a.ed3Title}><p>{a.ed3Text}</p></Step>

      <h3 className="font-semibold text-gray-800 text-lg mb-3 mt-6">{a.statusTitle}</h3>
      <Step number={1} title={a.st1Title}><p>{a.st1Text}</p></Step>
      <Step number={2} title={a.st2Title}><p>{a.st2Text}</p></Step>
      <Tip>{a.tip}</Tip>
    </div>
  );
}

function TimeClockSection({ c }: { c: C }) {
  const tc = c.timeclock;
  return (
    <div>
      <SectionHeader icon="⏱" title={c.nav[4].label} subtitle={tc.subtitle} />
      <Step number={1} title={tc.s1Title}><p>{tc.s1Text}</p></Step>
      <Step number={2} title={tc.s2Title}><p>{tc.s2Text}</p></Step>
      <Step number={3} title={tc.s3Title}><p>{tc.s3Text}</p></Step>
      <Step number={4} title={tc.s4Title}><p>{tc.s4Text}</p></Step>
      <Step number={5} title={tc.s5Title}><p>{tc.s5Text}</p></Step>
      <Step number={6} title={tc.s6Title}><p>{tc.s6Text}</p></Step>
      <Card title={tc.cardTitle} color="teal">
        <ul className="list-disc ml-4 space-y-0.5">
          {tc.cardItems.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </Card>
      <Tip>{tc.tip}</Tip>
    </div>
  );
}

function RemindersSection({ c }: { c: C }) {
  const r = c.reminders;
  return (
    <div>
      <SectionHeader icon="🔔" title={c.nav[5].label} subtitle={r.subtitle} />
      <Step number={1} title={r.s1Title}><p>{r.s1Text}</p></Step>
      <Step number={2} title={r.s2Title}>
        <ul className="list-disc ml-4 mt-1 space-y-0.5">
          {r.urgency.map(u => (
            <li key={u.label}><span className={`${u.color} font-medium`}>{u.label}</span> — {u.desc}</li>
          ))}
        </ul>
      </Step>
      <Step number={3} title={r.s3Title}><p>{r.s3Text}</p></Step>
      <Step number={4} title={r.s4Title}><p>{r.s4Text}</p></Step>
      <Step number={5} title={r.s5Title}><p>{r.s5Text}</p></Step>
      <Step number={6} title={r.s6Title}>
        <p>{r.s6Intro}</p>
        <ul className="list-disc ml-4 mt-1 space-y-0.5">
          {r.s6Items.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </Step>
      <Tip>{r.tip}</Tip>
    </div>
  );
}

function StaffSection({ c }: { c: C }) {
  const s = c.staff;
  return (
    <div>
      <SectionHeader icon="🧑‍⚕️" title={c.nav[6].label} subtitle={s.subtitle} />
      <Step number={1} title={s.s1Title}><p>{s.s1Text}</p></Step>
      <Step number={2} title={s.s2Title}>
        <p>{s.s2Intro}</p>
        <ul className="list-disc ml-4 mt-1 space-y-0.5">
          {s.s2Items.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </Step>
      <Step number={3} title={s.s3Title}><p>{s.s3Text}</p></Step>
      <Step number={4} title={s.s4Title}><p>{s.s4Text}</p></Step>
      <Card title={s.cardTitle} color="purple">
        <ul className="list-disc ml-4 space-y-0.5">
          {s.cardItems.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </Card>
    </div>
  );
}

function PayrollSection({ c }: { c: C }) {
  const p = c.payroll;
  return (
    <div>
      <SectionHeader icon="💰" title={c.nav[7].label} subtitle={p.subtitle} />
      <h3 className="font-semibold text-gray-800 text-lg mb-3">{p.generateTitle}</h3>
      <Step number={1} title={p.g1Title}><p>{p.g1Text}</p></Step>
      <Step number={2} title={p.g2Title}><p>{p.g2Text}</p></Step>
      <Step number={3} title={p.g3Title}><p>{p.g3Text}</p></Step>
      <Step number={4} title={p.g4Title}>
        <p>{p.g4Intro}</p>
        <ul className="list-disc ml-4 mt-1 space-y-0.5">
          {p.g4Items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: item.replace(/^([^—]+)—/, '<strong>$1</strong>—') }} />)}
        </ul>
        <p className="mt-1">{p.g4Outro}</p>
      </Step>
      <h3 className="font-semibold text-gray-800 text-lg mb-3 mt-6">{p.approveTitle}</h3>
      <Step number={1} title={p.a1Title}><p>{p.a1Text}</p></Step>
      <Step number={2} title={p.a2Title}><p>{p.a2Text}</p></Step>
      <h3 className="font-semibold text-gray-800 text-lg mb-3 mt-6">{p.printTitle}</h3>
      <Step number={1} title={p.p1Title}><p>{p.p1Text}</p></Step>
      <Card title={p.cardTitle} color="green">
        <p className="font-mono text-xs">{p.cardFlow}</p>
        <p className="mt-1">{p.cardNote}</p>
      </Card>
      <Tip>{p.tip}</Tip>
    </div>
  );
}

function OptimumAISection({ c }: { c: C }) {
  const o = c.optimumai;
  return (
    <div>
      <SectionHeader icon="🤖" title={`${c.nav[8].label} — ${o.subtitle.split(',')[0]}`} subtitle={o.subtitle} />
      <Card title={o.whatTitle} color="teal"><p>{o.whatText}</p></Card>

      <h3 className="font-semibold text-gray-800 text-lg mb-3">{o.openTitle}</h3>
      <Step number={1} title={o.o1Title}><p>{o.o1Text}</p></Step>
      <Step number={2} title={o.o2Title}><p>{o.o2Text}</p></Step>
      <Step number={3} title={o.o3Title}>
        <p><strong>{o.o3TypeLabel}</strong> {o.o3TypeText}</p>
        <p><strong>{o.o3VoiceLabel}</strong> {o.o3VoiceText}</p>
      </Step>
      <Step number={4} title={o.o4Title}><p>{o.o4Text}</p></Step>
      <Step number={5} title={o.o5Title}><p>{o.o5Text}</p></Step>
      <Tip>{o.voiceTip}</Tip>

      <h3 className="font-semibold text-gray-800 text-lg mb-3 mt-6">{o.bilingualTitle}</h3>
      <Step number={1} title={o.b1Title}><p>{o.b1Text}</p></Step>
      <Step number={2} title={o.b2Title}><p>{o.b2Text}</p></Step>
      <Step number={3} title={o.b3Title}><p>{o.b3Text}</p></Step>
      <Step number={4} title={o.b4Title}><p>{o.b4Text}</p></Step>
      <Tip>{o.bilingualTip}</Tip>

      <h3 className="font-semibold text-gray-800 text-lg mb-3 mt-6">{o.ttsTitle}</h3>
      <Step number={1} title={o.t1Title}><p>{o.t1Text}</p></Step>
      <Step number={2} title={o.t2Title}><p>{o.t2Text}</p></Step>
      <Step number={3} title={o.t3Title}><p>{o.t3Text}</p></Step>
      <Step number={4} title={o.t4Title}><p>{o.t4Text}</p></Step>
      <Step number={5} title={o.t5Title}><p>{o.t5Text}</p></Step>

      <Card title={o.trainingCardTitle} color="teal"><p>{o.trainingCardText}</p></Card>

      <h3 className="font-semibold text-gray-800 text-lg mb-4 mt-6">{o.tasksTitle}</h3>
      {o.taskCategories.map(cat => (
        <AITask key={cat.category} category={cat.category} tasks={cat.tasks} />
      ))}

      <Card title={o.tipsTitle} color="teal">
        <ul className="list-disc ml-4 space-y-1">
          {o.tips.map((tip, i) => <li key={i}>{tip}</li>)}
        </ul>
      </Card>
      <Tip>{o.contextTip}</Tip>
    </div>
  );
}

// ─── AI TRAINING BANNER ──────────────────────────────────────────────────────

function AITrainingBanner({ c }: { c: C }) {
  const [copied, setCopied] = useState<string | null>(null);
  const b = c.banner;

  const sendToAI = (desc: string, label: string) => {
    const prompt = b.copyPromptTemplate.replace('{label}', label);
    window.dispatchEvent(new CustomEvent('optimumai:send', { detail: { prompt } }));
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="mb-6 rounded-xl overflow-hidden border border-teal-200 shadow-sm">
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-bold text-base">{b.title}</h3>
            <p className="text-teal-100 text-xs mt-0.5">{b.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="bg-teal-50 px-5 py-4">
        <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-3">{b.quickStart}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {b.topics.map(t => (
            <button
              key={t.label}
              onClick={() => sendToAI(t.desc, t.label)}
              className="flex items-center gap-2 bg-white border border-teal-200 rounded-lg px-3 py-2 text-left hover:bg-teal-100 hover:border-teal-400 transition-colors group"
            >
              <span className="text-lg flex-shrink-0">{t.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-teal-700 truncate">{t.label}</div>
                <div className="text-xs text-gray-400 truncate group-hover:text-teal-600">
                  {copied === t.label ? b.copied : b.clickToCopy}
                </div>
              </div>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          {b.orType} <em>{b.orTypeQuote}</em> {b.orTypeRest}{' '}
          {b.micNote}
        </p>
      </div>

      <div className="bg-white px-5 py-3 border-t border-teal-100 flex flex-wrap gap-4 text-xs text-gray-600">
        {[b.step1, b.step2, b.step3, b.step4].map((step, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold text-xs flex-shrink-0">{i + 1}</span>
            <span>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export function Training() {
  const { lang } = useLanguage();
  const c = CONTENT[lang];
  const [active, setActive] = useState<Section>('overview');

  const renderContent = () => {
    switch (active) {
      case 'overview':     return <OverviewSection c={c} />;
      case 'dashboard':    return <DashboardSection c={c} />;
      case 'patients':     return <PatientsSection c={c} />;
      case 'appointments': return <AppointmentsSection c={c} />;
      case 'timeclock':    return <TimeClockSection c={c} />;
      case 'reminders':    return <RemindersSection c={c} />;
      case 'staff':        return <StaffSection c={c} />;
      case 'payroll':      return <PayrollSection c={c} />;
      case 'optimumai':    return <OptimumAISection c={c} />;
    }
  };

  return (
    <div className="space-y-4">
      <AITrainingBanner c={c} />

      <div className="flex flex-col lg:flex-row gap-6 min-h-[80vh]">
        <aside className="lg:w-56 flex-shrink-0">
          <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
            <div className="bg-teal-600 px-4 py-3">
              <h2 className="text-white font-semibold text-sm uppercase tracking-wide">{c.sidebarTitle}</h2>
              <p className="text-teal-200 text-xs">{c.sidebarSubtitle}</p>
            </div>
            <nav className="p-2 space-y-0.5">
              {c.nav.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    active === item.id
                      ? 'bg-teal-50 text-teal-700 font-semibold border border-teal-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="leading-tight">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <main className="flex-1 bg-white rounded-xl shadow border border-gray-200 p-6 lg:p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
