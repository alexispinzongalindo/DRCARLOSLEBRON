import React, { useState } from 'react';

type Section = 'overview' | 'dashboard' | 'patients' | 'appointments' | 'timeclock' | 'reminders' | 'staff' | 'payroll' | 'optimumai';

const NAV: { id: Section; label: string; icon: string }[] = [
  { id: 'overview',      label: 'Overview',          icon: '📋' },
  { id: 'dashboard',     label: 'Dashboard',         icon: '🏠' },
  { id: 'patients',      label: 'Patients',          icon: '👥' },
  { id: 'appointments',  label: 'Appointments',      icon: '📅' },
  { id: 'timeclock',     label: 'Time Clock',        icon: '⏱' },
  { id: 'reminders',     label: 'Reminders',         icon: '🔔' },
  { id: 'staff',         label: 'Staff',             icon: '🧑‍⚕️' },
  { id: 'payroll',       label: 'Payroll',           icon: '💰' },
  { id: 'optimumai',     label: 'OptimumAI Guide',   icon: '🤖' },
];

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

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 mb-5">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
        {number}
      </div>
      <div className="flex-1 pt-0.5">
        <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
        <div className="text-sm text-gray-600 space-y-1">{children}</div>
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

// ─── SECTION CONTENT ────────────────────────────────────────────────────────

function OverviewSection() {
  return (
    <div>
      <SectionHeader icon="📋" title="User Manual — Optimum Therapy" subtitle="Complete guide to using all features of the clinic management system" />

      <div className="prose max-w-none">
        <p className="text-gray-600 mb-6">
          Welcome to <strong>Optimum Therapy</strong> — the all-in-one clinic management platform for Dr. Carlos Lebron-Quiñones PT DPT.
          This manual walks you through every section of the system. Use the left menu to jump to any topic.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {[
            { icon: '🏠', title: 'Dashboard',        desc: 'Daily overview, stats, and quick actions' },
            { icon: '👥', title: 'Patients',         desc: 'Register, search, and manage patient records' },
            { icon: '📅', title: 'Appointments',     desc: 'Schedule and track appointments on a calendar' },
            { icon: '⏱',  title: 'Time Clock',       desc: 'Staff clock in/out and break tracking' },
            { icon: '🔔', title: 'Reminders',        desc: 'Send SMS, email, or call reminders to patients' },
            { icon: '🧑‍⚕️', title: 'Staff',          desc: 'Manage employees, roles, and licenses' },
            { icon: '💰', title: 'Payroll',          desc: 'Generate and approve payroll from time entries' },
            { icon: '🤖', title: 'OptimumAI',        desc: 'AI assistant — ask anything, anytime' },
          ].map(item => (
            <div key={item.title} className="flex gap-3 border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <div>
                <div className="font-semibold text-gray-900">{item.title}</div>
                <div className="text-xs text-gray-500">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <Card title="User Roles & Permissions" color="purple">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { role: 'Admin',      desc: 'Full access to all sections including staff and payroll' },
              { role: 'Therapist',  desc: 'Patients, appointments, encounters, SOAP notes, time clock' },
              { role: 'Front Desk', desc: 'Patients, appointments, reminders, time clock' },
              { role: 'Billing',    desc: 'Patient records, insurance data, payroll review' },
            ].map(r => (
              <div key={r.role} className="bg-white rounded p-2 border border-purple-100">
                <span className="font-semibold text-purple-700">{r.role}: </span>
                <span className="text-gray-600">{r.desc}</span>
              </div>
            ))}
          </div>
        </Card>

        <Tip>
          The <strong>OptimumAI</strong> assistant (lightbulb button, bottom-right) is available on every screen.
          You can type or speak your question at any time — no need to navigate to a specific page first.
        </Tip>
      </div>
    </div>
  );
}

function DashboardSection() {
  return (
    <div>
      <SectionHeader icon="🏠" title="Dashboard" subtitle="Your daily command center — everything at a glance" />

      <Step number={1} title="Reading the Summary Cards">
        <p>The four cards at the top show your current clinic status:</p>
        <ul className="list-disc ml-4 mt-1 space-y-0.5">
          <li><strong>Today's Appointments</strong> — total appointments scheduled for today</li>
          <li><strong>Pending Notes</strong> — encounters that still need a SOAP note completed</li>
          <li><strong>Active Patients</strong> — total non-deleted patients in the system</li>
          <li><strong>Sync Status</strong> — whether the app is connected to the network (On Line / Off Line)</li>
        </ul>
      </Step>

      <Step number={2} title="Today's Appointments Panel">
        <p>Shows up to 5 appointments for today. Each entry displays:</p>
        <ul className="list-disc ml-4 mt-1 space-y-0.5">
          <li>Patient name, time range, and appointment type</li>
          <li>Color-coded status badge: <em>confirmed</em> (green), <em>scheduled</em> (blue), <em>checked in</em> (yellow), <em>completed</em> (gray), <em>cancelled / no-show</em> (red)</li>
        </ul>
      </Step>

      <Step number={3} title="Pending Notes Panel (Therapist / Admin only)">
        <p>Lists encounters that have not yet been documented. Click <strong>Complete</strong> to open the SOAP note form directly.</p>
      </Step>

      <Step number={4} title="Quick Actions">
        <p>Use the <strong>New Patient</strong> and <strong>New Appointment</strong> buttons in the top-right of the dashboard to create records without leaving the home screen.</p>
      </Step>

      <Tip>If Sync Status shows "Off Line", data is saved locally and will sync automatically once the connection is restored.</Tip>
    </div>
  );
}

function PatientsSection() {
  return (
    <div>
      <SectionHeader icon="👥" title="Patients" subtitle="Register new patients, search records, and manage clinical information" />

      <h3 className="font-semibold text-gray-800 text-lg mb-3">Registering a New Patient</h3>
      <Step number={1} title="Open the New Patient form">
        <p>Click <strong>Patients</strong> in the top navigation, then click the <strong>New Patient</strong> button (top-right).</p>
      </Step>
      <Step number={2} title="Fill in Personal Information">
        <ul className="list-disc ml-4 space-y-0.5">
          <li><strong>First Name</strong> and <strong>Last Name</strong> — required</li>
          <li><strong>Date of Birth</strong> — required; use the date picker</li>
          <li><strong>Sex</strong> — select Male, Female, or Other</li>
          <li><strong>Phone</strong> — format: (787) 123-4567</li>
          <li><strong>Email</strong> — optional but recommended for reminders</li>
        </ul>
      </Step>
      <Step number={3} title="Fill in Address & Emergency Contact">
        <p>Enter the complete address (street, city, state, zip) and an emergency contact with name and phone number.</p>
      </Step>
      <Step number={4} title="Enter Insurance Information">
        <p>Enter the <strong>Insurance Member ID</strong>. This will appear in evaluations and billing documents.</p>
      </Step>
      <Step number={5} title="Save the patient">
        <p>Click <strong>Save Patient</strong>. A unique MRN (Medical Record Number) is generated automatically.</p>
      </Step>

      <h3 className="font-semibold text-gray-800 text-lg mb-3 mt-6">Searching for a Patient</h3>
      <Step number={1} title="Use the search bar">
        <p>Type any of the following in the search box: patient name, MRN, date of birth, or phone number. Results appear automatically after a short pause.</p>
      </Step>
      <Step number={2} title="Select a patient">
        <p>Click any patient row to open their <strong>Patient Detail</strong> view.</p>
      </Step>

      <h3 className="font-semibold text-gray-800 text-lg mb-3 mt-6">Patient Detail Tabs</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {[
          { tab: 'Overview',      desc: 'Demographics, contact info, quick stats, recent activity' },
          { tab: 'Appointments',  desc: 'Full appointment history for this patient' },
          { tab: 'Encounters',    desc: 'Clinical encounters and SOAP note completion status' },
          { tab: 'Evaluations',   desc: 'Physical therapy evaluation reports' },
          { tab: 'Notes',         desc: 'Clinical notes: progress, phone calls, physician communication, discharge, and more' },
        ].map(t => (
          <div key={t.tab} className="border border-gray-200 rounded-lg p-3 bg-white">
            <span className="font-semibold text-teal-700">{t.tab}: </span>
            <span className="text-sm text-gray-600">{t.desc}</span>
          </div>
        ))}
      </div>

      <h3 className="font-semibold text-gray-800 text-lg mb-3 mt-6">Editing a Patient</h3>
      <Step number={1} title="Open the patient record">
        <p>Go to Patients, search for the patient, and click their name.</p>
      </Step>
      <Step number={2} title="Click Edit Patient">
        <p>The button is in the top-right of the patient header. The form opens pre-filled with all existing data.</p>
      </Step>
      <Step number={3} title="Make changes and save">
        <p>Update any fields and click <strong>Update Patient</strong>. Changes are saved immediately.</p>
      </Step>

      <h3 className="font-semibold text-gray-800 text-lg mb-3 mt-6">Adding Clinical Notes</h3>
      <Step number={1} title="Open the Notes tab in Patient Detail" />
      <Step number={2} title="Click + Add Note">
        <p>Select the note type from the dropdown:</p>
        <ul className="list-disc ml-4 space-y-0.5 mt-1">
          <li>Progress Note, Phone Call, Treatment Session</li>
          <li>Physician Communication, Insurance / Auth</li>
          <li>Missed Appointment, Discharge Note, General Note</li>
        </ul>
      </Step>
      <Step number={3} title="Enter the date and note content, then click Save Note" />

      <Tip>All notes are date-stamped and color-coded by type for easy identification.</Tip>
    </div>
  );
}

function AppointmentsSection() {
  return (
    <div>
      <SectionHeader icon="📅" title="Appointments" subtitle="Schedule, view, and manage all clinic appointments on an interactive calendar" />

      <h3 className="font-semibold text-gray-800 text-lg mb-3">Navigating the Calendar</h3>
      <Step number={1} title="Choose a view">
        <p>Use the <strong>Day / Week / Month</strong> buttons (top-right of calendar) to switch views.</p>
      </Step>
      <Step number={2} title="Move between dates">
        <p>Click the <strong>← →</strong> arrows to go back or forward. Click <strong>Today</strong> to return to the current date.</p>
      </Step>
      <Step number={3} title="Read the appointment colors">
        <ul className="list-disc ml-4 space-y-0.5 mt-1">
          <li><span className="text-blue-600 font-medium">Blue</span> — Scheduled</li>
          <li><span className="text-green-600 font-medium">Green</span> — Confirmed</li>
          <li><span className="text-yellow-600 font-medium">Yellow</span> — Checked In</li>
          <li><span className="text-gray-600 font-medium">Gray</span> — Completed</li>
          <li><span className="text-red-600 font-medium">Red</span> — Cancelled or No-Show</li>
        </ul>
      </Step>

      <h3 className="font-semibold text-gray-800 text-lg mb-3 mt-6">Scheduling a New Appointment</h3>
      <Step number={1} title="Click New Appointment">
        <p>From the Appointments page or from the Dashboard quick-action button.</p>
      </Step>
      <Step number={2} title="Select the patient">
        <p>Search by name or MRN to find the patient.</p>
      </Step>
      <Step number={3} title="Set date, time, and type">
        <p>Choose the appointment date, start time, end time, and appointment type (e.g., PT Evaluation, PT Follow-up, PT Re-evaluation).</p>
      </Step>
      <Step number={4} title="Assign a staff member">
        <p>Select the therapist or provider from the staff dropdown.</p>
      </Step>
      <Step number={5} title="Add notes (optional) and save">
        <p>Click <strong>Save Appointment</strong>. The appointment appears immediately on the calendar.</p>
      </Step>

      <h3 className="font-semibold text-gray-800 text-lg mb-3 mt-6">Changing Appointment Status</h3>
      <Step number={1} title="Click the appointment on the calendar" />
      <Step number={2} title="Select the new status from the dropdown">
        <p>Options: Scheduled → Confirmed → Checked In → Completed. You can also mark as Cancelled or No-Show.</p>
      </Step>

      <Tip>You can call the patient directly from the appointment card — look for the phone link next to their number.</Tip>
    </div>
  );
}

function TimeClockSection() {
  return (
    <div>
      <SectionHeader icon="⏱" title="Time Clock" subtitle="Track your work hours, breaks, and weekly totals" />

      <Step number={1} title="Clock In">
        <p>Navigate to <strong>Time Clock</strong> in the top navigation. Click the <strong>Clock In</strong> button. Optionally add a note (e.g., "Opening shift"). The button changes to Clock Out and a timer starts.</p>
      </Step>
      <Step number={2} title="Start a Break">
        <p>Click <strong>Start Break</strong> when you leave for a break. The break timer starts automatically and break time is tracked separately.</p>
      </Step>
      <Step number={3} title="End a Break">
        <p>Click <strong>End Break</strong> when you return. Break duration is recorded and subtracted from total hours worked.</p>
      </Step>
      <Step number={4} title="Clock Out">
        <p>Click <strong>Clock Out</strong> at the end of your shift. Total hours (minus breaks) are calculated and saved.</p>
      </Step>
      <Step number={5} title="Review your entries">
        <p>The <strong>Recent Time Entries</strong> section shows your last 10 entries with clock-in/out times, break times, total hours, and notes.</p>
      </Step>
      <Step number={6} title="Check your weekly summary">
        <p>The <strong>Weekly Summary</strong> at the bottom shows total hours this week, days worked, and average hours per day.</p>
      </Step>

      <Card title="What is tracked per entry:" color="teal">
        <ul className="list-disc ml-4 space-y-0.5">
          <li>Clock-in timestamp</li>
          <li>Clock-out timestamp</li>
          <li>Break start and end times</li>
          <li>Total hours worked (net of break time)</li>
          <li>Optional shift note</li>
        </ul>
      </Card>

      <Tip>Time entries are used automatically by Payroll to calculate hours for each pay period — no manual entry needed.</Tip>
    </div>
  );
}

function RemindersSection() {
  return (
    <div>
      <SectionHeader icon="🔔" title="Reminders" subtitle="Send appointment reminders to patients via SMS, email, or phone call" />

      <Step number={1} title="Open the Reminders section">
        <p>Click <strong>Reminders</strong> in the top navigation. The screen shows all appointments from today through the next 7 days that are Scheduled or Confirmed.</p>
      </Step>
      <Step number={2} title="Read the urgency indicators">
        <ul className="list-disc ml-4 mt-1 space-y-0.5">
          <li><span className="text-red-600 font-medium">Red</span> — Appointment is within 2 hours (urgent)</li>
          <li><span className="text-yellow-600 font-medium">Yellow</span> — Appointment is within 24 hours</li>
          <li><span className="text-blue-600 font-medium">Blue</span> — Appointment is more than 24 hours away</li>
        </ul>
      </Step>
      <Step number={3} title="Send a reminder to a specific patient">
        <p>Find the appointment card and click one of: <strong>SMS</strong>, <strong>Email</strong>, or <strong>Call</strong>. The call button opens your device's dialer.</p>
      </Step>
      <Step number={4} title="Send all reminders at once">
        <p>Click <strong>Send All Reminders</strong> (top-right) to send reminders to all upcoming appointments in one action.</p>
      </Step>
      <Step number={5} title="Confirm an appointment">
        <p>After contacting the patient, click <strong>Confirm</strong> on their appointment card to update the status to Confirmed.</p>
      </Step>
      <Step number={6} title="Configure reminder settings">
        <p>Use the Settings panel to:</p>
        <ul className="list-disc ml-4 mt-1 space-y-0.5">
          <li>Enable or disable automatic reminders</li>
          <li>Set how many days in advance to send (1–3 days)</li>
          <li>Choose methods: SMS, Email, Call</li>
          <li>Customize the reminder message template using <em>{'{patient}'}</em>, <em>{'{date}'}</em>, and <em>{'{time}'}</em> placeholders</li>
        </ul>
      </Step>

      <Tip>The summary cards at the top show how many appointments need reminders, how many are confirmed, and how many are urgent.</Tip>
    </div>
  );
}

function StaffSection() {
  return (
    <div>
      <SectionHeader icon="🧑‍⚕️" title="Staff" subtitle="Manage clinic employees, roles, and contact information" />

      <Step number={1} title="View the staff list">
        <p>Click <strong>Staff</strong> in the navigation. The list shows all employees. Use the filter tabs to view by status (Active / Inactive) or by role (Admin, Therapist, Front Desk, Billing).</p>
      </Step>
      <Step number={2} title="Add a new staff member">
        <p>Click <strong>Add Staff Member</strong>. Fill in:</p>
        <ul className="list-disc ml-4 mt-1 space-y-0.5">
          <li>First and last name</li>
          <li>Role (Admin / Therapist / Front Desk / Billing)</li>
          <li>Position/title</li>
          <li>Phone and email</li>
          <li>License number (for therapists)</li>
          <li>Hourly rate (used in payroll calculations)</li>
        </ul>
      </Step>
      <Step number={3} title="Edit a staff member">
        <p>Click the staff member's name to open their detail page, then click <strong>Edit</strong> to update their information.</p>
      </Step>
      <Step number={4} title="Deactivate a staff member">
        <p>Click the <strong>Toggle Active/Inactive</strong> button. The employee is deactivated (not deleted) to preserve historical records such as time entries and payroll.</p>
      </Step>

      <Card title="Important notes about staff roles:" color="purple">
        <ul className="list-disc ml-4 space-y-0.5">
          <li>Role determines which sections of the app the employee can access</li>
          <li>Only Admins can manage staff and view payroll</li>
          <li>Hourly rate is private and only visible to Admins</li>
        </ul>
      </Card>
    </div>
  );
}

function PayrollSection() {
  return (
    <div>
      <SectionHeader icon="💰" title="Payroll" subtitle="Generate, review, approve, and pay staff payroll from time clock entries" />

      <h3 className="font-semibold text-gray-800 text-lg mb-3">Generating Payroll</h3>
      <Step number={1} title="Open Payroll and click Generate Payroll">
        <p>Navigate to <strong>Payroll</strong> in the top navigation. Click the <strong>Generate Payroll</strong> button.</p>
      </Step>
      <Step number={2} title="Step 1 — Select Pay Period">
        <p>Choose the start and end dates. You can also click one of the quick-select buttons for the last 4 bi-weekly periods.</p>
      </Step>
      <Step number={3} title="Step 2 — Select Staff">
        <p>Check the employees to include. Click <strong>Select All</strong> to include everyone, or select individually. Each row shows the employee's role and hourly rate.</p>
      </Step>
      <Step number={4} title="Step 3 — Review and Adjust">
        <p>The system calculates hours automatically from Time Clock entries:</p>
        <ul className="list-disc ml-4 mt-1 space-y-0.5">
          <li><strong>Regular hours</strong> — up to 40 hours/week</li>
          <li><strong>Overtime hours</strong> — above 40 hours at 1.5× the hourly rate</li>
          <li><strong>Deductions</strong> — editable field for tax withholdings, etc.</li>
          <li><strong>Net Pay</strong> — calculated automatically (gross − deductions)</li>
        </ul>
        <p className="mt-1">Review totals, adjust deductions if needed, then click <strong>Save Payroll</strong>.</p>
      </Step>

      <h3 className="font-semibold text-gray-800 text-lg mb-3 mt-6">Approving & Paying</h3>
      <Step number={1} title="Approve a draft payroll">
        <p>In the payroll list, find a record with status <strong>Draft</strong> and click <strong>Approve</strong>. This locks the record from further edits.</p>
      </Step>
      <Step number={2} title="Mark as Paid">
        <p>After issuing payment, click <strong>Mark as Paid</strong> on an Approved record. Status changes to <strong>Paid</strong>.</p>
      </Step>

      <h3 className="font-semibold text-gray-800 text-lg mb-3 mt-6">Printing Payroll</h3>
      <Step number={1} title="Click Print All">
        <p>A printable payroll report opens with the clinic name, date, all employee records, and a grand total row.</p>
      </Step>

      <Card title="Payroll status flow:" color="green">
        <p className="font-mono text-xs">Draft → Approved → Paid</p>
        <p className="mt-1">Only Admins can generate, approve, and mark payroll as paid.</p>
      </Card>

      <Tip>Make sure all staff have clocked in and out for the full pay period before generating payroll — missing time entries will result in lower calculated hours.</Tip>
    </div>
  );
}

function OptimumAISection() {
  return (
    <div>
      <SectionHeader icon="🤖" title="OptimumAI — Complete Guide" subtitle="Your intelligent clinic assistant, available on every screen, 24/7" />

      <Card title="What is OptimumAI?" color="teal">
        <p>
          OptimumAI is a built-in artificial intelligence assistant trained to help you manage the clinic efficiently.
          It understands the context of your current screen (which patient you are viewing, how many appointments you have today, your role, etc.)
          and provides answers, guidance, and support instantly — without you having to leave the page.
        </p>
      </Card>

      <h3 className="font-semibold text-gray-800 text-lg mb-3">How to Open OptimumAI</h3>
      <Step number={1} title="Find the lightbulb button">
        <p>Look for the <strong>lightbulb icon</strong> (💡) floating in the <strong>bottom-right corner</strong> of every screen.</p>
      </Step>
      <Step number={2} title="Click to open the chat panel">
        <p>A chat window appears. OptimumAI greets you by name and is ready to help.</p>
      </Step>
      <Step number={3} title="Type your question or use voice">
        <p>
          <strong>Type:</strong> Click the text field, type your question, and press <strong>Enter</strong> (or click the send button).<br />
          <strong>Voice:</strong> Click the <strong>microphone button</strong> 🎤, speak your question, and it will be transcribed automatically. Then press Enter to send.
        </p>
      </Step>
      <Step number={4} title="Read the response">
        <p>OptimumAI replies in seconds. You can continue the conversation naturally — it remembers the full chat history within the session.</p>
      </Step>
      <Step number={5} title="Close the assistant">
        <p>Click the <strong>X button</strong> to close the chat panel. Your history is saved for the current session.</p>
      </Step>

      <Tip>You can use voice input in English or Spanish. Just click the mic and speak naturally.</Tip>

      <h3 className="font-semibold text-gray-800 text-lg mb-3 mt-6">Text-to-Speech — Oral Training</h3>
      <Step number={1} title="Find the speaker button in the AI header">
        <p>When the AI chat is open, look at the <strong>teal header bar</strong>. There is a <strong>speaker icon</strong> (🔊) on the right side of the header.</p>
      </Step>
      <Step number={2} title="Click the speaker to enable Voice Output">
        <p>The button turns <strong>white</strong> to indicate voice is ON. From this point, every AI response will be <strong>read aloud automatically</strong> as soon as it arrives.</p>
      </Step>
      <Step number={3} title="Listen to the training">
        <p>Ask the AI to train you on any topic. It will speak the full step-by-step walkthrough aloud while you follow along on screen.</p>
      </Step>
      <Step number={4} title="Re-read any message">
        <p>Below every AI message you will see a small <strong>🔊 Read aloud</strong> link. Click it to replay that specific response at any time.</p>
      </Step>
      <Step number={5} title="Mute voice output">
        <p>Click the speaker button again to turn voice OFF. The button returns to its gray/dim state.</p>
      </Step>

      <Card title="Training Mode — this page" color="teal">
        <p>When you are on the <strong>Training</strong> page, OptimumAI automatically enters <strong>Training Mode</strong>.
        You will see a green pulsing dot and the label "Training Mode Active" in the AI header.
        In this mode the AI provides longer, more detailed visual walkthroughs — describing exactly what you will see on screen and what to click.</p>
      </Card>

      <h3 className="font-semibold text-gray-800 text-lg mb-4 mt-6">All Tasks OptimumAI Can Help With</h3>

      <AITask category="Patient Information & Records" tasks={[
        'What are the demographics for patient Roberto Gonzalez?',
        'What insurance does Alexis Pinzon-Galindo have?',
        'When was Carmen Rivera-Santos last seen?',
        'How do I add an emergency contact for a patient?',
        'How do I edit a patient\'s address?',
        'What does MRN stand for and how is it generated?',
        'How many active patients do we have?',
        'How do I search for a patient by date of birth?',
      ]} />

      <AITask category="Appointments & Scheduling" tasks={[
        'How many appointments do I have today?',
        'How do I schedule a new appointment?',
        'What appointment types are available?',
        'How do I change an appointment from Scheduled to Confirmed?',
        'What does "no-show" status mean and how do I set it?',
        'How do I view the weekly calendar?',
        'Can I see all appointments for a specific patient?',
        'How do I cancel an appointment?',
      ]} />

      <AITask category="Clinical Notes & SOAP Documentation" tasks={[
        'How do I complete a pending SOAP note?',
        'What is a SOAP note?',
        'How do I add a Progress Note for a patient?',
        'What types of clinical notes can I write?',
        'How do I document a phone call with a patient?',
        'How do I write a discharge note?',
        'Where do I find pending notes for today?',
        'How do I record a missed appointment in the notes?',
      ]} />

      <AITask category="Physical Therapy & Clinical Guidance" tasks={[
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
      ]} />

      <AITask category="Reminders & Patient Communication" tasks={[
        'How do I send a reminder to a patient?',
        'How do I confirm an appointment after calling the patient?',
        'What does the urgency color mean on reminders?',
        'How do I send all reminders at once?',
        'How do I customize the reminder message template?',
        'Can reminders be sent by email instead of SMS?',
        'Which patients need reminders for tomorrow?',
      ]} />

      <AITask category="Staff Management" tasks={[
        'How do I add a new staff member?',
        'How do I change a staff member\'s role?',
        'What is the difference between Therapist and Front Desk roles?',
        'How do I deactivate an employee who left?',
        'Where do I enter a staff member\'s license number?',
        'How do I update an employee\'s hourly rate?',
      ]} />

      <AITask category="Time Clock & Attendance" tasks={[
        'How do I clock in?',
        'How do I record a break?',
        'How many hours did I work this week?',
        'What happens if I forget to clock out?',
        'Does break time count toward my total hours?',
        'Where can I see my recent time entries?',
        'How does the system calculate overtime?',
      ]} />

      <AITask category="Payroll & Compensation" tasks={[
        'How do I generate payroll for this pay period?',
        'How does the system calculate overtime pay?',
        'How do I approve a payroll record?',
        'How do I mark payroll as paid?',
        'How do I print a payroll report?',
        'What is the difference between gross pay and net pay?',
        'Can I adjust deductions before approving payroll?',
        'What pay periods are available for quick selection?',
      ]} />

      <AITask category="Insurance & Billing Information" tasks={[
        'Where do I find a patient\'s insurance ID?',
        'What is the clinic\'s NPI number?',
        'What is the clinic\'s PTAN number?',
        'What is Dr. Lebron\'s PT license number?',
        'How do I add insurance information to a new patient?',
        'What CPT codes does the clinic commonly use?',
      ]} />

      <AITask category="System Help & Navigation" tasks={[
        'How do I get back to the dashboard?',
        'What is the difference between Encounters and Notes?',
        'Why is the Sync Status showing Off Line?',
        'What does "Pending" sync status mean on a patient record?',
        'How do I sign out?',
        'Will I be logged out automatically?',
        'What permissions does the Front Desk role have?',
        'How do I use the voice input feature?',
      ]} />

      <AITask category="Clinic Information" tasks={[
        'What is the clinic\'s address?',
        'What is the clinic\'s phone number?',
        'Who is the treating provider?',
        'What are the clinic\'s service specialties?',
        'What is Dr. Lebron\'s NPI?',
      ]} />

      <Card title="Tips for best results with OptimumAI" color="teal">
        <ul className="list-disc ml-4 space-y-1">
          <li>Ask in complete sentences for the most accurate answers</li>
          <li>You can ask follow-up questions — OptimumAI remembers the conversation</li>
          <li>Use voice input when your hands are occupied</li>
          <li>Ask "how do I..." for step-by-step guidance on any feature</li>
          <li>Ask clinical questions during patient encounters for quick reference</li>
          <li>OptimumAI knows your role — it will tailor answers to what you have access to</li>
        </ul>
      </Card>

      <Tip>
        OptimumAI is context-aware. When you are on the Patients page it knows you are working with patients.
        When you are on the Dashboard it knows your appointment count for today. This means you can ask short questions like
        "how many pending notes do I have?" and it will answer with your actual data.
      </Tip>
    </div>
  );
}

// ─── AI TRAINING BANNER ──────────────────────────────────────────────────────

const AI_TOPICS = [
  { emoji: '🏠', label: 'Dashboard',    desc: 'Walk me through the dashboard' },
  { emoji: '👥', label: 'Patients',     desc: 'Train me on patient management' },
  { emoji: '📅', label: 'Appointments', desc: 'Show me the appointments calendar' },
  { emoji: '⏱',  label: 'Time Clock',  desc: 'Explain how to clock in and out' },
  { emoji: '🔔', label: 'Reminders',   desc: 'How do I send patient reminders?' },
  { emoji: '💰', label: 'Payroll',     desc: 'Walk me through generating payroll' },
  { emoji: '🤖', label: 'OptimumAI',  desc: 'Train me on all AI features' },
];

function AITrainingBanner() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyPrompt = (text: string, label: string) => {
    navigator.clipboard.writeText(`Train me on ${label} — give me a complete visual and oral step-by-step walkthrough.`);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="mb-6 rounded-xl overflow-hidden border border-teal-200 shadow-sm">
      {/* Banner header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-bold text-base">OptimumAI Training Mode is Active on This Page</h3>
            <p className="text-teal-100 text-xs mt-0.5">
              The AI assistant (💡 bottom-right) is in Training Mode — it provides full visual &amp; oral step-by-step walkthroughs.
              Enable the 🔊 speaker button to hear responses read aloud.
            </p>
          </div>
        </div>
      </div>

      {/* Topic quick-start */}
      <div className="bg-teal-50 px-5 py-4">
        <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-3">
          Quick Start — Click a topic, then open the AI assistant (💡) and paste or type it:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {AI_TOPICS.map(t => (
            <button
              key={t.label}
              onClick={() => copyPrompt(t.desc, t.label)}
              className="flex items-center gap-2 bg-white border border-teal-200 rounded-lg px-3 py-2 text-left hover:bg-teal-100 hover:border-teal-400 transition-colors group"
            >
              <span className="text-lg flex-shrink-0">{t.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-teal-700 truncate">{t.label}</div>
                <div className="text-xs text-gray-400 truncate group-hover:text-teal-600">
                  {copied === t.label ? '✓ Copied!' : 'Click to copy prompt'}
                </div>
              </div>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Or just open the AI and type <em>"Train me on [any topic]"</em> — it knows this entire manual.
          Use the <strong>🎤 mic button</strong> to speak your question instead of typing.
        </p>
      </div>

      {/* How to use voice */}
      <div className="bg-white px-5 py-3 border-t border-teal-100 flex flex-wrap gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold text-xs flex-shrink-0">1</span>
          <span>Open AI (💡 bottom-right)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold text-xs flex-shrink-0">2</span>
          <span>Enable 🔊 speaker for oral training</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold text-xs flex-shrink-0">3</span>
          <span>Type or say <em>"Train me on Patients"</em></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold text-xs flex-shrink-0">4</span>
          <span>Follow the step-by-step walkthrough</span>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

export function Training() {
  const [active, setActive] = useState<Section>('overview');

  const renderContent = () => {
    switch (active) {
      case 'overview':     return <OverviewSection />;
      case 'dashboard':    return <DashboardSection />;
      case 'patients':     return <PatientsSection />;
      case 'appointments': return <AppointmentsSection />;
      case 'timeclock':    return <TimeClockSection />;
      case 'reminders':    return <RemindersSection />;
      case 'staff':        return <StaffSection />;
      case 'payroll':      return <PayrollSection />;
      case 'optimumai':    return <OptimumAISection />;
    }
  };

  return (
    <div className="space-y-4">
      {/* AI Training Banner — always visible on this page */}
      <AITrainingBanner />

      <div className="flex flex-col lg:flex-row gap-6 min-h-[80vh]">
        {/* Sidebar */}
        <aside className="lg:w-56 flex-shrink-0">
          <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
            <div className="bg-teal-600 px-4 py-3">
              <h2 className="text-white font-semibold text-sm uppercase tracking-wide">Training</h2>
              <p className="text-teal-200 text-xs">User Manual</p>
            </div>
            <nav className="p-2 space-y-0.5">
              {NAV.map(item => (
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

        {/* Content */}
        <main className="flex-1 bg-white rounded-xl shadow border border-gray-200 p-6 lg:p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
