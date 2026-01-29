// Generator interfaces

import { ViewsConfig } from "./entity.js";

export interface GenerateOptions {
    force?: boolean;
    only?: GenerationPart[];
    skip?: GenerationPart[];
}

export type GenerationPart = 'api' | 'types' | 'components' | 'pages' | 'hooks' | 'tests';

export interface GeneratedFile {
    path: string;
    content: string;
    overwritten: boolean;
}

export interface GenerationResult {
    entity: string;
    files: GeneratedFile[];
    errors: string[];
    warnings: string[];
}

export interface ManifestEntry {
    entity: string;
    files: string[];
    generatedAt: string;
    lastModified: string;
}

export interface Manifest {
    [entityName: string]: ManifestEntry;
}

// Template data interfaces
export interface TemplateData {
    entity: string;
    plural: string;
    route: string;
    apiEndpoint: string;
    tenantScoped: boolean;
    pagination: {
        defaultPageSize: number;
        pageSizeOptions: number[];
    };
    fields: FieldTemplateData[];
    formFields: FieldTemplateData[];
    tableFields: FieldTemplateData[];
    hasRelations: boolean;
    computedFields: FieldTemplateData[];
    views: ViewsConfig;
    mutationUIisModal: boolean;
    mutationUIisDrawer: boolean;
    mutationUIisPage: boolean;
}

export interface FieldTemplateData {
    name: string;
    type: string;
    tsType: string;
    defaultValue: string;
    yupValidation: string;
    validation?: {
        required?: boolean;
        type?: string;
        min?: number;
        max?: number;
        minLength?: number;
        maxLength?: number;
        pattern?: string;
    };
    relation?: {
        entity: string;
        labelField: string;
        valueField: string;
    };
    ui?: {
        form?: {
            exclude?: boolean;
            component?: string;
            type?: string;
            placeholder?: string;
            label?: string;
            helperText?: string;
            options?: Array<{ label: string; value: string }>;
            endpoint?: string;
        };
        table?: {
            exclude?: boolean;
            visible?: boolean;
            sortable?: boolean;
            filterable?: boolean;
            header?: string;
        };
    };
}
