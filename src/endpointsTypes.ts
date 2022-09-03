/**
 * Body request for the POST to /market_buy
 */
export interface IMarketBuyRequest {
  auth: string;
  symbol: string;
  quantity: number;
  strategy: string;
}

/**
 * Body request for the POST to /market_sell
 */
export interface IMarketSellRequest {
  auth: string;
  symbol: string;
  quantity: number;
  strategy: string;
}

/**
 * Body request for the POST to /add_unavailable_date
 */
export interface IUnavailableDateRequest {
  auth: string;
  unavailable_date: string;
}
