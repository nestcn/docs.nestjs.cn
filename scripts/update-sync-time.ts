import fs from 'node:fs';
import path from 'node:path';

/**
 * 更新 README 中的同步时间
 */
function updateSyncTime() {
  const readmePath = 'README.md';
  if (!fs.existsSync(readmePath)) return;

  const content = fs.readFileSync(readmePath, 'utf8');
  const syncTime = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
  
  const updatedContent = content.replace(
    /<!-- LAST_SYNC_TIME -->.*<!-- \/LAST_SYNC_TIME -->/g,
    `<!-- LAST_SYNC_TIME --> ${syncTime} (TS) <!-- /LAST_SYNC_TIME -->`
  );

  fs.writeFileSync(readmePath, updatedContent, 'utf8');
  console.log(`✅ 同步时间已更新: ${syncTime}`);
}

updateSyncTime();
