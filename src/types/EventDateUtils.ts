import { EventData } from "@/src/types/EventData";

export function parseEventDate(post: EventData): Date | null {
  if (!post.date) return null;

  const dateParts = post.date.split(".");
  if (dateParts.length !== 3) {
    console.warn("Invalid date format, expected DD.MM.YYYY:", post.date);
    return null;
  }

  const day = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1;
  const year = parseInt(dateParts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    console.warn("Invalid date values:", post.date);
    return null;
  }

  let hours = 0;
  let minutes = 0;

  if (post.time && post.time.length > 0) {
    const timeParts = post.time.split(":");
    if (timeParts.length >= 2) {
      hours = parseInt(timeParts[0], 10);
      minutes = parseInt(timeParts[1], 10);

      if (isNaN(hours) || isNaN(minutes)) {
        console.warn("Invalid time values:", post.time);
        hours = 0;
        minutes = 0;
      }
    }
  }

  const eventDate = new Date(year, month, day, hours, minutes);

  return isNaN(eventDate.getTime()) ? null : eventDate;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function splitEventsByDate(events: EventData[]) {
  const now = new Date();

  const past: EventData[] = [];
  const ongoing: EventData[] = [];
  const upcoming: EventData[] = [];

  events.forEach((post) => {
    const eventDate = parseEventDate(post);

    if (!eventDate) {
      past.push(post);
      return;
    }

    const isToday = isSameDay(eventDate, now);

    if (isToday) {
      if (post.time) {
        if (eventDate <= now) {
          ongoing.push(post);
        } else {
          upcoming.push(post);
        }
      } else {
        ongoing.push(post);
      }
    } else if (eventDate < now) {
      past.push(post);
    } else {
      upcoming.push(post);
    }
  });

  return { past, ongoing, upcoming };
}