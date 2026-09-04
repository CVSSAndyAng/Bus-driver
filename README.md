# Bus Captain SG V7 — No-Worker Street View Edition

A mobile-first Singapore bus-captain role-play / simulator for Android and iPhone.

## What changed in V7

**No LTA DataMall API key and no Cloudflare Worker are required.**

The game now loads Singapore bus service/stop/route-shape data directly from the public static dataset at `data.busrouter.sg/v1/` and uses the browser's normal HTTP cache. The game does not call LTA DataMall dynamic APIs.

You can therefore host the whole game as an ordinary static site on Cloudflare Pages or GitHub Pages.

## Two modes

### 1. Live GPS Captain
Use this while physically riding on the selected Singapore bus.

- GPS controls the journey automatically.
- Real Singapore Google Street View is shown near the phone's GPS location.
- No accelerator, brake or normal turn-signal controls.
- Phone rotation animates the bus steering wheel for role-play only.
- STOP REQUEST, HORN and HAZARD remain available.
- Door OPEN/CLOSE appears only when GPS indicates the bus is slow/stopped near a stop belonging to the selected bus service.
- The game compares the phone's position with each direction of the selected service and chooses the nearest route.

### 2. Full Route Simulator
Use this when not riding a real bus.

- GPS is not used.
- Select a Singapore bus service and direction.
- The ordered stops and route geometry come from the bundled/public static Singapore bus dataset.
- Google Street View supplies the realistic Singapore streetscape in the windscreen.
- Accelerator, brake, steering, indicators, doors, bell, announcements, kneeling, wipers, horn/hazard controls and lights are available.
- Phone rotation controls steering on supported Android/iPhone devices.

## Google Maps / Street View

A Google Maps JavaScript API browser key is still required for Google Street View. Restrict that browser key to your deployed domain, for example:

`https://your-game.pages.dev/*`

The key is a browser key by design; restrict it by website/domain and enable only the Maps JavaScript API required by the game.

## Hosting

Upload these files to your existing Cloudflare Pages / GitHub repository. There is **no `api/` Worker folder in V7**.

Recommended architecture:

```text
Android / iPhone browser
        |
        +--> Cloudflare Pages (Bus Captain SG)
        |
        +--> public static Singapore bus route data
        |
        +--> Google Maps JavaScript API / Street View
```

## Internet requirement

Both game modes need internet for realistic Street View. The route dataset is small and cacheable, but it is still downloaded from the public static data server when required. If you later want a fully self-contained copy, the three JSON files can be copied into a local `data/` folder and `BUS_DATA_BASE` in `game.js` changed to `./data`.

## Data note

The static bus data source is the open-source SG Bus Data project used by BusRouter SG. It aggregates Singapore bus stops, services and route geometry and is not the LTA DataMall real-time API. Because it is static/cached data, route changes may not appear instantly.
