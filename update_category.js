const fs = require('fs');

const channelsFile1 = 'd:\\Projects\\ip-tv\\vanilla\\channels.json';
const channelsFile2 = 'd:\\Projects\\iptv-vanilla\\channels.json';

function updateTSportsCategory(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }
    
    let rawdata = fs.readFileSync(filePath);
    let channels = JSON.parse(rawdata);
    let updatedCount = 0;
    
    channels.forEach(channel => {
        const name = channel.name.toLowerCase().replace(/\s+/g, '');
        // Match things like 'tsports', 't sports', 't-sports'
        if (name.includes('tsports') || name.includes('t-sports')) {
            channel.category = "FIFA WC 2026";
            channel.badge = "🏆 LIVE";
            updatedCount++;
        }
    });
    
    fs.writeFileSync(filePath, JSON.stringify(channels, null, 2));
    console.log(`Updated ${updatedCount} T-Sports channels in ${filePath}`);
}

updateTSportsCategory(channelsFile1);
updateTSportsCategory(channelsFile2);
