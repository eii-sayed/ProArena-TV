# ProArena TV

ProArena TV is a premium, lightweight, and highly-responsive IPTV streaming web application built entirely with **Vanilla JavaScript, HTML, and CSS**. It offers a sleek and modern user interface to browse, filter, and play live TV channels via m3u8 streams.

## 🚀 Features

- **Zero Dependencies:** Built entirely with native web technologies. No heavy frameworks required.
- **HLS Streaming Support:** Uses `hls.js` for robust playback of HTTP Live Streaming (HLS) formats, with automatic native fallback for browsers like Safari.
- **Modern UI/UX:** Features a beautiful, responsive dark mode design with glassmorphism effects, micro-animations, theme customization, and SVG icons.
- **Dynamic M3U Playlists:** Paste any external M3U link into `config.js` and the app will automatically fetch and load it alongside your local channels seamlessly.
- **Native CORS Bypass:** Importing GitHub M3U UI links (like `github.com/..`) are automatically rewritten to raw links (`raw.githubusercontent.com/..`) to bypass CORS naturally without browser extensions. A fallback CORS proxy is also built-in.
- **Local File Import:** Upload local `.m3u` or `.m3u8` playlist files directly via the UI.
- **Electronic Program Guide (EPG):** Load XMLTV EPG data to see full channel schedules and "Now Playing / Next Playing" information natively on the player.
- **Channel Categorization & Search:** Filter channels by categories or search instantly. Includes a quick `/` keyboard shortcut for searching.
- **Keyboard & Remote Support:** Zap up/down using arrows, tune directly to a channel by pressing numbers (`0-9`), and toggle fullscreen with `F`.
- **Favorites System:** Users can save their favorite channels locally. Favorites persist across sessions using `localStorage`.
- **Online Only Filter & Health Checks:** Instantly filter out channels that are marked as offline or broken. The player dynamically checks stream health.
- **Picture-in-Picture & Captions:** Support for floating PiP video and native/HLS subtitle tracks.

## 🛠️ Technology Stack

- **Frontend Core:** HTML5, CSS3 (Vanilla), JavaScript (ES6+)
- **Streaming:** [hls.js](https://github.com/video-dev/hls.js/)
- **Data Source:** JSON (`channels.json`) and standard M3U/M3U8 playlists.

## 📺 Usage

### Running Locally

Since the application relies on fetching local files (`channels.json` and `config.js`), it must be run via a local web server or deployed online (like Cloudflare Pages).

1. Clone the repository:
   ```bash
   git clone https://github.com/eii-sayed/ProArena-TV.git
   cd ProArena-TV
   ```
2. Start a local server:
   ```bash
   # Using Node.js (http-server)
   npx http-server -p 8080

   # Using Python 3
   python -m http.server 8080
   ```
3. Open your browser and navigate to `http://localhost:8080`.

### In-App Playlist Importer (UI)

You don't need to touch any code to add new channels. Simply use the buttons in the top-right header of the web app:
- **Import from URL:** Click the Link icon to paste any `.m3u` or `.m3u8` URL (e.g. from GitHub). The app naturally bypasses CORS.
- **Import from File:** Click the File Upload icon to select a local `.m3u` or `.m3u8` playlist from your computer/device.

These imported channels are temporarily injected directly into your viewing session.

### Loading Dynamic External Playlists (Config)

You no longer need to edit the source code to load an external M3U list. Simply open the `config.js` file located in the root folder:

```javascript
const APP_CONFIG = {
    // Paste your M3U playlist URL between the quotes
    EXTERNAL_PLAYLIST_URL: "https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8"
};
```
Every time the app loads, it will fetch the channels from this URL and display them dynamically.

### Adding Channels Manually

Channel data is also loaded locally from `channels.json`. To add or modify persistent channels, update the array with the following object structure:

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

This project is a video player interface. It does not host, provide, or distribute any video streams or copyrighted material. The `channels.json` and playlist inputs are meant to be populated by the user with their own legally obtained m3u8 links.

## 📄 License

This project is open-source and available under the MIT License.
