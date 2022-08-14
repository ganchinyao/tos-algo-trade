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
export const getClientID = () => {
  return (process.env.CONSUMER_KEY + "@AMER.OAUTHAP") as string;
};
