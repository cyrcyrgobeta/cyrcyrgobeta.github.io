/**
 * Scratch S2 编辑器 - SB3文件导出器
 */

class SB3Exporter {
    constructor() {
        this.zip = new JSZip();
    }
    
    /**
     * 导出为SB3
     */
    async export(project) {
        this.zip = new JSZip();
        
        // 创建project.json
        const projectJson = JSON.stringify(project, null, 2);
        this.zip.file('project.json', projectJson);
        
        // 生成blob
        const blob = await this.zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE'
        });
        
        return blob;
    }
    
    /**
     * 下载SB3文件
     */
    async download(project, filename = 'project.sb3') {
        const blob = await this.export(project);
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        
        URL.revokeObjectURL(url);
    }
}

window.sb3Exporter = new SB3Exporter();
console.log('SB3导出器加载完成');
