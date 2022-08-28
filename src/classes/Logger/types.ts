import { INSTRUCTION } from "@root/utils/order";
import { Strategy } from "@root/classes/Order";

export interface ILogBook_Trade {
  timestamp: string; // date-time stamp in Unix
  instruction: INSTRUCTION;
  quantity: number; // 100
  symbol: string; // 'SPY'
  strategy: Strategy;
}

export type ILogBook_Order = {
  date: string;
  trades: ILogBook_Trade[];
};

export type ILogBook_Error = {
  date: string;
  err: any;
};

export type ILogBook_Summary = {
  date: string;
  numTrade: number;
  rawP_L: number[]; // E.g. [55, -120, 77] for P/L of 3 trades
  netP_L: number; // E.g 12 for the net P/L of all the trades
};

export interface LogBook {
  orders: ILogBook_Order[];
  errors: ILogBook_Error[];
  summary: ILogBook_Summary[];
}
