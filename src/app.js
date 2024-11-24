const express = require("express");
const multer = require("multer");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
require("dotenv").config();
const middlewares = require("./middlewares");
const api = require("./api");
const app = express();
const path = require("path");
app.use(morgan("dev"));
app.use(helmet());
app.use(express.json());
// app.use(cors());
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["audio/mpeg", "audio/wav", "image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only audio and image files are allowed!"));
    }
  },
});

app.get("/", (req, res) => {
  res.json({
    message: "API OK",
  });
});

const imagesDirectory = path.join(__dirname, 'api','compute','uploads');
app.use('/', express.static(imagesDirectory));

app.use("/api/v1", api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
