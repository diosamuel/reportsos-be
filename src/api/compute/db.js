const { neon } = require("@neondatabase/serverless");

const sql = neon(
  "postgresql://reportsos_owner:AIp5JzO2HrgY@ep-wild-meadow-a57cbyy0.us-east-2.aws.neon.tech/reportsos?sslmode=require"
);

// Sample data for insertion
const geolocation = [40.712776, -74.005974]; // Example: Latitude, Longitude
const imageUrl = "https://example.com/image.jpg"; // Example image URL
const audioUrl = "https://example.com/audio.webm"; // Example audio URL

function insertData({ geolocation, imageUrl, audioUrl, title }) {
  // Insert query
  console.log({
    geolocation,
    imageUrl,
    audioUrl,
    title,
  });
  const insertQuery = sql`
    INSERT INTO report (geolocation, image, audio, title, status)
    VALUES (${geolocation}, ${imageUrl}, ${audioUrl}, ${title}, TRUE)
    RETURNING id, geolocation, image, audio, status, datetime;
  `;
  return insertQuery;
}

function retrieveData(id) {
  if (id) {
    query = sql`
        SELECT * FROM report WHERE id=${id}
    `;
  } else {
    query = sql`
        SELECT * FROM report
    `;
  }
  return query;
}

async function updateSummaryData({ id, data }) {
  try {
    const query = sql`
        UPDATE report
        SET summary = ${data}::text
        WHERE id = ${id} AND (summary IS NULL OR summary = '');
      `;
    const result = await query;
    return result;
  } catch (err) {
    console.error("Error updating data:", err);
    throw err;
  }
}

module.exports = {
  insertData,
  retrieveData,
  updateSummaryData,
};
