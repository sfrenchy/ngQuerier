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
            (0, schematics_1.forEach)((entry) => {
                if (entry.path.endsWith('.template')) {
                    return {
                        content: entry.content,
                        path: (0, core_1.normalize)(entry.path.slice(0, -9))
                    };
                }
                return entry;
            }),
            (0, schematics_1.move)(`src/app/cards/${core_1.strings.dasherize(_options.name)}-card`)
        ]);
        // Merge translations into global i18n files
        const mergeTranslations = () => {
            const languages = ['fr', 'en'];
            languages.forEach(lang => {
                const i18nPath = `src/assets/i18n/${lang}.json`;
                const content = _tree.read(i18nPath);
                if (content) {
                    const i18nContent = JSON.parse(content.toString());
                    const cardTranslationsPath = `src/app/cards/${core_1.strings.dasherize(_options.name)}-card/i18n/${lang}.json`;
                    const cardTranslations = _tree.read(cardTranslationsPath);
                    if (cardTranslations) {
                        const cardContent = JSON.parse(cardTranslations.toString());
                        // Merge translations
                        const mergedContent = Object.assign(Object.assign({}, i18nContent), { CARDS: Object.assign(Object.assign({}, i18nContent.CARDS), cardContent.CARDS) });
                        _tree.overwrite(i18nPath, JSON.stringify(mergedContent, null, 2));
                        // Delete the card's translation file as it's now merged
                        _tree.delete(cardTranslationsPath);
                    }
                }
            });
            return _tree;
        };
        const updateAvailableCards = () => {
            const availableCardsPath = 'src/app/cards/available-cards.ts';
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
            mergeTranslations,
            updateAvailableCards
        ]);
    };
}
//# sourceMappingURL=index.js.map