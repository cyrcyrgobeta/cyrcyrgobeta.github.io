/**
 * Scratch S2 编辑器 - 项目管理器
 */

class ProjectManager {
    constructor() {
        this.currentProject = null;
    }
    
    /**
     * 新建项目
     */
    newProject() {
        this.currentProject = {
            name: '未命名项目',
            targets: [],
            monitors: [],
            extensions: [],
            meta: {
                semver: '3.0.0',
                vm: '0.2.0',
                agent: 'Scratch S2/1.0.0'
            }
        };
        return this.currentProject;
    }
    
    /**
     * 获取当前项目
     */
    getCurrentProject() {
        return this.currentProject;
    }
    
    /**
     * 设置当前项目
     */
    setCurrentProject(project) {
        this.currentProject = project;
    }
    
    /**
     * 保存项目
     */
    async save() {
        if (!this.currentProject) return false;
        
        const json = JSON.stringify(this.currentProject, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentProject.name}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        return true;
    }
    
    /**
     * 打开项目文件
     */
    async open(file) {
        try {
            const text = await file.text();
            this.currentProject = JSON.parse(text);
            return this.currentProject;
        } catch (e) {
            console.error('打开项目失败:', e);
            return null;
        }
    }
}

window.projectManager = new ProjectManager();
console.log('项目管理器加载完成');
