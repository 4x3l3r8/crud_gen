// JSON Schema validation with AJV

import Ajv from 'ajv';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ajv = new Ajv.default({ allErrors: true, verbose: true });

/**
 * Validate an entity configuration against the JSON schema
 */
export async function validateEntity(entity: unknown): Promise<void> {
    const schemaPath = path.join(__dirname, '..', 'schemas', 'entity.schema.json');
    const schema = await fs.readJson(schemaPath);

    const validate = ajv.compile(schema);
    const valid = validate(entity);

    if (!valid) {
        const errors = validate.errors
            ?.map((err) => `${err.instancePath || 'root'} ${err.message}`)
            .join('\n');
        throw new Error(`Entity validation failed:\n${errors}`);
    }
}

/**
 * Validate a project configuration against the JSON schema
 */
export async function validateConfig(config: unknown): Promise<void> {
    const schemaPath = path.join(__dirname, '..', 'schemas', 'config.schema.json');
    const schema = await fs.readJson(schemaPath);

    const validate = ajv.compile(schema);
    const valid = validate(config);

    if (!valid) {
        const errors = validate.errors
            ?.map((err) => `${err.instancePath || 'root'} ${err.message}`)
            .join('\n');
        throw new Error(`Config validation failed:\n${errors}`);
    }
}

/**
 * Validate entity configuration with detailed error messages
 */
export function validateEntitySync(
    entity: unknown,
    schema: object
): { valid: boolean; errors: string[] } {
    const validate = ajv.compile(schema);
    const valid = validate(entity);

    if (!valid) {
        const errors =
            validate.errors?.map((err) => {
                const path = err.instancePath || 'root';
                const message = err.message || 'Unknown error';
                return `${path}: ${message}`;
            }) || [];
        return { valid: false, errors };
    }

    return { valid: true, errors: [] };
}
