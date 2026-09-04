# Bus Captain SG V9 — Mapillary Street View Edition

Mobile-first Singapore bus-captain role-play / simulator for Android and iPhone.

## What changed in V9

V9 replaces KartaView with **Mapillary** because KartaView coverage was too sparse for the selected Singapore bus routes.

There is still:

- no Google Maps billing account
- no Google Maps API key
- no LTA DataMall API key
- no Cloudflare Worker

V9 uses the public static Singapore bus-route dataset for route and stop geometry and uses Mapillary street-level imagery for the windscreen.

## One-time Mapillary token

Mapillary requires a free client access token. The game has a token field on the start screen. Press **Save token** and the token is stored in the browser's localStorage on that device, so it does not need to be re-entered every session.

The token is a browser/client token, not a Google billing credential. Do not commit a personal secret/server token into GitHub.

## Option 1 — Live GPS Captain

Use while physically riding on the selected Singapore bus.

- GPS controls the real journey.
- Mapillary imagery follows the phone GPS position when nearby coverage exists.
- No accelerator, brake or normal turn-signal controls.
- Phone rotation animates the steering wheel for role-play only.
- STOP REQUEST, HORN and HAZARD remain available.
- Door OPEN/CLOSE appears only when GPS indicates the bus is slow/stopped near a selected-service bus stop.

## Option 2 — Full Route Simulator

Use without GPS.

- Select a Singapore bus service and direction.
- Actual bus-route/stop geometry supplies the route path.
- Mapillary shows nearby real street-level photographs along that route.
- Accelerator, brake, steering, indicators, doors, bell, announcements, kneeling, wipers and lights are available.
- Phone rotation controls steering on supported Android/iPhone devices.

## Hosting

Upload these files to the root of the GitHub Pages repository:

```text
Bus-driver/
  index.html
  game.js
  styles.css
  manifest.webmanifest
  README.md
```

The HTML references `styles.css?v=9` and `game.js?v=9` to reduce stale browser-cache problems after deployment.

## Important limitation

Mapillary is community-contributed imagery, so some Singapore road sections may still have no nearby image. V9 displays a clear status message instead of a black windscreen and searches again as the bus progresses.
