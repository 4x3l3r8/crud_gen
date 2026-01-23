// Check for required packages in target project

import fs from 'fs-extra';
import path from 'path';
import semver from 'semver';
import chalk from 'chalk';

const REQUIRED_PACKAGES: Record<string, string> = {
    '@chakra-ui/react': '^3.0.0',
    '@reduxjs/toolkit': '^1.9.0',
    'react-redux': '^8.0.0',
    'formik': '^2.0.0',
    'yup': '^1.0.0',
    '@tanstack/react-table': '^8.0.0',
    'react-router-dom': '^6.0.0',
};

export interface DependencyCheckResult {
    missing: string[];
    outdated: Array<{
        name: string;
        installed: string;
        required: string;
    }>;
    valid: boolean;
}

/**
 * Check if the target project has required dependencies installed
 */
export async function checkDependencies(projectRoot: string): Promise<DependencyCheckResult> {
    const packagePath = path.join(projectRoot, 'package.json');

    if (!(await fs.pathExists(packagePath))) {
        throw new Error('package.json not found in project root. Is this a valid Node.js project?');
    }

    const pkg = await fs.readJson(packagePath);
    const missing: string[] = [];
    const outdated: Array<{ name: string; installed: string; required: string }> = [];

    for (const [dep, requiredVersion] of Object.entries(REQUIRED_PACKAGES)) {
        const installedVersion = pkg.dependencies?.[dep] || pkg.devDependencies?.[dep];

        if (!installedVersion) {
            missing.push(dep);
        } else {
            // Clean version string (remove ^, ~, etc.)
            const cleanVersion = installedVersion.replace(/^[\^~><=]/, '');
            const coerced = semver.coerce(cleanVersion);

            if (coerced && !semver.satisfies(coerced, requiredVersion)) {
                outdated.push({
                    name: dep,
                    installed: installedVersion,
                    required: requiredVersion,
                });
            }
        }
    }

    return {
        missing,
        outdated,
        valid: missing.length === 0 && outdated.length === 0,
    };
}

/**
 * Print dependency check results
 */
export function printDependencyResults(result: DependencyCheckResult): void {
    if (result.missing.length > 0) {
        console.log(chalk.yellow('\n⚠️  Missing required packages:'));
        result.missing.forEach((dep) => console.log(chalk.yellow(`   - ${dep}`)));
        console.log(
            chalk.dim('\n   Install with: npm install ' + result.missing.join(' '))
        );
    }

    if (result.outdated.length > 0) {
        console.log(chalk.yellow('\n⚠️  Outdated packages:'));
        result.outdated.forEach((dep) =>
            console.log(
                chalk.yellow(`   - ${dep.name} (installed: ${dep.installed}, required: ${dep.required})`)
            )
        );
    }

    if (result.valid) {
        console.log(chalk.green('✓ All required dependencies are installed'));
    }
}

/**
 * Get list of required packages for display
 */
export function getRequiredPackages(): Record<string, string> {
    return { ...REQUIRED_PACKAGES };
}
