import {
  Rule,
  SchematicContext,
  Tree,
  apply,
  mergeWith,
  template,
  url,
  move,
  chain,
  forEach,
  FileEntry
} from '@angular-devkit/schematics';
import { strings, normalize } from '@angular-devkit/core';
import { Schema } from './schema';
import { files } from './files';

export function card(_options: Schema): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    console.log('Available templates:', files);

    const sourceTemplates = url('./files');
    console.log('Source templates:', sourceTemplates);

    const sourceParametrizedTemplates = apply(sourceTemplates, [
      template({
        ..._options,
        ...strings,
      }),
      forEach((entry: FileEntry) => {
        console.log('Processing file:', entry.path);
        const newPath = entry.path.replace('.template', '');
        console.log('New path:', newPath);
        return {
          ...entry,
          path: normalize(newPath)
        };
      }),
      move(`src/app/cards/${strings.dasherize(_options.name)}-card`)
    ]);

    return chain([
      mergeWith(sourceParametrizedTemplates)
    ])(tree, _context);
  };
}
