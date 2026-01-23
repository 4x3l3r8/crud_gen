// Types Generator - TypeScript interface generation

import { BaseGenerator } from './base.js';
import type { EntityConfig } from '../types/entity.js';
import type { GenerateOptions } from '../types/generator.js';

export class TypesGenerator extends BaseGenerator {
    async generate(entity: EntityConfig, options: GenerateOptions): Promise<void> {
        if (options.skip?.includes('types')) {
            return;
        }

        const templateData = this.prepareTemplateData(entity);

        // Generate types file
        const typesContent = await this.templateEngine.render('types/entity', templateData);
        const formattedTypes = await this.formatCode(typesContent);

        const typesPath = this.getOutputPath(entity, 'types');
        await this.fileManager.safeWrite(typesPath, formattedTypes, options.force);
    }
}
