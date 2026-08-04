import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const ICAL_URL = 'https://calendar.google.com/calendar/ical/8dc85166f24519f6b0e2225e6f56699aa7d3653ee9c132c301bd30f478605641%40group.calendar.google.com/public/basic.ics';

  try {
    const response = await fetch(ICAL_URL);
    const data = await response.text();

    return new Response(data, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar',
      },
    });
  } catch (error) {
    return new Response('Fehler beim Abrufen des Kalenders', { status: 500 });
  }
};