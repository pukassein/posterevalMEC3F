const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

let startFound = content.indexOf('if (printEvaluators) {');

if (startFound === -1) {
  console.log('Could not find printViewStart');
  process.exit(1);
}

// Find the closing brace of the if block
let depth = 0;
let printViewEnd = -1;
for (let i = startFound; i < content.length; i++) {
  if (content[i] === '{') depth++;
  if (content[i] === '}') {
    depth--;
    if (depth === 0) {
      printViewEnd = i;
      break;
    }
  }
}

if (printViewEnd === -1) {
  console.log('Could not find printViewEnd');
  process.exit(1);
}

const printViewCode = content.substring(startFound, printViewEnd + 1);
content = content.substring(0, startFound) + content.substring(printViewEnd + 1);

// Now find the main return (
const mainReturn = content.lastIndexOf('  return (\n    <div className="min-h-screen');
if (mainReturn === -1) {
    console.log('Could not find main return');
    process.exit(1);
}

content = content.substring(0, mainReturn) + printViewCode + '\n\n' + content.substring(mainReturn);

fs.writeFileSync('src/components/AdminPanel.tsx', content);
