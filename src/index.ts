import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { isAuthorized } from "./auth";
import { Logger } from "./classes/Logger";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use(express.json());
app.use(isAuthorized);

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.post("/test", (req: Request, res: Response) => {
  res.send("POST LOL");
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
