const fs = require('fs');
const jsonSchema = require('./csv-json-schema.json');
const paraParser = require('papaparse');

/**
 * Generates a folder in apis/v2 based on $endpoint passed with the following three files:
 * $endpoint.routes.js
 * $endpoint.schema.js
 * $endpoint.controller.js
 * As well as 3 tests files in __tests__/src/apis/v2/$endpoint
 */

// Skip first two args (`node` and name of script)
const args = process.argv.slice(2);

if (args.length !== 1) {
  // eslint-disable-next-line no-console
  console.info('Provider a absolute path to .csv file');
  process.exit(1);
}

const filePath = args[0].replace(/\//g, "/"); // Allows cross platform file destination
const fileContents = fs.readFileSync(filePath).toString();
const content = paraParser.parse(fileContents);
const rows = content.data;
const parsedCSV = [];

for (let row = 0; row < rows.length; row++) {
    if (jsonSchema.rowsToIgnore.includes(row)) {
        continue;
    }

    const indexToAddTo = parsedCSV.length;
    parsedCSV.push({});

    const columns = rows[row];
    for (let column = 0; column < columns.length; column++) {
        let value = columns[column];
        if (jsonSchema.columnsToIgnore.includes(column)) {
            continue;
        }

        const columnString = String(column);
        if (columnString in jsonSchema.columnDefinitions) {
            const columnDefinition = jsonSchema.columnDefinitions[columnString];

            if (columnDefinition.isArray) {
                value = value.split(columnDefinition.deliminator);
            }

            parsedCSV[indexToAddTo][columnDefinition.name] = value
        }
    }
}


const FILE_TO_WRITE = "result.json";
fs.writeFileSync(FILE_TO_WRITE, JSON.stringify(parsedCSV));
