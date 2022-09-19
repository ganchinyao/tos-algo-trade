import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Returns the date in the format YYYY-MM-DD format in New York time.
 * @param timestamp Unix 13 digits timestamp
 * @returns Formatted string in YYYY-MM-DD format. E.g. `2022-08-28`
 */
export const getYYYYMMDD = (timestamp: number) => {
  return dayjs(timestamp)
    .tz("America/New_York")
    .format("YYYY-MM-DD")
    .toString();
};

/**
 * Returns the date in the format HH:MM (hourhour:minmin) format in New York time.
 * @param timestamp Unix 13 digits timestamp
 * @returns Formatted string in HH:MM format. E.g. `13:43`, `08:35`
 */
export const getHHmm = (timestamp: number) => {
  return dayjs(timestamp).tz("America/New_York").format("HH:mm").toString();
};

/**
 * Check if the current hour (in New York Time) is equals to the hour passed in.
 * @param hr The hour passed in to check.
 * @returns True if the current hour is equal to the hour passed in.
 */
export const isCurrentHourEquals = (hr: string | number) => {
  const currentHr = dayjs(Date.now()).tz("America/New_York").format("HH");
  return Number(currentHr) === Number(hr);
};

/**
 * Check if the current minute (in New York Time) is more than the minute passed in.
 * @param min The minute passed in to check.
 * @returns True if the current minute is more than the minute passed in.
 */
export const isCurrentMinMoreThan = (min: string | number) => {
  const currentMin = dayjs(Date.now()).tz("America/New_York").format("mm");
  return Number(currentMin) > Number(min);
};

/**
 * Returns the timestamp in the format of YYYY-MM-W{n}, where n represent the week number of the month.
 * For example, 2022-09-w1 for 1-7th of Sept, and 2022-09-w2 for 8-14th Sept.
 * @param timestamp Unix 13 digits number
 * @returns A string in `YYYY-MM-W{n}` format, e.g. `2022-12-w5`
 */
export const getYYYYMMWeek = (timestamp: number) => {
  const dateTime = dayjs(timestamp).tz("America/New_York");
  const date = dateTime.get("date");
  const weekNumber = Math.ceil(date / 7);
  return `${dateTime.format("YYYY-MM")}-w${weekNumber}`;
};
