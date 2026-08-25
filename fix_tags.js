import fs from 'fs';
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

code = code.replace(
  `              </div>\n            </div>\n          </section>\n        )}\n        {/* TAB: CRITERIA */}`,
  `              </div>\n            </div>\n          </div>\n        )}\n        {/* TAB: CRITERIA */}`
);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
