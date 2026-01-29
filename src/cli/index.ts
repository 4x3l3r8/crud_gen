#!/usr/bin/env node
// CLI entry point - Main command setup

import { Command } from 'commander';
import { initCommand } from '../commands/init.js';
import { generateCommand } from '../commands/generate.js';
import { listCommand } from '../commands/list.js';
import { cleanCommand } from '../commands/clean.js';
import { scaffoldCommand } from '../commands/scaffold.js';

const program = new Command();

program
    .name('crud-gen')
    .description('Generate CRUD code for multi-tenant SaaS applications')
    .version('1.0.0');

program
    .command('init')
    .description('Initialize CRUD generator configuration in the current project')
    .option('--force', 'Overwrite existing configuration', false)
    .action(initCommand);

program
    .command('scaffold')
    .description('Interactively create a new entity schema')
    .argument('<entity-name>', 'Name of the entity (e.g., User, Product)')
    .option('-o, --output <dir>', 'Output directory for schema file', 'schemas')
    .action(scaffoldCommand);

program
    .command('generate')
    .description('Generate CRUD code for an entity')
    .argument('<entity-file>', 'Path to entity JSON file')
    .option('--only <parts...>', 'Only generate specific parts (api, types, components, pages, hooks, tests)')
    .option('--skip <parts...>', 'Skip specific parts')
    .option('--force', 'Force regeneration of existing files', false)
    .option('--no-format', 'Skip Prettier formatting')
    .action(generateCommand);

program
    .command('list')
    .description('List all generated entities')
    .action(listCommand);

program
    .command('clean')
    .description('Remove generated files for an entity')
    .argument('<entity>', 'Entity name to clean')
    .option('--yes', 'Skip confirmation prompt', false)
    .action(cleanCommand);


program.parse();

