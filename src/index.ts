import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { isAuthorized } from "./auth";
import { addErrorToLogbook, Logger } from "./classes/Logger";
import { Order } from "./classes/Order";
import {
  IMarketBuyRequest,
  IMarketOrderRequest,
  IMarketSellRequest,
  IUnavailableDateRequest,
} from "./endpointsTypes";
import { CONFIG } from "./Constants";
import { startCronJob } from "./cron-jobs";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use(express.json());
app.use(isAuthorized);

/**
 * Send a POST request to put in a Market Buy Order for a particular ticker.
 * If there is already an opened Short order for this strategy that is not closed yet, we will proceed to close that instead.
 * If there is already an opened Long order for this strategy, then do nothing.
 *
 * E.g. curl -X POST -H "Content-Type: application/json" -d '{"auth": "MY_SOME_AUTH", "symbol": "SPY", "quantity": 1, "strategy": "My Strategy Name"}' http://localhost:8000/market_buy
 *
 * Request signature:
 *    body: {
 *      "auth": string,
 *      "symbol": string,
 *      "quantity": number,
 *      "strategy": string
 *    }
 *
 * Response signature:
 *    Succeeds: 200 "market_buy finishes!"
 *    Failed to pass in 'symbol' or 'quantity' or 'strategy': 422 "Wrong body format"
 *    Error: 503 "Server error"
 *
 */
app.post("/market_buy", async (req: Request, res: Response) => {
  try {
    const body: IMarketBuyRequest = req.body;
    const { symbol, quantity, strategy } = body;
    if (!symbol || !quantity || !strategy) {
      return res.status(422).send("Wrong body format");
    }

    await Order.marketBuyEquity(strategy, symbol, Number(quantity));
    return res.send("market_buy finishes!");
  } catch (err: any) {
    addErrorToLogbook(Date.now(), err.toString());
    return res.status(503).send("Server error");
  }
});

/**
 * Send a POST request to put in a Market Sell Order for a particular ticker.
 * If there is already an opened Long order for this strategy that is not closed yet, we will proceed to close that instead.
 * If there is already an opened Short order for this strategy, then do nothing.
 *
 * E.g. curl -X POST -H "Content-Type: application/json" -d '{"auth": "MY_SOME_AUTH", "symbol": "SPY", "quantity": 1, "strategy": "My Strategy Name"}' http://localhost:8000/market_sell
 *
 * Request signature:
 *    body: {
 *      "auth": string,
 *      "symbol": string,
 *      "quantity": number,
 *      "strategy": string
 *    }
 *
 * Response signature:
 *    Succeeds: 200 "market_sell finishes!"
 *    Failed to pass in 'symbol' or 'quantity' or 'strategy': 422 "Wrong body format"
 *    Error: 503 "Server error"
 *
 */
app.post("/market_sell", async (req: Request, res: Response) => {
  try {
    const body: IMarketSellRequest = req.body;
    const { symbol, quantity, strategy } = body;
    if (!symbol || !quantity || !strategy) {
      return res.status(422).send("Wrong body format");
    }

    await Order.marketSellEquity(strategy, symbol, Number(quantity));
    return res.send("market_sell finishes!");
  } catch (err: any) {
    addErrorToLogbook(Date.now(), err.toString());
    return res.status(503).send("Server error");
  }
});

/**
 * Send a POST request to put in a Market Buy or Market Sell Order for a particular ticker.
 * This is the same as calling /market_buy or /market_sell, except we instruct the buy or sell action through the body request.
 *
 * If we send in a Market Buy and there is already an opened Short order for this strategy that is not closed yet, we will proceed to close that instead.
 * If we send in a Market Buy and there is already an opened Long order for this strategy that is not closed yet, do nothing.
 * If we send in a Market Sell and there is already an opened Long order for this strategy that is not closed yet, we will proceed to close that instead.
 * If we send in a Market Sell and there is already an opened Short order for this strategy that is not closed yet, do nothing.
 *
 * E.g. curl -X POST -H "Content-Type: application/json" -d '{"auth": "MY_SOME_AUTH", "symbol": "SPY", "quantity": 1, "strategy": "My Strategy Name", "action": "buy"}' http://localhost:8000/market_order
 *
 * Request signature:
 *    body: {
 *      "auth": string,
 *      "symbol": string,
 *      "quantity": number,
 *      "strategy": string
 *      "action": "buy" | "sell"
 *    }
 *
 * Response signature:
 *    Succeeds: 200 "market_order for {buy|sell} finishes!"
 *    Failed to pass in 'symbol' or 'quantity' or 'strategy' or 'action': 422 "Wrong body format"
 *    Error: 503 "Server error"
 *
 */
app.post("/market_order", async (req: Request, res: Response) => {
  try {
    const body: IMarketOrderRequest = req.body;
    const { symbol, quantity, strategy, action } = body;
    if (!symbol || !quantity || !strategy || !action) {
      return res.status(422).send("Wrong body format");
    }

    switch (action) {
      case "buy":
        await Order.marketBuyEquity(strategy, symbol, Number(quantity));
        return res.send("market_order for buy finishes!");
      case "sell":
        await Order.marketSellEquity(strategy, symbol, Number(quantity));
        return res.send("market_order for sell finishes!");
    }
  } catch (err: any) {
    addErrorToLogbook(Date.now(), err.toString());
    return res.status(503).send("Server error");
  }
});

/**
 * Send a POST request to close all existing open orders, if any, for all strategies.
 * If there is no open orders, do nothing.
 *
 * E.g curl -X POST -H "Content-Type: application/json" -d '{"auth": "MY_SOME_AUTH"}' http://localhost:8000/market_close_all
 *
 * Request signature:
 *    body: {
 *      "auth": string
 *    }
 *
 * Response signature:
 *    Succeeds: 200 "Closed all open orders successfully."
 *    Error: 503 "Server error"
 *
 */
app.post("/market_close_all", async (req: Request, res: Response) => {
  try {
    await Order.marketCloseAllOpenOrders();
    return res.send("Closed all open orders successfully.");
  } catch (err: any) {
    addErrorToLogbook(Date.now(), err.toString());
    return res.status(503).send("Server error");
  }
});

/**
 * Send a POST request to add an unavailable date to trade, so the app will not trade on that particular date.
 * The format of the unavailable_date must be YYYY-MM-YY, in New York time. e.g. "2022-09-03".
 *
 * E.g. curl -X POST -H "Content-Type: application/json" -d '{"auth": "MY_SOME_AUTH", "unavailable_date": "2022-09-03" }' http://localhost:8000/add_unavailable_date
 *
 * Request signature:
 *    body: {
 *      "auth": string,
 *      "unavailable_date": string
 *    }
 *
 * Response signature:
 *    Succeeds: 200 "Closed all open orders successfully."
 *    Error: 503 "Server error"
 *
 */
app.post("/add_unavailable_date", (req: Request, res: Response) => {
  try {
    const body: IUnavailableDateRequest = req.body;
    const { unavailable_date } = body;
    if (!unavailable_date) {
      return res.status(422).send("Wrong body format");
    }

    CONFIG.datesUnavailableToTrade = [
      ...CONFIG.datesUnavailableToTrade,
      unavailable_date,
    ];
    return res.send("Added unavailable_date successfully.");
  } catch (err: any) {
    addErrorToLogbook(Date.now(), err.toString());
    return res.status(503).send("Server error");
  }
});

/**
 * Get the logbook information.
 * Query: {
 *  type: 'error' | 'summary' | 'orders'
 * }
 *
 * E.g. http://localhost:8000/logbook?type=orders
 */
app.get("/logbook", (req: Request, res: Response) => {
  const type = req.query.type;
  switch (type) {
    case "orders":
      return res.json(Logger.getOrders());
    case "summary":
      return res.json(Logger.getSummary());
    case "error":
      return res.json(Logger.getErrors());
  }
  return res.send("Please add in a query");
});

/**
 * View the list of unavailable dates to trade.
 */
app.get("/unavailable_date", (req: Request, res: Response) => {
  return res.json(CONFIG.datesUnavailableToTrade);
});

/**
 * A kill switch to quickly stop all trading. The bot will not executed anymore trades.
 */
app.get("/stop", (req: Request, res: Response) => {
  CONFIG.eligibleToTrade = false;
  return res.status(503); // Purposely send 503 to confuse web scrapper.
});

/**
 * Resume the kill switch done in /stop.
 */
app.get("/start", (req: Request, res: Response) => {
  CONFIG.eligibleToTrade = true;
  return res.status(503); // Purposely send 503 to confuse web scrapper.
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  startCronJob();
});
