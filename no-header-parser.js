const paraParser = require("papaparse");
const fs = require("fs");
const { shouldContinueRow } = require("./row-logic.js");
const jsonSchema = require("./csv-json-schema.json");

function parseCSVNoHeaderFile(filePath) {
  filePath = filePath.replace(/\//g, "/");
  const fileContents = fs.readFileSync(filePath).toString();
  const content = paraParser.parse(fileContents);
  const rows = content.data;
  const parsedCSV = [];

  for (let row = 0; row < rows.length; row++) {
    if (!shouldContinueRow(row)) {
      continue;
    }

    const indexToAddTo = parsedCSV.length;
    parsedCSV.push({});

    const columns = rows[row];
    for (let column = 0; column < columns.length; column++) {
      let value = columns[column];

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

  return parsedCSV;
}

module.exports = {
  parseCSVNoHeaderFile
};
