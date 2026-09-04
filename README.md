# Bus Captain SG V4 — AR + Street View Edition

A browser-based Singapore bus driving simulator with a fixed right-hand-drive cockpit and three windscreen modes.

## Windscreen modes

1. **Singapore Street View** — Google Maps JavaScript API `StreetViewPanorama` is displayed behind the cockpit. The demo advances along a Marina Centre training corridor as the virtual bus moves. Steering changes the panorama heading.
2. **AR live camera** — uses the device rear camera (`getUserMedia`) as the windscreen. The cockpit, next-stop chip and route arrow remain over the live view. Intended for ride-along use while a child is safely seated, not for operating a real vehicle.
3. **Offline training road** — the original generated road scene, with no API key or internet requirement.

## Hosting

Upload all files in this folder to the existing GitHub repository / Cloudflare Pages project. `index.html` must remain at the project root.

Camera mode requires HTTPS (GitHub Pages and Cloudflare Pages both provide HTTPS).

## Google Street View setup

Street View needs a Google Maps JavaScript API browser key with Street View / Maps JavaScript API enabled. The setup screen accepts a key for the current page session and does not save the field.

For a school deployment, create a dedicated browser key and restrict it by **HTTP referrer** to the exact school game domain. Do not use an unrestricted key. Google Maps Platform billing/usage terms apply.

Optional alternative: define the key before `game.js` loads:

```html
<script>
window.BUS_CAPTAIN_CONFIG = { googleMapsApiKey: "YOUR_RESTRICTED_BROWSER_KEY" };
</script>
```

A browser key is necessarily delivered to the browser; security comes from restricting the key to the permitted domain and APIs.

## Safety / privacy

- AR camera video remains in the browser and is not uploaded by this game.
- Ride-Along GPS, when enabled, remains in the browser in this prototype.
- Do not use AR mode while crossing roads or while operating any real vehicle.
- Street View imagery remains Google-hosted and must retain Google attribution/terms.

## Controls

- Drag steering wheel: up to 450 degrees each direction
- A/D or left/right arrows: steer
- W/up arrow: accelerate
- S/down arrow: brake
- Q/E: indicators
- Space: doors
- Cockpit buttons: bell, announcement, kneeling, wipers, lights

## Prototype note

The Street View route is currently a Singapore training corridor rather than a certified reproduction of a particular LTA service. A later version can load real bus-route coordinates and bus stops from official transport data.

## V5 Phone Steering Edition

This version is designed for Android phones and iPhones in landscape orientation.

- Device rotation/tilt steers the simulated bus. Hold the phone like a steering wheel and rotate left/right.
- Tap **CENTRE STEERING** to recalibrate the neutral hand position.
- Large left/right signal buttons remain on screen while driving.
- The red **STOP REQUEST** control lights a **BUS STOPPING** sign on the windscreen.
- The door control is hidden while moving. When the bus is fully stopped inside a bus-stop zone, an **OPEN DOORS** button appears automatically. It changes to **CLOSE DOORS** when opened.
- Large BRAKE and ACCEL controls remain at the bottom corners.
- iOS asks for Motion & Orientation access after Start Journey is tapped.
- Camera, geolocation and device-motion features require HTTPS when deployed. GitHub Pages and Cloudflare Pages provide HTTPS.

For best play, add the site to the phone home screen and use landscape orientation.
