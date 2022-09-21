import {
  getYYYYMMDD,
  readLogbookErrorsFromDisk,
  readLogbookOrderFromDisk,
  readLogbookSummaryFromDisk,
} from "../../utils";

/**
 * Get all the orders executed on a particular week, or return empty array if there is no order executed on that week.
 * @param timestamp Unix 13 digits number of any day on that week.
 * @returns The orders executed on that week, or empty array if there is no order executed.
 */
export const getParticularWeekOrder = (timestamp: number) => {
  return readLogbookOrderFromDisk(timestamp);
};

/**
 * Get all the Summary of a particular week, or return empty array if there is no Summary for that week.
 * @param timestamp Unix 13 digits number of any day on that week.
 * @returns The Summary of a particular week, or empty array if there is no Summary.
 */
export const getParticularWeekSummary = (timestamp: number) => {
  return readLogbookSummaryFromDisk(timestamp);
};

/**
 * Get all the errors of a particular week, or return empty array if there is no error for that week.
 * @param timestamp Unix 13 digits number of any day on that week.
 * @returns The errors of a particular week, or empty array if there is no error.
 */
export const getParticularWeekError = (timestamp: number) => {
  return readLogbookErrorsFromDisk(timestamp);
};

/**
 * Get the orders executed on a particular date, or return undefined if there is no order executed on that day.
 * @param timestamp Unix 13 digits number of that day
 * @returns The orders executed on that date, or undefined if there is no order executed.
 */
export const getParticularDateOrder = (timestamp: number) => {
  const orders = getParticularWeekOrder(timestamp);
  const date = getYYYYMMDD(timestamp);
  return orders.find((order) => order.date === date);
};

/**
 * Get the Summary of orders executed on a particular date, or return undefined if there is no order executed on that day.
 * @param timestamp Unix 13 digits number of that day
 * @returns Summary from the logbook executed on that date, or undefined if there is no order executed.
 */
export const getParticularDateSummary = (timestamp: number) => {
  const currentSummary = getParticularWeekSummary(timestamp);
  const date = getYYYYMMDD(timestamp);
  return currentSummary.find((summary) => summary.date === date);
};

/**
 * Get the errors that happened on a particular date, or undefined if there is no error on that date.
 * @param timestamp Unix 13 digits number of that day
 * @returns  Errors that were added to the logbook on that date, or undefined.
 */
export const getParticularDateError = (timestamp: number) => {
  const currentErrors = getParticularWeekError(timestamp);
  const date = getYYYYMMDD(timestamp);
  return currentErrors.find((error) => error.date === date);
};

/**
 * Get the orders executed today, or return undefined if there is no order executed for today yet.
 * @returns Orders from the logbook executed for today, or undefined if there is no order executed for today yet.
 */
export const getTodaysOrder = () => {
  return getParticularDateOrder(Date.now());
};

/**
 * Get the summary of orders executed today, or return undefined if there is no order executed for today yet.
 * @returns Summary from the logbook executed for today, or undefined if there is no order executed for today yet.
 */
export const getTodaysSummary = () => {
  return getParticularDateSummary(Date.now());
};

/**
 * Get the errors that happened today, if any.
 * @returns Errors that were added to the logbook today, or undefined.
 */
export const getTodaysError = () => {
  return getParticularDateError(Date.now());
};

/**
 * Get all the orders that have been executed to date.
 * @returns All the orders that were executed to date.
 */
export const getAllOrders = () => {
  return readLogbookOrderFromDisk();
};

/**
 * Get the summary that have occured to date.
 * @returns All the summaries to date.
 */
export const getAllSummaries = () => {
  return readLogbookSummaryFromDisk();
};

/**
 * Get all the errors that have occured to date.
 * @returns All errors that have occured to date.
 */
export const getAllErrors = () => {
  return readLogbookErrorsFromDisk();
};
