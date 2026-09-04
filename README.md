# Bus Captain SG — Cockpit Edition

A browser-based, kid-friendly Singapore bus-driving simulator.

## Version 2 highlights
- First-person driver's cockpit / windscreen view
- Left-side Singapore road driving
- Perspective road, traffic, HDB-style streetscape and tropical greenery
- Singapore-style bus stop poles with five-digit codes
- Bus bays, BUS road markings, pedestrian crossing and traffic signals
- Bus captain operations: doors, bell, announcements, kneeling, indicators, wipers and headlights
- Tropical rain and evening modes
- Passenger boarding/alighting and safe-driving score
- Keyboard and large touchscreen controls
- Ride-Along GPS mode (location processed in the browser)

## Controls
- W / Up: accelerate
- S / Down: brake
- A / Left and D / Right: steer
- Q: left indicator
- E: right indicator
- Space: doors

## Hosting
Upload all files in this folder to GitHub and deploy through GitHub Pages or Cloudflare Pages. `index.html` must remain at the website root.

## Live Singapore data
The game currently uses an offline training-route dataset for dependable play. A production version can connect to LTA DataMall / GTFS and OneMap through a server-side proxy. Do not expose API credentials in browser JavaScript.
