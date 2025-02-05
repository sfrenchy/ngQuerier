import {
  Rule,
  SchematicContext,
  Tree,
  apply,
  mergeWith,
  url,
  move,
  chain,
  forEach,
  FileEntry,
  Source,
  template,
  filter
} from '@angular-devkit/schematics';
import { strings, normalize, Path } from '@angular-devkit/core';
import { Schema } from './schema';

export function card(_options: Schema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('Starting card schematic');

    const basePath = `/src/app/cards/${strings.dasherize(_options.name)}-card`;
    context.logger.info(`Base path: ${basePath}`);

    const templateSource = apply(
      url('./files'),
      [
        filter(path => path.endsWith('.template')),
        template({
          ...strings,
          name: _options.name
        }),
        forEach((entry: FileEntry) => {
          let newPath = entry.path.replace('__name@dasherize__-card', '');
          newPath = newPath.replace('.template', '');
          return {
            ...entry,
            path: normalize(newPath) as Path
          };
        }),
        move(normalize(basePath) as Path)
      ]
    );

    return chain([
      mergeWith(templateSource)
    ])(tree, context);
  };
}
