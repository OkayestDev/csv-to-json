const fs = require("fs");
const clipboardy = require("clipboardy");
const jsonSchema = require("./csv-json-schema.json");
const { getFileList } = require("./get-file-list.js");
const { parseCSVNoHeaderFile } = require("./no-header-parser.js");
const { parseCSVHeaderFile } = require("./header-parser.js");

// Skip first two args (`node` and name of script)
const args = process.argv.slice(2);

if (args.length !== 1) {
  console.info(
    "Provide an absolute path to .csv file or directory containing .csv files"
  );
  process.exit(1);
}

const filePath = args[0].replace(/\//g, "/"); // Allows cross platform file destination
let parsedCSV = [];

// Parse CSV files
const fileList = getFileList(filePath);
fileList.forEach(file => {
  if (jsonSchema.hasHeaders) {
    const currentParsedCSV = parseCSVHeaderFile(file);
    parsedCSV.push(currentParsedCSV);
  } else {
    const currentParsedCSV = parseCSVNoHeaderFile(file);
    parsedCSV = [...parsedCSV, ...currentParsedCSV];
  }
});

// JSON stringify and write to file
const json = JSON.stringify(parsedCSV);
if (jsonSchema.writeToFile) {
  fs.writeFileSync(jsonSchema.fileName, json);
}

// Print and copy to clipboard
console.info(json);
clipboardy.writeSync(json);
