import fs from 'fs';
import path from 'path';

const publicDir = new URL('../public/', import.meta.url).pathname;

function processDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      processDir(filePath);
    } else if (file.endsWith('.html')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const fixed = content.replace(/href="(?:[^"]*\/)?((mailto|tel):[^"]+)"/g, 'href="$1"');
      if (fixed !== content) {
        fs.writeFileSync(filePath, fixed, 'utf8');
        console.log('Fixed:', path.relative(publicDir, filePath));
      }
    }
  });
}

processDir(publicDir);
