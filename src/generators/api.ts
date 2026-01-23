// API Generator - RTK Query API generation

import { BaseGenerator } from './base.js';
import type { EntityConfig } from '../types/entity.js';
import type { GenerateOptions } from '../types/generator.js';
import { camelCase } from '../utils/helpers.js';

export class ApiGenerator extends BaseGenerator {
    async generate(entity: EntityConfig, options: GenerateOptions): Promise<void> {
        if (options.skip?.includes('api')) {
            return;
        }

        const templateData = this.prepareTemplateData(entity);
        const entityLower = camelCase(entity.entity);

        // Generate API file
        const apiContent = await this.templateEngine.render('api/inject', templateData);
        const formattedApi = await this.formatCode(apiContent);

        const apiPath = this.getOutputPath(entity, 'api');
        await this.fileManager.safeWrite(apiPath, formattedApi, options.force);

        // Generate barrel export
        const indexContent = `export * from './${entityLower}Api.js';\n`;
        const indexPath = `${this.config.paths.store}/${entityLower}/index.ts`;
        await this.fileManager.safeWrite(indexPath, indexContent, options.force);
    }
}
