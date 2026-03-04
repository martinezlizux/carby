const fs = require('fs');
const data = JSON.parse(fs.readFileSync('/Users/lizmartinez/.gemini/antigravity/brain/a4f5e5f3-8537-4a1e-84d6-b8254d15a5cf/.system_generated/steps/391/output.txt', 'utf8'));
const vars = data.data.variables;

const cssVars = [];

vars.forEach(v => {
  if (v.resolvedType === 'COLOR') {
    const val = v.valuesByMode["2:4"];
    if (val && val.r !== undefined) {
      cssVars.push(`  --${v.name.replace(/[/\s]/g, '-').toLowerCase()}: rgba(${Math.round(val.r * 255)}, ${Math.round(val.g * 255)}, ${Math.round(val.b * 255)}, ${val.a});`);
    } else if (v.valuesByMode["2:5"] && v.valuesByMode["2:5"].type === "VARIABLE_ALIAS") {
      const aliasId = v.valuesByMode["2:5"].id;
      const aliasVar = vars.find(x => x.id === aliasId);
      if (aliasVar) {
        cssVars.push(`  --${v.name.replace(/[/\s]/g, '-').toLowerCase()}: var(--${aliasVar.name.replace(/[/\s]/g, '-').toLowerCase()});`);
      }
    }
  } else if (v.resolvedType === 'FLOAT') {
    let val = v.valuesByMode["2:4"];
    if (val !== undefined) {
      if (v.name.includes("Typography")) {
        if (v.name.includes("Weight") || v.name.includes("weight")) {
          cssVars.push(`  --${v.name.replace(/[/\s]/g, '-').toLowerCase()}: ${val};`);
        } else {
          cssVars.push(`  --${v.name.replace(/[/\s]/g, '-').toLowerCase()}: ${val}px;`);
        }
      } else if (v.name.includes("Spacing")) {
        cssVars.push(`  --${v.name.replace(/[/\s]/g, '-').toLowerCase()}: ${val}px;`);
      } else if (v.name.includes("Radius")) {
        cssVars.push(`  --${v.name.replace(/[/\s]/g, '-').toLowerCase()}: ${val}px;`);
      }
    } else if (v.valuesByMode["2:5"] && v.valuesByMode["2:5"].type === "VARIABLE_ALIAS") {
      const aliasId = v.valuesByMode["2:5"].id;
      const aliasVar = vars.find(x => x.id === aliasId);
      if (aliasVar) {
        cssVars.push(`  --${v.name.replace(/[/\s]/g, '-').toLowerCase()}: var(--${aliasVar.name.replace(/[/\s]/g, '-').toLowerCase()});`);
      }
    }
  } else if (v.resolvedType === 'STRING') {
    let val = v.valuesByMode["2:4"];
    if (val !== undefined) {
      cssVars.push(`  --${v.name.replace(/[/\s]/g, '-').toLowerCase()}: '${val}';`);
    } else if (v.valuesByMode["2:5"] && v.valuesByMode["2:5"].type === "VARIABLE_ALIAS") {
      const aliasId = v.valuesByMode["2:5"].id;
      const aliasVar = vars.find(x => x.id === aliasId);
      if (aliasVar) {
        cssVars.push(`  --${v.name.replace(/[/\s]/g, '-').toLowerCase()}: var(--${aliasVar.name.replace(/[/\s]/g, '-').toLowerCase()});`);
      }
    }
  }
});

let output = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');\n\n:root {\n${cssVars.join('\n')}\n}\n`;

output += `
body {
  font-family: var(--typography-family-body, 'Inter'), sans-serif;
  background-color: var(--surface-neutral-bg-light, #f1f0f2);
  color: var(--color-neutral-900, #16151a);
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
* {
  box-sizing: border-box;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--typography-family-heading, 'Outfit'), sans-serif;
  margin: 0;
  font-weight: var(--typography-weight-bold, 700);
}

#root {
  width: 100%;
  max-width: 430px;
  height: 100vh;
  margin: 0 auto;
  position: relative;
  background: white;
  overflow-x: hidden;
  box-shadow: 0 0 20px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
}
`;

fs.writeFileSync('src/index.css', output);
console.log('src/index.css generated.');
