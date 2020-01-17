const paraParser = require("papaparse");
const fs = require("fs");
const jsonSchema = require("./csv-json-schema.json");
const { shouldContinueRow } = require("./row-logic.js");

function getHeaders(headerRow) {
  const headers = [];
  for (
    let index = jsonSchema.headerColumnStart;
    index < headerRow.length;
    index++
  ) {
    let header = headerRow[index];

    if (jsonSchema.headerDefinition.deliminator) {
      header = header.split(jsonSchema.headerDefinition.deliminator);
      header = header[jsonSchema.headerDefinition.indexOfSplitIsHeader];
    }

    headers.push(header);
  }
  return headers;
}

function parseCSVHeaderFile(filePath) {
  filePath = filePath.replace(/\//g, "/");
  const fileContents = fs.readFileSync(filePath).toString();
  const content = paraParser.parse(fileContents);
  const rows = content.data;
  const headers = getHeaders(rows[0]);
  const parsedCSV = {};

  for (let headerIndex = 0; headerIndex < headers.length; headerIndex++) {
    const header = headers[headerIndex];
    parsedCSV[header] = {};

    for (let row = 0; row < rows.length; row++) {
      if (!shouldContinueRow(row)) {
        continue;
      }
      const columns = rows[row];
      const childName = columns[jsonSchema.childColumn];

      for (
        let column = jsonSchema.headerColumnStart;
        column < columns.length;
        column++
      ) {
        let value = columns[column];

        const columnDefinition = jsonSchema.intersectionWithHeaderDefinition;

        if (columnDefinition.isArray) {
          value = value.split(columnDefinition.deliminator);
        }

        parsedCSV[header][childName] = value;
      }
    }
  }

  return parsedCSV;
}

module.exports = {
  parseCSVHeaderFile
};
