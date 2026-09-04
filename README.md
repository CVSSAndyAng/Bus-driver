# Bus Captain SG V6 — Dual Mode Street View Edition

A mobile-first Singapore bus-captain role-play / simulator for Android and iPhone.

## Two game modes

### 1. Live GPS Captain
Use this while physically riding on the selected Singapore bus.

- GPS drives the journey automatically.
- Real Singapore Google Street View is shown at the phone's GPS location.
- No accelerator, brake or normal turn-signal controls.
- Phone rotation animates the bus steering wheel for role-play only.
- STOP REQUEST remains available.
- HORN and HAZARD controls remain available, including when the real bus stops at a traffic light or in traffic.
- Door OPEN/CLOSE appears only when GPS indicates the bus is stopped near a recognised stop on the selected service.
- The game tries to infer the route direction by finding the selected service direction nearest the current GPS location.

### 2. Full Route Simulator
Use this when not riding a real bus.

- GPS is not needed.
- Select a real Singapore bus service and direction.
- LTA Bus Routes + Bus Stops provide the ordered real stops.
- Google driving directions build the road path between those stops.
- Google Street View supplies the real Singapore streetscape in the windscreen.
- Accelerator, brake, steering, indicators, doors, bell, announcements, kneeling, wipers and lights are available.
- Phone rotation controls steering on supported Android/iPhone devices.

## Important: real-route data

The browser must NOT contain your LTA DataMall Account Key. The included `api/worker.js` is a Cloudflare Worker template. Store the key as a Worker secret named:

`LTA_ACCOUNT_KEY`

The Worker serves:

`/api/route?service=118&direction=1`

or, for Live GPS mode, all directions:

`/api/route?service=118`

The browser then matches the live GPS to the nearest route direction.

## Google Maps setup

Enable the Maps JavaScript API for the browser key. The game uses:

- `StreetViewPanorama` / `StreetViewService` for real Singapore Street View.
- `DirectionsService` to construct the road path between the actual LTA bus stops in Simulator mode.

Restrict the browser key to your deployed domain, for example:

`https://your-game.pages.dev/*`

Do not place an unrestricted key in a public GitHub repository.

## Hosting

Use HTTPS (Cloudflare Pages or GitHub Pages). HTTPS is required for reliable phone motion and GPS permissions.

Recommended architecture:

```text
Android / iPhone browser
        |
        +--> Cloudflare Pages (game)
        |
        +--> Cloudflare Worker /api/route
                  |
                  +--> LTA DataMall
        |
        +--> Google Maps JavaScript API / Street View
```

## V6 behaviour notes

Street View consists of real 360-degree panoramas rather than live video. Simulator movement advances through panoramas along the generated route path. Live GPS mode continuously requests the panorama nearest the real bus's GPS position.

Door controls are intentionally separated from traffic-light stops: stopping in traffic or at a red light does **not** expose the door button; it exposes/retains horn and hazard controls. Door controls are shown only when the bus is both slow/stopped and close to a bus stop belonging to the selected route.
