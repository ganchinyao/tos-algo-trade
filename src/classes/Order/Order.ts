import { INSTRUCTION, makeMarketOrder_SPY } from "@root/utils/order";
import {
  IOrder_OpenPositions,
  IOrder_Position,
  IOrder_Strategy,
} from "./types";
import {
  getOpenPositionQuantity,
  hasOpenLongOrder,
  hasOpenShortOrder,
  setOpenOrder,
} from "./utils";

/**
 * Use this singleton instance to place an order.
 */
class Order {
  /**
   * Use this to check what is the current position of a particular Strategy to decide whether to still open positions.
   */
  openPositions: IOrder_OpenPositions;
  constructor() {
    this.openPositions = [];
    Object.values(IOrder_Strategy).forEach((strategy) => {
      this.openPositions.push({
        strategy,
        currentPosition: IOrder_Position.NONE,
        quantity: 0,
      });
    });
  }

  /**
   * Use this to open a Buy order for SPY for this particular strategy.
   * If there is existing Long order for this strategy, then exit and do nothing.
   * If there is existing Short order for this strategy, close that position instead.
   * If there is no existing order for this strategy, go Long.
   * @param strategy What strategy this is using
   * @param quantity The amount of SPY to buy if there is no open short SPY position for this strategy. Otherwise, we will close the existing Short position.
   */
  buySPY(strategy: IOrder_Strategy, quantity: number) {
    const hasLongOrder = hasOpenLongOrder(this.openPositions, strategy);
    const hasShortOrder = hasOpenShortOrder(this.openPositions, strategy);
    if (hasLongOrder) {
      // Already has open long position, exit.
      return;
    }
    if (hasShortOrder) {
      // Currently has open short position, we buy to close that current short position.
      quantity = getOpenPositionQuantity(this.openPositions, strategy);
    }
    makeMarketOrder_SPY(INSTRUCTION.BUY, quantity).then((res) => {
      console.log("#### result", res);
      setOpenOrder(
        this.openPositions,
        strategy,
        hasShortOrder ? IOrder_Position.NONE : IOrder_Position.LONG,
        hasShortOrder ? 0 : quantity
      );
    });
  }

  /**
   * Use this to open a Sell order for SPY for this particular strategy.
   * If there is existing Short order for this strategy, then exit and do nothing.
   * If there is existing Long order for this strategy, close that position instead.
   * If there is no existing order for this strategy, go Short.
   * @param strategy What strategy this is using
   * @param quantity The amount of SPY to sell if there is no open long SPY position for this strategy. Otherwise, we will close the existing long position.
   */
  sellSPY(strategy: IOrder_Strategy, quantity: number) {
    const hasLongOrder = hasOpenLongOrder(this.openPositions, strategy);
    const hasShortOrder = hasOpenShortOrder(this.openPositions, strategy);
    if (hasShortOrder) {
      // Already has open short position, exit.
      return;
    }
    if (hasLongOrder) {
      // Currently has open long position, we sell to close that current long position.
      quantity = getOpenPositionQuantity(this.openPositions, strategy);
    }
    makeMarketOrder_SPY(INSTRUCTION.SELL, quantity).then((res) => {
      console.log("#### result", res);
      setOpenOrder(
        this.openPositions,
        strategy,
        hasLongOrder ? IOrder_Position.NONE : IOrder_Position.SHORT,
        hasLongOrder ? 0 : quantity
      );
    });
  }
}

const order = new Order();
export default order; // singleteon
