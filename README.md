# bank-schema-parser

Script to parse bank statement files with known structure and produce a JSON object that conforms to [bank-schema](https://github.com/xpcoffee/bank-schema).

## Currently supported bank statement formats

- [FNB](https://www.fnb.co.za)
  - `DEFAULT` - this is for the CSV statements that gets sent to you every X months or that you download from the site.
  - `TRANSACTION_HISTORY` - this is for the CSV statements downloaded from the transaction history page.
- [StandardBank](https://www.standardbank.co.za/)
  - `DEFAULT` - this is for the CSV statements that gets sent to you every X months or that you download from the site.
  - `HANDMADE` - this is for the CSV statements are hand-crafter (e.g. for backfilling purposes).

If you need an additional format, please submit a pull-request or submit an issue.

## Dependencies

- NodeJS 11 (necessary for [readline async iterator](https://nodejs.org/api/readline.html#readline_rl_symbol_asynciterator))

## Installing the repo

Clone the repo

```bash
git clone git@github.com:xpcoffee/parse-bank-statement.git \
&& cd parse-bank-statement
```

Install dependencies

```bash
npm install
```

## CLI

See [bank-schema-cli](https://github.com/xpcoffee/bank-schema-cli) for the command line interface of this library.

## UI

See [bank-schema-ui](https://github.com/xpcoffee/bank-schema-ui) for the web-UI of this library.
