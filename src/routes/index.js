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
  const timeBeforeAlarm = query.timeBeforeAlarm;
  const deviceTime = query.deviceTime;

  let code = 0;

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
    timeToDestination = response.data.routes[0].legs[0].duration.value;
    // ! Adjust based off device time
    if (timeToDestination <= timeBeforeAlarm) {
      const client = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
      console.log(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
      client.calls
        .create({
          twiml: "<Response><Say>Ahoy there!</Say></Response>",
          to: "+447801824101",
          from: `${TWILIO_NUMBER}`,
        })
        .then((call) => console.log(call.sid));
      console.log("RING RING BITCHES");
    }
    code = 200;
  } catch (error) {
    console.log(error);
    code = 404;
  }
  return res.send(code);
});

module.exports = router;
