export function startOfDayUTC(date: Date): Date {
  return new Date(Date.UTC(date.getUTCMonth(), date.getUTCDate()));
}

export function startOfLocalDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

export function addDays(d: Date, days: number) {
  const res = new Date(d);
  res.setDate(res.getDate() + days);
  return res;
}

// Build a Date object representing local time for a given yyyy-mm-dd and hour
export function buildLocalDateFromYMDAndHour(ymd: string, hour24: number) {
  // ymd expected "YYYY-MM-DD"
  const [y, m, day] = ymd.split("-").map((s) => Number(s));
  // Note: months are 0-based in JS Date constructor
  return new Date(y, m - 1, day, hour24, 0, 0, 0);
}

// Format date object to YYYY-MM-DD
export function formatYMD(d: Date) {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
}
