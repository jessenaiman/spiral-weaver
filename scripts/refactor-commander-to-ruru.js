const fs = require('fs').promises;
const path = require('path');
const { isBinaryFile } = require('isbinaryfile');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

/**
 * Fixed: Use escapeRegExp utility to safely handle dynamic patterns
 * This prevents ReDoS (Regular Expression Denial of Service) attacks
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function refactorFileContent(filePath, oldString, newString) {
  const content = await fs.readFile(filePath, 'utf-8');
  
  // FIXED: Use escapeRegExp instead of inline replacement
  const escapedPattern = escapeRegExp(oldString);
  const searchRegex = new RegExp(escapedPattern, 'g');
  
  const newContent = content.replace(searchRegex, (match) => newString);
  
  if (newContent !== content) {
    const stats = await fs.stat(filePath);
    if (!stats.isDirectory()) {
      const isBinary = await isBinaryFile(filePath);
      if (!isBinary) {
        await fs.writeFile(filePath, newContent, 'utf8');
        return { filePath, changed: true };
      }
    }
  }
  
  return { filePath, changed: false };
}

async function processDirectory(dirPath, oldString, newString) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      const subResults = await processDirectory(fullPath, oldString, newString);
      results.push(...subResults);
    } else {
      const result = await refactorFileContent(fullPath, oldString, newString);
      results.push(result);
    }
  }

  return results;
}

async function main() {
  const argv = yargs(hideBin(process.argv))
    .option('dir', {
      alias: 'd',
      description: 'Directory to search',
      type: 'string',
      default: '.',
    })
    .option('old', {
      alias: 'o',
      description: 'String to find',
      type: 'string',
      demandOption: true,
    })
    .option('new', {
      alias: 'n',
      description: 'String to replace with',
      type: 'string',
      demandOption: true,
    })
    .help()
    .alias('help', 'h').argv;

  try {
    const results = await processDirectory(argv.dir, argv.old, argv.new);
    const changed = results.filter((r) => r.changed);
    console.log(`Updated ${changed.length} files`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

void main();
