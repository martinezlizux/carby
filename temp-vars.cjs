const fs = require('fs');
const path = require('path');

const jsonPath = '/Users/lizmartinez/.gemini/antigravity/brain/f849e29d-e2fc-4865-a8f2-686ee15cee82/.system_generated/steps/694/output.txt';
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const vars = data.data.variables;

function formatName(name) {
    return '--' + name.toLowerCase().replace(/\//g, '-').replace(/\s+/g, '-');
}

function resolveValue(valByMode) {
    // just taking the first mode value
    const val = Object.values(valByMode)[0];
    if (val && typeof val === 'object') {
        if (val.type === 'VARIABLE_ALIAS') {
            const aliasVar = vars.find(v => v.id === val.id);
            return aliasVar ? `var(${formatName(aliasVar.name)})` : 'ALIAS_NOT_FOUND';
        }
        if (val.r !== undefined && val.g !== undefined && val.b !== undefined) {
            const r = Math.round(val.r * 255);
            const g = Math.round(val.g * 255);
            const b = Math.round(val.b * 255);
            const a = val.a;
            if (a === 1) return `rgba(${r}, ${g}, ${b}, 1)`;
            return `rgba(${r}, ${g}, ${b}, ${a})`;
        }
    }
    if (typeof val === 'number') {
        const name = formatName('test').toLowerCase();
        // Just doing a heuristic for px if not obvious
        return val;
    }
    return val;
}

const cssVars = [];
for (const v of vars) {
    // Only keeping Primitives and Semantics ? Wait, the output includes all variables, including Typography collection
    const collection = data.data.variableCollections.find(c => c.id === v.variableCollectionId);
    if (!collection) continue;

    let valStr = resolveValue(v.valuesByMode);

    // add 'px' for specific keys like scale, radius, spacing
    const lowerName = v.name.toLowerCase();
    if (typeof Object.values(v.valuesByMode)[0] === 'number') {
        if (lowerName.includes('scale') || lowerName.includes('font-size') || lowerName.includes('spacing') || lowerName.includes('radius')) {
            valStr += 'px';
        }
    }

    cssVars.push(`${formatName(v.name)}: ${valStr};`);
}

console.log(cssVars.join('\n'));
