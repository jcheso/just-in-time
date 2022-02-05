const express = require("express");
const router = express.Router();
require("dotenv").config();

router.get("/ping", async (req, res) => {
  return res.sendStatus(200);
});

router.post("/call", async (req, res) => {
  const axios = require("axios");
  TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
  TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
  TWILIO_NUMBER = process.env.TWILIO_NUMBER;
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

  // Parse the request body for params

  const params = { key: GOOGLE_API_KEY };
  let response = {};
  try {
    console.log(params.key);
    response = await axios.get(
      "https://maps.googleapis.com/maps/api/directions/json?origin=Toronto&destination=Montreal",
      { params }
    );
    console.log(response);
    timeToDestination = response.data.routes[0].legs[0].duration.value;
  } catch (error) {
    console.log(error);
  }

  console.log(timeToDestination);
  // Logic for calling

  // ! TWILIO CALL
  // const client = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  // console.log(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  // client.calls
  //   .create({
  //     twiml: "<Response><Say>Ahoy there!</Say></Response>",
  //     to: "+447801824101",
  //     from: `${TWILIO_NUMBER}`,
  //   })
  //   .then((call) => console.log(call.sid));
  return res.send(timeToDestination.toString());
});

module.exports = router;
