const express = require("express");
const router = express.Router();
const url = require("url");
const axios = require("axios");

require("dotenv").config();

router.get("/ping", async (req, res) => {
  return res.sendStatus(200);
});

router.post("/call", async (req, res) => {
  const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
  const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
  const TWILIO_NUMBER = process.env.TWILIO_NUMBER;
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

  const query = url.parse(req.url, true).query;
  const origin = query.origin;
  const destination = query.destination;
  const speed = query.speed;
  const deviceTime = query.deviceTime;
  const timeBeforeAlarm = query.timeBeforeAlarm;
  // const safetyPhoneNumber = query.safetyPhoneNumber;

  // Get longlat coordinates from origin and destination input
  const originArray = origin.split(",");
  const destinationArray = destination.split(",");
  const originLat = originArray[0];
  const originLong = originArray[1];
  const destinationLat = destinationArray[0];
  const destinationLong = destinationArray[1];

  let statusCode = 0;

  const params = {
    origin: origin,
    destination: destination,
    key: GOOGLE_API_KEY,
  };

  let response = {};

  try {
    response = await axios.get(
      "https://maps.googleapis.com/maps/api/directions/json?",
      { params }
    );

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
    const straightLineDurationToDestination = d / speed;
    if (straightLineDurationToDestination <= timeBeforeAlarm) {
      const num = "+447801824101";
      const safetyPhoneNumber = "+447762711868";
      const count = 0;

      console.log("RING RING BITCHES");
      const client = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
      client.calls
        .create({
          twiml: "<Response><Say>Ahoy there!</Say></Response>",
          to: num,
          from: `${TWILIO_NUMBER}`,
          statusCallback: `https://ichack-22.herokuapp.com/no-answer?number=${num}&count=${count}`,
          statusCallbackEvent: ["completed"],
          statusCallbackMethod: "POST",
        })
        .then((call) => console.log(call.status));

      console.log("MESSAGE MESSAGE BABY");
      client.messages
        .create({
          body: "Your friend has arrived at their destination!",
          from: `${TWILIO_NUMBER}`,
          to: safetyPhoneNumber,
        })
        .then((message) => console.log(message.sid));
    }
    statusCode = 200;
  } catch (error) {
    console.log(error);
    statusCode = 404;
  }
  return res.sendStatus(statusCode);
});

router.post("/no-answer", async (req, res) => {
  const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
  const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
  const TWILIO_NUMBER = process.env.TWILIO_NUMBER;
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

  const query = url.parse(req.url, true).query;
  const count = parseInt(query.count) + 1;
  const num = query.number;

  console.log("NO ANSWER");
  console.log("COUNT: " + count);

  try {
    //Get count from query string
    if (count < 3) {
      console.log("RING RING BITCHES AGAIN");
      const client = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
      client.calls
        .create({
          twiml: "<Response><Say>Ahoy there!</Say></Response>",
          to: "+447801824101",
          from: `${TWILIO_NUMBER}`,
          statusCallback: `https://ichack-22.herokuapp.com/no-answer?number=${num}&count=${count}`,
          statusCallbackEvent: ["completed"],
          statusCallbackMethod: "POST",
        })
        .then((call) => console.log(call.status));
    }
    statusCode = 200;
  } catch (error) {
    console.log(error);
    statusCode = 404;
  }
  return res.sendStatus(statusCode);
});

module.exports = router;
