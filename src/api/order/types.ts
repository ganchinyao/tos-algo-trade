import { TacRequestConfig } from "../apimaker";

export interface IPlaceOrderConfig extends TacRequestConfig {
  orderJSON: any;
}

export interface IReplaceOrderConfig extends IPlaceOrderConfig {
  orderId: string | number;
}
