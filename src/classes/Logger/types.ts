import { INSTRUCTION } from "../../utils";

export interface ILogBook_Trade {
  timestamp: number; // date-time stamp in Unix 13 digits
  instruction: INSTRUCTION;
  quantity: number; // 100
  symbol: string; // 'SPY'
  price: number; // Estimated executed price derived through calling the current ticker price
  strategy: string;
}

export type ILogBook_Order = {
  date: string; // Date in YYYY-MM-DD format
  trades: ILogBook_Trade[];
};

export type ILogBook_Error = {
  date: string;
  err: any[];
};

export type ILogBook_Summary = {
  date: string;
  numCompletedTrades: number; // Completed trade, i.e. open and closed.
  rawP_L: number[]; // E.g. [55, -120, 77] for P/L of 3 trades
  netP_L: number; // E.g 12 for the net P/L of all the trades
};

export interface LogBook {
  orders: ILogBook_Order[];
  errors: ILogBook_Error[];
  summary: ILogBook_Summary[];
}
