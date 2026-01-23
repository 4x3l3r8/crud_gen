// Handlebars wrapper with custom helpers

import Handlebars from 'handlebars';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { getTypeScriptType, getDefaultValue, generateYupValidation } from './helpers.js';
import type { FieldConfig } from '../types/entity.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class TemplateEngine {
    private templates = new Map<string, Handlebars.TemplateDelegate>();
    private helpersRegistered = false;
    private templatesDir: string;

    constructor(templatesDir?: string) {
        // Default to bundled templates if not specified
        this.templatesDir = templatesDir || path.join(__dirname, '..', 'templates');
        this.registerHelpers();
    }

    private registerHelpers(): void {
        if (this.helpersRegistered) return;

        // String case conversions
        Handlebars.registerHelper('camelCase', (str: string) => {
            if (!str) return '';
            return str.charAt(0).toLowerCase() + str.slice(1);
        });

        Handlebars.registerHelper('pascalCase', (str: string) => {
            if (!str) return '';
            return str.charAt(0).toUpperCase() + str.slice(1);
        });

        Handlebars.registerHelper('kebabCase', (str: string) => {
            if (!str) return '';
            return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        });

        Handlebars.registerHelper('upperCase', (str: string) => {
            if (!str) return '';
            return str.toUpperCase();
        });

        Handlebars.registerHelper('lowerCase', (str: string) => {
            if (!str) return '';
            return str.toLowerCase();
        });

        // Comparison helpers
        Handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);

        Handlebars.registerHelper('neq', (a: unknown, b: unknown) => a !== b);

        Handlebars.registerHelper('or', function (...args: unknown[]) {
            // Remove the options object (last argument)
            return args.slice(0, -1).some(Boolean);
        });

        Handlebars.registerHelper('and', function (...args: unknown[]) {
            // Remove the options object (last argument)
            return args.slice(0, -1).every(Boolean);
        });

        Handlebars.registerHelper('not', (value: unknown) => !value);

        // Type conversion helpers
        Handlebars.registerHelper('tsType', (type: string) => {
            return new Handlebars.SafeString(getTypeScriptType(type));
        });

        Handlebars.registerHelper('defaultValue', (type: string) => {
            return new Handlebars.SafeString(getDefaultValue(type));
        });

        // Yup validation generator
        Handlebars.registerHelper('generateYupValidation', (field: FieldConfig) => {
            return new Handlebars.SafeString(generateYupValidation(field));
        });

        // JSON stringify helper
        Handlebars.registerHelper('json', (context: unknown) => {
            return JSON.stringify(context, null, 2);
        });

        // Array/object helpers
        Handlebars.registerHelper('first', (arr: unknown[]) => {
            return arr?.[0];
        });

        Handlebars.registerHelper('last', (arr: unknown[]) => {
            return arr?.[arr.length - 1];
        });

        Handlebars.registerHelper('length', (arr: unknown[]) => {
            return arr?.length || 0;
        });

        // Conditional block helpers
        Handlebars.registerHelper('ifEq', function (this: unknown, a: unknown, b: unknown, options: Handlebars.HelperOptions) {
            if (a === b) {
                return options.fn(this);
            }
            return options.inverse(this);
        });

        Handlebars.registerHelper('ifNeq', function (this: unknown, a: unknown, b: unknown, options: Handlebars.HelperOptions) {
            if (a !== b) {
                return options.fn(this);
            }
            return options.inverse(this);
        });

        // Unless helper for negation
        Handlebars.registerHelper('unlessOr', function (this: unknown, ...args: unknown[]) {
            const options = args.pop() as Handlebars.HelperOptions;
            const condition = args.some(Boolean);
            if (!condition) {
                return options.fn(this);
            }
            return options.inverse(this);
        });

        this.helpersRegistered = true;
    }

    /**
     * Load a template from the templates directory
     */
    async loadTemplate(templatePath: string): Promise<Handlebars.TemplateDelegate> {
        if (!this.templates.has(templatePath)) {
            const fullPath = path.join(this.templatesDir, `${templatePath}.hbs`);

            if (!(await fs.pathExists(fullPath))) {
                throw new Error(`Template not found: ${fullPath}`);
            }

            const source = await fs.readFile(fullPath, 'utf-8');
            this.templates.set(templatePath, Handlebars.compile(source));
        }

        return this.templates.get(templatePath)!;
    }

    /**
     * Render a template with the given data
     */
    async render(templatePath: string, data: unknown): Promise<string> {
        const template = await this.loadTemplate(templatePath);
        return template(data);
    }

    /**
     * Register a custom partial
     */
    async registerPartial(name: string, templatePath: string): Promise<void> {
        const fullPath = path.join(this.templatesDir, `${templatePath}.hbs`);

        if (await fs.pathExists(fullPath)) {
            const source = await fs.readFile(fullPath, 'utf-8');
            Handlebars.registerPartial(name, source);
        }
    }

    /**
     * Clear cached templates
     */
    clearCache(): void {
        this.templates.clear();
    }
}
