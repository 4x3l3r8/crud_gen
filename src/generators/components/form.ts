// Form Generator - Form component with Chakra UI v3 + Formik

import { BaseGenerator } from '../base.js';
import type { EntityConfig } from '../../types/entity.js';
import type { GenerateOptions } from '../../types/generator.js';
import { camelCase, pascalCase } from '../../utils/helpers.js';

export class FormGenerator extends BaseGenerator {
    async generate(entity: EntityConfig, options: GenerateOptions): Promise<void> {
        if (options.skip?.includes('components')) {
            return;
        }

        const baseData = this.prepareTemplateData(entity);

        // Prepare relation hooks data
        const relationsMap = new Map<string, any>();

        // Helper to format relation data
        entity.fields.forEach(field => {
            if (field.type === 'relation' && field.relation) {
                const entityName = field.relation.entity;
                if (!relationsMap.has(entityName)) {
                    const pascalName = pascalCase(entityName);
                    relationsMap.set(entityName, {
                        entityName,
                        pascalName,
                        camelName: camelCase(entityName),
                        hookName: `use${pascalName}`,
                        importPath: `@/hooks/use${pascalName}`,
                    });
                }
            }
        });

        const relatedHooks = Array.from(relationsMap.values());

        // Enrich form fields with relation data
        const formFields = baseData.formFields.map(field => {
            if (field.type === 'relation' && field.relation) {
                return {
                    ...field,
                    isRelation: true,
                    relationData: relationsMap.get(field.relation.entity)
                };
            }
            return field;
        });

        const templateData = {
            ...baseData,
            formFields,
            relatedHooks
        };

        // Generate form component
        const formContent = await this.templateEngine.render('components/form', templateData);
        const formattedForm = await this.formatCode(formContent);

        const formPath = this.getOutputPath(entity, 'component', `${entity.entity}Form.tsx`);
        await this.fileManager.safeWrite(formPath, formattedForm, options.force);
    }
}
