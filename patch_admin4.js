import fs from 'fs';
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// Remove saveEvaluatorsChanges
code = code.replace(/const saveEvaluatorsChanges = \(\) => \{[\s\S]*?^\s*\};\n/m, '');
// Remove saveAssignmentsChanges
code = code.replace(/const saveAssignmentsChanges = \(\) => \{[\s\S]*?^\s*\};\n/m, '');
// Remove saveCriteriaChanges
code = code.replace(/const saveCriteriaChanges = \(\) => \{[\s\S]*?^\s*\};\n/m, '');
// Remove saveWorksChanges
code = code.replace(/const saveWorksChanges = \(\) => \{[\s\S]*?^\s*\};\n/m, '');

// Remove the Works button
code = code.replace(/\{savedWorksMsg && <span[^>]*>Salvo com sucesso!<\/span>\}\s*<button\s*onClick=\{saveWorksChanges\}[^>]*>\s*<Save[^>]*\/>\s*Salvar Alterações\s*<\/button>/g, '');
code = code.replace(/<div className="flex items-center gap-3 shrink-0 w-full sm:w-auto mt-4 sm:mt-0">\s*<\/div>/g, '');

// Remove the Criteria button
code = code.replace(/\{savedCriteriaMsg && <span[^>]*>Salvo com sucesso!<\/span>\}\s*<button\s*onClick=\{saveCriteriaChanges\}[^>]*>\s*<Save[^>]*\/>\s*Salvar Alterações\s*<\/button>/g, '');

// Remove Evaluators button
code = code.replace(/\{savedEvaluatorsMsg && <span[^>]*>Salvo com sucesso!<\/span>\}\s*<button\s*onClick=\{saveEvaluatorsChanges\}[^>]*>\s*<Save[^>]*\/>\s*Salvar Avaliadores\s*<\/button>/g, '');

// Remove Assignments button
code = code.replace(/\{savedAssignmentsMsg && <span[^>]*>Salvo com sucesso!<\/span>\}\s*<button\s*onClick=\{saveAssignmentsChanges\}[^>]*>\s*<Save[^>]*\/>\s*Salvar Atribuições\s*<\/button>/g, '');

// Remove the div wrapper for Criteria/Evaluators/Assignments buttons if they are empty
code = code.replace(/<div className="flex items-center gap-3">\s*<\/div>/g, '');
code = code.replace(/<div className="flex items-center gap-3 w-full md:w-auto">\s*<\/div>/g, '');
code = code.replace(/<div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">\s*<\/div>/g, '');

fs.writeFileSync('src/components/AdminPanel.tsx', code);
