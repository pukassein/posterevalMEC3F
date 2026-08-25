const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// The broken function left pieces behind. Let's find exactly what to remove.
// I will just use regex to remove the broken pieces.
code = code.replace(/  const renderWorkCardWithAssign = \(work: Poster\) => \{[\s\S]*?  \};\n/g, "");

// And remove any trailing bits of it
code = code.replace(/    \/\/ Determine card color based on tematica[\s\S]*?  \};\n/g, "");

// Wait, the easiest way is to restore AdminPanel from git? We don't have git.
