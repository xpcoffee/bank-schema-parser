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
### Installing the CLI

After installing the repo, you can further install the CLI for use with other command-line tooling.

```bash
npm run build \
&& npm -g install
```

Try it out

```bash
bank-schema-parser --help
```

### Usage

```bash
Usage: bank-schema-parser --bank <bank> --filePath <filePath> [--type <type>]

Options:
  -V, --version              output the version number
  -b, --bank <bank>          The bank who's statement will be parsed (default: false)
  -f, --filePath <filePath>  The path to the file that should be parsed
  -t, --type <type>          Use to specify the type of input file. Can be DEFAULT, TRANSACTION_HISTORY or HANDMADE. Uses DEFAULT if the option is unspecified.
  -h, --help                 output usage information
```

### Example

```bash
yarn run parse --bank fnb -statement-file ~/Downloads/my-fnb-bank-statement.csv
```

## JSON output structure

The output of the command has the following structure:

```json
{
  "account": "1234567890",
  "bank": "FNB",
  "transactions": [
    {
      "timeStamp": "2019-01-01T00:00:00Z",
      "amountInZAR": -5000,
      "description": "SOME DESCRIPTION",
      "hash": "2019-01-01T00:00:00Z-5000SOMEDESCRIPTION",
      "balance": 11520
    }
  ],
  "parsingErrors": ["some problem was encountered when doing X"]
}
```

## Handmade statements

Sometimes we can't get statements in CSV format and we need to manually enter the data.
"Handmade" statements are statements with manually entered data that have a different
format for ease of data-entry.
