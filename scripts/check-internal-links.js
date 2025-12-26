const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Configuration
const DOCS_DIR = path.resolve(__dirname, '../docs');
const PUBLIC_DIR = path.resolve(__dirname, '../public');
const IGNORE_PATTERNS = [
    /^http/,      // Ignore external links
    /^mailto:/,
    /^#/,         // Ignore anchors for now (unless we want to parse headings too)
];

async function checkLinks() {
    console.log('🔍 Starting internal link check...');

    // 1. Get all markdown files
    // Ensure we use forward slashes for glob and replace backslashes
    const globPattern = path.join(DOCS_DIR, '**/*.{md,mdx}').replace(/\\/g, '/');
    const files = await glob(globPattern);
    console.log(`📄 Found ${files.length} markdown files.`);

    let deadLinksCount = 0;
    let filesWithDeadLinks = 0;

    // Helper to check file existence
    const fileExists = (filePath) => {
        // Check exact path
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) return true;

        // Check with .md
        if (fs.existsSync(filePath + '.md')) return true;
        if (fs.existsSync(filePath + '.mdx')) return true;

        // Check with /index.md (directory)
        if (fs.existsSync(path.join(filePath, 'index.md'))) return true;
        if (fs.existsSync(path.join(filePath, 'index.mdx'))) return true;

        return false;
    };

    for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        const dir = path.dirname(file);

        // Match standard markdown links [text](url) and image links ![text](url)
        // Also matches <img src="..."> if we want, but let's stick to markdown syntax first.
        // Simplifying regex to capture link target. 
        // Captures: [anything](TARGET)
        const linkRegex = /\[.*?\]\((.*?)\)/g;

        let match;
        let fileHasIssues = false;

        while ((match = linkRegex.exec(content)) !== null) {
            const link = match[1];

            // Remove anchor part
            const linkWithoutAnchor = link.split('#')[0];

            if (!linkWithoutAnchor) continue; // Just an anchor like #section

            // Check ignores
            if (IGNORE_PATTERNS.some(p => p.test(linkWithoutAnchor))) continue;

            // Check absolute paths (starting with /)
            let targetPath;
            let targetPathPublic;

            if (linkWithoutAnchor.startsWith('/')) {
                // Absolute path: check docs root OR public root
                targetPath = path.join(DOCS_DIR, linkWithoutAnchor);
                targetPathPublic = path.join(PUBLIC_DIR, linkWithoutAnchor);
            } else {
                // Relative path
                targetPath = path.resolve(dir, linkWithoutAnchor);
                // Relative paths to public assets are rare/discouraged in Rspress vs absolute, 
                // but if used, they would be relative to file. 
                // However, 'public' is mounted at root. 
                // So ../../assets/foo.png might act as valid file path if it exists on disk.
            }

            // Check if it exists in Docs (Markdown/Structure)
            let exists = fileExists(targetPath);

            // If not found in Docs, and it was absolute, check Public (Assets)
            if (!exists && targetPathPublic) {
                if (fs.existsSync(targetPathPublic) && fs.statSync(targetPathPublic).isFile()) {
                    exists = true;
                }
            }
            // For relative paths that might point to files (e.g. images not in public but relative)
            if (!exists && !targetPathPublic) {
                if (fs.existsSync(targetPath) && fs.statSync(targetPath).isFile()) {
                    exists = true;
                }
            }

            if (!exists) {
                if (!fileHasIssues) {
                    console.log(`\n❌ ${path.relative(process.cwd(), file)}:`);
                    fileHasIssues = true;
                    filesWithDeadLinks++;
                }
                console.log(`   Broken link: ${link}`);
                console.log(`     -> Resolved to: ${targetPath} (and checked extensions .md, .mdx, /index.md)`);
                deadLinksCount++;
            }
        }
    }

    console.log('\n📊 Link Check Summary:');
    if (deadLinksCount > 0) {
        console.log(`❌ Found ${deadLinksCount} dead links in ${filesWithDeadLinks} files.`);
        process.exit(1);
    } else {
        console.log('✅ All internal links look good!');
        process.exit(0);
    }
}

checkLinks().catch(err => {
    console.error(err);
    process.exit(1);
});
