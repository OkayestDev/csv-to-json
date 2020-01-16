const fs = require("fs");
const jsonSchema = require("./csv-json-schema.json");
const paraParser = require("papaparse");
const clipboardy = require("clipboardy");

// Skip first two args (`node` and name of script)
const args = process.argv.slice(2);

if (args.length !== 1) {
  console.info("Provide an absolute path to .csv file");
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

      parsedCSV[indexToAddTo][columnDefinition.name] = value;
    }
  }
}

if (jsonSchema.writeToFile) {
  const FILE_TO_WRITE = "result.json";
  fs.writeFileSync(FILE_TO_WRITE, JSON.stringify(parsedCSV));
}
console.info(parsedCSV);
clipboardy.writeSync(parsedCSV);
