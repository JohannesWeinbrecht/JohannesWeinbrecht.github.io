import ICAL from "ical.js";
import { parse } from "yaml";

export async function fetchCalendarOnClient() {
    const listElement = document.getElementById("event-list")!;
    const loadingElement = document.getElementById("loading")!;

    try {
        // Ruf deine eigene API-Route an, nicht direkt Google (CORS-Bypass)
        const response = await fetch("/api/calendarData");
        const data = await response.text();

        // iCal Daten parsen
        const jcalData = ICAL.parse(data);
        const vcalendar = new ICAL.Component(jcalData);
        const vevents = vcalendar.getAllSubcomponents("vevent");
        const calendearEvents = vevents.map((vevent) => {
            return new ICAL.Event(vevent);
        });

        const statusEvents = calendearEvents.filter((vevent) => {
            if (vevent.summary === "Status") {
                return true;
            }
            return false;
        });

        const today = new Date();
        today.setDate(today.getDate());
        //today.setHours(0, 0, 0, 0);

        // 2. In ICAL.Time umwandeln
        const icaltodayStart = ICAL.Time.fromJSDate(today, true); // 'true' für lokale Zeit
        icaltodayStart.isDate = true;

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        //tomorrow.setHours(0, 0, 0, 0);

        // 2. In ICAL.Time umwandeln
        const icalTomorrowStart = ICAL.Time.fromJSDate(tomorrow, true); // 'true' für lokale Zeit
        icalTomorrowStart.isDate = true;

        const todayStatusEvents = statusEvents.filter((event) => {
            if (
                event.startDate.compare(icaltodayStart) === 0 &&
                event.endDate.compare(icalTomorrowStart) === 0 &&
                !event.component.hasProperty("rrule")
            ) {
                return event;
            }
        });

        const informationEvent = todayStatusEvents[0];

        const calendarData = parse(informationEvent.description);

        return calendarData;
    } catch (error) {
        console.error(error);
        loadingElement.textContent = "Fehler beim Laden der Termine.";
    }
}
