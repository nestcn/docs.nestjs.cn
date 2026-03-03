import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function touchUntranslatedFiles() {
    const contentDir = path.resolve(__dirname, 'content');
    const untranslatedListFile = path.resolve(__dirname, 'untranslated-list.txt');

    if (!fs.existsSync(untranslatedListFile)) {
        console.error('❌ untranslated-list.txt not found!');
        return;
    }

    const listContent = fs.readFileSync(untranslatedListFile, 'utf8');
    const fileLines = listContent.split('\n').filter(line => line.startsWith('- '));

    console.log(`🚀 Touching ${fileLines.length} files in ${contentDir} to trigger re-translation...`);

    let count = 0;
    for (const line of fileLines) {
        // Extract file path: "- path/to/file.md (Chinese chars: 24)" -> "path/to/file.md"
        const filePathMatch = line.match(/- (.*?) \(Chinese chars: \d+\)/);
        if (filePathMatch && filePathMatch[1]) {
            const relPath = filePathMatch[1].trim();
            const fullPath = path.join(contentDir, relPath);

            if (fs.existsSync(fullPath)) {
                const now = new Date();
                fs.utimesSync(fullPath, now, now);
                console.log(`✅ Touched: ${relPath}`);
                count++;
            } else {
                console.warn(`⚠️ File not found: ${fullPath}`);
            }
        }
    }

    console.log(`\n🎉 Successfully touched ${count} files. Translation script will now pick them up!`);
}

touchUntranslatedFiles().catch(console.error);
