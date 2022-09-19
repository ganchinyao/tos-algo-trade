import {
  readLogbookErrorsFromDisk,
  readLogbookOrderFromDisk,
  readLogbookSummaryFromDisk,
} from "../../utils/file";

/**
 * Use this singleton instance to log the trades into a logbook
 */
class Logger {
  constructor() {}

  getOrders(timestamp: number = Date.now()) {
    return readLogbookOrderFromDisk(timestamp);
  }

  getErrors(timestamp: number = Date.now()) {
    return readLogbookErrorsFromDisk(timestamp);
  }

  getSummary(timestamp: number = Date.now()) {
    return readLogbookSummaryFromDisk(timestamp);
  }
}

const logger = new Logger();
export default logger; // singleteon
