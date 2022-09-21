import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { isAuthorized } from "./auth";
import {
  addErrorToLogbook,
  getAllErrors,
  getAllOrders,
  getAllSummaries,
  getParticularDateError,
  getParticularDateOrder,
  getParticularDateSummary,
  getParticularWeekError,
  getParticularWeekOrder,
  getParticularWeekSummary,
} from "./classes/Logger";
import { Order } from "./classes/Order";
import {
  IMarketBuyRequest,
  IMarketOrderRequest,
  IMarketSellRequest,
  IUnavailableDateRequest,
  PATH,
} from "./endpoints";
import { startCronJob } from "./cron-jobs";
import dayjs from "dayjs";
import { getUnixFromYYYYMMWeek } from "./utils/datetime";
import { readConfigFromDisk, writeConfigToDisk } from "./utils/file";
import { Config } from "./utils";

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
app.post(PATH.MARKET_BUY, async (req: Request, res: Response) => {
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
app.post(PATH.MARKET_SELL, async (req: Request, res: Response) => {
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
app.post(PATH.MARKET_ORDER, async (req: Request, res: Response) => {
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
app.post(PATH.MARKET_CLOSE_ALL, async (req: Request, res: Response) => {
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
app.post(PATH.ADD_UNAVAILABLE_DATE, (req: Request, res: Response) => {
  try {
    const body: IUnavailableDateRequest = req.body;
    const { unavailable_date } = body;
    if (!unavailable_date) {
      return res.status(422).send("Wrong body format");
    }
    const currentConfig = readConfigFromDisk();
    const newConfig: Config = {
      ...currentConfig,
      datesUnavailableToTrade: [
        ...currentConfig.datesUnavailableToTrade,
        unavailable_date,
      ],
    };
    writeConfigToDisk(newConfig);
    return res.send("Added unavailable_date successfully.");
  } catch (err: any) {
    addErrorToLogbook(Date.now(), err.toString());
    return res.status(503).send("Server error");
  }
});

/**
 * Get the logbook information.
 * If date query is specified, retrive information on that particular date.
 * If week query is specified, retrieve information on that particular week.
 * Otherwise, retrieve all information to date.
 *
 * Priority: date > week > all
 *
 * Query: {
 *  type: 'error' | 'summary' | 'orders'
 *  date?: string,
 *  week?: string,
 * }
 *
 * E.g. http://localhost:8000/logbook?type=orders
 * E.g. http://localhost:8000/logbook?type=orders&date=2022-09-19
 * E.g. http://localhost:8000/logbook?type=summary&week=2022-09-w3
 */
app.get(PATH.LOGBOOK, (req: Request, res: Response) => {
  try {
    const type = req.query.type;
    const date = req.query.date;
    const week = req.query.week;
    if (!type) {
      return res.send("Please add in a type.");
    }
    if (date && typeof date !== "string") {
      return res.send("Invalid date. Try `2022-09-19`.");
    }
    if (week && typeof week !== "string") {
      return res.send("Invalid week. Try `2022-09-w1`.");
    }
    const timestamp = date
      ? dayjs.tz(date, "America/New_York").unix() * 1000
      : week
      ? getUnixFromYYYYMMWeek(week)
      : Date.now();
    switch (type) {
      case "orders":
        return date
          ? res.json(getParticularDateOrder(timestamp) || [])
          : week
          ? res.json(getParticularWeekOrder(timestamp))
          : res.json(getAllOrders());
      case "summary":
        return date
          ? res.json(getParticularDateSummary(timestamp) || [])
          : week
          ? res.json(getParticularWeekSummary(timestamp))
          : res.json(getAllSummaries());
      case "error":
        return date
          ? res.json(getParticularDateError(timestamp) || [])
          : week
          ? res.json(getParticularWeekError(timestamp))
          : res.json(getAllErrors());
    }
    return res.send("Unexpected type.");
  } catch (err: any) {
    addErrorToLogbook(Date.now(), err.toString());
    return res.status(503).send("Server error");
  }
});

/**
 * View the Config object in disk.
 * E.g. http://localhost:8000/config
 */
app.get(PATH.CONFIG, (req: Request, res: Response) => {
  const config = readConfigFromDisk();
  return res.json(config);
});

/**
 * A kill switch to quickly stop all trading. The bot will not executed anymore trades.
 * E.g. http://localhost:8000/stop
 */
app.get(PATH.STOP, (req: Request, res: Response) => {
  const currentConfig = readConfigFromDisk();
  const newConfig: Config = {
    ...currentConfig,
    eligibleToTrade: false,
  };
  writeConfigToDisk(newConfig);
  return res.status(200);
});

/**
 * Resume the kill switch done in /stop.
 * E.g. http://localhost:8000/start
 */
app.get(PATH.START, (req: Request, res: Response) => {
  const currentConfig = readConfigFromDisk();
  const newConfig: Config = {
    ...currentConfig,
    eligibleToTrade: true,
  };
  writeConfigToDisk(newConfig);
  return res.status(200);
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  startCronJob();
});
