import { getQuote } from "../api";

/**
 * Return the last price of the Equity symbol.
 * @param symbol The ticket, e.g. 'SPY'
 * @returns The last price, e.g. 420.69
 */
export const getCurrentPrice = async (symbol: string): Promise<number> => {
  const quote = await getQuote(symbol);
  return quote[symbol].lastPrice;
};
