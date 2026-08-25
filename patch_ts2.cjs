const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

content = content.replace(
  "mergedMap.set(w.posterId, { ...(mergedMap.get(w.posterId) || {}), ...w } as Poster);",
  "mergedMap.set(w.posterId, { ...(mergedMap.get(w.posterId) || ({} as any)), ...(w as any) } as Poster);"
);

fs.writeFileSync('src/components/AdminPanel.tsx', content);
