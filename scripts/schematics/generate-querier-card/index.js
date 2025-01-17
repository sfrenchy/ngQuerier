"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQuerierCard = generateQuerierCard;
const schematics_1 = require("@angular-devkit/schematics");
const core_1 = require("@angular-devkit/core");
function generateQuerierCard(_options) {
    return (_tree, _context) => {
        const sourceTemplates = (0, schematics_1.url)('./files');
        const sourceParametrizedTemplates = (0, schematics_1.apply)(sourceTemplates, [
            (0, schematics_1.template)(Object.assign(Object.assign({}, _options), core_1.strings)),
            (0, schematics_1.move)(`ngQuerier/src/app/cards/${core_1.strings.dasherize(_options.name)}-card`)
        ]);
        const updateAvailableCards = () => {
            const availableCardsPath = 'ngQuerier/src/app/cards/available-cards.ts';
            const cardName = core_1.strings.dasherize(_options.name);
            const importLine = `import '@cards/${cardName}-card/${cardName}-card.component';\n`;
            const content = _tree.read(availableCardsPath);
            if (content) {
                const strContent = content.toString();
                const importIndex = strContent.indexOf('import { getRegisteredCards }');
                if (importIndex !== -1) {
                    const nextLineIndex = strContent.indexOf('\n', importIndex) + 1;
                    const newContent = strContent.slice(0, nextLineIndex) +
                        importLine +
                        strContent.slice(nextLineIndex);
                    _tree.overwrite(availableCardsPath, newContent);
                }
            }
            return _tree;
        };
        return (0, schematics_1.chain)([
            (0, schematics_1.mergeWith)(sourceParametrizedTemplates),
            updateAvailableCards
        ]);
    };
}
//# sourceMappingURL=index.js.map