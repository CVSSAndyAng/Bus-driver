# Optional live-data proxy

For a production version, create server-side endpoints here and store your LTA DataMall Account Key as an environment variable (for example `LTA_ACCOUNT_KEY`). Never expose the key in browser JavaScript.

A proxy can fetch Bus Routes, Bus Stops, Bus Services and Bus Arrival data, then return only the fields needed by the game.
