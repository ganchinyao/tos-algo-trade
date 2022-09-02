import { INSTRUCTION, makeMarketOrder_SPY } from "../../utils/order";
import { getCurrentPrice } from "../../utils/quotes";
import {
  addCompletedTradeToSummaryLogbook,
  addOrderToLogbook,
} from "../Logger";
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
  async marketBuySPY(strategy: IOrder_Strategy, quantity: number) {
    const symbol = "SPY";
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
    await makeMarketOrder_SPY(INSTRUCTION.BUY, quantity);
    const now = Date.now();
    const estimatedBoughtPrice = await getCurrentPrice(symbol);
    setOpenOrder(
      this.openPositions,
      strategy,
      hasShortOrder ? IOrder_Position.NONE : IOrder_Position.LONG,
      hasShortOrder ? 0 : quantity
    );
    addOrderToLogbook(
      now,
      hasShortOrder ? INSTRUCTION.BUY_TO_CLOSE : INSTRUCTION.BUY_TO_OPEN,
      quantity,
      estimatedBoughtPrice,
      symbol,
      strategy
    );

    if (hasShortOrder) {
      addCompletedTradeToSummaryLogbook(now, strategy);
    }
  }

  /**
   * Use this to open a market Sell order for SPY for this particular strategy.
   * If there is existing Short order for this strategy, then exit and do nothing.
   * If there is existing Long order for this strategy, close that position instead.
   * If there is no existing order for this strategy, go Short.
   * @param strategy What strategy this is using
   * @param quantity The amount of SPY to sell if there is no open long SPY position for this strategy. Otherwise, we will close the existing long position.
   */
  async marketSellSPY(strategy: IOrder_Strategy, quantity: number) {
    const symbol = "SPY";
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
    await makeMarketOrder_SPY(INSTRUCTION.SELL, quantity);
    const now = Date.now();
    const estimatedSellPrice = await getCurrentPrice(symbol);
    setOpenOrder(
      this.openPositions,
      strategy,
      hasLongOrder ? IOrder_Position.NONE : IOrder_Position.SHORT,
      hasLongOrder ? 0 : quantity
    );
    addOrderToLogbook(
      now,
      hasLongOrder ? INSTRUCTION.SELL_TO_CLOSE : INSTRUCTION.SELL_TO_OPEN,
      quantity,
      estimatedSellPrice,
      symbol,
      strategy
    );
    if (hasLongOrder) {
      addCompletedTradeToSummaryLogbook(now, strategy);
    }
  }
}

const order = new Order();
export default order; // singleteon
