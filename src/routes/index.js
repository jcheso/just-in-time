const express = require("express");
const router = express.Router();
const url = require("url");
const axios = require("axios");
require("dotenv").config();

router.get("/ping", async (req, res) => {
  return res.sendStatus(200);
});

router.post("/call", async (req, res) => {
  // Import API Keys from environment
  const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
  const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
  const TWILIO_NUMBER = process.env.TWILIO_NUMBER;
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

  // Parse query for variables
  const query = url.parse(req.url, true).query;
  const origin = query.origin;
  const destination = query.destination;
  const speed = query.speed;
  const timeBeforeAlarm = query.timeBeforeAlarm;
  const phoneNumber = query.phoneNumber;
  const smsNumbers = query.smsNumbers;
  console.log(speed, timeBeforeAlarm, phoneNumber, smsNumbers);
  // Ensure number starts with +
  const numberToCall = "+" + phoneNumber.substring(1);

  // Split numbers to notify to array
  let smsNumbersArray = [];
  if (smsNumbers) {
    smsNumbersArray = smsNumbers.split(",");
  }

  // Define variables
  let response;
  let queryFrequency;

  //
  try {
    // * Get destination location to print in text message
    const params = {
      latlng: destination,
      key: GOOGLE_API_KEY,
    };
    response = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json?",
      { params }
    );

    let destinationName;
    response.data
      ? (destinationName = response.data.results[0].formatted_address)
      : (destinationName = "their destination");

    // Determine the straight-line distance between start and end
    const d = calculateDistance(origin, destination);

    // Error handling: Ensure that speed is not 0
    if (speed === 0)
      return res.send(JSON.stringify(minimumTimeBeforeNextQuery));

    // Calculate the time to destination based on instantaneous
    const straightLineDurationToDestination = d / Math.abs(speed);

    // Call user if time to location is less than set time
    if (straightLineDurationToDestination <= timeBeforeAlarm) {
      console.log("RING RING BITCHES");

      const client = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
      client.calls
        .create({
          twiml: "<Response><Say>Ahoy there!</Say></Response>",
          to: numberToCall,
          from: TWILIO_NUMBER,
        })
        .then((call) => console.log(call.status));

      if (smsNumbersArray) {
        console.log("MESSAGE MESSAGE BABY");
        //
        smsNumbersArray.forEach((number) => {
          number = "+" + number.substring(1);
          console.log(number);
          client.messages
            .create({
              from: TWILIO_NUMBER,
              body: `Your friend will arrive at ${destinationName} in ${Math.floor(
                straightLineDurationToDestination / 60
              )} minutes.`,
              to: number,
              messagingServiceSid: "MG61ffe7bda5574fa4bf36ddc2614e6501",
            })
            .then((message) => console.log(message.sid));
        });
      }
      queryFrequency = 0;
    } else {
      queryFrequency = returnTimeToQueryNext(straightLineDurationToDestination);

      console.log("Time to destination: ", straightLineDurationToDestination);
      console.log("Time to next query: ", queryFrequency);
    }
  } catch (error) {
    console.log(error);
    return res.sendStatus(404);
  }
  return res.send(JSON.stringify(queryFrequency));
});

module.exports = router;

/* FUNCTIONS */

// Function that receives input of two latlong coordinates, and returns distance
function calculateDistance(origin, destination) {
  // Split origin and destination into latitude and longitude coordinates
  const originArray = origin.split(",");
  const destinationArray = destination.split(",");
  const originLat = originArray[0];
  const originLong = originArray[1];
  const destinationLat = destinationArray[0];
  const destinationLong = destinationArray[1];

  // Determine the straight-line distance between start and end
  const R = 6371e3; // Earth Radius metres
  const φ1 = (originLat * Math.PI) / 180; // φ, λ in radians
  const φ2 = (destinationLat * Math.PI) / 180;
  const Δφ = ((destinationLat - originLat) * Math.PI) / 180;
  const Δλ = ((destinationLong - originLong) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // in metres

  return d;
}

// Function that receives input of duration from destination,
// and returns time to query next according to algorithm
function returnTimeToQueryNext(straightLineDurationToDestination) {
  const minimumTimeBeforeNextQuery = 30;
  const timeToQueryNext =
    0.0024 * (straightLineDurationToDestination / 60) ** 2 +
    4.8338 * (straightLineDurationToDestination / 60) -
    56;
  return Math.max(timeToQueryNext, minimumTimeBeforeNextQuery);
}
