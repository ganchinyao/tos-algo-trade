/**
 * The name of my strategy
 */
export enum IOrder_Strategy {
  VWAP_SD_BOUNCE = "VWAP_SD_BOUNCE",
}

export enum IOrder_Position {
  NONE = "NONE", // No open orders. E.g qty=0
  LONG = "LONG", // Currently having long position. E.g. qty=100
  SHORT = "SHORT", // Currently having short position. E.g. qty=-100
}

export type IOrder_OpenPosition = {
  strategy: IOrder_Strategy;
  currentPosition: IOrder_Position;
  quantity: number; // Always positive. If short 50, this is still 50. Use the `currentPosition` to determine if it is long or short.
};

export type IOrder_OpenPositions = IOrder_OpenPosition[];
