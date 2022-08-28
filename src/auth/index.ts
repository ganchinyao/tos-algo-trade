import { NextFunction, Request, Response } from "express";
import { IAuth } from "./types";

export const isAuthorized = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.method === "GET") {
    // Don't need check for authorization for GET method
    return next();
  }
  const body: IAuth = req.body;
  const reqAuth = body.auth;
  const actualAuth = process.env.AUTH;
  if (reqAuth === actualAuth) {
    return next();
  }

  console.log("Unauthorized!");
  res.status(401).send();
};
