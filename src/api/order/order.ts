// Modified from https://github.com/Sainglend/tda-api-client/blob/master/src/orders.ts

import { getAccountId } from "../../utils";
import { apiPost, apiPut, IWriteResponse } from "../apimaker";
import { IPlaceOrderConfig, IReplaceOrderConfig } from "./types";

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
 * Not rate limited so never queued unless specifically overridden.
 */
export async function replaceOrder(
  config: IReplaceOrderConfig
): Promise<IWriteResponse> {
  config.url = `/v1/accounts/${getAccountId()}/orders/${config.orderId}`;
  config.bodyJSON = config.orderJSON;
  return await apiPut(config);
}
