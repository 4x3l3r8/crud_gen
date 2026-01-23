// Init command - Initialize crud-gen configuration

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { DEFAULT_CONFIG } from '../types/config.js';
import { checkDependencies, printDependencyResults } from '../utils/dependency-check.js';

interface InitOptions {
    force?: boolean;
}

export async function initCommand(options: InitOptions): Promise<void> {
    const projectRoot = process.cwd();
    const configPath = path.join(projectRoot, 'crud-gen.config.json');
    const crudGenDir = path.join(projectRoot, '.crud-gen');

    console.log(chalk.blue('\n🚀 Initializing crud-gen...\n'));

    try {
        // Check if config already exists
        if ((await fs.pathExists(configPath)) && !options.force) {
            console.log(
                chalk.yellow('⚠️  Configuration already exists. Use --force to overwrite.')
            );
            return;
        }

        // Check if package.json exists (valid Node.js project)
        const packageJsonPath = path.join(projectRoot, 'package.json');
        if (!(await fs.pathExists(packageJsonPath))) {
            console.log(
                chalk.red('✗ No package.json found. Please run this command in a Node.js project.')
            );
            process.exit(1);
        }

        // Write configuration file
        await fs.writeJson(configPath, DEFAULT_CONFIG, { spaces: 2 });
        console.log(chalk.green(`✓ Created ${path.relative(projectRoot, configPath)}`));

        // Create .crud-gen directory for manifest
        await fs.ensureDir(crudGenDir);
        console.log(chalk.green(`✓ Created ${path.relative(projectRoot, crudGenDir)}/`));

        // Initialize empty manifest
        const manifestPath = path.join(crudGenDir, 'manifest.json');
        await fs.writeJson(manifestPath, {}, { spaces: 2 });
        console.log(chalk.green(`✓ Created ${path.relative(projectRoot, manifestPath)}`));

        // Check dependencies
        console.log(chalk.blue('\n📦 Checking dependencies...\n'));
        try {
            const depResult = await checkDependencies(projectRoot);
            printDependencyResults(depResult);
        } catch (error) {
            console.log(chalk.yellow('⚠️  Could not check dependencies.'));
        }

        console.log(chalk.green('\n✓ crud-gen initialized successfully!\n'));
        console.log(chalk.dim('Next steps:'));
        console.log(chalk.dim('  1. Create an entity schema file (e.g., schemas/user.json)'));
        console.log(chalk.dim('  2. Run: crud-gen generate schemas/user.json'));
        console.log('');
    } catch (error) {
        console.error(chalk.red('\n✗ Initialization failed:'), error);
        process.exit(1);
    }
}
