// Base generator class - Common functionality for all generators

import prettier from 'prettier';
import { FileManager } from '../utils/file-system.js';
import { TemplateEngine } from '../utils/template-engine.js';
import type { EntityConfig, ViewsConfig } from '../types/entity.js';
import type { ProjectConfig } from '../types/config.js';
import type { GenerateOptions, FieldTemplateData, TemplateData } from '../types/generator.js';
import {
    getTypeScriptType,
    getDefaultValue,
    generateYupValidation,
    shouldIncludeInForm,
    shouldIncludeInTable,
    isRelationField,
    camelCase
} from '../utils/helpers.js';

export abstract class BaseGenerator {
    constructor(
        protected fileManager: FileManager,
        protected templateEngine: TemplateEngine,
        protected config: ProjectConfig
    ) { }

    /**
     * Abstract method to be implemented by each generator
     */
    abstract generate(entity: EntityConfig, options: GenerateOptions): Promise<void>;

    /**
     * Format code with Prettier
     */
    protected async formatCode(code: string, parser: 'typescript' | 'json' = 'typescript'): Promise<string> {
        try {
            return await prettier.format(code, {
                parser,
                singleQuote: true,
                trailingComma: 'es5',
                tabWidth: 2,
                semi: true,
                printWidth: 100,
            });
        } catch (error) {
            console.warn('Prettier formatting failed, returning unformatted code');
            return code;
        }
    }

    /**
     * Get output path for a specific type of generated file
     */
    protected getOutputPath(
        entity: EntityConfig,
        type: 'api' | 'types' | 'component' | 'page' | 'hook' | 'test',
        subPath?: string
    ): string {
        const entityLower = camelCase(entity.entity);

        const pathMap: Record<string, string> = {
            api: `${this.config.paths.store}/${entityLower}/${entityLower}Api.ts`,
            types: `${this.config.paths.types}/${entityLower}.ts`,
            component: `${this.config.paths.components}/${entityLower}`,
            page: `${this.config.paths.pages}/${entity.route}`,
            hook: `${this.config.paths.hooks}/use${entity.entity}.ts`,
            test: `${this.config.paths.tests}`,
        };

        const basePath = pathMap[type];
        return subPath ? `${basePath}/${subPath}` : basePath;
    }

    /**
     * Prepare template data from entity config
     */
    protected prepareTemplateData(entity: EntityConfig): TemplateData {
        const fields: FieldTemplateData[] = entity.fields.map((field) => ({
            ...field,
            tsType: getTypeScriptType(field.type),
            defaultValue: getDefaultValue(field.type),
            yupValidation: generateYupValidation(field),
        }));

        // Filter fields for forms and tables
        const formFields = fields.filter((f) => shouldIncludeInForm(f as any));
        const tableFields = fields.filter((f) => shouldIncludeInTable(f as any));
        const computedFields = fields.filter((f) => f.type === 'computed');
        const hasRelations = entity.fields.some((f) => isRelationField(f));

        const views = (entity.views as ViewsConfig) ?? {
            list: {
                type: 'table',
                defaultView: 'table',
            },
            details: {
                type: 'modal',
                modalType: 'dialog',
            },
            'create/edit': {
                type: 'modal',
                modalType: 'dialog',
            },
        };

        return {
            entity: entity.entity,
            plural: entity.plural,
            route: entity.route,
            apiEndpoint: entity.apiEndpoint,
            tenantScoped: entity.tenantScoped ?? this.config.defaults.tenantScoped,
            pagination: entity.pagination ?? {
                defaultPageSize: 20,
                pageSizeOptions: [10, 20, 50, 100],
            },
            fields,
            formFields,
            tableFields,
            hasRelations,
            computedFields,
            views,
            mutationUIisModal: views['create/edit'] ? views['create/edit'].type === 'modal' : false,
            mutationUIisDrawer: views['create/edit'] ? views['create/edit'].modalType === 'drawer' : false,
            mutationUIisPage: views['create/edit'] ? views['create/edit'].type === 'page' : false,
        };
    }
}
