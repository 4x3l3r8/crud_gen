// Safe file operations with rollback capability

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import type { Manifest, ManifestEntry } from '../types/generator.js';

export class FileManager {
    private generatedFiles: string[] = [];
    private manifestPath: string;

    constructor(private projectRoot: string) {
        this.manifestPath = path.join(projectRoot, '.crud-gen', 'manifest.json');
    }

    /**
     * Safely write a file, optionally skipping if it exists
     */
    async safeWrite(filePath: string, content: string, force = false): Promise<boolean> {
        const fullPath = path.join(this.projectRoot, filePath);

        // Check if file exists
        if ((await fs.pathExists(fullPath)) && !force) {
            console.log(chalk.yellow(`⚠️  Skipping ${filePath} (already exists). Use --force to overwrite.`));
            return false;
        }

        try {
            // Create directory if needed
            await fs.ensureDir(path.dirname(fullPath));

            // Write file
            await fs.writeFile(fullPath, content, 'utf-8');
            this.generatedFiles.push(filePath);

            console.log(chalk.green(`✓ Created ${filePath}`));
            return true;
        } catch (error) {
            console.error(chalk.red(`✗ Failed to create ${filePath}`), error);
            throw error;
        }
    }

    /**
     * Rollback all generated files in case of error
     */
    async rollback(): Promise<void> {
        console.log(chalk.yellow('\n⚠️  Rolling back changes...'));

        for (const file of this.generatedFiles.reverse()) {
            const fullPath = path.join(this.projectRoot, file);

            try {
                if (await fs.pathExists(fullPath)) {
                    await fs.remove(fullPath);
                    console.log(chalk.red(`✗ Removed ${file}`));
                }
            } catch (error) {
                console.error(chalk.red(`Failed to remove ${file}`), error);
            }
        }

        this.generatedFiles = [];
    }

    /**
     * Update the manifest with generated files for an entity
     */
    async updateManifest(entityName: string, files: string[]): Promise<void> {
        const manifest = await this.loadManifest();

        manifest[entityName] = {
            entity: entityName,
            files,
            generatedAt: manifest[entityName]?.generatedAt || new Date().toISOString(),
            lastModified: new Date().toISOString(),
        };

        await fs.ensureDir(path.dirname(this.manifestPath));
        await fs.writeJson(this.manifestPath, manifest, { spaces: 2 });
    }

    /**
     * Load the manifest file
     */
    async loadManifest(): Promise<Manifest> {
        if (await fs.pathExists(this.manifestPath)) {
            return await fs.readJson(this.manifestPath);
        }
        return {};
    }

    /**
     * Get a manifest entry for a specific entity
     */
    async getManifestEntry(entityName: string): Promise<ManifestEntry | null> {
        const manifest = await this.loadManifest();
        return manifest[entityName] || null;
    }

    /**
     * Remove files for an entity from the manifest and filesystem
     */
    async removeEntityFiles(entityName: string): Promise<string[]> {
        const entry = await this.getManifestEntry(entityName);
        if (!entry) {
            return [];
        }

        const removedFiles: string[] = [];

        for (const file of entry.files) {
            const fullPath = path.join(this.projectRoot, file);
            try {
                if (await fs.pathExists(fullPath)) {
                    await fs.remove(fullPath);
                    removedFiles.push(file);
                    console.log(chalk.red(`✗ Removed ${file}`));
                }
            } catch (error) {
                console.error(chalk.red(`Failed to remove ${file}`), error);
            }
        }

        // Update manifest
        const manifest = await this.loadManifest();
        delete manifest[entityName];
        await fs.writeJson(this.manifestPath, manifest, { spaces: 2 });

        return removedFiles;
    }

    /**
     * Get list of files generated in this session
     */
    getGeneratedFiles(): string[] {
        return [...this.generatedFiles];
    }

    /**
     * Check if a file exists in the project
     */
    async fileExists(filePath: string): Promise<boolean> {
        const fullPath = path.join(this.projectRoot, filePath);
        return fs.pathExists(fullPath);
    }
}
