/**
 * Delay execution by ms milliseconds.
 * @param ms Number of milliseconds to delay
 * @returns Returns a promise that fulfils after `ms` number of milliseconds.
 */
export const delay = async (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
