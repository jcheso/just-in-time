## Problem we are tackling

We've all heard stories of people falling asleep on a train or bus and missing their stop - ending up in an unknown land or getting fined for getting off at the wrong station.

One solution to is this to set an alarm and try to estimate your arrival time, but what if your transports delayed and you just missed out on an hour of extra sleep? What if it's early and you've missed the stop?

Just In Time provides a solution to this problem no matter the destination, by using precise location to dynamically predict your time of arrival and wake you up via a phone call prior to arriving at your destination. It also offers support to automate text messages informing others of your arrival to ensure your friend is there to pick you up, or so your family members at home know you've arrived safe.

## How is JustInTime built?

- A Swift iOS application incorporating MapKit and using background fetching.
- A Node.js backend server deployed to Heroku, which takes a user's geolocation, average speed and destination to precisely determine their arrival time.
- Integration with the Twilio API to call a user to wake them and to SMS multiple numbers with the destination and their time to arrival.

## Challenges we ran into

- Navigating group unfamiliarity with app + backend development.
- Finding a way to accurately estimate time to arrival.
- Implementing an algorithm optimise the query frequency based on the distance to the destination.

## Accomplishments that we're proud of

- When a group member tested the app on a bus, running the app in the background, they received a wake up call when they were 10 minutes away from their location and we all received SMS notifications to inform us of their arrival.
