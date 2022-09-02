export interface IQuoteGeneric {
  description: string;
  exchangeName: string;
  securityStatus: string;
  symbol: string;
  [index: string]: any;
}

export interface IQuoteEquity extends IQuoteGeneric {
  "52WkHigh": number;
  "52WkLow": number;
  askId: string;
  askPrice: number;
  askSize: number;
  bidId: string;
  bidPrice: number;
  bidSize: number;
  closePrice: number;
  digits: number;
  divAmount: number;
  divDate: string;
  divYield: number;
  exchange: string;
  highPrice: number;
  lastId: string;
  lastPrice: number;
  lastSize: number;
  lowPrice: number;
  marginable: boolean;
  mark: number;
  netChange: number;
  openPrice: number;
  peRatio: number;
  quoteTimeInLong: number;
  regularMarketLastPrice: number;
  regularMarketLastSize: number;
  regularMarketNetChange: number;
  regularMarketTradeTimeInLong: number;
  shortable: boolean;
  totalVolume: number;
  tradeTimeInLong: number;
  volatility: number;
}

/**
 * The type IQuoteResult is indexed with the quoted symbol
 * @example
 * quoteResult["MSFT"]
 */
export type IQuoteResult = Record<string, IQuoteGeneric | IQuoteEquity>;
