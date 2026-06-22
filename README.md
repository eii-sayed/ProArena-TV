# ProArena TV

ProArena TV is a premium, lightweight, and highly-responsive IPTV streaming web application built entirely with **Vanilla JavaScript, HTML, and CSS**. It offers a sleek, modern, and high-performance user interface to browse, filter, and stream live TV channels via HLS (`.m3u8` / `.ts`) formats.

## 🚀 Features

- **Zero Dependencies Core:** Built with native, framework-less web technologies for lightning-fast loads.
- **HLS & TS Streaming Support:** Seamless integration with `hls.js` for stable Live TV stream playback, including automatic native HLS fallback for mobile devices and Safari.
- **Xtream Codes API Support:** 
  - **Auto-Sync Config:** Add credentials in `config.js` to automatically load accounts at start.
  - **In-App Login:** Quick-access Login modal in the header to connect with any Xtream Codes server (Server, Username, Password) dynamically.
- **CORS Bypass & Proxy Architecture:**
  - Automated rewriting of GitHub blob links to raw raw.githubusercontent links.
  - Transparent, high-performance CORS proxying via `corsproxy.org` to bypass Cloudflare protection and fetch third-party playlists securely.
- **DOM Virtualization:** Powered by `Clusterize.js` to render tens of thousands of channels smoothly without lagging the browser.
- **Electronic Program Guide (EPG):** Supports XMLTV guides to show full schedule times and "Now Playing / Next Playing" info directly inside the video player HUD.
- **Remote / Keyboard Control:** Quick keyboard shortcuts including `/` for search focus, `Arrow Up/Down` for channel zapping, direct number tuning (`0-9`), and `F` to toggle fullscreen.
- **Favorites & Recents System:** Persistent storage for user bookmarks and view histories utilizing `localStorage`.
- **Stream Health Checker:** Integrated status pinging to verify if stream endpoints are active and online, with an "Online Only" filter switch.
- **Picture-in-Picture & Captions:** Support for floating PiP windows and embedded subtitles.

## 🛠️ Technology Stack

- **Frontend Core:** HTML5, CSS3 (Vanilla), JavaScript (ES6+)
- **DOM Virtualization:** [Clusterize.js](https://github.com/NeXTs/Clusterize.js)
- **HLS Streaming Engine:** [hls.js](https://github.com/video-dev/hls.js/)
- **Data Stores:** Local `channels.json` database and standard M3U/M3U8 playlists.

## 📺 Usage

### Running Locally

Since the application relies on fetching local files (`channels.json` and `config.js`), it must be run via a local web server:

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

Add playlists and streams instantly using the top-right header tools:
- **Import from URL:** Paste any `.m3u` or `.m3u8` link. The app automatically proxies requests to avoid CORS blockages.
- **Import from File:** Upload local `.m3u` or `.m3u8` playlist files directly.
- **Xtream Codes Login:** Click the login button in the header, enter your Xtream Codes credentials, and stream your subscription instantly.

### Loading Dynamic External Playlists & Xtream Accounts (Config)

Configure the app to auto-load your playlists and accounts on startup by editing `config.js`:

```javascript
const APP_CONFIG = {
    // 📺 DYNAMIC PLAYLIST URL
    EXTERNAL_PLAYLIST_URL: "https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8",
    
    // 📅 DEFAULT EPG (TV GUIDE) URL
    DEFAULT_EPG_URL: "https://iptv-org.github.io/epg/guides/us/tvguide.com.epg.xml",
    
    // 🚀 XTREAM CODES ACCOUNTS
    XTREAM_ACCOUNTS: [
        { server: "http://example-server.com:8080", user: "yourUsername", pass: "yourPassword" }
    ]
};
```

### Adding Persistent Channels Manually

To add channels to the built-in database, add them to `channels.json` using the following schema:

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

This project is a video player interface. It does not host, provide, or distribute any video streams or copyrighted material. Users are expected to populate the playlist inputs and configurations with their own legally obtained streams.

## 📄 License

This project is open-source and available under the MIT License.
