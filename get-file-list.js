const fs = require("fs");

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

function getFileList(filePath) {
  let fileStats = fs.lstatSync(filePath);
  if (fileStats.isDirectory()) {
    return walkSync(filePath);
  } else {
    return [filePath];
  }
}

module.exports = {
  getFileList
};
