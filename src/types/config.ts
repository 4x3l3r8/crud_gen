// Project configuration structure

export interface ProjectConfig {
    projectRoot: string;
    paths: PathsConfig;
    templates?: TemplatesConfig;
    defaults: DefaultsConfig;
    api: ApiConfig;
    components: ComponentsConfig;
}

export interface PathsConfig {
    pages: string;
    components: string;
    store: string;
    hooks: string;
    types: string;
    tests: string;
}

export interface TemplatesConfig {
    api?: string;
    types?: string;
    form?: string;
    table?: string;
    grid?: string;
    details?: string;
    pageList?: string;
    pageCreate?: string;
    pageEdit?: string;
    pageDetails?: string;
    hook?: string;
    testApi?: string;
    testComponent?: string;
}

export interface DefaultsConfig {
    listType: 'table' | 'grid' | 'both';
    detailsView: 'page' | 'modal';
    tenantScoped: boolean;
    generateTests: boolean;
}

export interface ApiConfig {
    responseShape: ResponseShapeConfig;
    errorShape?: ErrorShapeConfig;
}

export interface ResponseShapeConfig {
    dataField: string;
    successField: string;
    messageField: string;
    metaField: string;
}

export interface ErrorShapeConfig {
    dataField: string;
    messageField: string;
}

export interface ComponentsConfig {
    tableComponent: string;
    gridComponent: string;
    formLayout: 'vertical' | 'horizontal' | 'grid';
}

// Default configuration values
export const DEFAULT_CONFIG: ProjectConfig = {
    projectRoot: '.',
    paths: {
        pages: 'src/pages',
        components: 'src/components',
        store: 'src/store',
        hooks: 'src/hooks',
        types: 'src/types',
        tests: 'src/__tests__',
    },
    defaults: {
        listType: 'table',
        detailsView: 'page',
        tenantScoped: true,
        generateTests: true,
    },
    api: {
        responseShape: {
            dataField: 'data',
            successField: 'success',
            messageField: 'message',
            metaField: 'meta',
        },
        errorShape: {
            dataField: 'error',
            messageField: 'message',
        },
    },
    components: {
        tableComponent: 'DataTable',
        gridComponent: 'CardGrid',
        formLayout: 'vertical',
    },
};
