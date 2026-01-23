// Configuration loader and saver

import fs from 'fs-extra';
import path from 'path';
import type { ProjectConfig } from '../types/config.js';
import { DEFAULT_CONFIG } from '../types/config.js';
import { validateConfig } from './validation.js';

const CONFIG_FILENAME = 'crud-gen.config.json';

/**
 * Load project configuration from the project root
 */
export async function loadConfig(projectRoot: string): Promise<ProjectConfig> {
    const configPath = path.join(projectRoot, CONFIG_FILENAME);

    if (!(await fs.pathExists(configPath))) {
        throw new Error(
            `Configuration file not found: ${configPath}\nRun 'crud-gen init' to create one.`
        );
    }

    const config = await fs.readJson(configPath);

    // Validate the configuration
    await validateConfig(config);

    return config as ProjectConfig;
}

/**
 * Save project configuration to the project root
 */
export async function saveConfig(projectRoot: string, config: ProjectConfig): Promise<void> {
    const configPath = path.join(projectRoot, CONFIG_FILENAME);
    await fs.writeJson(configPath, config, { spaces: 2 });
}

/**
 * Check if configuration exists in the project root
 */
export async function configExists(projectRoot: string): Promise<boolean> {
    const configPath = path.join(projectRoot, CONFIG_FILENAME);
    return fs.pathExists(configPath);
}

/**
 * Get default configuration
 */
export function getDefaultConfig(): ProjectConfig {
    return { ...DEFAULT_CONFIG };
}

/**
 * Merge user config with defaults (for partial configs)
 */
export function mergeWithDefaults(partialConfig: Partial<ProjectConfig>): ProjectConfig {
    return {
        ...DEFAULT_CONFIG,
        ...partialConfig,
        paths: {
            ...DEFAULT_CONFIG.paths,
            ...partialConfig.paths,
        },
        defaults: {
            ...DEFAULT_CONFIG.defaults,
            ...partialConfig.defaults,
        },
        api: {
            ...DEFAULT_CONFIG.api,
            ...partialConfig.api,
            responseShape: {
                ...DEFAULT_CONFIG.api.responseShape,
                ...partialConfig.api?.responseShape,
            },
        },
        components: {
            ...DEFAULT_CONFIG.components,
            ...partialConfig.components,
        },
    };
}
