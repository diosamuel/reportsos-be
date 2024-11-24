const { AssemblyAI } = require("assemblyai");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
// const { writeFileSync } = require("fs");
// // Construct the path to the file
// const TEST_AUD = path.join(
//   __dirname,
//   "uploads",
//   "audio-1732202775245-537811102.mp3"
// );

// const TEST_GEO = [38.89755337788813, -77.03655064697888];
async function GetOverpass(geo) {
  //radius 5 km
  let SW = geo.map((latlong) => latlong - 0.05);
  let NE = geo.map((latlong) => latlong + 0.05);
  let SWNE = [SW, NE];

  let overpassQuery = `[out:json][timeout:25];
  nwr["amenity"~"^(hospital|fire_station|police)$"](${SWNE.join(",")});
  out geom;`;

  let result = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: "data=" + encodeURIComponent(overpassQuery),
  });

  let res = await result.json();
  return res;
}
async function GetNominatim(geo) {
  let [lat, long] = geo;
  let result = await fetch(
    `https://nominatim.openstreetmap.org/reverse.php?lat=${lat}&lon=${long}&zoom=18&format=jsonv2`,
    {
      method: "GET",
    }
  );
  let res = await result.json();
  return res;
}

async function AudioAnalyze(filePath) {
  const client = new AssemblyAI({
    apiKey: process.env.APIKEY,
  });
  const FILE_URL = filePath;
  const audioAssemblyData = {
    audio: FILE_URL,
    speech_model: "best",
    iab_categories: true,
    entity_detection: true,
    language_detection: true,
  };
  const transcript = await client.transcripts.transcribe(audioAssemblyData);
  delete transcript["words"];
  // let transcript = { id: "cd867ab6-e387-47b4-8bf9-72a29c28f6c3" };
  const { response } = await client.lemur.summary({
    transcript_ids: [transcript.id],
    final_model: "anthropic/claude-3-haiku",
    context: "This is an emergency call for assistance.",
    answer_format: `{
                    "activities":"very short sentence",
                    "summary: "",
                    "key_points": [],
                    "tone": "",
                    "casualty":"",
                    "status":"Critical"|"Urgent"|"Non-Urgent"
                }`,
  });

  return {
    transcribe: transcript,
    llm: response,
  };
}

module.exports = {
  GetNominatim,
  GetOverpass,
  AudioAnalyze,
};
