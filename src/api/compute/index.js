const { AssemblyAI } = require("assemblyai");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
async function GetOverpass(geo) {
  let distanceInKm = 5;
  let [lat, lon] = geo;
  const latDegreeToKm = 111;
  const lonDegreeToKm = 111 * Math.cos((lat * Math.PI) / 180);
  const latOffset = distanceInKm / latDegreeToKm;
  const lonOffset = distanceInKm / lonDegreeToKm;
  const south = Number(lat) - latOffset;
  const north = Number(lat) + latOffset;
  const west = Number(lon) - lonOffset;
  const east = Number(lon) + lonOffset;
  let SWNE = [south, west, north, east];
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

async function AudioAnalyze(filePath, apikey) {
  try {
    const client = new AssemblyAI({
      apiKey: process.env.APIKEY || apikey,
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
                    "summary": "",
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
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  GetNominatim,
  GetOverpass,
  AudioAnalyze,
};
