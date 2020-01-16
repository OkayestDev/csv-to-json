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

function parseCSVFile(filePath) {
  filePath = filePath.replace(/\//g, "/");
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

  return parsedCSV;
}

function walkSync(dir, filePathList = []) {
  let files = fs.readdirSync(dir);
  files.forEach(function(file) {
    if (fs.statSync(dir + "/" + file).isDirectory()) {
      filePathList = walkSync(dir + "/" + file, filePathList);
    } else {
      filePathList.push(dir + "/" + file);
    }
  });
  return filePathList;
}

const filePath = args[0].replace(/\//g, "/"); // Allows cross platform file destination
console.info(filePath);
let fileStats = fs.lstatSync(filePath);
let parsedCSV = [];

if (fileStats.isDirectory()) {
  const fileList = walkSync(filePath);
  fileList.forEach(file => {
    const currentParsedCSV = parseCSVFile(file);
    parsedCSV = [...parsedCSV, ...currentParsedCSV];
  });
} else {
  parsedCSV = parseCSVFile(filePath);
}

const json = JSON.stringify(parsedCSV);
if (jsonSchema.writeToFile) {
  fs.writeFileSync(jsonSchema.fileName, json);
}

console.info(json);
clipboardy.writeSync(json);
