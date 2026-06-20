# ProArena TV

ProArena TV is a premium, lightweight, and responsive IPTV streaming web application built entirely with **Vanilla JavaScript, HTML, and CSS**. It offers a sleek and modern user interface to browse, filter, and play live TV channels via m3u8 streams.

## 🚀 Features

- **Zero Dependencies:** Built entirely with native web technologies. No React, Vue, or Angular required.
- **HLS Streaming Support:** Uses `hls.js` for robust playback of HTTP Live Streaming (HLS) formats, with automatic native fallback for browsers like Safari.
- **Modern UI/UX:** Features a beautiful, responsive dark mode design with glassmorphism effects, micro-animations, and SVG icons.
- **Channel Categorization & Search:** Easily filter channels by categories (Sports, News, Entertainment, etc.) or search by name. Includes a quick `/` keyboard shortcut for searching.
- **Favorites System:** Users can save their favorite channels locally. Favorites persist across sessions using `localStorage`.
- **Online Only Filter:** Instantly filter out channels that are marked as offline or broken.
- **Multi-Server Support:** Seamlessly switch between multiple stream sources (servers) for a single channel to ensure the best viewing experience.
- **FIFA WC 2026 Ready:** Special UI highlights and badges for major events like the World Cup.

## 🛠️ Technology Stack

- **Frontend Core:** HTML5, CSS3 (Vanilla), JavaScript (ES6+)
- **Streaming:** [hls.js](https://github.com/video-dev/hls.js/)
- **Data Source:** JSON (`channels.json`)

## 📺 Usage

### Running Locally

Since the application relies on fetching a local JSON file (`channels.json`) and handling CORS for streams, it must be run via a local web server.

1. Clone the repository:
   ```bash
   git clone https://github.com/eii-sayed/ProArena-TV.git
   cd ProArena-TV
   ```
2. Start a local server. You can use tools like VS Code Live Server, or Python/Node.js:
   ```bash
   # Using Node.js (http-server)
   npx http-server -p 8080

   # Using Python 3
   python -m http.server 8080
   ```
3. Open your browser and navigate to `http://localhost:8080`.

### Adding Channels

All channel data is loaded dynamically from `channels.json`. To add or modify channels, update the array with the following object structure:

```json
{
  "id": "channel-unique-id",
  "name": "Channel Name",
  "number": 1,
  "category": "Sports",
  "country": "International",
  "quality": "HD",
  "logo": "https://link-to-logo.png",
  "streams": [
    {
      "name": "Server 1",
      "url": "https://example.com/stream.m3u8"
    }
  ],
  "isLive": true,
  "badge": "SPORTS",
  "isWorking": true
}
```

## ⚠️ Disclaimer

This project is a video player interface. It does not host, provide, or distribute any video streams or copyrighted material. The `channels.json` file is meant to be populated by the user with their own legally obtained m3u8 links.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
