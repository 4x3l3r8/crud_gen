// Scaffold command - Interactive entity schema creation

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import type { FieldConfig, ViewsConfig } from '../types/entity.js';

interface ScaffoldOptions {
    output?: string;
}

interface FieldAnswers {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'relation';
    required: boolean;
    validationType?: 'email' | 'url' | 'uuid' | 'none';
    formComponent: 'Input' | 'Select' | 'AsyncSelect' | 'Textarea' | 'Checkbox' | 'DatePicker';
    label: string;
    placeholder?: string;
    showInTable: boolean;
    sortable: boolean;
}

interface ViewsAnswers {
    list: 'table' | 'grid' | 'both';
    details: 'modal' | 'page';
    createEdit: 'modal' | 'page';
    singleViewType: 'drawer' | 'dialog';
    detailsEnabled: boolean;
}

export async function scaffoldCommand(entityName: string, options: ScaffoldOptions): Promise<void> {
    console.log(chalk.blue(`\n🏗️  Scaffolding entity: ${entityName}\n`));

    try {
        // Basic entity info
        const basicInfo = await inquirer.prompt([
            {
                type: 'input',
                name: 'plural',
                message: 'Plural name:',
                default: `${entityName}s`,
            },
            {
                type: 'input',
                name: 'route',
                message: 'Route path (e.g., users):',
                default: entityName.toLowerCase() + 's',
            },
            {
                type: 'input',
                name: 'apiEndpoint',
                message: 'API endpoint:',
                default: `/api/v1/${entityName.toLowerCase()}s`,
            },
            {
                type: 'confirm',
                name: 'tenantScoped',
                message: 'Is this entity tenant-scoped?',
                default: true,
            },
        ]);

        // Collect fields
        const fields: FieldConfig[] = [
            // Always include ID field
            {
                name: 'id',
                type: 'string',
                ui: {
                    form: { exclude: true },
                    table: { exclude: true },
                },
            },
        ];

        let addMoreFields = true;

        console.log(chalk.cyan('\n📝 Add fields to your entity:\n'));

        while (addMoreFields) {
            const fieldAnswers = await promptForField();
            fields.push(buildFieldConfig(fieldAnswers));

            const { continueAdding } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'continueAdding',
                    message: 'Add another field?',
                    default: true,
                },
            ]);
            addMoreFields = continueAdding;
        }

        const viewsConfig = await promptForViewsConfig();
        const builtViewsConfig = buildViewsConfig(viewsConfig);

        // Determine output path
        const outputDir = options.output || 'schemas';
        const outputPath = path.join(process.cwd(), outputDir, `${entityName.toLowerCase()}.json`);

        // Calculate relative path to schema
        // From: outputDir/file.json
        // To:   .crud-gen/schemas/entity.schema.json
        const crudGenSchemaPath = path.join(process.cwd(), '.crud-gen', 'schemas', 'entity.schema.json');
        let relativeSchemaPath = path.relative(path.dirname(outputPath), crudGenSchemaPath);

        // Ensure path uses forward slashes for JSON
        relativeSchemaPath = relativeSchemaPath.split(path.sep).join('/');

        // Build the schema
        const schema = {
            $schema: relativeSchemaPath,
            entity: entityName,
            plural: basicInfo.plural,
            route: basicInfo.route,
            apiEndpoint: basicInfo.apiEndpoint,
            tenantScoped: basicInfo.tenantScoped,
            pagination: {
                defaultPageSize: 20,
                pageSizeOptions: [10, 20, 50, 100],
            },
            fields,
            views: builtViewsConfig,
        };

        // Ensure directory exists
        await fs.ensureDir(path.dirname(outputPath));

        // Write schema file
        await fs.writeJson(outputPath, schema, { spaces: 2 });

        console.log(chalk.green(`\n✓ Created schema: ${outputPath}`));
        console.log(chalk.dim('\nNext steps:'));
        console.log(chalk.dim(`  1. Review and customize the schema`));
        console.log(chalk.dim(`  2. Run: crud-gen generate ${outputPath}`));
        console.log('');
    } catch (error) {
        if ((error as Error).name === 'ExitPromptError') {
            console.log(chalk.yellow('\n⚠️  Scaffolding cancelled.'));
            return;
        }
        console.error(chalk.red('\n✗ Scaffolding failed:'), error);
        process.exit(1);
    }
}

async function promptForField(): Promise<FieldAnswers> {
    return inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Field name:',
            validate: (input) => {
                if (!input.trim()) return 'Field name is required';
                if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(input)) {
                    return 'Field name must start with a letter and contain only alphanumeric characters';
                }
                return true;
            },
        },
        {
            type: 'list',
            name: 'type',
            message: 'Field type:',
            choices: [
                { name: 'String (text)', value: 'string' },
                { name: 'Number', value: 'number' },
                { name: 'Boolean (true/false)', value: 'boolean' },
                { name: 'Date', value: 'date' },
                { name: 'Relation (foreign key)', value: 'relation' },
            ],
        },
        {
            type: 'confirm',
            name: 'required',
            message: 'Is this field required?',
            default: false,
        },
        {
            type: 'list',
            name: 'validationType',
            message: 'Validation type:',
            choices: [
                { name: 'None', value: 'none' },
                { name: 'Email', value: 'email' },
                { name: 'URL', value: 'url' },
                { name: 'UUID', value: 'uuid' },
            ],
            when: (answers) => answers.type === 'string',
        },
        {
            type: 'list',
            name: 'formComponent',
            message: 'Form component:',
            choices: (answers) => {
                const baseChoices = [
                    { name: 'Text Input', value: 'Input' },
                    { name: 'Textarea (multi-line)', value: 'Textarea' },
                    { name: 'Select (dropdown)', value: 'Select' },
                    { name: 'Async Select (API-loaded options)', value: 'AsyncSelect' },
                ];

                if (answers.type === 'boolean') {
                    return [{ name: 'Checkbox', value: 'Checkbox' }];
                }
                if (answers.type === 'date') {
                    return [{ name: 'Date Picker', value: 'DatePicker' }];
                }
                return baseChoices;
            },
        },
        {
            type: 'input',
            name: 'label',
            message: 'Display label:',
            default: (answers: FieldAnswers) => {
                // Convert camelCase to Title Case
                return answers.name
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase())
                    .trim();
            },
        },
        {
            type: 'input',
            name: 'placeholder',
            message: 'Placeholder text (optional):',
            when: (answers) => ['Input', 'Textarea'].includes(answers.formComponent),
        },
        {
            type: 'confirm',
            name: 'showInTable',
            message: 'Show in table view?',
            default: true,
        },
        {
            type: 'confirm',
            name: 'sortable',
            message: 'Allow sorting in table?',
            default: false,
            when: (answers) => answers.showInTable,
        },
    ]);
}

function buildFieldConfig(answers: FieldAnswers): FieldConfig {
    const field: FieldConfig = {
        name: answers.name,
        type: answers.type,
        ui: {
            form: {
                component: answers.formComponent,
                label: answers.label,
            },
            table: {
                visible: answers.showInTable,
                sortable: answers.sortable,
                header: answers.label,
            },
        },
    };

    // Add validation if required or has validation type
    if (answers.required || (answers.validationType && answers.validationType !== 'none')) {
        field.validation = {};
        if (answers.required) {
            field.validation.required = true;
        }
        if (answers.validationType && answers.validationType !== 'none') {
            field.validation.type = answers.validationType;
        }
    }

    // Add placeholder if provided
    if (answers.placeholder && field.ui?.form) {
        field.ui.form.placeholder = answers.placeholder;
    }

    return field;
}

function promptForViewsConfig(): Promise<ViewsAnswers> {
    return inquirer.prompt<ViewsAnswers>([
        {
            type: 'list',
            name: 'list',
            message: 'List view type:',
            choices: [
                { name: 'Table', value: 'table' },
                { name: 'Grid', value: 'grid' },
                { name: 'Both', value: 'both' },
            ],
        },
        {
            type: 'confirm',
            name: 'detailsEnabled',
            message: 'Enable details view?',
            default: true,
        },
        {
            type: 'list',
            name: 'details',
            message: 'Details view type:',
            choices: [
                { name: 'Modal', value: 'modal' },
                { name: 'Page', value: 'page' },
            ],
            when: (answers) => answers.detailsEnabled,
        },
        {
            type: 'list',
            name: 'createEdit',
            message: 'Create/Edit view type:',
            choices: [
                { name: 'Modal', value: 'modal' },
                { name: 'Page', value: 'page' },
            ],
        },
        {
            type: 'list',
            name: 'singleViewType',
            message: 'What type of modal should be used for single view (i.e. create/edit, view)?',
            choices: [
                { name: 'Drawer', value: 'drawer' },
                { name: 'Dialog', value: 'dialog' },
            ],
            when: (answers) => answers.details === 'modal' || answers.createEdit === 'modal',
        },
    ]);
}

function buildViewsConfig(answers: ViewsAnswers): ViewsConfig {
    const views: ViewsConfig = {};
    if (answers.list) {
        views.list = {
            type: answers.list,
            defaultView: answers.list as "table" | "grid",
        };
    }
    if (answers.detailsEnabled) {
        views.details = {
            type: answers.details,
        };
    } else {
        views.details = false;
    }
    if (answers.createEdit) {
        views['create/edit'] = {
            type: answers.createEdit,
        };
    }
    if (answers.createEdit === 'modal') {
        views['create/edit']!.modalType = answers.singleViewType;
    }
    if (answers.details === "modal") {
        views.details = {
            type: "modal",
            modalType: answers.singleViewType
        }
    }
    return views;
}