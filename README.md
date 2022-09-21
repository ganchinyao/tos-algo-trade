# tos-algo-trade

Simple Express server that helps automate Buy and Sell stock orders through Thinkorswim API.

This programs exposes API endpoints where you can send a POST request to Buy or Sell stocks for Thinkorswim. It does not decide what/when to Buy or Sell. You need to find a Signal Provider, or write your own program to send a POST request to this server to execute the trade.

# Features

1. Buy and Sell Stocks automatically
2. Log all trades to a Logbook to be viewed easily
3. Automatically close all open trades at 15:50 New York Time each day
4. Send trade summary to a Telegram group of your choice each day at 15:50

# Setup
1. Clone this project
2. Run `npm install` on root folder of project
3. Create a file `.env` in root folder of project, using the template below. This will contain all your credentials.
4. Run `npm run dev` during development. Run `npm run start` for production. To stop production, run `npm run stop`.

`.env` Template:

```bash
PORT=8000
AUTH=enter_some_string_here_of_your_choice
REFRESH_TOKEN=your_refresh_token_here
CONSUMER_KEY=your_consumer_key_without_@AMER.OAUTHAP
ACCOUNT_ID=nine_digits_thinkorswim_account_id
TELEGRAM_TOKEN=your_telegram_token_to_send_the_bot_msg_from
TELEGRAM_CHAT_ID=your_telegram_chat_id_to_send_bot_msg_to
```

# API Endpoints

### POST /market_buy
Send a POST request to put in a Market Buy Order for a particular ticker.
If there is already an opened Short order for this strategy that is not closed yet, we will proceed to close that instead.
If there is already an opened Long order for this strategy, then do nothing.

<table>
<tr>
<td> </td> <td> Signature </td> <td> Explanation </td>
</tr>
<tr>
<td> Request Body </td>
<td>

```ts
{
  auth: string,
  symbol: string,
  quantity: number,
  strategy: string,
}
```

</td>
<td> 


```
auth: The same string found in `.env` AUTH
symbol: The ticker to buy, e.g. 'SPY'
quantity: The amount to buy, e.g. 10
strategy: A string name of your choice
```

</td>
</tr>
<tr>
<td> Response Body </td>
<td> Status: 200 | 422 | 503 </td>
<td> 


```
Succeeds: 200 "market_buy finishes!"
Failed to pass in 'symbol' or 'quantity' or 'strategy': 422 "Wrong body format"
Error: 503 "Server error"
```

</td>
</tr>
</table>

Example:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"auth": "MY_SOME_AUTH", "symbol": "SPY", "quantity": 1, "strategy": "My Strategy Name"}' http://localhost:8000/market_buy
```
