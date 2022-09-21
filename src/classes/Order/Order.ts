import { ASSET_TYPE, INSTRUCTION, makeMarketOrder } from "../../utils/order";
import {
  addCompletedTradeToSummaryLogbook,
  addOrderToLogbook,
} from "../Logger";
import { getTodaysOrder } from "../Logger/Logger";
import { IOrder_OpenPositions, IOrder_Position } from "./types";
import {
  getFilledPriceOfLatestOrder,
  getOpenPositionQuantity,
  hasOpenLongOrder,
  hasOpenShortOrder,
  init,
  isEligibleForTrading,
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
  hasPendingOrder: boolean; // As making orders take few seconds to fulfil, we use this variable to keep track if we have ongoing order so we do not create another same order when the previous one is still pending.
  constructor() {
    this.openPositions = [];
    this.hasPendingOrder = false;
  }

  /**
   * Use this to open a Buy order for a particular symbol for this particular strategy.
   * If there is existing Long order for this strategy, then exit and do nothing.
   * If there is existing Short order for this strategy, close that position instead.
   * If there is no existing order for this strategy, go Long.
   * @param strategy What strategy this is using
   * @param symbol The ticker to buy, e.g. 'SPY'
   * @param quantity The amount of symbol to buy if there is no open short position for this strategy. Otherwise, we will close the existing Short position.
   */
  async marketBuyEquity(strategy: string, symbol: string, quantity: number) {
    init(this.openPositions, strategy);
    if (this.hasPendingOrder || !isEligibleForTrading()) {
      return;
    }
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
    this.hasPendingOrder = true;
    await makeMarketOrder(symbol, ASSET_TYPE.EQUITY, INSTRUCTION.BUY, quantity);
    const now = Date.now();
    const filledPrice = await getFilledPriceOfLatestOrder({
      symbol,
      timestamp: now,
    });
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
      filledPrice,
      symbol,
      strategy
    );

    if (hasShortOrder) {
      addCompletedTradeToSummaryLogbook(now, strategy);
    }
    this.hasPendingOrder = false;
  }

  /**
   * Use this to open a market Sell order for a particular symbol for this particular strategy.
   * If there is existing Short order for this strategy, then exit and do nothing.
   * If there is existing Long order for this strategy, close that position instead.
   * If there is no existing order for this strategy, go Short.
   * @param strategy What strategy this is using
   * @param symbol The ticker to sell, e.g. 'SPY'
   * @param quantity The amount of symbol to sell if there is no open long position for this strategy. Otherwise, we will close the existing long position.
   */
  async marketSellEquity(strategy: string, symbol: string, quantity: number) {
    init(this.openPositions, strategy);
    if (this.hasPendingOrder || !isEligibleForTrading()) {
      return;
    }
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
    this.hasPendingOrder = true;
    await makeMarketOrder(
      symbol,
      ASSET_TYPE.EQUITY,
      INSTRUCTION.SELL,
      quantity
    );
    const now = Date.now();
    const filledPrice = await getFilledPriceOfLatestOrder({
      symbol,
      timestamp: now,
    });
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
      filledPrice,
      symbol,
      strategy
    );
    if (hasLongOrder) {
      addCompletedTradeToSummaryLogbook(now, strategy);
    }
    this.hasPendingOrder = false;
  }

  /**
   * Market close all current opened positions for all the strategies.
   */
  async marketCloseAllOpenOrders() {
    const strategies = this.openPositions.map((openPosition) => {
      return openPosition.strategy;
    });
    for (const strategy of strategies) {
      const hasLongOrder = hasOpenLongOrder(this.openPositions, strategy);
      const hasShortOrder = hasOpenShortOrder(this.openPositions, strategy);
      const todaysOrder = getTodaysOrder();
      if (todaysOrder) {
        const ordersForStrategy = todaysOrder.trades.filter(
          (order) => order.strategy === strategy
        );
        const lastOrderOfStrategy =
          ordersForStrategy[ordersForStrategy.length - 1];
        if (hasLongOrder) {
          await this.marketSellEquity(
            lastOrderOfStrategy.strategy,
            lastOrderOfStrategy.symbol,
            lastOrderOfStrategy.quantity
          );
        } else if (hasShortOrder) {
          await this.marketBuyEquity(
            lastOrderOfStrategy.strategy,
            lastOrderOfStrategy.symbol,
            lastOrderOfStrategy.quantity
          );
        }
      }
    }
  }
}

const order = new Order();
export default order; // singleteon
