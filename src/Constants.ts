/**
 * The maximum number of trades that can be done in a day.
 * An open and a close trade is considered as 2 trades.
 * This is to limit the number of trades the bot can make in a day in case there is error in code and the bot contiuously ping TD server,
 * or malicious actor managed to send request to this server.
 */
export const MAX_NUM_TRADES_A_DAY = 20;

/**
 * Path to store the JSON file in hard disk.
 */
export const PATH_ORDERS = "./db/orders";
export const PATH_ERRORS = "./db/errors";
export const PATH_SUMMARY = "./db/summary";

/**
 * Config file to be read/write as a global constant.
 * We can modify the respective variables by POST/GET to respective API that modifies them.
 */
export const CONFIG = {
  /**
   * An array of dates that we want to skip trading.
   * Date must be of format YYYY-MM-DD. E.g. `2022-08-28`.
   * E.g. of array values: ['2022-08-28', '2022-09-03'] if we want to skip both of these dates.
   */
  datesUnavailableToTrade: [] as string[],
  /**
   * If false, stops all trading event.
   * Use as a kill switch.
   */
  eligibleToTrade: true,
};
