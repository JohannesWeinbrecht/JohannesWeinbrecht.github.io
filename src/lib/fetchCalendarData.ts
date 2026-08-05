import ICAL from "ical.js";
import { parse } from "yaml";

const ICAL_URL = 'https://calendar.google.com/calendar/ical/8dc85166f24519f6b0e2225e6f56699aa7d3653ee9c132c301bd30f478605641%40group.calendar.google.com/public/basic.ics';

let calendarDataPromise: Promise<Record<string, any> | null> | null = null;

export async function getCalendarData(): Promise<Record<string, any> | null> {
    if (calendarDataPromise) {
        return calendarDataPromise;
    }

    calendarDataPromise = (async () => {
        try {
            const response = await fetch(ICAL_URL);
            if (!response.ok) {
                throw new Error(`HTTP fetch failed with status ${response.status}`);
            }

            const data = await response.text();

            // iCal Daten parsen
            const jcalData = ICAL.parse(data);
            const vcalendar = new ICAL.Component(jcalData);
            const vevents = vcalendar.getAllSubcomponents("vevent");
            const calendarEvents = vevents.map((vevent) => new ICAL.Event(vevent));

            // Nutze die normale JS-Lokalzeit
            const now = new Date();

            const berlinTimeStr = now.toLocaleString("en-US", { timeZone: "Europe/Berlin" });
            const localNow = new Date(berlinTimeStr);

            const currentYear = localNow.getFullYear();
            const currentMonth = localNow.getMonth() + 1;
            const currentDay = localNow.getDate();

            // Filter auf "Status"-Events für HEUTE
            // 1. Suche nach einem spezifischen Tages-Event für HEUTE (ohne RRULE)
            const specificTodayEvent = calendarEvents.find((event) => {
                const isStatus = event.summary === "Status";
                const isNoRecurrence = !event.component.hasProperty("rrule");
                const isToday =
                    event.startDate.year === currentYear &&
                    event.startDate.month === currentMonth &&
                    event.startDate.day === currentDay;

                return isStatus && isNoRecurrence && isToday;
            });

            // 2. Suche nach dem Serien-Event (Haupt-Event mit RRULE) als Fallback
            const recurringSeriesEvent = calendarEvents.find((event) => {
                const isStatus = event.summary === "Status";
                const hasRecurrence = event.component.hasProperty("rrule");

                return isStatus && hasRecurrence;
            });

            // 3. Bevorzuge das Tages-Event. Wenn nicht vorhanden, nimm das Serien-Event.
            const informationEvent = specificTodayEvent ?? recurringSeriesEvent;


            if (!informationEvent?.description) {
                console.warn("Kein Status-Event für den heutigen Tag gefunden.");
                return null;
            }

            return parse(informationEvent.description) as Record<string, any>;
        } catch (error) {
            console.error("Fehler beim Abrufen der Kalenderdaten:", error);
            calendarDataPromise = null;
            return null;
        }
    })();

    return calendarDataPromise;
}
