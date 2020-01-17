const jsonSchema = require("./csv-json-schema.json");

function shouldContinueRow(row) {
  if (jsonSchema.rowsToInclude.length > 0) {
    return json.schema.rowsToInclude.includes(row);
  }

  if (jsonSchema.rowsToIgnore.includes(row)) {
    return false;
  }

  return true;
}

module.exports = {
  shouldContinueRow
};
