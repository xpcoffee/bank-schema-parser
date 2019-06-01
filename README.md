# parse-bank-statement

Script to parse a bank statement and produce a JSON object

## Dependencies

- NodeJS 11 (necessary for [readline async iterator](https://nodejs.org/api/readline.html#readline_rl_symbol_asynciterator))

## Installing

Clone the repo

```
git clone git@github.com:xpcoffee/parse-bank-statement.git
```

Install the dependencies

```
yarn install
```

## Running locally

```
yarn run parse --help
```

## Usage

```
Usage: index --bank <bank> --statement-file <file>

Options:
  -V, --version                output the version number
  -b, --bank <bank>            The bank who's statement will be parsed (default: false)
  -f, --statement-file <file>  The bank statement file to be parsed
  -h, --help                   output usage information
```

## Example

```
yarn run parse --bank fnb -statement-file ~/Downloads/my-fnb-bank-statement.csv
```

## JSON output structure

The output of the command has the following structure:

```json
{
  account: "1234567890",
  bank: "FNB",
  transactions: [
    {
      timeStamp: "2019-01-01T00:00:00Z",
      amountInZAR: -5000,
      description: "SOME DESCRIPTION",
      hash: "2019-01-01T00:00:00Z-5000SOMEDESCRIPTION",
      balance: 11520
    }
  ],
  parsingErrors: [
    "some problem was encountered when doing X"
  ]
}
```