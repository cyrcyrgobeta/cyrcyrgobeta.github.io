/**
 * 蟒蛇 Python在线编译器 - 国际化
 */

class I18n {
    constructor() {
        this.currentLanguage = 'zh-CN';
        this.translations = {
            'zh-CN': {
                'app.name': '蟒蛇',
                'app.title': 'Python在线编译器',
                
                'menu.file': '文件',
                'menu.edit': '编辑',
                'menu.run': '运行',
                'menu.packages': '包',
                'menu.examples': '示例',
                'menu.help': '帮助',
                
                'file.new': '新建文件',
                'file.open': '打开文件',
                'file.save': '保存文件',
                'file.downloadPy': '下载 .py 文件',
                'file.downloadHtml': '导出为 HTML',
                
                'run.runCode': '运行代码',
                'run.runSelection': '运行选中代码',
                'run.stop': '停止',
                'run.clearConsole': '清空控制台',
                
                'console.title': '控制台',
                'console.output': '输出',
                'console.problems': '问题',
                'console.variables': '变量',
                
                'status.ready': '就绪',
                'status.running': '运行中...',
                'status.stopped': '已停止',
                
                'loading.initPyodide': '正在初始化 Python 运行时...',
                'loading.loadingRuntime': '正在加载Python运行时...',
                'loading.loadingComplete': 'Python运行时加载完成',
                'loading.initComplete': '初始化完成',
                
                'example.hello': 'Hello World',
                'example.calculator': '计算器',
                'example.loop': '循环示例',
                'example.function': '函数示例',
                'example.class': '类示例',
                'example.numpy': 'NumPy 示例',
                'example.matplotlib': 'Matplotlib 示例'
            },
            
            'en': {
                'app.name': 'Python',
                'app.title': 'Python Online Compiler',
                
                'menu.file': 'File',
                'menu.edit': 'Edit',
                'menu.run': 'Run',
                'menu.packages': 'Packages',
                'menu.examples': 'Examples',
                'menu.help': 'Help',
                
                'file.new': 'New File',
                'file.open': 'Open File',
                'file.save': 'Save File',
                'file.downloadPy': 'Download .py File',
                'file.downloadHtml': 'Export as HTML',
                
                'run.runCode': 'Run Code',
                'run.runSelection': 'Run Selection',
                'run.stop': 'Stop',
                'run.clearConsole': 'Clear Console',
                
                'console.title': 'Console',
                'console.output': 'Output',
                'console.problems': 'Problems',
                'console.variables': 'Variables',
                
                'status.ready': 'Ready',
                'status.running': 'Running...',
                'status.stopped': 'Stopped',
                
                'loading.initPyodide': 'Initializing Python runtime...',
                'loading.loadingRuntime': 'Loading Python runtime...',
                'loading.loadingComplete': 'Python runtime loaded',
                'loading.initComplete': 'Initialization complete',
                
                'example.hello': 'Hello World',
                'example.calculator': 'Calculator',
                'example.loop': 'Loop Example',
                'example.function': 'Function Example',
                'example.class': 'Class Example',
                'example.numpy': 'NumPy Example',
                'example.matplotlib': 'Matplotlib Example'
            }
        };
    }
    
    t(key) {
        const lang = this.translations[this.currentLanguage];
        return lang ? (lang[key] || key) : key;
    }
    
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            this._updateUI();
            return true;
        }
        return false;
    }
    
    _updateUI() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.t(key);
        });
    }
}

window.i18n = new I18n();
window.t = (key) => window.i18n.t(key);

console.log('国际化系统加载完成');
