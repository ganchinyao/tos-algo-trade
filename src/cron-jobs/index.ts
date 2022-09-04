import cron from "node-cron";
import { Order } from "../classes/Order";
import sendTodaySummaryToTelegram from "./telegram-job";

const startCronJob = () => {
  // Run this job every Monday-Friday at 15:50 New York time.
  cron.schedule(
    "50 15 * * 1,2,3,4,5",
    async function () {
      await Order.marketCloseAllOpenOrders();
      sendTodaySummaryToTelegram();
    },
    {
      timezone: "America/New_York",
    }
  );
};

export { startCronJob };
