#!/usr/bin/env node

/**
 * 更新 README.md 中的最近同步时间
 * 
 * 使用方法:
 * node scripts/update-sync-time.js
 */

const fs = require('fs');
const path = require('path');

const README_PATH = path.join(__dirname, '..', 'README.md');

function updateSyncTime() {
  try {
    // 读取 README.md 文件
    const readme = fs.readFileSync(README_PATH, 'utf-8');
    
    // 获取当前时间（北京时间）
    const now = new Date();
    
    // 使用 toLocaleString 获取北京时间
    const beijingTimeString = now.toLocaleString('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    // 解析并重新格式化为我们需要的格式：2025年07月01日 17:48
    const [datePart, timePart] = beijingTimeString.split(' ');
    const [year, month, day] = datePart.split('/');
    const syncTime = `${year}年${month}月${day}日 ${timePart}`;
    
    // 更新同步时间标记
    const updatedReadme = readme.replace(
      /<!-- LAST_SYNC_TIME -->.*?<!-- \/LAST_SYNC_TIME -->/g,
      `<!-- LAST_SYNC_TIME --> ${syncTime} <!-- /LAST_SYNC_TIME -->`
    );
    
    // 写回文件
    fs.writeFileSync(README_PATH, updatedReadme);
    
    console.log('✅ 同步时间已更新:', syncTime);
    
    // 如果内容有变更，返回 0，否则返回 1
    if (readme !== updatedReadme) {
      return 0;
    } else {
      console.log('📋 同步时间无变更');
      return 1;
    }
    
  } catch (error) {
    console.error('❌ 更新同步时间失败:', error.message);
    return 2;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const exitCode = updateSyncTime();
  process.exit(exitCode);
}

module.exports = { updateSyncTime };
