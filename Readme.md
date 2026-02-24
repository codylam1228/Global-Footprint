# 🌍 My Global Footprint (Google Timeline → KML → GitHub Pages)

This repository is a tutorial for visualizing your “footprint on EARTH” using **Google Maps Timeline** data, then converting it into **KML** for editing in **Google Earth**, and finally publishing it on **GitHub Pages**/**Google Earth**.

---

## ✅ Prerequisites
- A smartphone with **Google Maps Timeline** enabled.
- A **Google account** (for Google Earth projects and Timeline export).
- A computer browser (Chrome recommended) to use:
  - [**Google Earth Web**](https://earth.google.com/web/)
  - [**GPS Visualizer (Google Earth KML form)**](https://www.gpsvisualizer.com/map_input?form=googleearth)
- A **github account** (for map display)
- **Google Earth Pro** application (for map display)
---

## 📑 Table of Contents
1. [Export Timeline JSON from your phone](#1-export-timeline-json-from-your-phone)
2. [Convert JSON to KML (no-code)](#2-convert-json-to-kml-no-code)
3. [Edit points/lines in Google Earth](#3-edit-pointslines-in-google-earth)
4. [Publish on GitHub Pages](#4-publish-on-github-pages)
5. [Troubleshooting](#troubleshooting)

---

## 1. Export Timeline JSON from your phone

Google Maps can export your Timeline data as a JSON file (on-device export).

### Android
1. Open **Device Settings**
2. Go to **Location** → **Location Services** → **Timeline**
3. Tap **Export Timeline data**
4. Copy the exported file to your computer, and rename it to:
   - `location-history.json`

### iOS (iPhone / iPad)
1. Open **Google Maps**
2. Tap your **Profile icon**
3. Go to **Settings** (or **Personal content / Location & privacy**, depending on version)
4. Tap **Export Timeline data**
5. Save the JSON file to **Files**, then transfer it to your computer as:
   - `location-history.json`

---

## 2. Convert JSON to KML (no-code)

We will convert `location-history.json` into a Google Earth-compatible **KML** file using GPS Visualizer.  
GPS Visualizer can generate KML files for Google Earth from uploaded GPS-like data sources [web:20].

1. Open: https://www.gpsvisualizer.com/map_input?form=googleearth
2. Under **General map parameters**
   - Set **Output file type** = `KML`
3. Under **Waypoint options**
   - Set **Waypoint labels** = `Labels on waypoints + tickmarks + trackpoints`
4. Upload `location-history.json`
5. Click **Create KML file**
6. Download the result and name it:
   - `output.kml`

---

## 3. Edit points/lines in Google Earth

The exported data may contain:
- Unwanted points (e.g., noise, wrong GPS jumps)
- Missing line segments between points

Use Google Earth Web to clean it up:

1. Open: https://earth.google.com/web/ (sign in)
2. Create a new project or open an existing one
3. Import your KML:
   - **File** → **Import file to project** (or import into an existing project) [web:25]
4. Review your map:
   - Delete unwanted points/paths
   - Add missing lines if needed (draw a new path)
5. When you are satisfied, export/download the cleaned KML from your project (or keep it in Drive and re-export when needed)

---

## 4. Publish on GitHub Pages

Use this template repo to render KML on a web map:
👉 https://github.com/codylam1228/KML_MAP

Typical workflow:
1. Put your finalized `output.kml` into the web folder (follow the template repo structure)
2. Update the app.js > kmlFiles field with your file name 
3. Enable **GitHub Pages** in repo settings
4. Open the GitHub Pages URL and verify the map loads

---

## Troubleshooting

### GPS Visualizer output looks too heavy / browser lag
- Try converting smaller time ranges (export less data if possible), or remove noisy points in Google Earth first.
- Large datasets can make browsers slow; Google Earth generally handles KML better than browser-based renderers [web:18].

### Lines are missing between points
- This can happen with inconsistent sampling.
- In Google Earth, manually draw the missing path segments and save them in the same project.

### Data contains private places
- Remove sensitive points before publishing.
- Consider publishing a “sanitized” KML (e.g., only trips, no home/work clusters).

---

## License / Disclaimer
This project is for personal visualization and educational use.  
You are responsible for reviewing and removing private/sensitive location data before publishing.
