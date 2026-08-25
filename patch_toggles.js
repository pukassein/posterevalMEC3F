import fs from 'fs';
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf-8');

code = code.replace(
`    setLocalAssignments({ ...localAssignments, [selectedEvaluator]: updated });
  };`,
`    const newAssignments = { ...localAssignments, [selectedEvaluator]: updated };
    setLocalAssignments(newAssignments);
    onSaveAssignments(newAssignments);
  };`);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
