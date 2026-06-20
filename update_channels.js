const fs = require('fs');
const path = require('path');

const channelsFile1 = 'd:\\Projects\\ip-tv\\vanilla\\channels.json';
const channelsFile2 = 'd:\\Projects\\iptv-vanilla\\channels.json';

const newChannelsData = [
  { name: "M6 FRANCE", id: "m6-france", url: "" },
  { name: "TSN 4", id: "tsn-4", url: "" },
  { name: "Bein English", id: "bein-english", url: "" },
  { name: "SP", id: "sp", url: "" },
  { name: "RTB GO (IOS)", id: "rtb-go-ios", url: "" },
  { name: "SP - 2", id: "sp-2", url: "" },
  { name: "TSN 1", id: "tsn-1", url: "" },
  { name: "FOX FHD", id: "fox-fhd", url: "" },
  { name: "RTE SPORT", id: "rte-sport", url: "" },
  { name: "FOX 4K", id: "fox-4k", url: "" },
  { name: "CAZETV", id: "cazetv", url: "https://dfr80qz435crc.cloudfront.net/MNOP/Amagi/Caze/Caze_TV_BR/Caze_TV.m3u8" },
  { name: "SPORTV", id: "sportv", url: "https://stm.sinalmycn.com/21000/video.m3u8?token=EkP2qSi13ckjQRLSIDoxI5rMZsF5rZyEYzqWjxD248ScEUPYQ0" },
  { name: "TUDN", id: "tudn", url: "" },
  { name: "ČT sport", id: "ct-sport", url: "http://88.212.15.19/live/test_ctsport_25p/playlist.m3u8" },
  { name: "TSN4 (CANADA)", id: "tsn4-canada", url: "" },
  { name: "TSN 1 (CANADA)", id: "tsn-1-canada", url: "" },
  { name: "TSN3 (CANADA)", id: "tsn3-canada", url: "" },
  { name: "FUSSBALL (Germany)", id: "fussball-germany", url: "" },
  { name: "FUSSBALL 4K", id: "fussball-4k", url: "" },
  { name: "JOJ SPORT", id: "joj-sport", url: "" },
  { name: "TVP SPORT", id: "tvp-sport", url: "https://estreams.tv.nej.cz/dash/CH_TVP_SPORT_Portable.ism/playlist.mpd" }
];

function updateChannels(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }
    
    let rawdata = fs.readFileSync(filePath);
    let channels = JSON.parse(rawdata);
    
    let lastNumber = channels.reduce((max, channel) => Math.max(max, channel.number || 0), 0);
    
    newChannelsData.forEach(item => {
        // check if already exists by name
        if (!channels.find(c => c.name === item.name)) {
            lastNumber++;
            channels.push({
                id: item.id,
                name: item.name,
                number: lastNumber,
                category: "Sports",
                country: "International",
                quality: "HD",
                logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name.substring(0,2))}&background=1a1a2e&color=e94560&size=200&bold=true`,
                streams: [
                    {
                        name: "Server 1",
                        url: item.url || "https://example.com/stream.m3u8"
                    }
                ],
                isLive: true,
                badge: "SPORTS",
                isWorking: item.url ? true : false
            });
        }
    });
    
    fs.writeFileSync(filePath, JSON.stringify(channels, null, 2));
    console.log(`Updated ${filePath}`);
}

updateChannels(channelsFile1);
updateChannels(channelsFile2);
