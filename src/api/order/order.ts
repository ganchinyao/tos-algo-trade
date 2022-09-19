// Modified from https://github.com/Sainglend/tda-api-client/blob/master/src/orders.ts

import { getAccountId } from "../../utils";
import { apiGet, apiPost, apiPut, IWriteResponse } from "../apimaker";
import {
  IGetOrderByAccountParam,
  IOrderGet,
  IPlaceOrderConfig,
  IReplaceOrderConfig,
} from "./types";

/**
 * Place a new order for a specified account using the properly formatted orderJSON.
 * The order number can be parsed from the url returned in the location property.
 * See order examples at: https://developer.tdameritrade.com/content/place-order-samples
 */
export async function placeOrder(
  config: IPlaceOrderConfig
): Promise<IWriteResponse> {
  return await apiPost({
    ...config,
    bodyJSON: config.orderJSON,
    url: `/v1/accounts/${getAccountId()}/orders`,
  });
}

/**
 * Replace an existing order by a specified account using the properly formatted orderJSON
 * The new order number can be parsed from the location property on the return object
 * See order examples at: https://developer.tdameritrade.com/content/place-order-samples
 * Not rate limited.
 */
export async function replaceOrder(
  config: IReplaceOrderConfig
): Promise<IWriteResponse> {
  config.url = `/v1/accounts/${getAccountId()}/orders/${config.orderId}`;
  config.bodyJSON = config.orderJSON;
  return await apiPut(config);
}

/**
 * Get all orders for a specified account, possibly filtered by time and order status
 * Takes accountId, and optionally: maxResults, fromEnteredTime, toEnteredTime
 * (times must either both be included or omitted), status (ENUM is ORDER_STATUS)
 * Not rate limited.
 */
export async function getOrdersByAccount(
  config: IGetOrderByAccountParam & { url?: string } = {}
): Promise<IOrderGet[]> {
  config.url =
    `/v1/accounts/${getAccountId()}/orders?` +
    (config.maxResults ? `maxResults=${config.maxResults}&` : "") +
    (config.fromEnteredTime
      ? `fromEnteredTime=${config.fromEnteredTime}&`
      : "") +
    (config.toEnteredTime ? `toEnteredTime=${config.toEnteredTime}&` : "") +
    (config.status ? `status=${config.status}` : "");

  return await apiGet(config);
}
