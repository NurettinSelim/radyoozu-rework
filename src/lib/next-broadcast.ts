import { DAY_KEYS, type DayKey } from "@/content/schema";

const IST_OFFSET_MS = 3 * 3_600_000;

export type Broadcastish = {
  day: DayKey;
  startHour: number;
};

export type Occurrence<T extends Broadcastish> = {
  item: T;
  start: Date;
};

export function nextOccurrence<T extends Broadcastish>(
  items: T[],
  from: Date,
): Occurrence<T> | null {
  const istanbulNow = new Date(from.getTime() + IST_OFFSET_MS);
  const currentDayIndex = (istanbulNow.getUTCDay() + 6) % 7;
  const currentMinutes =
    istanbulNow.getUTCHours() * 60 + istanbulNow.getUTCMinutes();
  const istanbulMidnight = Date.UTC(
    istanbulNow.getUTCFullYear(),
    istanbulNow.getUTCMonth(),
    istanbulNow.getUTCDate(),
  );

  let next: Occurrence<T> | null = null;

  for (const item of items) {
    const dayIndex = DAY_KEYS.indexOf(item.day);
    let daysAhead = (dayIndex - currentDayIndex + 7) % 7;

    if (daysAhead === 0 && currentMinutes >= item.startHour * 60) {
      daysAhead = 7;
    }

    const start = new Date(
      istanbulMidnight +
        daysAhead * 24 * 3_600_000 +
        item.startHour * 3_600_000 -
        IST_OFFSET_MS,
    );

    if (next === null || start < next.start) {
      next = { item, start };
    }
  }

  return next;
}
