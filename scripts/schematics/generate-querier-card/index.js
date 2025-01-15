"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQuerierCard = generateQuerierCard;
const schematics_1 = require("@angular-devkit/schematics");
const core_1 = require("@angular-devkit/core");
function generateQuerierCard(_options) {
    return (tree, _context) => {
        const templateSource = (0, schematics_1.apply)((0, schematics_1.url)('./files'), [
            (0, schematics_1.template)(Object.assign(Object.assign({}, core_1.strings), _options)),
            (0, schematics_1.forEach)((fileEntry) => {
                if (fileEntry.path.endsWith('.template')) {
                    return {
                        content: fileEntry.content,
                        path: (0, core_1.normalize)(fileEntry.path.slice(0, -9)), // Remove .template
                    };
                }
                return fileEntry;
            }),
            (0, schematics_1.move)(`src/app/cards/${core_1.strings.dasherize(_options.name)}-card`)
        ]);
        return (0, schematics_1.chain)([
            (0, schematics_1.mergeWith)(templateSource),
            (tree) => {
                const availableCardsPath = 'src/app/cards/available-cards.ts';
                const cardName = core_1.strings.dasherize(_options.name);
                const importLine = `import './${cardName}-card/${cardName}-card.component';\n`;
                const content = tree.read(availableCardsPath);
                if (content) {
                    const strContent = content.toString();
                    const importIndex = strContent.indexOf('import { getRegisteredCards }');
                    if (importIndex !== -1) {
                        const nextLineIndex = strContent.indexOf('\n', importIndex) + 1;
                        const newContent = strContent.slice(0, nextLineIndex) +
                            '\n' + importLine +
                            strContent.slice(nextLineIndex);
                        tree.overwrite(availableCardsPath, newContent);
                    }
                }
                return tree;
            }
        ])(tree, _context);
    };
}
//# sourceMappingURL=index.js.map