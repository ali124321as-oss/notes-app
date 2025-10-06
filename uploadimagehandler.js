          const path = require("path");
      const multer = require("multer");
      function createStorage(fileDestination) {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.resolve(`./public/${fileDestination}`));
    },
    filename: function (req, file, cb) {
      const fileName = `${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    },
  });
}   

module.exports={
            createStorage,
}