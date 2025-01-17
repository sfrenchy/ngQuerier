import { Rule, SchematicContext, Tree, apply, url, template, move, mergeWith, chain } from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';

export function generateQuerierCard(_options: any): Rule {
  return (_tree: Tree, _context: SchematicContext) => {
    const sourceTemplates = url('./files');
    const sourceParametrizedTemplates = apply(sourceTemplates, [
      template({
        ..._options,
        ...strings
      }),
      move(`ngQuerier/src/app/cards/${strings.dasherize(_options.name)}-card`)
    ]);

    const updateAvailableCards = () => {
      const availableCardsPath = 'ngQuerier/src/app/cards/available-cards.ts';
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
      updateAvailableCards
    ]);
  };
} 