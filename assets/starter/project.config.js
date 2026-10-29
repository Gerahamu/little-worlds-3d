export default {
  "name": "little-world",
  "title": "Little World",
  "subtitle": "An ordinary place, in miniature",
  "seed": 48271,
  "terrain": {
    "width": 34,
    "depth": 28,
    "thickness": 3.4,
    "surface": "plaza",
    "relief": 0.18
  },
  "camera": {
    "position": [
      70,
      55,
      82
    ],
    "target": [
      0,
      3,
      0
    ],
    "viewHeight": 35,
    "minZoom": 0.55,
    "maxZoom": 2.6,
    "minPolarAngle": 0.32,
    "maxPolarAngle": 1.3,
    "autoRotate": true,
    "autoRotateSpeed": 0.045
  },
  "weather": {
    "preset": "clear",
    "wind": 0.25,
    "rainCount": 300
  },
  "lighting": {
    "night": true,
    "windowLitRate": 0.72,
    "bloom": 0.24,
    "exposure": 1.16,
    "dayBackground": "#c1d1d2",
    "nightBackground": "#142943"
  },
  "visual": {
    "palette": {},
    "fontFamily": "Arial, sans-serif",
    "outlineOpacity": 0.42,
    "pixelRatio": 1.6,
    "shadows": true
  },
  "people": {
    "count": 18,
    "economyCount": 10,
    "speedScale": 1
  },
  "traffic": {
    "count": 4,
    "speedScale": 1,
    "signals": true,
    "signalPlan": [
      [
        "LOOP",
        10
      ],
      [
        "LOOP_AMBER",
        2
      ],
      [
        "LOOP_CLEAR",
        1.2
      ],
      [
        "PED",
        6
      ],
      [
        "PED_CLEAR",
        1.2
      ]
    ],
    "labels": {
      "bus": "LOCAL BUS",
      "route": "01",
      "delivery": "DELIVERY"
    }
  }
};
