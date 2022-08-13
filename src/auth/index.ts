import { NextFunction, Request, Response } from "express";
import { IAuth } from "./types";

export const isAuthorized = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const body: IAuth = req.body;
  const reqAuth = body.auth;
  const actualAuth = process.env.AUTH;
  if (reqAuth === actualAuth) {
    return next();
  }

  console.log("Unauthorized!", { req });
  res.status(401).send();
};
