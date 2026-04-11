/**
 * Scratch S2 编辑器 - SB3文件解析器
 */

class SB3Parser {
    constructor() {
        this.zip = null;
        this.projectData = null;
    }
    
    /**
     * 解析SB3文件
     */
    async parse(arrayBuffer) {
        try {
            this.zip = await JSZip.loadAsync(arrayBuffer);
            
            // 读取project.json
            const projectJson = await this.zip.file('project.json').async('string');
            this.projectData = JSON.parse(projectJson);
            
            return this.projectData;
        } catch (e) {
            console.error('解析SB3失败:', e);
            return null;
        }
    }
    
    /**
     * 获取目标列表
     */
    getTargets() {
        return this.projectData?.targets || [];
    }
    
    /**
     * 加载资源
     */
    async loadAssets() {
        const assets = {};
        
        if (!this.zip) return assets;
        
        const files = Object.keys(this.zip.files);
        for (const file of files) {
            if (file.endsWith('.png') || file.endsWith('.svg')) {
                const data = await this.zip.file(file).async('base64');
                assets[file] = 'data:image/png;base64,' + data;
            } else if (file.endsWith('.mp3') || file.endsWith('.wav')) {
                const data = await this.zip.file(file).async('base64');
                assets[file] = 'data:audio/mp3;base64,' + data;
            }
        }
        
        return assets;
    }
}

window.sb3Parser = new SB3Parser();
console.log('SB3解析器加载完成');
