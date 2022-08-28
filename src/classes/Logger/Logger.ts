import {
  ILogBook_Error,
  ILogBook_Order,
  ILogBook_Summary,
  LogBook,
} from "./types";

/**
 * Use this singleton instance to log the trades into a logbook
 */
class Logger {
  logbook: LogBook;
  constructor() {
    this.logbook = {
      orders: [],
      errors: [],
      summary: [],
    };
  }

  addOrder(order: ILogBook_Order) {
    this.logbook.orders.push(order);
  }

  addError(error: ILogBook_Error) {
    this.logbook.errors.push(error);
  }

  addSummary(summary: ILogBook_Summary) {
    this.logbook.summary.push(summary);
  }

  getOrders() {
    return this.logbook.orders;
  }

  getErrors() {
    return this.logbook.errors;
  }

  getSummary() {
    return this.logbook.summary;
  }
}

const logger = new Logger();
export default logger; // singleteon
