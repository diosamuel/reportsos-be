const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const { GetNominatim, GetOverpass, AudioAnalyze } = require("./compute/");
const { retrieveData, insertData, updateSummaryData } = require("./compute/db");
const { stat } = require("fs");
const uploadPath = path.join(__dirname, "compute", "uploads");

router.get("/", async (req, res) => {
  let response = await retrieveData();
  res.json({
    status: 200,
    message: "Success",
    data: response,
  });
});
router.get("/:id", async (req, res) => {
  try {
    let response = await retrieveData(req.params.id);
    let { geolocation, audio, image, status, summary, title, datetime } =
      response[0];
    const API_KEY = req.query.API_KEY;
    if (summary) {
      console.log(req.params.id, "EXISTS!");
      res.json(JSON.parse(summary));
    } else {
      let geoRes = JSON.parse(geolocation);
      let nominatimRes = await GetNominatim(geoRes);
      // let overpassRes = await GetOverpass(geoRes);
      let assemblyaiRes = await AudioAnalyze(
        `./src/api/compute/uploads/${audio}`,
        API_KEY
      );

      let result = {
        status: 200,
        message: "Success",
        image,
        audio,
        emergencyStatus: status,
        datetime,
        data: {
          nominatim: nominatimRes,
          assemblyai: assemblyaiRes,
        },
      };
      updateSummaryData({
        id: req.params.id,
        data: JSON.stringify(result),
      }).catch((err) => {
        console.log(err);
        throw new Error(err);
      });

      res.json(result);
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage });
router.post(
  "/",
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const coordinate = req.body?.coordinate;
      const audioFile = req.files.audio ? req.files.audio[0] : null;
      const imageFile = req.files.image ? req.files.image[0] : null;
      if (coordinate) {
        let { display_name } = await GetNominatim(JSON.parse(coordinate));
        let data = {
          geolocation: coordinate,
          imageUrl: imageFile?.filename,
          audioUrl: audioFile?.filename,
          title: display_name,
        };
        let result = await insertData(data);

        res.json({
          status: 200,
          message: "Success",
          data: result[0],
        });
      } else {
        res.json({
          status: 200,
          message: "Error, please add coordinate",
          data: null,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: error.message });
    }
  }
);

module.exports = router;
