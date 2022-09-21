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
export const PATH_CONFIG = "./db/config";
