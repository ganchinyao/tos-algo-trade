import { Logger } from ".";
import { getYYYYMMDD } from "../../utils/datetime";
import { INSTRUCTION } from "../../utils/order";
import { IOrder_Strategy } from "../Order";
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
  strategy: IOrder_Strategy
) => {
  const currentOrders = Logger.getOrders();
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
  strategy: IOrder_Strategy
) => {
  const currentSummary = Logger.getSummary();
  const currentOrders = Logger.getOrders();
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
};
