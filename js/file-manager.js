/**
 * 蟒蛇 Python在线编译器 - 文件管理器
 */

class FileManager {
    constructor() {
        this.files = new Map();
        this.currentFile = 'main.py';
        this.fileIdCounter = 0;
    }
    
    /**
     * 初始化
     */
    init() {
        // 创建默认文件
        this.createFile('main.py', this._getDefaultContent());
        
        // 更新文件树
        this.updateFileTree();
        
        console.log('📁 文件管理器初始化完成');
    }
    
    /**
     * 创建文件
     */
    createFile(name, content = '') {
        const id = 'file_' + (++this.fileIdCounter);
        
        this.files.set(id, {
            id,
            name,
            content,
            created: Date.now(),
            modified: false
        });
        
        return id;
    }
    
    /**
     * 获取文件
     */
    getFile(id) {
        return this.files.get(id);
    }
    
    /**
     * 获取文件内容
     */
    getFileContent(id) {
        const file = this.files.get(id);
        return file ? file.content : '';
    }
    
    /**
     * 设置文件内容
     */
    setFileContent(id, content) {
        const file = this.files.get(id);
        if (file) {
            file.content = content;
            file.modified = true;
        }
    }
    
    /**
     * 删除文件
     */
    deleteFile(id) {
        if (this.files.size <= 1) {
            return false; // 至少保留一个文件
        }
        
        return this.files.delete(id);
    }
    
    /**
     * 重命名文件
     */
    renameFile(id, newName) {
        const file = this.files.get(id);
        if (file) {
            file.name = newName;
            file.modified = true;
            return true;
        }
        return false;
    }
    
    /**
     * 获取所有文件
     */
    getAllFiles() {
        return Array.from(this.files.values());
    }
    
    /**
     * 设置当前文件
     */
    setCurrentFile(id) {
        this.currentFile = id;
    }
    
    /**
     * 获取当前文件
     */
    getCurrentFile() {
        return this.files.get(this.currentFile);
    }
    
    /**
     * 更新文件树UI
     */
    updateFileTree() {
        const container = document.getElementById('file-tree');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.files.forEach((file, id) => {
            const item = document.createElement('div');
            item.className = 'file-item' + (id === this.currentFile ? ' active' : '');
            item.dataset.fileId = id;
            item.innerHTML = `
                <i class="fab fa-python"></i>
                <span>${file.name}</span>
            `;
            
            item.addEventListener('click', () => {
                this._selectFile(id);
            });
            
            container.appendChild(item);
        });
    }
    
    /**
     * 选择文件
     */
    _selectFile(id) {
        this.currentFile = id;
        this.updateFileTree();
        
        // 通知编辑器
        const file = this.files.get(id);
        if (file && window.editorManager) {
            window.editorManager.setValue(file.content);
        }
    }
    
    /**
     * 打开文件
     */
    async openFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.py,.txt';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const content = await file.text();
            const id = this.createFile(file.name, content);
            this._selectFile(id);
            
            window.app?._showToast(`已打开: ${file.name}`, 'success');
        };
        
        input.click();
    }
    
    /**
     * 保存文件
     */
    saveFile() {
        const file = this.files.get(this.currentFile);
        if (!file) return;
        
        // 从编辑器获取内容
        if (window.editorManager) {
            file.content = window.editorManager.getValue();
        }
        
        file.modified = false;
        
        window.app?._showToast(`已保存: ${file.name}`, 'success');
    }
    
    /**
     * 下载.py文件
     */
    downloadPy() {
        const file = this.files.get(this.currentFile);
        if (!file) return;
        
        // 获取当前内容
        const content = window.editorManager?.getValue() || file.content;
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        
        URL.revokeObjectURL(url);
        
        window.app?._showToast(`已下载: ${file.name}`, 'success');
    }
    
    /**
     * 下载HTML文件
     */
    downloadHtml() {
        const content = window.editorManager?.getValue() || '';
        const fileName = this.files.get(this.currentFile)?.name || 'main.py';
        
        const html = this._generateHtml(fileName, content);
        
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName.replace('.py', '.html');
        a.click();
        
        URL.revokeObjectURL(url);
        
        window.app?._showToast('已导出HTML文件', 'success');
    }
    
    /**
     * 生成HTML文件
     */
    _generateHtml(fileName, code) {
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${fileName}</title>
    <script src="https://cdn.jsdelivr.net/pyodide/v0.28.3/full/pyodide.js"></script>
</head>
<body>
    <pre id="output"></pre>
    <script>
        async function main() {
            const pyodide = await loadPyodide();
            
            // 重定向输出
            pyodide.runPython(\`
                import sys
                from io import StringIO
                _output = StringIO()
                sys.stdout = _output
            \`);
            
            // 运行代码
            ${code.split('\n').map(line => `            pyodide.runPython(\`${line.replace(/`/g, '\\`')}\`);`).join('\n')}
            
            // 获取输出
            const output = pyodide.runPython("_output.getvalue()");
            document.getElementById('output').textContent = output;
        }
        main();
    </script>
</body>
</html>`;
    }
    
    /**
     * 获取默认内容
     */
    _getDefaultContent() {
        return `# 蟒蛇 Python在线编译器
# 编写你的Python代码

print("Hello, Python! 🐍")
`;
    }
}

// 创建全局实例
window.fileManager = new FileManager();

console.log('文件管理器加载完成');
