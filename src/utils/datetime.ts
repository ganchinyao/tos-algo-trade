/**
 * Returns the date in the format YYYY-MM-DD format.
 * @param timestamp Unix 13 digits timestamp
 * @returns Formatted string in YYYY-MM-DD format. E.g. `2022-08-28`
 */
export const getYYYYMMDD = (timestamp: number) => {
  const date = new Date(timestamp);
  const year = date.getUTCFullYear();
  let month = (date.getUTCMonth() + 1).toString();
  const day = date.getUTCDate();
  if (month.length < 2) {
    month = "0" + month;
  }
  return year + "-" + month + "-" + day;
};
