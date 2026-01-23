// Generate command - Main generation logic

import path from 'path';
import chalk from 'chalk';
import fs from 'fs-extra';
import { validateEntity } from '../utils/validation.js';
import { loadConfig } from '../utils/config.js';
import { FileManager } from '../utils/file-system.js';
import { TemplateEngine } from '../utils/template-engine.js';
import { checkDependencies, printDependencyResults } from '../utils/dependency-check.js';
import { ApiGenerator } from '../generators/api.js';
import { TypesGenerator } from '../generators/types.js';
import { FormGenerator } from '../generators/components/form.js';
import { TableGenerator } from '../generators/components/table.js';
import { DetailsGenerator } from '../generators/components/details.js';
import { PagesGenerator } from '../generators/pages.js';
import { HooksGenerator } from '../generators/hooks.js';
import { TestsGenerator } from '../generators/tests.js';
import type { EntityConfig } from '../types/entity.js';
import type { GenerationPart } from '../types/generator.js';
import { camelCase } from '../utils/helpers.js';

interface GenerateCommandOptions {
    force?: boolean;
    only?: string[];
    skip?: string[];
    format?: boolean;
}

export async function generateCommand(
    entityFile: string,
    options: GenerateCommandOptions
): Promise<void> {
    const projectRoot = process.cwd();

    try {
        console.log(chalk.blue('\n🚀 Starting code generation...\n'));

        // Load and validate entity
        const entityPath = path.resolve(projectRoot, entityFile);

        if (!(await fs.pathExists(entityPath))) {
            console.error(chalk.red(`✗ Entity file not found: ${entityPath}`));
            process.exit(1);
        }

        const entity: EntityConfig = await fs.readJson(entityPath);

        try {
            await validateEntity(entity);
            console.log(chalk.green(`✓ Validated entity: ${entity.entity}`));
        } catch (error) {
            console.error(chalk.red('✗ Entity validation failed:'));
            console.error(chalk.red((error as Error).message));
            process.exit(1);
        }

        // Load config
        let config;
        try {
            config = await loadConfig(projectRoot);
            console.log(chalk.green('✓ Loaded configuration'));
        } catch (error) {
            console.error(chalk.red('✗ Configuration not found.'));
            console.error(chalk.dim('  Run: crud-gen init'));
            process.exit(1);
        }

        // Check dependencies (warning only, don't block)
        console.log(chalk.blue('\n📦 Checking dependencies...\n'));
        try {
            const depResult = await checkDependencies(projectRoot);
            if (!depResult.valid) {
                printDependencyResults(depResult);
                console.log(chalk.yellow('\n⚠️  Continuing with generation...\n'));
            } else {
                console.log(chalk.green('✓ All dependencies satisfied'));
            }
        } catch (error) {
            console.log(chalk.yellow('⚠️  Could not check dependencies, continuing...'));
        }

        // Initialize utilities
        const fileManager = new FileManager(projectRoot);
        const templateEngine = new TemplateEngine();

        // Create generators
        const generators = {
            api: new ApiGenerator(fileManager, templateEngine, config),
            types: new TypesGenerator(fileManager, templateEngine, config),
            form: new FormGenerator(fileManager, templateEngine, config),
            table: new TableGenerator(fileManager, templateEngine, config),
            details: new DetailsGenerator(fileManager, templateEngine, config),
            pages: new PagesGenerator(fileManager, templateEngine, config),
            hooks: new HooksGenerator(fileManager, templateEngine, config),
            tests: new TestsGenerator(fileManager, templateEngine, config),
        };

        // Determine what to generate
        const allParts: GenerationPart[] = ['api', 'types', 'components', 'pages', 'hooks', 'tests'];
        let partsToGenerate = options.only
            ? (options.only as GenerationPart[])
            : allParts;

        const skipParts = options.skip || [];

        console.log(chalk.blue('\n📝 Generating code...\n'));

        // Map parts to generators
        const partToGenerator: Record<string, (keyof typeof generators)[]> = {
            api: ['api'],
            types: ['types'],
            components: ['form', 'table', 'details'],
            pages: ['pages'],
            hooks: ['hooks'],
            tests: ['tests'],
        };

        // Generate each part
        for (const part of partsToGenerate) {
            if (skipParts.includes(part)) {
                console.log(chalk.dim(`  Skipping ${part}...`));
                continue;
            }

            const genNames = partToGenerator[part];
            if (!genNames) continue;

            for (const genName of genNames) {
                const generator = generators[genName];
                if (generator) {
                    try {
                        await generator.generate(entity, {
                            force: options.force,
                            skip: skipParts as GenerationPart[],
                        });
                    } catch (error) {
                        console.error(chalk.red(`✗ Failed to generate ${genName}:`));
                        console.error(chalk.red((error as Error).message));

                        // Rollback on error
                        console.log(chalk.yellow('\n⚠️  Rolling back changes...'));
                        await fileManager.rollback();
                        process.exit(1);
                    }
                }
            }
        }

        // Generate component barrel export
        const entityLower = camelCase(entity.entity);
        const componentIndexContent = `export { ${entity.entity}Form } from './${entity.entity}Form.js';
export { ${entity.entity}Table } from './${entity.entity}Table.js';
export { ${entity.entity}Details } from './${entity.entity}Details.js';
`;
        const componentIndexPath = `${config.paths.components}/${entityLower}/index.ts`;
        await fileManager.safeWrite(componentIndexPath, componentIndexContent, options.force);

        // Update manifest
        await fileManager.updateManifest(entity.entity, fileManager.getGeneratedFiles());

        const fileCount = fileManager.getGeneratedFiles().length;
        console.log(chalk.green(`\n✓ Generated ${fileCount} file(s) for entity '${entity.entity}'`));
        console.log(chalk.dim('\nGenerated files:'));
        for (const file of fileManager.getGeneratedFiles()) {
            console.log(chalk.dim(`  - ${file}`));
        }
        console.log('');
    } catch (error) {
        console.error(chalk.red('\n✗ Code generation failed:'));
        console.error(error);
        process.exit(1);
    }
}
