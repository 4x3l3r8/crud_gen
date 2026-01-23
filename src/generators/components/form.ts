// Form Generator - Form component with Chakra UI v3 + Formik

import { BaseGenerator } from '../base.js';
import type { EntityConfig } from '../../types/entity.js';
import type { GenerateOptions } from '../../types/generator.js';

export class FormGenerator extends BaseGenerator {
    async generate(entity: EntityConfig, options: GenerateOptions): Promise<void> {
        if (options.skip?.includes('components')) {
            return;
        }

        const templateData = this.prepareTemplateData(entity);

        // Generate form component
        const formContent = await this.templateEngine.render('components/form', templateData);
        const formattedForm = await this.formatCode(formContent);

        const formPath = this.getOutputPath(entity, 'component', `${entity.entity}Form.tsx`);
        await this.fileManager.safeWrite(formPath, formattedForm, options.force);
    }
}
