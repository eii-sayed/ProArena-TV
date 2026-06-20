const fs = require('fs');

const m3uFile = 'd:\\Projects\\iptv-vanilla\\AllChannels.m3u';
const channelsFile1 = 'd:\\Projects\\ip-tv\\vanilla\\channels.json';
const channelsFile2 = 'd:\\Projects\\iptv-vanilla\\channels.json';

// Sports keywords to identify sports channels
const sportsKeywords = [
  'sport', 'espn', 'bein', 'fifa', 'cricket', 'football', 'soccer', 
  'tennis', 'dazn', 'wwe', 'ufc', 'nba', 'nfl', 'mlb', 'nhl', 
  'star sports', 'sony ten', 'willow', 'fox sport', 'super sport', 'arena sport',
  'sky sport', 'bt sport', 'euro sport', 'tsn', 'tnt sport', 'golf'
];

function isSportsChannel(name) {
  const lowerName = name.toLowerCase();
  return sportsKeywords.some(kw => lowerName.includes(kw));
}

function processChannels() {
  if (!fs.existsSync(m3uFile)) {
    console.error('AllChannels.m3u not found');
    return;
  }
  
  const m3uContent = fs.readFileSync(m3uFile, 'utf8').split(/\r?\n/);
  const newSportsChannels = [];
  
  for (let i = 0; i < m3uContent.length; i++) {
    const line = m3uContent[i].trim();
    if (line.startsWith('#EXTINF:')) {
      // Extract channel name after the comma
      const commaIdx = line.indexOf(',');
      if (commaIdx !== -1) {
        let name = line.substring(commaIdx + 1).trim();
        let url = '';
        
        // Find the URL (usually the next non-empty line that isn't a comment)
        for (let j = i + 1; j < m3uContent.length; j++) {
          const nextLine = m3uContent[j].trim();
          if (nextLine && !nextLine.startsWith('#')) {
            url = nextLine;
            break;
          }
        }
        
        if (url && isSportsChannel(name)) {
          newSportsChannels.push({ name, url });
        }
      }
    }
  }
  
  console.log(`Found ${newSportsChannels.length} sports channels in M3U.`);
  
  // Append to JSON files
  [channelsFile1, channelsFile2].forEach(filePath => {
    if (fs.existsSync(filePath)) {
      let channels = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      let lastNumber = channels.reduce((max, c) => Math.max(max, c.number || 0), 0);
      let added = 0;
      
      newSportsChannels.forEach(sc => {
        // Avoid duplicates
        if (!channels.some(c => c.name === sc.name || c.streams[0].url === sc.url)) {
          lastNumber++;
          channels.push({
            id: sc.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            name: sc.name,
            number: lastNumber,
            category: "Sports",
            country: "International",
            quality: sc.name.toLowerCase().includes('1080') || sc.name.toLowerCase().includes('hd') ? "HD" : "SD",
            logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(sc.name.substring(0,2))}&background=1a1a2e&color=e94560&size=200&bold=true`,
            streams: [
              {
                name: "Server 1",
                url: sc.url
              }
            ],
            isLive: true,
            badge: "SPORTS",
            isWorking: true
          });
          added++;
        }
      });
      
      fs.writeFileSync(filePath, JSON.stringify(channels, null, 2));
      console.log(`Added ${added} new sports channels to ${filePath}`);
    }
  });
}

processChannels();
