import { visit } from 'unist-util-visit';

function remarkCodeTabs() {
  return (tree) => {
    console.log('🔍 Remark plugin is running...');
    
    visit(tree, 'code', (node, index, parent) => {
      if (!node.value || typeof node.value !== 'string') return;
      
      console.log('📝 Found code block:', {
        lang: node.lang,
        hasFilename: node.value.includes('@@filename'),
        hasSwitch: node.value.includes('@@switch'),
        preview: node.value.substring(0, 100)
      });
      
      const lines = node.value.split('\n');
      let filename = '';
      let switchIndex = -1;
      
      // 查找 @@filename 和 @@switch
      for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex].trim();
        
        if (line.startsWith('@@filename(') && line.endsWith(')')) {
          filename = line.slice(11, -1);
          console.log('📁 Found filename:', filename);
        } else if (line === '@@switch') {
          switchIndex = lineIndex;
          console.log('🔄 Found switch at line:', switchIndex);
          break;
        }
      }
      
      if (filename && switchIndex > -1) {
        console.log('✅ Processing code tabs for:', filename);
        
        // 分离代码
        const tsLines = lines.slice(0, switchIndex);
        const jsLines = lines.slice(switchIndex + 1);
        
        const filteredTsLines = tsLines.filter(line => !line.trim().startsWith('@@filename('));
        const typescriptCode = filteredTsLines.join('\n').trim();
        const javascriptCode = jsLines.join('\n').trim();
        
        console.log('📊 Code separation:', {
          tsLines: typescriptCode.split('\n').length,
          jsLines: javascriptCode.split('\n').length
        });
        
        const jsFilename = filename.replace(/\.ts$/, '.js');
        
        // 创建 HTML
        const htmlContent = `<div class="code-tabs" data-filename="${filename}">
  <div class="tab-buttons">
    <button class="tab-btn active" data-tab="typescript">TypeScript</button>
    <button class="tab-btn" data-tab="javascript">JavaScript</button>
  </div>
  <div class="tab-content">
    <div class="tab-pane active" data-tab="typescript">
      <div class="filename-label">${filename}</div>
      <pre><code class="language-typescript">${escapeHtml(typescriptCode)}</code></pre>
    </div>
    <div class="tab-pane" data-tab="javascript">
      <div class="filename-label">${jsFilename}</div>
      <pre><code class="language-javascript">${escapeHtml(javascriptCode)}</code></pre>
    </div>
  </div>
</div>`;
        
        console.log('🔨 Generated HTML length:', htmlContent.length);
        
        // 替换节点
        const newNode = {
          type: 'html',
          value: htmlContent
        };
        
        parent.children[index] = newNode;
        console.log('🎯 Replaced node successfully');
      } else {
        console.log('❌ Skipping code block - missing filename or switch');
      }
    });
    
    console.log('✨ Remark plugin finished processing');
  };
}

function escapeHtml(text) {
  const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  
  return text.replace(/[&<>"']/g, (match) => htmlEscapes[match] || match);
}

export default remarkCodeTabs;
