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
