# parse-bank-statement

Script to parse a bank statement and produce a JSON object

## Dependencies

- NodeJS 11 (necessary for [readline async iterator](https://nodejs.org/api/readline.html#readline_rl_symbol_asynciterator))

## Installing

Clone the repo

```bash
git clone git@github.com:xpcoffee/parse-bank-statement.git \
&& cd parse-bank-statement
```

Install dependencies

```bash
npm run install
```

Build the project and install the binary

```bash
npm run build \
&& npm -g install
```

Try it out

```bash
parse-bank-statement --help
```

## Usage

```bash
Usage: index --bank <bank> --file <file> [--handmade]

Options:
  -V, --version      output the version number
  -b, --bank <bank>  The bank who's statement will be parsed (default: false)
  -f, --file <file>  The bank statement file to be parsed
  -hm, --handmade    Use for statements with the 'handmade' format
  -h, --help         output usage information
```

## Example

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
  "parsingErrors": [
    "some problem was encountered when doing X"
  ]
}
```

## Handmade statements

Sometimes we can't get statements in CSV format and we need to manually enter the data.
"Handmade" statements are statements with manually entered data that have a different
format for ease of data-entry.