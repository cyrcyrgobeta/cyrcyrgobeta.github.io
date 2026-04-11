/**
 * Scratch S2 编辑器 - 主应用逻辑
 * 初始化和协调所有组件
 */

class ScratchApp {
    constructor() {
        // 版本信息
        this.version = '1.0.0';
        this.buildDate = '2026-04-11';
        
        // 核心组件
        this.runtime = null;
        this.renderer = null;
        
        // UI元素
        this.elements = {};
        
        // 当前项目
        this.project = {
            name: '未命名项目',
            modified: false
        };
        
        // 撤销/重做历史
        this.history = [];
        this.historyIndex = -1;
        
        // 剪贴板
        this.clipboard = null;
        
        // 当前选中的角色
        this.activeSprite = null;
        
        // 缩放级别
        this.zoom = 1;
        
        // 初始化状态
        this.initialized = false;
    }
    
    /**
     * 初始化应用
     */
    async init() {
        console.log('Scratch S2 初始化中...');
        
        try {
            // 获取UI元素
            this._initElements();
            
            // 初始化运行时
            this._initRuntime();
            
            // 初始化渲染器
            this._initRenderer();
            
            // 初始化积木系统
            this._initBlocksSystem();
            
            // 初始化事件监听
            this._initEventListeners();
            
            // 初始化快捷键
            this._initShortcuts();
            
            // 创建默认角色
            this._createDefaultSprite();
            
            // 隐藏加载遮罩
            this._hideLoading();
            
            this.initialized = true;
            this._updateStatus('就绪');
            
            console.log('Scratch S2 初始化完成');
            
        } catch (error) {
            console.error('初始化失败:', error);
            this._showError('初始化失败: ' + error.message);
        }
    }
    
    /**
     * 初始化UI元素引用
     */
    _initElements() {
        this.elements = {
            // 菜单
            menuBar: document.getElementById('menu-bar'),
            projectNameInput: document.getElementById('project-name-input'),
            
            // 积木面板
            blocksPanel: document.getElementById('blocks-panel'),
            blocksContent: document.getElementById('blocks-content'),
            blocksTabs: document.getElementById('blocks-tabs'),
            blockSearchInput: document.getElementById('block-search-input'),
            
            // 工作区
            workspacePanel: document.getElementById('workspace-panel'),
            workspaceCanvas: document.getElementById('workspace-canvas'),
            workspaceEmpty: document.getElementById('workspace-empty'),
            workspaceTabs: document.getElementById('workspace-tabs'),
            
            // 舞台
            stageCanvas: document.getElementById('stage-canvas'),
            stageViewport: document.getElementById('stage-viewport'),
            stageCoordinates: document.getElementById('stage-coordinates'),
            monitorsLayer: document.getElementById('monitors-layer'),
            speechLayer: document.getElementById('speech-layer'),
            
            // 角色面板
            spritesList: document.getElementById('sprites-list'),
            spriteProperties: document.getElementById('sprite-properties'),
            spriteName: document.getElementById('sprite-name'),
            spriteX: document.getElementById('sprite-x'),
            spriteY: document.getElementById('sprite-y'),
            spriteSize: document.getElementById('sprite-size'),
            spriteDirection: document.getElementById('sprite-direction'),
            spriteVisible: document.getElementById('sprite-visible'),
            
            // 背景面板
            backdropsList: document.getElementById('backdrops-list'),
            
            // 按钮
            btnRun: document.getElementById('btn-run'),
            btnStop: document.getElementById('btn-stop'),
            btnGreenFlag: document.getElementById('btn-green-flag'),
            btnStopAll: document.getElementById('btn-stop-all'),
            btnUndo: document.getElementById('btn-undo'),
            btnRedo: document.getElementById('btn-redo'),
            btnClear: document.getElementById('btn-clear'),
            btnClean: document.getElementById('btn-clean'),
            btnZoomIn: document.getElementById('btn-zoom-in'),
            btnZoomOut: document.getElementById('btn-zoom-out'),
            zoomLevel: document.getElementById('zoom-level'),
            
            // 状态栏
            statusMessage: document.getElementById('status-message'),
            statusFps: document.getElementById('status-fps'),
            statusSprites: document.getElementById('status-sprites'),
            
            // 其他
            loadingOverlay: document.getElementById('loading-overlay'),
            toastContainer: document.getElementById('toast-container'),
            modalContainer: document.getElementById('modal-container'),
            contextMenu: document.getElementById('context-menu')
        };
    }
    
    /**
     * 初始化运行时
     */
    _initRuntime() {
        this.runtime = new RuntimeEngine();
        
        // 监听运行时事件
        this.runtime.on('greenFlagStarted', () => {
            this._updateStatus('运行中...');
        });
        
        this.runtime.on('stopped', () => {
            this._updateStatus('已停止');
        });
        
        this.runtime.on('spriteAdded', (sprite) => {
            this._updateSpritesList();
        });
        
        this.runtime.on('spriteRemoved', (sprite) => {
            this._updateSpritesList();
        });
    }
    
    /**
     * 初始化渲染器
     */
    _initRenderer() {
        const canvas = this.elements.stageCanvas;
        this.renderer = new StageRenderer(canvas);
        this.renderer.start();
        
        // 鼠标位置跟踪
        this.elements.stageViewport.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = Math.round((e.clientX - rect.left - canvas.width / 2));
            const y = Math.round(-(e.clientY - rect.top - canvas.height / 2));
            this.elements.stageCoordinates.textContent = `x: ${x}, y: ${y}`;
            
            this.runtime.mouseX = x;
            this.runtime.mouseY = y;
        });
        
        this.elements.stageViewport.addEventListener('click', (e) => {
            // 舞台点击事件
            this.runtime._emit('stageClicked');
        });
    }
    
    /**
     * 初始化积木系统
     */
    _initBlocksSystem() {
        const blocksContent = this.elements.blocksContent;
        blocksContent.innerHTML = '';
        
        // 获取积木定义
        const categories = BLOCKS_DEFINITION || {};
        
        for (const [categoryId, category] of Object.entries(categories)) {
            // 创建分类标题
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'block-category';
            
            const headerDiv = document.createElement('div');
            headerDiv.className = `category-header category-${categoryId}`;
            headerDiv.innerHTML = `
                <i class="fas fa-chevron-right"></i>
                <span>${category.name}</span>
            `;
            
            // 创建积木列表
            const listDiv = document.createElement('div');
            listDiv.className = 'blocks-list';
            
            // 添加积木
            if (category.blocks) {
                for (const block of category.blocks) {
                    const blockDiv = document.createElement('div');
                    blockDiv.className = `block-item block-${categoryId}`;
                    blockDiv.textContent = this._formatBlockText(block.text);
                    blockDiv.draggable = true;
                    blockDiv.dataset.category = categoryId;
                    blockDiv.dataset.opcode = block.opcode;
                    blockDiv.dataset.type = block.type || 'stack';
                    
                    // 拖拽开始
                    blockDiv.addEventListener('dragstart', (e) => {
                        e.dataTransfer.setData('text/plain', JSON.stringify({
                            category: categoryId,
                            opcode: block.opcode,
                            text: block.text,
                            type: block.type || 'stack',
                            defaults: block.defaults || {}
                        }));
                        e.dataTransfer.effectAllowed = 'copy';
                        blockDiv.style.opacity = '0.5';
                    });
                    
                    // 拖拽结束
                    blockDiv.addEventListener('dragend', () => {
                        blockDiv.style.opacity = '1';
                    });
                    
                    listDiv.appendChild(blockDiv);
                }
            }
            
            // 分类展开/收起
            headerDiv.addEventListener('click', () => {
                listDiv.classList.toggle('expanded');
                headerDiv.classList.toggle('expanded');
                const icon = headerDiv.querySelector('i');
                icon.className = listDiv.classList.contains('expanded') 
                    ? 'fas fa-chevron-down' 
                    : 'fas fa-chevron-right';
            });
            
            categoryDiv.appendChild(headerDiv);
            categoryDiv.appendChild(listDiv);
            blocksContent.appendChild(categoryDiv);
        }
        
        // 工作区拖放
        this._initWorkspaceDrop();
    }
    
    /**
     * 格式化积木文本
     */
    _formatBlockText(text) {
        // 将 {param} 替换为输入框占位符
        return text.replace(/\{(\w+)\}/g, '□');
    }
    
    /**
     * 初始化工作区拖放
     */
    _initWorkspaceDrop() {
        const workspace = this.elements.workspaceCanvas;
        
        workspace.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            workspace.classList.add('drag-over');
        });
        
        workspace.addEventListener('dragleave', () => {
            workspace.classList.remove('drag-over');
        });
        
        workspace.addEventListener('drop', (e) => {
            e.preventDefault();
            workspace.classList.remove('drag-over');
            
            const data = e.dataTransfer.getData('text/plain');
            if (data) {
                try {
                    const blockData = JSON.parse(data);
                    this._addBlockToWorkspace(blockData, e);
                } catch (err) {
                    console.error('解析积木数据失败:', err);
                }
            }
        });
    }
    
    /**
     * 添加积木到工作区
     */
    _addBlockToWorkspace(blockData, event) {
        const workspace = this.elements.workspaceCanvas;
        
        // 移除空状态提示
        if (this.elements.workspaceEmpty) {
            this.elements.workspaceEmpty.style.display = 'none';
        }
        
        // 计算位置
        const rect = workspace.getBoundingClientRect();
        const x = event.clientX - rect.left - 80;
        const y = event.clientY - rect.top - 20;
        
        // 创建积木元素
        const blockDiv = document.createElement('div');
        blockDiv.className = `workspace-block block-${blockData.category}`;
        blockDiv.textContent = this._formatBlockText(blockData.text);
        blockDiv.style.left = `${x}px`;
        blockDiv.style.top = `${y}px`;
        blockDiv.dataset.opcode = blockData.opcode;
        blockDiv.dataset.type = blockData.type;
        blockDiv.dataset.blockId = 'block_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // 添加删除按钮
        const deleteBtn = document.createElement('span');
        deleteBtn.className = 'delete-block';
        deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            blockDiv.remove();
            this._checkWorkspaceEmpty();
            this.project.modified = true;
        });
        blockDiv.appendChild(deleteBtn);
        
        // 添加拖拽功能
        this._makeBlockDraggable(blockDiv);
        
        workspace.appendChild(blockDiv);
        
        // 标记项目已修改
        this.project.modified = true;
        
        // 记录历史
        this._pushHistory();
    }
    
    /**
     * 使积木可拖拽
     */
    _makeBlockDraggable(blockDiv) {
        let isDragging = false;
        let startX, startY;
        
        blockDiv.addEventListener('mousedown', (e) => {
            if (e.target.closest('.delete-block')) return;
            
            isDragging = true;
            startX = e.clientX - parseFloat(blockDiv.style.left);
            startY = e.clientY - parseFloat(blockDiv.style.top);
            
            blockDiv.classList.add('dragging');
            blockDiv.style.zIndex = '1000';
            
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const x = e.clientX - startX;
            const y = e.clientY - startY;
            
            blockDiv.style.left = `${x}px`;
            blockDiv.style.top = `${y}px`;
        });
        
        document.addEventListener('mouseup', () => {
            if (!isDragging) return;
            
            isDragging = false;
            blockDiv.classList.remove('dragging');
            blockDiv.style.zIndex = '';
        });
    }
    
    /**
     * 检查工作区是否为空
     */
    _checkWorkspaceEmpty() {
        const blocks = this.elements.workspaceCanvas.querySelectorAll('.workspace-block');
        if (blocks.length === 0 && this.elements.workspaceEmpty) {
            this.elements.workspaceEmpty.style.display = 'flex';
        }
    }
    
    /**
     * 初始化事件监听
     */
    _initEventListeners() {
        // 运行按钮
        this.elements.btnRun?.addEventListener('click', () => this.runProject());
        this.elements.btnGreenFlag?.addEventListener('click', () => this.runProject());
        
        // 停止按钮
        this.elements.btnStop?.addEventListener('click', () => this.stopProject());
        this.elements.btnStopAll?.addEventListener('click', () => this.stopProject());
        
        // 撤销/重做
        this.elements.btnUndo?.addEventListener('click', () => this.undo());
        this.elements.btnRedo?.addEventListener('click', () => this.redo());
        
        // 清空
        this.elements.btnClear?.addEventListener('click', () => this.clearWorkspace());
        
        // 缩放
        this.elements.btnZoomIn?.addEventListener('click', () => this.zoomIn());
        this.elements.btnZoomOut?.addEventListener('click', () => this.zoomOut());
        
        // 项目名称
        this.elements.projectNameInput?.addEventListener('change', (e) => {
            this.project.name = e.target.value;
            this.project.modified = true;
        });
        
        // 角色属性
        this.elements.spriteX?.addEventListener('change', () => this._updateSpriteFromProperties());
        this.elements.spriteY?.addEventListener('change', () => this._updateSpriteFromProperties());
        this.elements.spriteSize?.addEventListener('change', () => this._updateSpriteFromProperties());
        this.elements.spriteDirection?.addEventListener('change', () => this._updateSpriteFromProperties());
        
        // 菜单项
        this._initMenuListeners();
    }
    
    /**
     * 初始化菜单监听
     */
    _initMenuListeners() {
        // 文件菜单
        document.querySelector('[data-action="new-project"]')?.addEventListener('click', () => this.newProject());
        document.querySelector('[data-action="save-project"]')?.addEventListener('click', () => this.saveProject());
        document.querySelector('[data-action="export-sb3"]')?.addEventListener('click', () => this.exportSB3());
        
        // 编辑菜单
        document.querySelector('[data-action="undo"]')?.addEventListener('click', () => this.undo());
        document.querySelector('[data-action="redo"]')?.addEventListener('click', () => this.redo());
        
        // 帮助菜单
        document.querySelector('[data-action="disclaimer"]')?.addEventListener('click', () => this.showDisclaimer());
        document.querySelector('[data-action="about"]')?.addEventListener('click', () => this.showAbout());
    }
    
    /**
     * 初始化快捷键
     */
    _initShortcuts() {
        document.addEventListener('keydown', (e) => {
            const ctrl = e.ctrlKey || e.metaKey;
            
            // Ctrl+S 保存
            if (ctrl && e.key === 's') {
                e.preventDefault();
                this.saveProject();
            }
            // Ctrl+Z 撤销
            else if (ctrl && e.key === 'z') {
                e.preventDefault();
                this.undo();
            }
            // Ctrl+Y 重做
            else if (ctrl && e.key === 'y') {
                e.preventDefault();
                this.redo();
            }
            // Ctrl+R 运行
            else if (ctrl && e.key === 'r') {
                e.preventDefault();
                this.runProject();
            }
            // Delete 删除
            else if (e.key === 'Delete') {
                // 删除选中的积木
            }
        });
    }
    
    /**
     * 创建默认角色
     */
    _createDefaultSprite() {
        const sprite = new Sprite('角色1', {
            x: 0,
            y: 0,
            direction: 90,
            size: 100,
            visible: true
        });
        sprite.renderer = this.renderer;
        sprite._runtime = this.runtime;
        
        this.runtime.addSprite(sprite);
        this.renderer.setSprites(this.runtime.getAllSprites());
        
        this.activeSprite = sprite;
        this._updateSpritesList();
        this._updateSpriteProperties();
    }
    
    /**
     * 更新角色列表
     */
    _updateSpritesList() {
        const list = this.elements.spritesList;
        list.innerHTML = '';
        
        for (const sprite of this.runtime.getAllSprites()) {
            const item = document.createElement('div');
            item.className = 'sprite-item' + (sprite === this.activeSprite ? ' active' : '');
            item.innerHTML = `
                <div class="sprite-thumbnail">
                    <i class="fas fa-cat"></i>
                </div>
                <div class="sprite-info">
                    <div class="sprite-name">${sprite.name}</div>
                    <div class="sprite-coords">x: ${Math.round(sprite.x)}, y: ${Math.round(sprite.y)}</div>
                </div>
            `;
            
            item.addEventListener('click', () => {
                this.activeSprite = sprite;
                this._updateSpritesList();
                this._updateSpriteProperties();
            });
            
            list.appendChild(item);
        }
        
        // 更新状态栏
        this.elements.statusSprites.textContent = `角色: ${this.runtime.getAllSprites().length}`;
    }
    
    /**
     * 更新角色属性面板
     */
    _updateSpriteProperties() {
        if (!this.activeSprite) return;
        
        const s = this.activeSprite;
        this.elements.spriteName.value = s.name;
        this.elements.spriteX.value = Math.round(s.x);
        this.elements.spriteY.value = Math.round(s.y);
        this.elements.spriteSize.value = Math.round(s.size);
        this.elements.spriteDirection.value = Math.round(s.direction);
        this.elements.spriteVisible.value = s.visible.toString();
    }
    
    /**
     * 从属性面板更新角色
     */
    _updateSpriteFromProperties() {
        if (!this.activeSprite) return;
        
        this.activeSprite.name = this.elements.spriteName.value;
        this.activeSprite.x = parseFloat(this.elements.spriteX.value) || 0;
        this.activeSprite.y = parseFloat(this.elements.spriteY.value) || 0;
        this.activeSprite.size = parseFloat(this.elements.spriteSize.value) || 100;
        this.activeSprite.direction = parseFloat(this.elements.spriteDirection.value) || 90;
        this.activeSprite.visible = this.elements.spriteVisible.value === 'true';
        
        this.renderer.needsRedraw = true;
        this._updateSpritesList();
    }
    
    // ==========================================
    // 项目操作
    // ==========================================
    
    /**
     * 运行项目
     */
    runProject() {
        console.log('运行项目');
        this.runtime.startGreenFlag();
        this.runtime.start();
    }
    
    /**
     * 停止项目
     */
    stopProject() {
        console.log('停止项目');
        this.runtime.stopAll();
    }
    
    /**
     * 新建项目
     */
    newProject() {
        if (this.project.modified) {
            if (!confirm('当前项目未保存，是否继续新建？')) {
                return;
            }
        }
        
        // 清空工作区
        this.clearWorkspace();
        
        // 重置角色
        this.runtime.sprites = [];
        this._createDefaultSprite();
        
        // 重置项目信息
        this.project.name = '未命名项目';
        this.project.modified = false;
        this.elements.projectNameInput.value = this.project.name;
        
        // 清空历史
        this.history = [];
        this.historyIndex = -1;
        
        this._updateStatus('新建项目');
    }
    
    /**
     * 保存项目
     */
    saveProject() {
        console.log('保存项目');
        // 简化实现：导出JSON
        const data = this._serializeProject();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.project.name}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.project.modified = false;
        
        this._showToast('项目已保存', 'success');
    }
    
    /**
     * 导出SB3
     */
    exportSB3() {
        console.log('导出SB3');
        this._showToast('SB3导出功能开发中...', 'info');
    }
    
    /**
     * 序列化项目
     */
    _serializeProject() {
        return {
            name: this.project.name,
            targets: this.runtime.getAllSprites().map(s => s.toJSON()),
            monitors: [],
            extensions: [],
            meta: {
                semver: '3.0.0',
                vm: '0.2.0',
                agent: 'Scratch S2/' + this.version
            }
        };
    }
    
    /**
     * 清空工作区
     */
    clearWorkspace() {
        const blocks = this.elements.workspaceCanvas.querySelectorAll('.workspace-block');
        blocks.forEach(b => b.remove());
        this._checkWorkspaceEmpty();
        this.project.modified = true;
    }
    
    // ==========================================
    // 撤销/重做
    // ==========================================
    
    /**
     * 撤销
     */
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this._restoreHistory();
        }
    }
    
    /**
     * 重做
     */
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this._restoreHistory();
        }
    }
    
    /**
     * 记录历史
     */
    _pushHistory() {
        // 简化实现
        const state = this._serializeProject();
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(state);
        this.historyIndex = this.history.length - 1;
        
        // 限制历史长度
        if (this.history.length > 50) {
            this.history.shift();
            this.historyIndex--;
        }
    }
    
    /**
     * 恢复历史
     */
    _restoreHistory() {
        // 简化实现
    }
    
    // ==========================================
    // 缩放
    // ==========================================
    
    /**
     * 放大
     */
    zoomIn() {
        this.zoom = Math.min(3, this.zoom + 0.1);
        this._updateZoom();
    }
    
    /**
     * 缩小
     */
    zoomOut() {
        this.zoom = Math.max(0.5, this.zoom - 0.1);
        this._updateZoom();
    }
    
    /**
     * 更新缩放
     */
    _updateZoom() {
        this.elements.zoomLevel.textContent = Math.round(this.zoom * 100) + '%';
        this.elements.workspaceCanvas.style.transform = `scale(${this.zoom})`;
    }
    
    // ==========================================
    // UI辅助方法
    // ==========================================
    
    /**
     * 隐藏加载遮罩
     */
    _hideLoading() {
        setTimeout(() => {
            this.elements.loadingOverlay?.classList.add('hidden');
        }, 500);
    }
    
    /**
     * 更新状态栏
     */
    _updateStatus(message) {
        if (this.elements.statusMessage) {
            this.elements.statusMessage.textContent = message;
        }
    }
    
    /**
     * 显示Toast
     */
    _showToast(message, type = 'info') {
        const container = this.elements.toastContainer;
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('toast-exit');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    /**
     * 显示错误
     */
    _showError(message) {
        this._showToast(message, 'error');
    }
    
    /**
     * 显示免责声明
     */
    showDisclaimer() {
        window.open('disclaimer.html', '_blank');
    }
    
    /**
     * 显示关于
     */
    showAbout() {
        alert(`Scratch S2 图形化编程编辑器\n版本: ${this.version}\n构建日期: ${this.buildDate}\n\n一个从零开始构建的Scratch风格编程环境。`);
    }
}

// 创建全局实例并初始化
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ScratchApp();
    window.app.init();
});

console.log('主应用逻辑加载完成');