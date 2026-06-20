const fs = require('fs');

const channelsFile1 = 'd:\\Projects\\ip-tv\\vanilla\\channels.json';
const channelsFile2 = 'd:\\Projects\\iptv-vanilla\\channels.json';

const newlyAddedNames = [
  "M6 FRANCE", "TSN 4", "Bein English", "SP", "RTB GO (IOS)", "SP - 2", 
  "TSN 1", "FOX FHD", "RTE SPORT", "FOX 4K", "CAZETV", "SPORTV", "TUDN", 
  "ČT sport", "TSN4 (CANADA)", "TSN 1 (CANADA)", "TSN3 (CANADA)", 
  "FUSSBALL (Germany)", "FUSSBALL 4K", "JOJ SPORT", "TVP SPORT"
];

function reorderChannels(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }
    
    let rawdata = fs.readFileSync(filePath);
    let channels = JSON.parse(rawdata);
    
    // Separate the newly added channels from the rest
    let newChannels = [];
    let oldChannels = [];
    
    channels.forEach(channel => {
        if (newlyAddedNames.includes(channel.name)) {
            newChannels.push(channel);
        } else {
            oldChannels.push(channel);
        }
    });
    
    // Combine them, putting the new channels first
    let combinedChannels = [...newChannels, ...oldChannels];
    
    // Update the 'number' property to be sequential starting from 1
    combinedChannels.forEach((channel, index) => {
        channel.number = index + 1;
    });
    
    fs.writeFileSync(filePath, JSON.stringify(combinedChannels, null, 2));
    console.log(`Reordered channels in ${filePath}`);
}

reorderChannels(channelsFile1);
reorderChannels(channelsFile2);
