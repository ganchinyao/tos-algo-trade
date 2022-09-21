import { getYYYYMMDD } from "../../utils/datetime";
import {
  writeLogbookErrorsToDisk,
  writeLogbookOrdersToDisk,
  writeLogbookSummaryToDisk,
} from "../../utils/file";
import { INSTRUCTION } from "../../utils/order";
import {
  getParticularWeekError,
  getParticularWeekOrder,
  getParticularWeekSummary,
} from "./Logger";
import { ILogBook_Order, ILogBook_Trade } from "./types";

/**
 * Add an order entry into the Logbook
 * @param timestamp Unix 13 digits timestamp of the trade
 * @param instruction Instruction of this trade
 * @param quantity Quantity of this trade
 * @param price Price of this trade
 * @param symbol Ticker of the trade
 * @param strategy Which strategy was used for this trade
 */
export const addOrderToLogbook = (
  timestamp: number,
  instruction: INSTRUCTION,
  quantity: number,
  price: number,
  symbol: string,
  strategy: string
) => {
  const currentOrders = getParticularWeekOrder(timestamp);
  const trade: ILogBook_Trade = {
    timestamp,
    instruction,
    quantity,
    price,
    symbol,
    strategy,
  };
  const date = getYYYYMMDD(timestamp);
  const order = currentOrders.find((order) => order.date === date);
  if (order) {
    // Already exist, so append to existing one.
    order.trades.push(trade);
  } else {
    // Doesn't exist yet, create new one for this date.
    currentOrders.push({
      date,
      trades: [trade],
    });
  }
  writeLogbookOrdersToDisk(timestamp, currentOrders);
};

/**
 * Add a completed trade (opened and then closed) summary P/L into the Logbook
 * @param timestamp Unix timestamp in 13 digits at the closing of the trade.
 * @param strategy: The order strategy for this completed trade
 *
 * Pre-requisite:
 * Assume both open and close orders are done on same day.
 * Assume both open and close orders are written into Logger orders already.
 * Assume the last 2 entries of the Orders Logger of a particular strategy refers to the opened and closed price respectively.
 */
export const addCompletedTradeToSummaryLogbook = (
  timestamp: number,
  strategy: string
) => {
  const currentSummary = getParticularWeekSummary(timestamp);
  const currentOrders = getParticularWeekOrder(timestamp);
  const date = getYYYYMMDD(timestamp);
  const orders = currentOrders.find(
    (order) => order.date === date
  ) as ILogBook_Order;
  const trades = orders.trades.filter(
    (trade) => trade.strategy === strategy
  ) as ILogBook_Trade[];
  const summary = currentSummary.find((summ) => summ.date === date);

  const openedPrice = trades[trades.length - 2].price;
  const closedPrice = trades[trades.length - 1].price;
  const p_l = Number((closedPrice - openedPrice).toFixed(2));

  if (summary) {
    // Already exist, so append to existing one.
    summary.numCompletedTrades = summary.numCompletedTrades + 1;
    summary.rawP_L.push(p_l);
    summary.netP_L = summary.netP_L + p_l;
  } else {
    // Doesn't exist yet, create new one for this date.
    currentSummary.push({
      date,
      numCompletedTrades: 1,
      rawP_L: [p_l],
      netP_L: p_l,
    });
  }
  writeLogbookSummaryToDisk(timestamp, currentSummary);
};

/**
 * Add an error to the logbook
 * @param timestamp Unix timestamp in 13 digits at the time the error happened.
 * @param error The error message
 */
export const addErrorToLogbook = (timestamp: number, error: any) => {
  const currentErrors = getParticularWeekError(timestamp);
  const date = getYYYYMMDD(timestamp);
  const errors = currentErrors.find((err) => err.date === date);

  if (errors) {
    // Already exist, so append to existing one.
    errors.err.push(error);
  } else {
    // Doesn't exist yet, create new one for this date.
    currentErrors.push({
      date,
      err: [error],
    });
  }
  writeLogbookErrorsToDisk(timestamp, currentErrors);
};
