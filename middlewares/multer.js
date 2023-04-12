const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
//set storage-need to inform multer,
// multer.diskStorage({  //wer to store all images inside the disk
const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("invalid image type");

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const store = multer({ storage: storage });


//IMAGE CROP
const sharpImage = (req, res, next) => {
  req.files.forEach((file) => {
    const inputBuffer = fs.readFileSync(file.path);
    sharp(inputBuffer)
      .resize({ width: 400, height: 400, fit: "cover" })
      .toFile(file.path, (err) => {
        if (err) throw err;
      });
  });

  next();
};

module.exports = { store, sharpImage };
