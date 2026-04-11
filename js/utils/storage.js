/**
 * Scratch S2 编辑器 - 存储系统
 */

class Storage {
    constructor() {
        this.prefix = 's2_';
        this.isAvailable = this._checkAvailability();
    }
    
    /**
     * 检查localStorage可用性
     */
    _checkAvailability() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * 保存数据
     */
    set(key, value) {
        if (!this.isAvailable) return false;
        
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(this.prefix + key, serialized);
            return true;
        } catch (e) {
            console.error('存储失败:', e);
            return false;
        }
    }
    
    /**
     * 读取数据
     */
    get(key, defaultValue = null) {
        if (!this.isAvailable) return defaultValue;
        
        try {
            const serialized = localStorage.getItem(this.prefix + key);
            if (serialized === null) return defaultValue;
            return JSON.parse(serialized);
        } catch (e) {
            console.error('读取失败:', e);
            return defaultValue;
        }
    }
    
    /**
     * 删除数据
     */
    remove(key) {
        if (!this.isAvailable) return false;
        
        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * 清除所有数据
     */
    clear() {
        if (!this.isAvailable) return false;
        
        try {
            const keys = Object.keys(localStorage).filter(k => k.startsWith(this.prefix));
            keys.forEach(k => localStorage.removeItem(k));
            return true;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * 获取所有键
     */
    keys() {
        if (!this.isAvailable) return [];
        
        return Object.keys(localStorage)
            .filter(k => k.startsWith(this.prefix))
            .map(k => k.slice(this.prefix.length));
    }
    
    /**
     * 获取存储大小
     */
    getSize() {
        if (!this.isAvailable) return 0;
        
        let size = 0;
        for (const key of Object.keys(localStorage)) {
            if (key.startsWith(this.prefix)) {
                size += localStorage.getItem(key).length * 2; // UTF-16
            }
        }
        return size;
    }
    
    /**
     * 保存项目
     */
    saveProject(project) {
        return this.set('project_' + project.id, project);
    }
    
    /**
     * 加载项目
     */
    loadProject(projectId) {
        return this.get('project_' + projectId);
    }
    
    /**
     * 获取项目列表
     */
    getProjectList() {
        return this.keys()
            .filter(k => k.startsWith('project_'))
            .map(k => this.get(k))
            .filter(Boolean);
    }
    
    /**
     * 保存设置
     */
    saveSettings(settings) {
        return this.set('settings', settings);
    }
    
    /**
     * 加载设置
     */
    loadSettings() {
        return this.get('settings', {
            language: 'zh-CN',
            theme: 'light',
            autoSave: true,
            autoSaveInterval: 30000
        });
    }
}

// 创建全局实例
window.storage = new Storage();

console.log('存储系统加载完成');
