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

export function card(_options: Schema): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const sourceTemplates = url('./files');
    const sourceParametrizedTemplates = apply(sourceTemplates, [
      template({
        ..._options,
        ...strings,
      }),
      forEach((entry: FileEntry) => {
        if (!entry.path.endsWith('.template')) {
          return null;
        }
        return {
          ...entry,
          path: normalize(entry.path.replace('.template', ''))
        };
      }),
      move(`src/app/cards/${strings.dasherize(_options.name)}-card`)
    ]);

    return chain([
      mergeWith(sourceParametrizedTemplates)
    ])(tree, _context);
  };
}
