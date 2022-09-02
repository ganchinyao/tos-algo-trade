import {
  IOrder_OpenPosition,
  IOrder_OpenPositions,
  IOrder_Position,
  IOrder_Strategy,
} from "./types";

/**
 * Returns true if this current strategy already has an open Long position. False otherwise.
 */
export const hasOpenLongOrder = (
  openPositions: IOrder_OpenPositions,
  strategy: IOrder_Strategy
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
  strategy: IOrder_Strategy
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
  strategy: IOrder_Strategy
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
  strategy: IOrder_Strategy,
  currentPosition: IOrder_Position,
  quantity: number
) => {
  const strategyPosition = openPositions.find(
    (openPos) => openPos.strategy === strategy
  ) as IOrder_OpenPosition;

  strategyPosition.currentPosition = currentPosition;
  strategyPosition.quantity = quantity;
};