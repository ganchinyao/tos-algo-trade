// Modified from https://github.com/Sainglend/tda-api-client/blob/master/src/quotes.ts

import { apiGet } from "../apimaker";
import { IQuoteResult } from "./types";

/**
 * Get quotes for a single symbol, e.g. AAPL, MSFT_021822C200
 * For symbols containing special characters, use getQuotes instead,
 * e.g. futures (/ES), forex (EUR/USD), indexes ($SPX.X)
 * Note: Only US resident can get Live quotes through this API. If you get delayed quotes, email api@tdameritrade.com
 */
export async function getQuote(symbol: string): Promise<IQuoteResult> {
  return await apiGet({
    url: `/v1/marketdata/${encodeURIComponent(symbol)}/quotes`,
  });
}

/**
 * Get quotes for one or more symbols. Input property "symbol" should be a comma-separated string,
 * e.g. "F,O,TSLA,/ES,EUR/USD,T_021822C25,$SPX.X"
 * Can optionally use apikey for delayed data with an unauthenticated request.
 * Note: Only US resident can get Live quotes through this API. If you get delayed quotes, email api@tdameritrade.com
 */
export async function getQuotes(symbol: string): Promise<IQuoteResult> {
  return await apiGet({ url: `/v1/marketdata/quotes?symbol=${symbol}` });
}
