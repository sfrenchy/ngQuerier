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
      updateAvailableCards
    ]);
  };
} 