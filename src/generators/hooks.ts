// Hooks Generator - Custom hook for entity operations

import { BaseGenerator } from './base.js';
import type { EntityConfig } from '../types/entity.js';
import type { GenerateOptions } from '../types/generator.js';

export class HooksGenerator extends BaseGenerator {
    async generate(entity: EntityConfig, options: GenerateOptions): Promise<void> {
        if (options.skip?.includes('hooks')) {
            return;
        }

        const templateData = this.prepareTemplateData(entity);

        // Generate hook file
        const hookContent = await this.templateEngine.render('hooks/hook', templateData);
        const formattedHook = await this.formatCode(hookContent);

        const hookPath = this.getOutputPath(entity, 'hook');
        await this.fileManager.safeWrite(hookPath, formattedHook, options.force);
    }
}
