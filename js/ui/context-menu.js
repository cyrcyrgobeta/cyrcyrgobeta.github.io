/**
 * Scratch S2 编辑器 - UI组件：右键菜单
 */

class ContextMenu {
    constructor() {
        this.menu = document.getElementById('context-menu');
        this._init();
    }
    
    _init() {
        document.addEventListener('contextmenu', (e) => {
            const target = e.target.closest('.workspace-block');
            if (target) {
                e.preventDefault();
                this.show(e.clientX, e.clientY, target);
            }
        });
        
        document.addEventListener('click', () => this.hide());
    }
    
    show(x, y, target) {
        if (!this.menu) return;
        
        this.menu.innerHTML = `
            <div class="context-menu-item" data-action="copy"><i class="fas fa-copy"></i> 复制</div>
            <div class="context-menu-item" data-action="cut"><i class="fas fa-cut"></i> 剪切</div>
            <div class="context-menu-divider"></div>
            <div class="context-menu-item" data-action="delete"><i class="fas fa-trash"></i> 删除</div>
        `;
        
        this.menu.style.left = x + 'px';
        this.menu.style.top = y + 'px';
        this.menu.classList.add('active');
    }
    
    hide() {
        if (this.menu) {
            this.menu.classList.remove('active');
        }
    }
}

window.contextMenu = new ContextMenu();
console.log('右键菜单组件加载完成');
