// Pages Generator - Page components for list, create, edit, details

import { BaseGenerator } from './base.js';
import type { DetailsViewConfig, EntityConfig } from '../types/entity.js';
import type { GenerateOptions } from '../types/generator.js';

export class PagesGenerator extends BaseGenerator {
    async generate(entity: EntityConfig, options: GenerateOptions): Promise<void> {
        if (options.skip?.includes('pages')) {
            return;
        }

        const templateData = this.prepareTemplateData(entity);

        // Generate list page
        const listContent = await this.templateEngine.render('pages/list', templateData);
        const formattedList = await this.formatCode(listContent);
        const listPath = this.getOutputPath(entity, 'page', 'index.tsx');
        await this.fileManager.safeWrite(listPath, formattedList, options.force);

        if ((entity.views["create/edit"] as DetailsViewConfig).type === 'page') {
            // Generate create page
            const createContent = await this.templateEngine.render('pages/create', templateData);
            const formattedCreate = await this.formatCode(createContent);
            const createPath = this.getOutputPath(entity, 'page', 'create.tsx');
            await this.fileManager.safeWrite(createPath, formattedCreate, options.force);

            // Generate edit page
            const editContent = await this.templateEngine.render('pages/edit', templateData);
            const formattedEdit = await this.formatCode(editContent);
            const editPath = this.getOutputPath(entity, 'page', '[id]/edit.tsx');
            await this.fileManager.safeWrite(editPath, formattedEdit, options.force);
        }

        // Generate details page
        if ((entity.views.details as DetailsViewConfig).type === 'page') {
            const detailsContent = await this.templateEngine.render('pages/details', templateData);
            const formattedDetails = await this.formatCode(detailsContent);
            const detailsPath = this.getOutputPath(entity, 'page', '[id]/index.tsx');
            await this.fileManager.safeWrite(detailsPath, formattedDetails, options.force);
        }
    }
}
