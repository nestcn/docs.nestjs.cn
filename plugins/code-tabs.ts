/**
 * RSPress plugin for handling NestJS documentation code tabs
 * Handles @@filename() and @@switch syntax
 */

export interface CodeTabsOptions {
  // Configuration options can be added here
}

export function codeTabsPlugin(options: CodeTabsOptions = {}) {
  return {
    name: 'code-tabs',
    
    // Transform markdown before processing
    beforeParse(content: string) {
      // Process @@filename() and @@switch syntax
      return content.replace(
        /```typescript\n@@filename\(([^)]*)\)\n([\s\S]*?)@@switch\n([\s\S]*?)```/g,
        (match, filename, tsCode, jsCode) => {
          const cleanFilename = filename || 'index';
          return `
<div class="code-tabs">
  <div class="tab-buttons">
    <button class="tab-btn active" data-lang="ts">${cleanFilename}.ts</button>
    <button class="tab-btn" data-lang="js">${cleanFilename}.js</button>
  </div>
  <div class="tab-content">
    <div class="tab-pane active" data-lang="ts">

\`\`\`typescript
${tsCode.trim()}
\`\`\`

    </div>
    <div class="tab-pane" data-lang="js">

\`\`\`javascript
${jsCode.trim()}
\`\`\`

    </div>
  </div>
</div>
          `.trim();
        }
      );
    },

    // Add custom styles
    addStyles() {
      return `
        .code-tabs {
          margin: 1rem 0;
          border: 1px solid var(--rp-c-border);
          border-radius: 8px;
          overflow: hidden;
        }
        
        .tab-buttons {
          display: flex;
          background: var(--rp-c-bg-soft);
          border-bottom: 1px solid var(--rp-c-border);
        }
        
        .tab-btn {
          padding: 0.5rem 1rem;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--rp-c-text-2);
          transition: all 0.2s;
        }
        
        .tab-btn:hover {
          color: var(--rp-c-text-1);
          background: var(--rp-c-bg-mute);
        }
        
        .tab-btn.active {
          color: var(--rp-c-brand);
          background: var(--rp-c-bg);
          border-bottom: 2px solid var(--rp-c-brand);
        }
        
        .tab-content {
          position: relative;
        }
        
        .tab-pane {
          display: none;
        }
        
        .tab-pane.active {
          display: block;
        }
        
        .tab-pane pre {
          margin: 0 !important;
          border-radius: 0 !important;
          border: none !important;
        }
      `;
    },

    // Add client-side JavaScript for tab switching
    addScripts() {
      return `
        document.addEventListener('DOMContentLoaded', function() {
          // Handle tab switching
          document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
              const lang = this.dataset.lang;
              const container = this.closest('.code-tabs');
              
              // Update button states
              container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
              this.classList.add('active');
              
              // Update content visibility
              container.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active');
                if (pane.dataset.lang === lang) {
                  pane.classList.add('active');
                }
              });
            });
          });
        });
      `;
    }
  };
}
