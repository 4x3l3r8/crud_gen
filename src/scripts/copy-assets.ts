import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function copyAssets() {
    const projectRoot = path.resolve(__dirname, '../../');
    const srcDir = path.join(projectRoot, 'src');
    const distDir = path.join(projectRoot, 'dist');

    console.log('📦 Copying assets...');

    try {
        // Copy templates
        await fs.copy(
            path.join(srcDir, 'templates'),
            path.join(distDir, 'templates')
        );
        console.log('✓ Templates copied');

        // Copy schemas
        await fs.copy(
            path.join(srcDir, 'schemas'),
            path.join(distDir, 'schemas')
        );
        console.log('✓ Schemas copied');

    } catch (error) {
        console.error('✗ Failed to copy assets:', error);
        process.exit(1);
    }
}

copyAssets();
