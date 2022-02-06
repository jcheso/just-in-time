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
  const deviceTime = query.deviceTime;
  const timeBeforeAlarm = query.timeBeforeAlarm;
  const numberToCall = query.phoneNumber;
  // const sendMessageToSafety = query.sendMessageToSafety;
  // const safetyPhoneNumber = query.safetyPhoneNumber;

  let statusCode = 0;

  // return timeLeft, ifCalled

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
    const d = calculateDistance(origin, destination);

    // Calculate the time to destination based on instantaneous
    const straightLineDurationToDestination = d / Maths.abs(speed);

    // Call user if time to location is less than set time
    if (straightLineDurationToDestination <= timeBeforeAlarm) {
      let sendMessageToSafety = true;
      const safetyPhoneNumber = "+447883097795";
      const count = 0;

      console.log("RING RING BITCHES");
      const client = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
      client.calls
        .create({
          twiml: "<Response><Say>Ahoy there!</Say></Response>",
          to: numberToCall,
          from: TWILIO_NUMBER,
          statusCallback: `https://ichack-22.herokuapp.com/no-answer?number=${numberToCall}&count=${count}`,
          statusCallbackEvent: ["completed"],
          statusCallbackMethod: "POST",
        })
        .then((call) => console.log(call.status));

      if (sendMessageToSafety) {
        console.log("MESSAGE MESSAGE BABY");
        client.messages
          .create({
            from: TWILIO_NUMBER,
            body: "Your friend has arrived at their destination!",
            to: safetyPhoneNumber,
            messagingServiceSid: "MG61ffe7bda5574fa4bf36ddc2614e6501",
          })
          .then((message) => console.log(message.sid));
      }
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
    if (count < 3) {
      console.log("RING RING BITCHES AGAIN");
      const client = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
      client.calls
        .create({
          twiml: "<Response><Say>Ahoy there!</Say></Response>",
          to: "+447801824101",
          from: TWILIO_NUMBER,
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
