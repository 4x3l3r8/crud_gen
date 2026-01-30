// Details Generator - Details view component

import { BaseGenerator } from '../base.js';
import type { EntityConfig, DetailsViewConfig } from '../../types/entity.js';
import type { GenerateOptions } from '../../types/generator.js';

export class DetailsGenerator extends BaseGenerator {
    async generate(entity: EntityConfig, options: GenerateOptions): Promise<void> {
        if (options.skip?.includes('components')) {
            return;
        }

        const templateData = this.prepareTemplateData(entity);
        if (entity.views.details && (entity.views.details as DetailsViewConfig).type === 'page') {


            // Generate details component
            const detailsContent = await this.templateEngine.render('components/details', templateData);
            const formattedDetails = await this.formatCode(detailsContent);

            const detailsPath = this.getOutputPath(entity, 'component', `${entity.entity}Details.tsx`);
            await this.fileManager.safeWrite(detailsPath, formattedDetails, options.force);
        } else {
            // Generate details modal
            const detailsContent = await this.templateEngine.render('components/viewModal', templateData);
            const formattedDetails = await this.formatCode(detailsContent);

            const detailsPath = this.getOutputPath(entity, 'component', `${entity.entity}ViewModal.tsx`);
            await this.fileManager.safeWrite(detailsPath, formattedDetails, options.force);
        }

        // keeping the create and edit modal here
        if ((entity.views["create/edit"] as DetailsViewConfig).type === 'modal') {

            if ((entity.views["create/edit"] as DetailsViewConfig).modalType === "dialog") {
                // Generate create modal
                const createContent = await this.templateEngine.render('components/createModal', templateData);
                const formattedCreate = await this.formatCode(createContent);
                const createPath = this.getOutputPath(entity, 'component', `${entity.entity}CreateModal.tsx`);
                await this.fileManager.safeWrite(createPath, formattedCreate, options.force);

                // Generate edit modal
                const editContent = await this.templateEngine.render('components/editModal', templateData);
                const formattedEdit = await this.formatCode(editContent);
                const editPath = this.getOutputPath(entity, 'component', `${entity.entity}EditModal.tsx`);
                await this.fileManager.safeWrite(editPath, formattedEdit, options.force);
            } else {
                // Generate create modal
                const createContent = await this.templateEngine.render('components/createDrawer', templateData);
                const formattedCreate = await this.formatCode(createContent);
                const createPath = this.getOutputPath(entity, 'component', `${entity.entity}CreateDrawer.tsx`);
                await this.fileManager.safeWrite(createPath, formattedCreate, options.force);

                // Generate edit modal
                const editContent = await this.templateEngine.render('components/editDrawer', templateData);
                const formattedEdit = await this.formatCode(editContent);
                const editPath = this.getOutputPath(entity, 'component', `${entity.entity}EditDrawer.tsx`);
                await this.fileManager.safeWrite(editPath, formattedEdit, options.force);
            }
        }

        // Generate delete modal
        const deleteContent = await this.templateEngine.render('components/deleteModal', templateData);
        const formattedDelete = await this.formatCode(deleteContent);
        const deletePath = this.getOutputPath(entity, 'component', `${entity.entity}DeleteModal.tsx`);
        await this.fileManager.safeWrite(deletePath, formattedDelete, options.force);

    }
}
