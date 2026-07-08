const fs = require('fs');
const path = require('path');

function stripBOMAndSave(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            stripBOMAndSave(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath); // Read as Buffer
            if (content.length >= 3 && content[0] === 0xEF && content[1] === 0xBB && content[2] === 0xBF) {
                console.log('Stripped BOM from:', fullPath);
                fs.writeFileSync(fullPath, content.slice(3));
            }
        }
    }
}

stripBOMAndSave('c:\\Users\\servi\\camisashop-frontend\\src');
console.log('BOM cleanup finished!');
