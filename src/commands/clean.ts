// Clean command - Remove generated files for an entity

import chalk from 'chalk';
import inquirer from 'inquirer';
import { FileManager } from '../utils/file-system.js';

interface CleanOptions {
    yes?: boolean;
}

export async function cleanCommand(entityName: string, options: CleanOptions): Promise<void> {
    const projectRoot = process.cwd();
    const fileManager = new FileManager(projectRoot);

    console.log(chalk.blue(`\n🗑️  Cleaning ${entityName}...\n`));

    try {
        // Check if entity exists in manifest
        const entry = await fileManager.getManifestEntry(entityName);

        if (!entry) {
            console.log(chalk.yellow(`⚠️  Entity '${entityName}' not found in manifest.`));
            console.log(chalk.dim('  Run: crud-gen list to see available entities.'));
            console.log('');
            return;
        }

        // Show files to be deleted
        console.log(chalk.white('  Files to be removed:'));
        for (const file of entry.files) {
            console.log(chalk.dim(`    - ${file}`));
        }
        console.log('');

        // Confirm deletion (unless --yes flag is provided)
        if (!options.yes) {
            const { confirm } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'confirm',
                    message: `Are you sure you want to delete ${entry.files.length} file(s)?`,
                    default: false,
                },
            ]);

            if (!confirm) {
                console.log(chalk.yellow('\n⚠️  Aborted.'));
                return;
            }
        }

        // Remove files
        const removedFiles = await fileManager.removeEntityFiles(entityName);

        console.log('');
        console.log(
            chalk.green(`✓ Removed ${removedFiles.length} file(s) for entity '${entityName}'`)
        );
        console.log('');
    } catch (error) {
        console.error(chalk.red('\n✗ Clean failed:'), error);
        process.exit(1);
    }
}
