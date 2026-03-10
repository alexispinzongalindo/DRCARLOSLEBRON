# Optimum Therapy PT Practice Management System

A comprehensive, offline-first Progressive Web App (PWA) for Dr. Carlos Lebron-Quiñones, PT DPT at Optimum Therapy, Aguadilla, Puerto Rico. This HIPAA-compliant system manages physical therapy patient records, clinical evaluations (SOAP notes), appointments, staff scheduling, and communications.

## 🏥 Features

- **Offline-First Architecture**: Works 100% without internet, syncs when connectivity returns
- **HIPAA Compliant**: AES-256 encryption, audit logging, role-based access control
- **Clinical Documentation**: Structured SOAP note engine matching PT evaluation standards
- **Patient Management**: Complete demographics, insurance, and medical history
- **Appointment Scheduling**: Drag-and-drop calendar with conflict detection
- **Staff Management**: Time clock, scheduling, and role-based permissions
- **Automated Reminders**: Email and SMS notifications in English/Spanish
- **Hurricane-Proof**: Fully functional during power outages and internet disruptions

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **Offline Storage**: IndexedDB via Dexie.js (AES-256 encrypted)
- **Backend/Cloud**: Supabase (PostgreSQL) with Row-Level Security
- **Authentication**: Supabase Auth with role-based access control
- **PWA**: Vite PWA plugin with service worker
- **Sync Engine**: Background sync every 15 minutes + EOD reconciliation
- **Notifications**: Email (Resend API) + SMS (Twilio)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account with HIPAA add-on enabled
- Resend API key (for emails)
- Twilio account (for SMS)

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd optimum-therapy
   npm install
   ```
      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
