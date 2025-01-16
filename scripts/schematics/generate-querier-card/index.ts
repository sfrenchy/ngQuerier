import { Rule, SchematicContext, Tree, apply, url, template, move, mergeWith, chain, forEach } from '@angular-devkit/schematics';
import { strings, normalize } from '@angular-devkit/core';

export function generateQuerierCard(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const templateSource = apply(url('./files'), [
      template({
        ...strings,
        ..._options,
      }),
      forEach((fileEntry) => {
        if (fileEntry.path.endsWith('.template')) {
          return {
            content: fileEntry.content,
            path: normalize(fileEntry.path.slice(0, -9)), // Remove .template
          };
        }
        return fileEntry;
      }),
      move(`src/app/cards/${strings.dasherize(_options.name)}-card`)
    ]);

    return chain([
      mergeWith(templateSource),
      (tree: Tree) => {
        const availableCardsPath = 'src/app/cards/available-cards.ts';
        const cardName = strings.dasherize(_options.name);
        const importLine = `import '@cards/${cardName}-card/${cardName}-card.component';\n`;
        
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