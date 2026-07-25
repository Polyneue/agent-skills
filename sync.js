#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to parse CLI flags
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run') || args.includes('-n');
const destArgIndex = args.findIndex(arg => arg === '--dest' || arg === '-d');
const customDest = destArgIndex !== -1 ? args[destArgIndex + 1] : null;

// Target home directory (~/.agents/skills)
const homeDir = os.homedir();
const defaultTargetDir = path.join(homeDir, '.agents', 'skills');
const targetSkillsDir = customDest ? path.resolve(customDest) : defaultTargetDir;

const projectRoot = __dirname;
const sourceSkillsDir = path.join(projectRoot, 'skills');

/**
 * Finds skill directories strictly within the `./skills` directory
 */
function findSkillDirectoriesInSkillsDir(skillsDir) {
  const skillsMap = new Map();

  if (!fs.existsSync(skillsDir)) {
    return skillsMap;
  }

  let entries;
  try {
    entries = fs.readdirSync(skillsDir, { withFileTypes: true });
  } catch (err) {
    return skillsMap;
  }

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const fullPath = path.join(skillsDir, entry.name);
      
      // Verify directory contains SKILL.md
      const skillMdPath = path.join(fullPath, 'SKILL.md');
      if (fs.existsSync(skillMdPath)) {
        skillsMap.set(entry.name, fullPath);
      }
    }
  }

  return skillsMap;
}

function main() {
  console.log(`🔍 Scanning for skills in: ${sourceSkillsDir}`);
  console.log(`🎯 Target destination: ${targetSkillsDir}`);
  if (isDryRun) {
    console.log(`⚠️  DRY RUN MODE: No files will be copied.`);
  }
  console.log('--------------------------------------------------');

  const skillsMap = findSkillDirectoriesInSkillsDir(sourceSkillsDir);

  if (skillsMap.size === 0) {
    console.log(`⚠️  No skill directories (containing SKILL.md) found in ${sourceSkillsDir}.`);
    return;
  }

  let successCount = 0;

  for (const [skillName, srcDir] of skillsMap.entries()) {
    const destDir = path.join(targetSkillsDir, skillName);
    const relativeSrc = path.relative(projectRoot, srcDir) || '.';

    console.log(`📦 Skill found: '${skillName}' (${relativeSrc})`);
    console.log(`   ➡️  Destination: ${destDir}`);

    if (!isDryRun) {
      try {
        fs.mkdirSync(destDir, { recursive: true });
        fs.cpSync(srcDir, destDir, { recursive: true, force: true });
        console.log(`   ✅ Synced successfully.`);
        successCount++;
      } catch (err) {
        console.error(`   ❌ Failed to sync '${skillName}': ${err.message}`);
      }
    } else {
      console.log(`   [Dry Run] Would copy '${srcDir}' to '${destDir}'`);
      successCount++;
    }
    console.log('');
  }

  console.log('--------------------------------------------------');
  console.log(`🎉 Sync complete! ${successCount}/${skillsMap.size} skill(s) synced to ${targetSkillsDir}`);
}

main();
