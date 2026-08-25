const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

content = content.replace(
  "mergedMap.set(w.posterId, { ...mergedMap.get(w.posterId), ...w });",
  "mergedMap.set(w.posterId, { ...(mergedMap.get(w.posterId) || {}), ...w } as Poster);"
);

content = content.replace(
  "const updatedWorks = Array.from(mergedMap.values());",
  "const updatedWorks = Array.from(mergedMap.values()) as Poster[];"
);

fs.writeFileSync('src/components/AdminPanel.tsx', content);
