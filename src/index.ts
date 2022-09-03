import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { isAuthorized } from "./auth";
import { addErrorToLogbook, Logger } from "./classes/Logger";
import { Order } from "./classes/Order";
import { IMarketBuyRequest, IMarketSellRequest } from "./endpointsTypes";

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

    await Order.marketBuyEquity(strategy, symbol, quantity);
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

    await Order.marketSellEquity(strategy, symbol, quantity);
    return res.send("market_sell finishes!");
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
    res.send("Closed all open orders successfully.");
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
 * E.g. /logbook?type=order
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

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
