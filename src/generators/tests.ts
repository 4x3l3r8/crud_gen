// Tests Generator - Test files for API and components

import { BaseGenerator } from './base.js';
import type { EntityConfig } from '../types/entity.js';
import type { GenerateOptions } from '../types/generator.js';
import { camelCase } from '../utils/helpers.js';

export class TestsGenerator extends BaseGenerator {
    async generate(entity: EntityConfig, options: GenerateOptions): Promise<void> {
        if (options.skip?.includes('tests')) {
            return;
        }

        // Check if tests should be generated based on config
        if (!this.config.defaults.generateTests) {
            return;
        }

        const templateData = this.prepareTemplateData(entity);
        const entityLower = camelCase(entity.entity);

        // Generate API test
        const apiTestContent = await this.templateEngine.render('tests/api.test', templateData);
        const formattedApiTest = await this.formatCode(apiTestContent);
        const apiTestPath = `${this.config.paths.tests}/store/${entityLower}/${entityLower}Api.test.ts`;
        await this.fileManager.safeWrite(apiTestPath, formattedApiTest, options.force);

        // Generate component test
        const componentTestContent = await this.templateEngine.render('tests/component.test', templateData);
        const formattedComponentTest = await this.formatCode(componentTestContent);
        const componentTestPath = `${this.config.paths.tests}/components/${entityLower}/${entity.entity}Form.test.tsx`;
        await this.fileManager.safeWrite(componentTestPath, formattedComponentTest, options.force);
    }
}
