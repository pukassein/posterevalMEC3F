const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// The function is currently embedded inside the return block!
const startRenderWork = code.indexOf("const renderWorkCardWithAssign = (work: Poster) => {");
const endRenderWork = code.indexOf("};", startRenderWork) + 2;

// Extract it
const renderWorkFunc = code.substring(startRenderWork, endRenderWork);

// Remove it from current position
code = code.substring(0, startRenderWork) + code.substring(endRenderWork);

// Inject it right before return (
const returnStart = code.indexOf("return (\n    <div className=");
code = code.substring(0, returnStart) + "\n" + renderWorkFunc + "\n  " + code.substring(returnStart);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
console.log('Fixed JSX');
