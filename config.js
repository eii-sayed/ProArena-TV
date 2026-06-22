const APP_CONFIG = {
    // 📺 DYNAMIC PLAYLIST URL
    // If you want the app to automatically load an external M3U playlist 
    // every time it starts, paste the URL below between the quotes.
    // Example: "https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8"
    // Leave it empty ("") to only use the local channels.json
    
    EXTERNAL_PLAYLIST_URL: "",
    
    // 📅 DEFAULT EPG (TV GUIDE) URL
    // The app will automatically load this XMLTV guide in the background.
    // Example: "https://iptv-org.github.io/epg/guides/us/tvguide.com.epg.xml"
    DEFAULT_EPG_URL: "https://iptv-org.github.io/epg/guides/us/tvguide.com.epg.xml",
    
    // 🚀 XTREAM CODES ACCOUNTS
    // Add any Xtream server credentials here and they will be fetched automatically.
    // Example: { server: "http://example.com:8080", user: "myUser", pass: "myPass" }
    XTREAM_ACCOUNTS: [
        { server: "http://81637.org:2052", user: "ElectricChris", pass: "021223" },
        { server: "http://iptv.kilas7.com:80", user: "kaukia", pass: "asdfrewq" },
        { server: "http://vipapyenhmw.top:8080", user: "brejna", pass: "6yGNnFuahuTG" },
        { server: "http://93.93.113.95:25461", user: "TV-Berati", pass: "XtreamCodes" },
        { server: "http://ogietv.biz.id:80", user: "aqin", pass: "aqin168" }
    ]
};
