import dayjs from "dayjs";
import { EActivityType, EOrderStatus, getOrdersByAccount } from "../../api";
import { MAX_NUM_TRADES_A_DAY } from "../../Constants";
import {
  getYYYYMMDD,
  isCurrentHourEquals,
  isCurrentMinMoreThan,
  readConfigFromDisk,
} from "../../utils";
import { getTodaysOrder } from "../Logger";
import {
  IOrder_OpenPosition,
  IOrder_OpenPositions,
  IOrder_Position,
} from "./types";

/**
 * Init the particular strategy if it doesn't exist yet.
 */
export const init = (
  openPositions: IOrder_OpenPositions,
  strategy: string
): void => {
  const openPositionsForStrategy = openPositions.find(
    (openPosition) => openPosition.strategy === strategy
  );
  if (!openPositionsForStrategy) {
    openPositions.push({
      strategy,
      currentPosition: IOrder_Position.NONE,
      quantity: 0,
    });
  }
};

/**
 * Returns true if this current strategy already has an open Long position. False otherwise.
 */
export const hasOpenLongOrder = (
  openPositions: IOrder_OpenPositions,
  strategy: string
): boolean => {
  const strategyPosition = openPositions.find(
    (openPos) => openPos.strategy === strategy
  ) as IOrder_OpenPosition;
  return strategyPosition.currentPosition === IOrder_Position.LONG;
};

/**
 * Returns true if this current strategy already has an open Short position. False otherwise.
 */
export const hasOpenShortOrder = (
  openPositions: IOrder_OpenPositions,
  strategy: string
): boolean => {
  const strategyPosition = openPositions.find(
    (openPos) => openPos.strategy === strategy
  ) as IOrder_OpenPosition;
  return strategyPosition.currentPosition === IOrder_Position.SHORT;
};

/**
 * Returns the current open position quantity of a particular strategy.
 */
export const getOpenPositionQuantity = (
  openPositions: IOrder_OpenPositions,
  strategy: string
): number => {
  const strategyPosition = openPositions.find(
    (openPos) => openPos.strategy === strategy
  ) as IOrder_OpenPosition;

  return strategyPosition.quantity;
};

/**
 * Set the currentPosition of a particular Strategy type.
 */
export const setOpenOrder = (
  openPositions: IOrder_OpenPositions,
  strategy: string,
  currentPosition: IOrder_Position,
  quantity: number
) => {
  const strategyPosition = openPositions.find(
    (openPos) => openPos.strategy === strategy
  ) as IOrder_OpenPosition;

  strategyPosition.currentPosition = currentPosition;
  strategyPosition.quantity = quantity;
};

/**
 * Check if the user is eligible to trade.
 * @returns True if the trade can proceed, false otherwise
 */
export const isEligibleForTrading = () => {
  const todaysOrder = getTodaysOrder();
  if (
    todaysOrder &&
    todaysOrder.trades &&
    todaysOrder.trades.length >= MAX_NUM_TRADES_A_DAY
  ) {
    // Exceeded maximum number of trades allowed in a day
    return false;
  }
  const config = readConfigFromDisk();
  if (config.datesUnavailableToTrade.includes(getYYYYMMDD(Date.now()))) {
    // Today is not available to trade
    return false;
  }
  if (isCurrentHourEquals(15) && isCurrentMinMoreThan(50)) {
    // Do not allow the user to trade after 15:50 New York Time.
    // This is because the cron_job will run at 15:50 to exit all trades.
    return false;
  }

  return config.eligibleToTrade;
};

/**
 * Get the filled price of the latest order for a particular symbol at a particular date of the timestamp, or 0 if there is no filled order for that symbol.
 * Only works for orders with 1 execution leg.
 * @param params An object containing the `symbol` to get the latest filled price, a `timestamp` which is  Unix 13 digist number, and an optional `isFromAPI`,
 * which if true, we only consider orders sent using api, that starts with API_OMS_REST. If false, we consider all types of orders.
 * @returns The latest filled price for this symbol on this date, or 0 if there is no filled order.
 */

export const getFilledPriceOfLatestOrder = async (params: {
  symbol: string;
  timestamp: number;
  isFromAPI?: boolean;
}) => {
  const { symbol, timestamp, isFromAPI = true } = params;
  let orders = await getOrdersByAccount({
    fromEnteredTime: getYYYYMMDD(timestamp),
    status: EOrderStatus.FILLED,
  });
  orders = orders
    .filter((order) => (isFromAPI ? order.tag.includes("API") : true))
    .filter((order) => order.orderLegCollection[0].instrument.symbol === symbol)
    .sort((a, b) => dayjs(b.closeTime).unix() - dayjs(a.closeTime).unix());
  if (orders.length > 0) {
    const currentOrder = orders[0]; // Get the latest order that was tagged with "API"
    const execution = currentOrder.orderActivityCollection.find(
      (activity) => activity.activityType === EActivityType.EXECUTION
    );
    if (execution) {
      const price = execution.executionLegs[0].price;
      return price;
    }
  }
  return 0;
};
