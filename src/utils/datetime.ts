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
