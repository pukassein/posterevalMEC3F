const fs = require('fs');
let code = fs.readFileSync('src/lib/dataSync.ts', 'utf8');

// Replace the hacky way of saving areas
const oldSave = `      const formattedData = data.map((d: any) => {
        let name = d.name;
        if (d.areas && d.areas.length > 0) {
          name = \`\${name}:::\${d.areas.join(',')}\`;
        }
        return { id: d.id, name, accessCode: d.accessCode };
      });`;

const newSave = `      const formattedData = data.map((d: any) => {
        // We now have the 'areas' column in DB, we can send it directly
        // Fallback to name hack only if you don't run the SQL query
        return { id: d.id, name: d.name, accessCode: d.accessCode, areas: d.areas || [] };
      });`;
code = code.replace(oldSave, newSave);

const oldLoad = `    let evaluators = results[4].data?.map((e: any) => {
      let name = e.name;
      let areas: Tematica[] = [];
      if (name.includes(':::')) {
        const parts = name.split(':::');
        name = parts[0];
        areas = parts[1].split(',') as Tematica[];
      }
      return { ...e, name, areas };
    });`;

const newLoad = `    let evaluators = results[4].data?.map((e: any) => {
      let name = e.name;
      let areas: Tematica[] = e.areas || [];
      // Backward compatibility if someone still has the hack
      if (name.includes(':::')) {
        const parts = name.split(':::');
        name = parts[0];
        if (areas.length === 0) areas = parts[1].split(',') as Tematica[];
      }
      return { ...e, name, areas };
    });`;
code = code.replace(oldLoad, newLoad);

fs.writeFileSync('src/lib/dataSync.ts', code);
console.log('dataSync updated for areas column');
