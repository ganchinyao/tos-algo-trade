import { placeOrder } from "../api";

export enum INSTRUCTION {
  BUY = "BUY",
  SELL = "SELL",
  BUY_TO_COVER = "BUY_TO_COVER",
  SELL_SHORT = "SELL_SHORT",
  BUY_TO_OPEN = "BUY_TO_OPEN",
  BUY_TO_CLOSE = "BUY_TO_CLOSE",
  SELL_TO_OPEN = "SELL_TO_OPEN",
  SELL_TO_CLOSE = "SELL_TO_CLOSE",
  EXCHANGE = "EXCHANGE",
}

export enum ASSET_TYPE {
  EQUITY = "EQUITY",
  OPTION = "OPTION",
  INDEX = "INDEX",
  MUTUAL_FUND = "MUTUAL_FUND",
  CASH_EQUIVALENT = "CASH_EQUIVALENT",
  FIXED_INCOME = "FIXED_INCOME",
  CURRENCY = "CURRENCY",
}

export enum ORDER_TYPE {
  MARKET = "MARKET",
  LIMIT = "LIMIT",
  STOP = "STOP",
  STOP_LIMIT = "STOP_LIMIT",
  TRAILING_STOP = "TRAILING_STOP",
  MARKET_ON_CLOSE = "MARKET_ON_CLOSE",
  EXERCISE = "EXERCISE",
  TRAILING_STOP_LIMIT = "TRAILING_STOP_LIMIT",
  NET_DEBIT = "NET_DEBIT",
  NET_CREDIT = "NET_CREDIT",
  NET_ZERO = "NET_ZERO",
}

export enum SESSION {
  AM = "AM",
  PM = "PM",
  NORMAL = "NORMAL",
  SEAMLESS = "SEAMLESS", // extender hours
}

export enum DURATION {
  DAY = "DAY",
  GOOD_TILL_CANCEL = "GOOD_TILL_CANCEL",
  FILL_OR_KILL = "FILL_OR_KILL",
}

export enum ORDER_STRATEGY_TYPE {
  SINGLE = "SINGLE",
  OCO = "OCO",
  TRIGGER = "TRIGGER",
}

/**
 * Send an API request to Buy or Sell a specific security at market price.
 * @param symbol The ticker of the asset
 * @param assetType The underlying asset type of the ticker
 * @param instruction BUY or SELL
 * @param quantity The amount of equity to buy or sell.
 */
export const makeMarketOrder = async (
  symbol: string,
  assetType: ASSET_TYPE,
  instruction: INSTRUCTION,
  quantity: number
) => {
  const orderJSON = {
    orderType: ORDER_TYPE.MARKET,
    session: SESSION.NORMAL,
    duration: DURATION.DAY,
    orderStrategyType: ORDER_STRATEGY_TYPE.SINGLE,
    orderLegCollection: [
      {
        instruction,
        quantity,
        instrument: {
          symbol,
          assetType,
        },
      },
    ],
  };
  return await placeOrder({
    orderJSON,
  });
};

/**
 * Send an API request to Buy or Sell SPY at market price.
 * @param orderType BUY or SELL
 * @param quantity The amount of SPY to buy or sell.
 */
export const makeMarketOrder_SPY = async (
  instruction: INSTRUCTION,
  quantity: number
) => {
  return await makeMarketOrder("SPY", ASSET_TYPE.EQUITY, instruction, quantity);
};

/**
 * Send an API request to Buy or Sell QQQ at market price.
 * @param orderType BUY or SELL
 * @param quantity The amount of SPY to buy or sell.
 */
export const makeMarketOrder_QQQ = async (
  instruction: INSTRUCTION,
  quantity: number
) => {
  return await makeMarketOrder("QQQ", ASSET_TYPE.EQUITY, instruction, quantity);
};
