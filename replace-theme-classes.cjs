const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'client/src');

const replacements = [
  { regex: /\btext-ink-900\b/g, replacement: 'text-foreground' },
  { regex: /\btext-ink-600\b/g, replacement: 'text-muted-foreground' },
  { regex: /\btext-ink-400\b/g, replacement: 'text-muted-foreground' },
  { regex: /\btext-ink-200\b/g, replacement: 'text-muted-foreground\/50' },
  { regex: /\bbg-cream-50\b/g, replacement: 'bg-muted' },
  { regex: /\bbg-cream-100\b/g, replacement: 'bg-muted' },
  { regex: /\bbg-cream-150\b/g, replacement: 'bg-muted\/50' },
  { regex: /\bbg-cream-200\b/g, replacement: 'bg-muted' },
  { regex: /\bbg-cream-300\b/g, replacement: 'bg-muted' },
  { regex: /\bborder-cream-400\b/g, replacement: 'border-border' },
  { regex: /\bborder-cream-300\b/g, replacement: 'border-border' },
  // specific patterns like /50
  { regex: /\bbg-cream-50\/50\b/g, replacement: 'bg-muted\/50' },
  { regex: /\bbg-cream-100\/50\b/g, replacement: 'bg-muted\/50' },
];

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;

      replacements.forEach(({ regex, replacement }) => {
        content = content.replace(regex, replacement);
      });

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath.replace(__dirname, '')}`);
      }
    }
  });
}

processDirectory(directoryPath);
console.log('Done replacing hardcoded classes.');
