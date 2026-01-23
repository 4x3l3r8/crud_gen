// List command - Show all generated entities

import chalk from 'chalk';
import { FileManager } from '../utils/file-system.js';

export async function listCommand(): Promise<void> {
    const projectRoot = process.cwd();
    const fileManager = new FileManager(projectRoot);

    console.log(chalk.blue('\n📋 Generated Entities\n'));

    try {
        const manifest = await fileManager.loadManifest();
        const entities = Object.keys(manifest);

        if (entities.length === 0) {
            console.log(chalk.dim('  No entities have been generated yet.'));
            console.log(chalk.dim('  Run: crud-gen generate <entity-file>'));
            console.log('');
            return;
        }

        // Display table header
        console.log(
            chalk.bold('  Entity'.padEnd(20)) +
            chalk.bold('Files'.padEnd(10)) +
            chalk.bold('Last Modified')
        );
        console.log(chalk.dim('  ' + '-'.repeat(50)));

        // Display each entity
        for (const entityName of entities) {
            const entry = manifest[entityName];
            const fileCount = entry.files.length.toString();
            const lastModified = new Date(entry.lastModified).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });

            console.log(
                chalk.cyan(`  ${entityName}`.padEnd(20)) +
                chalk.white(fileCount.padEnd(10)) +
                chalk.dim(lastModified)
            );
        }

        console.log('');
        console.log(chalk.dim(`  Total: ${entities.length} entity(ies)`));
        console.log('');
    } catch (error) {
        console.error(chalk.red('\n✗ Failed to list entities:'), error);
        process.exit(1);
    }
}
