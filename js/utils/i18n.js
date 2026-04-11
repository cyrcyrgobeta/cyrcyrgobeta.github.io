/**
 * Scratch S2 编辑器 - 国际化系统
 */

class I18n {
    constructor() {
        this.currentLanguage = 'zh-CN';
        this.translations = {
            'zh-CN': {
                // 通用
                'app.name': 'Scratch S2',
                'app.title': 'Scratch 图形化编程',
                
                // 菜单
                'menu.file': '文件',
                'menu.edit': '编辑',
                'menu.view': '视图',
                'menu.tools': '工具',
                'menu.help': '帮助',
                
                // 文件菜单
                'file.new': '新建项目',
                'file.open': '从电脑中打开',
                'file.save': '保存到电脑',
                'file.exportSb3': '导出为 .sb3',
                'file.exportJson': '导出为 JSON',
                'file.importSb3': '导入 .sb3 文件',
                
                // 编辑菜单
                'edit.undo': '撤销',
                'edit.redo': '重做',
                'edit.cut': '剪切',
                'edit.copy': '复制',
                'edit.paste': '粘贴',
                'edit.deleteAll': '删除所有',
                'edit.cleanUp': '整理积木',
                
                // 视图菜单
                'view.zoomIn': '放大',
                'view.zoomOut': '缩小',
                'view.resetZoom': '重置缩放',
                'view.smallStage': '小舞台',
                'view.largeStage': '大舞台',
                'view.fullscreen': '全屏模式',
                
                // 按钮
                'btn.run': '运行',
                'btn.stop': '停止',
                'btn.clear': '清空',
                'btn.save': '保存',
                
                // 面板标题
                'panel.code': '代码',
                'panel.costumes': '造型',
                'panel.sounds': '声音',
                'panel.sprites': '角色',
                'panel.backdrops': '背景',
                'panel.properties': '属性',
                
                // 状态
                'status.ready': '就绪',
                'status.running': '运行中...',
                'status.stopped': '已停止',
                'status.saving': '保存中...',
                'status.loading': '加载中...',
                
                // 消息
                'message.saved': '项目已保存',
                'message.loaded': '项目已加载',
                'message.cleared': '工作区已清空',
                'message.noBlocks': '从左侧拖拽积木到这里开始编程',
                
                // 确认
                'confirm.newProject': '当前项目未保存，是否继续新建？',
                'confirm.clearWorkspace': '确定要清空工作区吗？',
                'confirm.deleteSprite': '确定要删除这个角色吗？',
                
                // 错误
                'error.loadFailed': '加载失败',
                'error.saveFailed': '保存失败',
                'error.invalidFile': '无效的文件格式',
                
                // 积木分类
                'category.motion': '运动',
                'category.looks': '外观',
                'category.sound': '声音',
                'category.events': '事件',
                'category.control': '控制',
                'category.sensing': '侦测',
                'category.operators': '运算',
                'category.variables': '变量',
                'category.myblocks': '自制积木',
                
                // 角色属性
                'sprite.name': '名称',
                'sprite.x': 'x坐标',
                'sprite.y': 'y坐标',
                'sprite.size': '大小',
                'sprite.direction': '方向',
                'sprite.visible': '显示',
                'sprite.hidden': '隐藏'
            },
            
            'en': {
                // General
                'app.name': 'Scratch S2',
                'app.title': 'Scratch Graphical Programming',
                
                // Menu
                'menu.file': 'File',
                'menu.edit': 'Edit',
                'menu.view': 'View',
                'menu.tools': 'Tools',
                'menu.help': 'Help',
                
                // File menu
                'file.new': 'New Project',
                'file.open': 'Open from Computer',
                'file.save': 'Save to Computer',
                'file.exportSb3': 'Export as .sb3',
                'file.exportJson': 'Export as JSON',
                'file.importSb3': 'Import .sb3 File',
                
                // Buttons
                'btn.run': 'Run',
                'btn.stop': 'Stop',
                'btn.clear': 'Clear',
                'btn.save': 'Save',
                
                // Panels
                'panel.code': 'Code',
                'panel.costumes': 'Costumes',
                'panel.sounds': 'Sounds',
                'panel.sprites': 'Sprites',
                'panel.backdrops': 'Backdrops',
                'panel.properties': 'Properties',
                
                // Status
                'status.ready': 'Ready',
                'status.running': 'Running...',
                'status.stopped': 'Stopped',
                
                // Categories
                'category.motion': 'Motion',
                'category.looks': 'Looks',
                'category.sound': 'Sound',
                'category.events': 'Events',
                'category.control': 'Control',
                'category.sensing': 'Sensing',
                'category.operators': 'Operators',
                'category.variables': 'Variables',
                'category.myblocks': 'My Blocks'
            }
        };
    }
    
    /**
     * 获取翻译文本
     */
    t(key, ...args) {
        const lang = this.translations[this.currentLanguage];
        let text = lang ? lang[key] : key;
        
        if (!text) {
            // 回退到中文
            text = this.translations['zh-CN'][key] || key;
        }
        
        // 替换参数
        args.forEach((arg, index) => {
            text = text.replace(`{${index}}`, arg);
        });
        
        return text;
    }
    
    /**
     * 设置语言
     */
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            this._updateUI();
            return true;
        }
        return false;
    }
    
    /**
     * 获取当前语言
     */
    getLanguage() {
        return this.currentLanguage;
    }
    
    /**
     * 获取支持的语言
     */
    getSupportedLanguages() {
        return Object.keys(this.translations);
    }
    
    /**
     * 更新UI文本
     */
    _updateUI() {
        // 更新所有带有 data-i18n 属性的元素
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.t(key);
        });
        
        // 更新所有带有 data-i18n-title 属性的元素
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            el.title = this.t(key);
        });
        
        // 更新所有带有 data-i18n-placeholder 属性的元素
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.t(key);
        });
    }
    
    /**
     * 添加翻译
     */
    addTranslations(lang, translations) {
        if (!this.translations[lang]) {
            this.translations[lang] = {};
        }
        Object.assign(this.translations[lang], translations);
    }
}

// 创建全局实例
window.i18n = new I18n();

// 快捷函数
window.t = (key, ...args) => window.i18n.t(key, ...args);

console.log('国际化系统加载完成');
