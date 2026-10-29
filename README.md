# CalcSlider - Two-Number Calculator with History Slider & Batch Addition

A modern, responsive web application where you can input two numbers, select an operation, save results into an interactive history slider, and add all saved results together into a final aggregate sum.

---

## 🌐 How to Share on the Network

### Option 1: On Your Local Network (Wi-Fi / LAN)
Anyone on your home or office Wi-Fi (phones, tablets, laptops) can access it immediately:
1. Double-click [start-server.bat](file:///g:/New%20folder%20(8)/start-server.bat) (or run `node server.js` in terminal).
2. Open this address on any device connected to the same Wi-Fi:
   ```
   http://192.168.1.7:3000
   ```
   *(Or `http://localhost:3000` on your own PC)*

---

### Option 2: Share Publicly to the Entire World (Global Internet Link)
To let anyone anywhere in the world open it without being on your Wi-Fi:
1. Keep the server running (`start-server.bat`).
2. Double-click [share-publicly.bat](file:///g:/New%20folder%20(8)/share-publicly.bat) (or run `npx localtunnel --port 3000`).
3. It will give you a public URL (like `https://calm-badger-22.loca.lt`) that you can send to anyone!

---

### Option 3: Free 24/7 Permanent Cloud Hosting
Because this app is pure HTML, CSS, and JavaScript, you can host it 100% free forever:
- **Netlify Drop**: Simply drag and drop this entire folder onto [app.netlify.com/drop](https://app.netlify.com/drop) to get a free live URL in 5 seconds.
- **GitHub Pages**: Push this folder to a GitHub repository and enable GitHub Pages in Settings.

---

## ✨ Features

- **2-Number Inputs**: Supports integers, decimals, negatives, quick clear (`×`), and swap (`⇄`).
- **Operation Selector**: `+`, `−`, `×`, `÷`, `%`, and `^`.
- **History Slider**: Interactive carousel with timeline scrubber, sequence cards, reuse buttons, and `localStorage` persistence.
- **Batch Addition (`Σ`)**: One-click sum of all history results with full calculation breakdown and summary statistics (Count, Average, Min, Max).
- **Themes**: Modern dark and light mode toggle.
