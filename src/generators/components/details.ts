// Details Generator - Details view component

import { BaseGenerator } from '../base.js';
import type { EntityConfig } from '../../types/entity.js';
import type { GenerateOptions } from '../../types/generator.js';

export class DetailsGenerator extends BaseGenerator {
    async generate(entity: EntityConfig, options: GenerateOptions): Promise<void> {
        if (options.skip?.includes('components')) {
            return;
        }

        const templateData = this.prepareTemplateData(entity);

        // Generate details component
        const detailsContent = await this.templateEngine.render('components/details', templateData);
        const formattedDetails = await this.formatCode(detailsContent);

        const detailsPath = this.getOutputPath(entity, 'component', `${entity.entity}Details.tsx`);
        await this.fileManager.safeWrite(detailsPath, formattedDetails, options.force);
    }
}
