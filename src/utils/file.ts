import { getYYYYMMWeek } from "./datetime";
import fs from "fs";
import {
  ILogBook_Error,
  ILogBook_Order,
  ILogBook_Summary,
} from "../classes/Logger";
import path from "path";
import {
  PATH_CONFIG,
  PATH_ERRORS,
  PATH_ORDERS,
  PATH_SUMMARY,
} from "../Constants";
import { Config } from "./configs";

/**
 * Write an Object as a string into a file path on the disk.
 * @param filePath The path to store the file
 * @param content An Object
 */
export const writeJSONFile = (filePath: string, content: Object) => {
  fs.writeFileSync(filePath, JSON.stringify(content));
};

/**
 * Write the logbook Order object to hard storage.
 * This will write the file as the name `YYYY-MM-W{n}.json`, e.g. `2022-09-w1.json` for any dates that are 1st-7th of September.
 * @param timestamp Unix number in 13 digits
 * @param orders The logbook order object
 */
export const writeLogbookOrdersToDisk = (
  timestamp: number,
  orders: ILogBook_Order[]
) => {
  const filePath = `${PATH_ORDERS}/${getYYYYMMWeek(timestamp)}.json`;
  writeJSONFile(filePath, orders);
};

/**
 * Write the logbook Error object to hard storage.
 *  This will write the file as the name `YYYY-MM-W{n}.json`, e.g. `2022-09-w1.json` for any dates that are 1st-7th of September.
 * @param timestamp Unix number in 13 digits
 * @param error The logbook error object
 */
export const writeLogbookErrorsToDisk = (
  timestamp: number,
  error: ILogBook_Error[]
) => {
  const filePath = `${PATH_ERRORS}/${getYYYYMMWeek(timestamp)}.json`;
  writeJSONFile(filePath, error);
};

/**
 * Write the logbook Summary object to hard storage.
 *  This will write the file as the name `YYYY-MM-W{n}.json`, e.g. `2022-09-w1.json` for any dates that are 1st-7th of September.
 * @param timestamp Unix number in 13 digits
 * @param error The logbook summary object
 */
export const writeLogbookSummaryToDisk = (
  timestamp: number,
  summary: ILogBook_Summary[]
) => {
  const filePath = `${PATH_SUMMARY}/${getYYYYMMWeek(timestamp)}.json`;
  writeJSONFile(filePath, summary);
};

/**
 * Read a JSON file on the harddisk and returns the Object.
 * @param filePath The path to read from
 * @param defaultVal A default value to return if the filePath does not exist, or empty object {} if none is provided.
 * @returns
 */
export const readJSONFile = (filePath: string, defaultVal: Object = {}) => {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    return defaultVal;
  }
};

/**
 * Read the logbook Order associated with the timestamp from the Disk, or an empty object [] if there is no such logbook.
 * This will read the file in the format `YYYY-MM-W{n}.json`, e.g. `2022-09-w1.json` for any dates that are 1st-7th of September.
 * @param timestamp Unix number in 13 digits. If not supplied, proceed to read all `.json` files in the directory.
 * @returns The logbook Order object, or empty array [] if there is no associated logbook on that timestamp.
 */
export const readLogbookOrderFromDisk = (
  timestamp?: number
): ILogBook_Order[] => {
  if (!timestamp) {
    let result: ILogBook_Order[] = [];
    const jsonsInDir = fs
      .readdirSync(PATH_ORDERS)
      .filter((file) => path.extname(file) === ".json");
    jsonsInDir.forEach((file) => {
      const order = readJSONFile(`${PATH_ORDERS}/${file}`, []);
      result = result.concat(order);
    });
    return result;
  }
  const filePath = `${PATH_ORDERS}/${getYYYYMMWeek(timestamp)}.json`;
  return readJSONFile(filePath, []);
};

/**
 * Read the logbook Errors associated with the timestamp from the Disk, or an empty object [] if there is no such logbook.
 * This will read the file in the format `YYYY-MM-W{n}.json`, e.g. `2022-09-w1.json` for any dates that are 1st-7th of September.
 * @param timestamp Unix number in 13 digits. If not supplied, proceed to read all `.json` files in the directory.
 * @returns The logbook Errors object, or empty array [] if there is no associated logbook on that timestamp.
 */
export const readLogbookErrorsFromDisk = (
  timestamp?: number
): ILogBook_Error[] => {
  if (!timestamp) {
    let result: ILogBook_Error[] = [];
    const jsonsInDir = fs
      .readdirSync(PATH_ERRORS)
      .filter((file) => path.extname(file) === ".json");
    jsonsInDir.forEach((file) => {
      const order = readJSONFile(`${PATH_ERRORS}/${file}`, []);
      result = result.concat(order);
    });
    return result;
  }
  const filePath = `${PATH_ERRORS}/${getYYYYMMWeek(timestamp)}.json`;
  return readJSONFile(filePath, []);
};

/**
 * Read the logbook Summary associated with the timestamp from the Disk, or an empty object [] if there is no such logbook.
 * This will read the file in the format `YYYY-MM-W{n}.json`, e.g. `2022-09-w1.json` for any dates that are 1st-7th of September.
 * @param timestamp Unix number in 13 digits. If not supplied, proceed to read all `.json` files in the directory.
 * @returns The logbook Summary object, or empty array [] if there is no associated logbook on that timestamp.
 */
export const readLogbookSummaryFromDisk = (
  timestamp?: number
): ILogBook_Summary[] => {
  if (!timestamp) {
    let result: ILogBook_Summary[] = [];
    const jsonsInDir = fs
      .readdirSync(PATH_SUMMARY)
      .filter((file) => path.extname(file) === ".json");
    jsonsInDir.forEach((file) => {
      const order = readJSONFile(`${PATH_SUMMARY}/${file}`, []);
      result = result.concat(order);
    });
    return result;
  }
  const filePath = `${PATH_SUMMARY}/${getYYYYMMWeek(timestamp)}.json`;
  return readJSONFile(filePath, []);
};

/**
 * Write the global Config to disk.
 * @param config The Config object
 */
export const writeConfigToDisk = (config: Config) => {
  const filePath = `${PATH_CONFIG}/config.json`;
  writeJSONFile(filePath, config);
};

/**
 * Read the global Config from disk.
 * @returns The Config object
 */
export const readConfigFromDisk = (): Config => {
  const filePath = `${PATH_CONFIG}/config.json`;
  return readJSONFile(filePath, []);
};
