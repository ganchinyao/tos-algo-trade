/**
 * Get the Refresh Token stored in .env
 * The Refresh Token is the refresh token for TD API and it lasts for 90 days.
 */
export const getRefreshToken = () => {
  return process.env.REFRESH_TOKEN as string;
};

/**
 * Get the Client Id (the Consumer Key) append with @AMER.OAUTHAP
 */
export const getClientId = () => {
  return (process.env.CONSUMER_KEY + "@AMER.OAUTHAP") as string;
};

/**
 * Get the TD Ameritrade Trading Account Id
 */
export const getAccountId = () => {
  return process.env.ACCOUNT_ID as string;
};

/**
 * Get the telegram bot token to send report everyday
 */
export const getTelegramBotToken = () => {
  return process.env.TELEGRAM_TOKEN as string;
};

/**
 * Get the telegram chat id to send the bot message to
 */
export const getTelegramChatId = () => {
  return process.env.TELEGRAM_CHAT_ID as string;
};

export interface Config {
  /**
   * An array of dates that we want to skip trading.
   * Date must be of format YYYY-MM-DD. E.g. `2022-08-28`.
   * E.g. of array values: ['2022-08-28', '2022-09-03'] if we want to skip both of these dates.
   */
  datesUnavailableToTrade: string[];
  /**
   * If false, stops all trading event.
   * Use as a kill switch.
   */
  eligibleToTrade: boolean;
}
