const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

export function getGoogleAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export function isGoogleCalendarConnected(): boolean {
  return !!localStorage.getItem('google_access_token');
}

export function disconnectGoogleCalendar(): void {
  localStorage.removeItem('google_access_token');
  localStorage.removeItem('google_refresh_token');
}

export async function exchangeCodeForToken(code: string): Promise<void> {
  const response = await fetch('/api/google/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) throw new Error('Failed to connect Google Calendar');

  const { access_token, refresh_token } = await response.json();
  localStorage.setItem('google_access_token', access_token);
  if (refresh_token) localStorage.setItem('google_refresh_token', refresh_token);
}

export interface CalendarEvent {
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
}

export async function createCalendarEvent(event: CalendarEvent): Promise<string> {
  const accessToken = localStorage.getItem('google_access_token');
  if (!accessToken) throw new Error('Not connected to Google Calendar');

  let response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  if (response.status === 401) {
    await refreshAccessToken();
    const newToken = localStorage.getItem('google_access_token')!;
    response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${newToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
  }

  if (!response.ok) throw new Error('Failed to create calendar event');

  const data = await response.json();
  return data.id;
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const accessToken = localStorage.getItem('google_access_token');
  if (!accessToken) return;

  await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

async function refreshAccessToken(): Promise<void> {
  const refreshToken = localStorage.getItem('google_refresh_token');
  if (!refreshToken) throw new Error('No refresh token');

  const response = await fetch('/api/google/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) throw new Error('Failed to refresh token');

  const { access_token } = await response.json();
  localStorage.setItem('google_access_token', access_token);
}
