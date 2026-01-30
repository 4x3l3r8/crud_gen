// Entity configuration structure

export interface EntityConfig {
    entity: string;
    plural: string;
    route: string;
    apiEndpoint: string;
    tenantScoped?: boolean;
    pagination?: PaginationConfig;
    views: ViewsConfig;
    fields: FieldConfig[];
}

export interface PaginationConfig {
    defaultPageSize: number;
    pageSizeOptions: number[];
}

export interface ViewsConfig {
    list: ListViewConfig;
    details: DetailsViewConfig | boolean;
    "create/edit": DetailsViewConfig;
}

export interface ListViewConfig {
    type: 'table' | 'grid' | 'both';
    defaultView: 'table' | 'grid';
    gridComponent?: string;
}

export interface DetailsViewConfig {
    type: 'page' | 'modal';
    modalType?: 'drawer' | 'dialog';
}

export interface FieldConfig {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'computed' | 'relation';
    validation?: ValidationConfig;
    relation?: RelationConfig;
    computation?: string;
    ui?: UIConfig;
}

export interface ValidationConfig {
    required?: boolean;
    type?: 'email' | 'url' | 'uuid';
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
}

export interface RelationConfig {
    entity: string;
    labelField: string;
    valueField: string;
}

export interface UIConfig {
    form?: FormUIConfig;
    table?: TableUIConfig;
}

export interface FormUIConfig {
    exclude?: boolean;
    component?: 'Input' | 'Select' | 'AsyncSelect' | 'Checkbox' | 'Textarea' | 'DatePicker' | 'Hidden';
    type?: string;
    placeholder?: string;
    label?: string;
    helperText?: string;
    options?: Array<{ label: string; value: string }>;
    endpoint?: string;
}

export interface TableUIConfig {
    exclude?: boolean;
    visible?: boolean;
    sortable?: boolean;
    filterable?: boolean;
    header?: string;
}
