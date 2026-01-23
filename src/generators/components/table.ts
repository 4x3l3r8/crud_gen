// Table Generator - Table component with TanStack React Table

import { BaseGenerator } from '../base.js';
import type { EntityConfig } from '../../types/entity.js';
import type { GenerateOptions } from '../../types/generator.js';

export class TableGenerator extends BaseGenerator {
    async generate(entity: EntityConfig, options: GenerateOptions): Promise<void> {
        if (options.skip?.includes('components')) {
            return;
        }

        const templateData = this.prepareTemplateData(entity);

        // Generate table component
        const tableContent = await this.templateEngine.render('components/table', templateData);
        const formattedTable = await this.formatCode(tableContent);

        const tablePath = this.getOutputPath(entity, 'component', `${entity.entity}Table.tsx`);
        await this.fileManager.safeWrite(tablePath, formattedTable, options.force);
    }
}
