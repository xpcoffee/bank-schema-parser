# parse-bank-statement
Script to parse a bank statement and produce a JSON object


## Installing

1. clone the repo
```
git clone git@github.com:xpcoffee/parse-bank-statement.git
```
1. install the dependencies
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
