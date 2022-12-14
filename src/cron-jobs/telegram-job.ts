import {
  getTodaysError,
  getTodaysOrder,
  getTodaysSummary,
} from "../classes/Logger";
import { getHHmm, getYYYYMMDD, sendTelegramBotMsg } from "../utils";

/**
 * Format these special characters because telegram requires these character to append '\', since these special characters have special meaning on its own to telegram.
 */
const formatDot = (str: string) => str.replace(/\./g, "\\.");
const formatDash = (str: string) => str.replace(/-/g, "\\-");
const formatComma = (str: string) => str.replace(/,/g, ", ");
const formatUnderscore = (str: string) => str.replace(/_/g, "\\_");

/**
 * Send a summary to a telegram bot everyday.
 * The summary includes: Number of completed trades, Raw P/L, Net P/L, and Time and Order type of each trades.
 */
export const sendTodaySummaryToTelegram = () => {
  const date = Date.now();
  const orders = getTodaysOrder();

  if (orders) {
    const summary = getTodaysSummary();
    const trades = orders.trades;

    const numTradesCompleted = summary?.numCompletedTrades ?? "";
    const rawP_L = summary?.rawP_L ?? "";
    const netP_L = summary?.netP_L ?? "";
    const tradeInfo = trades.map((trade) => {
      return {
        timestamp: trade.timestamp,
        instruction: trade.instruction,
      };
    });
    const greenEmoji = "\u{2747}";
    const redEmoji = "\u{1F534}";
    const neutralEmoji = "\u{2796}";

    const formatedDate = formatDash(getYYYYMMDD(date));
    const formatedP_L = formatComma(formatDash(formatDot(rawP_L.toString())));
    const formatedNetP_L =
      netP_L > 0
        ? `\\+${formatDot(netP_L.toString())}`
        : netP_L < 0
        ? `${formatDash(formatDot(netP_L.toString()))}`
        : netP_L;
    let formatedTradeInfo = "\n";
    const transformTradeInfo = tradeInfo.map((trade) => {
      return `${getHHmm(trade.timestamp)} ${formatUnderscore(
        trade.instruction
      )}`;
    });
    for (let i = 0; i < transformTradeInfo.length; i++) {
      formatedTradeInfo += transformTradeInfo[i] + "\n";
    }
    const formatedEmoji =
      netP_L > 0 ? greenEmoji : netP_L < 0 ? redEmoji : neutralEmoji;

    const msg = `*${formatedDate}* ${formatedEmoji}\n\nCompleted Trades: ${numTradesCompleted}\nRaw P/L: ${formatedP_L}\nNet P/L: *${formatedNetP_L}*\n\n\`\`\`${formatedTradeInfo}\`\`\``;
    sendTelegramBotMsg({ msg, parseMode: "MarkdownV2" });
  } else {
    sendTelegramBotMsg({
      msg: `*${formatDash(getYYYYMMDD(date))}*: No trade`,
      parseMode: "MarkdownV2",
    });
  }
};

/**
 * Send a message to telegram to inform that today has some error event that was logged to the logbook.
 * If today has no error, skip.
 * Then, manually call /logbook?type=error to see what are the error code
 */
export const sendTodaysErrorToTelegram = () => {
  const errors = getTodaysError();
  const now = Date.now();
  if (errors) {
    sendTelegramBotMsg({
      msg: `*${formatDash(getYYYYMMDD(now))}*: There is error!!!`,
      parseMode: "MarkdownV2",
    });
  }
};
