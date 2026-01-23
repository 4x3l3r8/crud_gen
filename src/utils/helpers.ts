// Utility type guards and helpers

import type { FieldConfig, RelationConfig } from '../types/entity.js';

/**
 * Type guard to check if a field is a relation field
 */
export function isRelationField(field: FieldConfig): field is FieldConfig & { relation: RelationConfig } {
    return field.type === 'relation' && !!field.relation;
}

/**
 * Check if a field is a computed field
 */
export function isComputedField(field: FieldConfig): boolean {
    return field.type === 'computed';
}

/**
 * Determine if a field should be included in forms
 */
export function shouldIncludeInForm(field: FieldConfig): boolean {
    return !field.ui?.form?.exclude && !isComputedField(field) && field.name !== 'id';
}

/**
 * Determine if a field should be included in tables
 */
export function shouldIncludeInTable(field: FieldConfig): boolean {
    return field.ui?.table?.visible !== false && !field.ui?.table?.exclude;
}

/**
 * Convert field type to TypeScript type
 */
export function getTypeScriptType(fieldType: string): string {
    const typeMap: Record<string, string> = {
        string: 'string',
        number: 'number',
        boolean: 'boolean',
        date: 'Date',
        relation: 'string',
        computed: 'string',
    };
    return typeMap[fieldType] || 'any';
}

/**
 * Get default value for a field type
 */
export function getDefaultValue(fieldType: string): string {
    const defaultMap: Record<string, string> = {
        string: "''",
        number: '0',
        boolean: 'false',
        date: 'new Date()',
        relation: "''",
    };
    return defaultMap[fieldType] || "''";
}

/**
 * Convert string to camelCase
 */
export function camelCase(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
}

/**
 * Convert string to PascalCase
 */
export function pascalCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert string to kebab-case
 */
export function kebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Generate Yup validation schema string for a field
 */
export function generateYupValidation(field: FieldConfig): string {
    const baseType = field.type === 'number' ? 'number' : 'string';
    let schema = `yup.${baseType}()`;

    if (field.validation?.required) {
        const label = field.ui?.form?.label || field.name;
        schema += `.required('${label} is required')`;
    }

    if (field.validation?.type === 'email') {
        schema += `.email('Invalid email address')`;
    }

    if (field.validation?.type === 'url') {
        schema += `.url('Invalid URL')`;
    }

    if (field.validation?.min !== undefined) {
        schema += `.min(${field.validation.min}, 'Must be at least ${field.validation.min}')`;
    }

    if (field.validation?.max !== undefined) {
        schema += `.max(${field.validation.max}, 'Must be at most ${field.validation.max}')`;
    }

    if (field.validation?.minLength !== undefined) {
        schema += `.min(${field.validation.minLength}, 'Must be at least ${field.validation.minLength} characters')`;
    }

    if (field.validation?.maxLength !== undefined) {
        schema += `.max(${field.validation.maxLength}, 'Must be at most ${field.validation.maxLength} characters')`;
    }

    if (field.validation?.pattern) {
        schema += `.matches(/${field.validation.pattern}/, 'Invalid format')`;
    }

    return schema;
}
