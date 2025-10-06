const path = require("path");
const fs = require("fs");

const deleteExtraFiles = (fileDestination) => {
  if (fs.existsSync(fileDestination)) {
    console.log(fileDestination);

    fs.unlinkSync(fileDestination);
    console.log("Old image deleted successfully");
  }
};

module.exports = {
  deleteExtraFiles,
};
