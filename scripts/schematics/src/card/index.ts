import {
  Rule,
  SchematicContext,
  Tree,
  apply,
  mergeWith,
  url,
  move,
  chain,
  template,
  renameTemplateFiles
} from '@angular-devkit/schematics';
import { strings, normalize, Path } from '@angular-devkit/core';
import { Schema } from './schema';

function addCardToAvailableCards(options: Schema): Rule {
  return (tree: Tree) => {
    const availableCardsPath = '/src/app/cards/available-cards.ts';
    const content = tree.read(availableCardsPath);
    if (!content) return tree;

    const contentStr = content.toString();
    const importLine = `import '@cards/${strings.dasherize(options.name)}-card/${strings.dasherize(options.name)}-card.component';\n`;

    const lastImportIndex = contentStr.lastIndexOf('import');
    const endOfLastImport = contentStr.indexOf('\n', lastImportIndex) + 1;

    const newContent = contentStr.slice(0, endOfLastImport) +
      importLine +
      contentStr.slice(endOfLastImport);

    tree.overwrite(availableCardsPath, newContent);
    return tree;
  };
}

export default function(options: Schema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('Starting card schematic');

    const templateSource = apply(
      url('./files'),
      [
        template({
          ...strings,
          name: options.name,
          upperCase: (str: string) => str.toUpperCase()
        }),
        renameTemplateFiles(),
        move(normalize(`/src/app/cards/${strings.dasherize(options.name)}-card`))
      ]
    );

    return chain([
      mergeWith(templateSource),
      addCardToAvailableCards(options)
    ])(tree, context);
  };
}
