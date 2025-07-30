export function yesterdayRangeISO(tzOffsetMinutes = 0) {
  // tzOffsetMinutes lets you shift to your local TZ day if needed.
  // 0 means use UTC boundaries for "yesterday".
  const now = new Date();

  // Move to provided timezone by shifting minutes
  const shiftedNow = new Date(now.getTime() + tzOffsetMinutes * 60 * 1000);

  // Start of today in that shifted TZ
  const startOfToday = new Date(shiftedNow);
  startOfToday.setHours(0, 0, 0, 0);

  // Start of yesterday
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  // End of yesterday
  const endOfYesterday = new Date(startOfToday);
  endOfYesterday.setMilliseconds(-1); // 23:59:59.999 of previous day

  // Convert back to UTC ISO strings
  const since = new Date(startOfYesterday.getTime() - tzOffsetMinutes * 60 * 1000).toISOString();
  const until = new Date(endOfYesterday.getTime() - tzOffsetMinutes * 60 * 1000).toISOString();

  return { since, until, dateLabel: since.slice(0, 10) };
}
