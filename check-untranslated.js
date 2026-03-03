import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function findUntranslatedFiles() {
    const docsDir = path.resolve(__dirname, 'docs');
    const files = await glob('**/*.md', { cwd: docsDir });

    const untranslated = [];

    for (const file of files) {
        const filePath = path.join(docsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');

        // Check if there are any Chinese characters in the content
        const chineseChars = content.match(/[\u4e00-\u9fa5]/g);
        const chineseCount = chineseChars ? chineseChars.length : 0;

        if (chineseCount < 30) {
            untranslated.push({ file, chineseCount });
        }
    }

    console.log(`Found ${untranslated.length} files that appear untranslated:`);
    for (const item of untranslated) {
        console.log(`- ${item.file} (Chinese chars: ${item.chineseCount})`);
    }
}

findUntranslatedFiles().catch(console.error);
