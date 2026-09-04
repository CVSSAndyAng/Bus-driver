# Bus Captain SG V8 — Free Street Imagery Edition

Mobile-first Singapore bus-captain role-play / simulator for Android and iPhone.

## V8 removes Google Maps billing

V8 no longer uses Google Maps JavaScript API or Google Street View. There is:

- no Google API key field
- no Google billing account requirement
- no LTA DataMall API key
- no Cloudflare Worker requirement

The windscreen now uses public community-contributed **KartaView** street-level imagery. KartaView public imagery and geographic search endpoints can be accessed without authentication for normal community use.

## Important imagery limitation

KartaView is crowdsourced rather than Google's comprehensive Street View. Singapore coverage and capture dates vary by road. When imagery is available, the game shows real street-level photographs and follows the selected bus route. When a point has no nearby community imagery, the game keeps the route state and searches again as the bus progresses.

## Two modes

### 1. Live GPS Captain

Use while physically riding on the selected Singapore bus.

- GPS controls the journey.
- KartaView street imagery follows the phone location when coverage exists.
- No accelerator, brake or normal turn-signal controls.
- Phone rotation animates the steering wheel for role-play only.
- STOP REQUEST, HORN and HAZARD remain available.
- Door OPEN/CLOSE appears only when GPS indicates the bus is slow/stopped near a selected-service bus stop.

### 2. Full Route Simulator

Use without GPS.

- Select a Singapore bus service and direction.
- Static Singapore bus route/stop data supplies the route geometry.
- KartaView provides real street-level imagery when coverage is available.
- Accelerator, brake, steering, indicators, doors, bell, announcements, kneeling, wipers and lights remain available.
- Phone rotation controls steering on supported Android/iPhone devices.

## Hosting

Upload all files to the root of the existing GitHub Pages repository. No API secrets are needed.

Example:

```text
Bus-driver/
  index.html
  game.js
  styles.css
  manifest.webmanifest
  README.md
```

The game needs HTTPS for reliable GPS and motion sensor permissions. GitHub Pages already provides HTTPS.

## Internet requirement

Internet is still required for route data and KartaView street imagery. The game does not incur Google Maps API charges because it no longer calls Google Maps.
