import axios from "axios";
import { getTelegramBotToken, getTelegramChatId } from "./configs";

/**
 * Send a particular message to a group chatid.
 * @param options An object of msg containing the message to send, and the parseMode to denote which method to parse.
 */
export const sendTelegramBotMsg = (options: {
  msg: string;
  parseMode: string;
}) => {
  const { msg, parseMode } = options;
  const token = getTelegramBotToken();
  const chatid = getTelegramChatId();
  if (!token || !chatid) {
    return;
  }
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  axios.get(url, {
    params: {
      chat_id: chatid,
      text: msg,
      parse_mode: parseMode,
    },
  });
};
