# Bus Captain SG

A mobile-friendly browser game for children to learn Singapore bus-driving and bus-operation routines.

## What is included
- Driver Mode: acceleration, braking, steering, bus stops, doors, passenger counts, score, speed limit and operations.
- Ride-Along Mode: browser geolocation can move the virtual bus while a child is actually travelling.
- Touch controls for phones/tablets and arrow-key controls for laptops.
- Spoken next-stop/game announcements using the browser Speech Synthesis API.
- No framework and no installation required.

## Run locally
Open `index.html` directly for Driver Mode. For GPS permissions, browsers generally require HTTPS (or localhost), so host the folder on GitHub Pages, Cloudflare Pages, Netlify or another HTTPS host.

## Real Singapore live-data upgrade
LTA DataMall offers Bus Arrival, Bus Routes, Bus Stops and other live/dynamic transport APIs. These APIs require an Account Key. Do NOT put that key in `game.js`, because students could see it. Put the key in a server-side/serverless environment variable and let the browser call your own `/api/...` endpoint.

OneMap can provide Singapore mapping/routing. Some APIs require token authentication. Keep credentials server-side where required.

## Privacy
Ride-Along GPS in this prototype is processed only in the child's browser. The prototype does not send coordinates to a server.

## Suggested next upgrade
1. Select any actual Singapore bus service.
2. Load its real stop sequence from DataMall.
3. Match phone GPS to the selected service's route/stops.
4. Show live/real stop names and progress.
5. Add bus-interchange missions, wheelchair boarding, rainy weather, traffic lights and safe-driving badges.
