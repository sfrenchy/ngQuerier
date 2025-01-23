import { Rule, SchematicContext, Tree, apply, url, template, move, mergeWith, chain, forEach } from '@angular-devkit/schematics';
import { strings, normalize } from '@angular-devkit/core';

export function generateQuerierCard(_options: any): Rule {
  return (_tree: Tree, _context: SchematicContext) => {
    const sourceTemplates = url('./files');
    const sourceParametrizedTemplates = apply(sourceTemplates, [
      template({
        ..._options,
        ...strings
      }),
      forEach((entry) => {
        if (entry.path.endsWith('.template')) {
          return {
            content: entry.content,
            path: normalize(entry.path.slice(0, -9))
          };
        }
        return entry;
      }),
      move(`src/app/cards/${strings.dasherize(_options.name)}-card`)
    ]);

    // Merge translations into global i18n files
    const mergeTranslations = () => {
      const languages = ['fr', 'en'];
      languages.forEach(lang => {
        const i18nPath = `src/assets/i18n/${lang}.json`;
        const content = _tree.read(i18nPath);
        if (content) {
          const i18nContent = JSON.parse(content.toString());
          const cardTranslationsPath = `src/app/cards/${strings.dasherize(_options.name)}-card/i18n/${lang}.json`;
          const cardTranslations = _tree.read(cardTranslationsPath);
          if (cardTranslations) {
            const cardContent = JSON.parse(cardTranslations.toString());
            // Merge translations
            const mergedContent = {
              ...i18nContent,
              CARDS: {
                ...i18nContent.CARDS,
                ...cardContent.CARDS
              }
            };
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
      const cardName = strings.dasherize(_options.name);
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

    return chain([
      mergeWith(sourceParametrizedTemplates),
      mergeTranslations,
      updateAvailableCards
    ]);
  };
} 