/**
 * 蟒蛇 Python在线编译器 - 主应用
 */

class PythonIDE {
    constructor() {
        this.version = '1.0.0';
        this.isReady = false;
        this.isRunning = false;
    }
    
    /**
     * 初始化应用
     */
    async init() {
        console.log('🐍 蟒蛇 Python在线编译器启动中...');
        
        try {
            // 先初始化Pyodide（最重要的）
            await this._initPyodide();
            
            // 初始化编辑器
            await window.editorManager.init('monaco-editor');
            
            // 初始化文件管理器
            window.fileManager.init();
            
            // 初始化控制台
            window.consoleManager.init('console-output', 'console-input');
            
            // 绑定事件
            this._bindEvents();
            
            // 绑定菜单
            this._bindMenuActions();
            
            // 加载示例代码片段
            this._loadSnippets();
            
            console.log('✅ 蟒蛇 Python编译器初始化完成');
            
        } catch (error) {
            console.error('初始化失败:', error);
            this._showToast('初始化失败: ' + error.message, 'error');
        }
    }
    
    /**
     * 初始化Pyodide
     */
    async _initPyodide() {
        const updateProgress = (status, progress) => {
            const statusEl = document.getElementById('loading-status');
            const progressEl = document.getElementById('progress-bar');
            if (statusEl) statusEl.textContent = status;
            if (progressEl) progressEl.style.width = progress + '%';
        };
        
        try {
            updateProgress('正在加载Python运行时...', 10);
            
            await window.pyodideManager.init(updateProgress);
            
            // 设置Python版本
            const version = await window.pyodideManager.getVersion();
            window.consoleManager.setPythonVersion(version);
            
            // 更新状态
            const statusEl = document.getElementById('python-status');
            if (statusEl) {
                statusEl.innerHTML = '<i class="fas fa-circle" style="color: #28A745;"></i> Python';
            }
            
            // 隐藏加载遮罩
            setTimeout(() => {
                const overlay = document.getElementById('loading-overlay');
                if (overlay) overlay.classList.add('hidden');
            }, 500);
            
            this.isReady = true;
            this._updateStatus('就绪');
            
            this._showToast('Python运行时加载完成', 'success');
            
        } catch (error) {
            console.error('Pyodide初始化失败:', error);
            const statusEl = document.getElementById('loading-status');
            if (statusEl) statusEl.textContent = '加载失败: ' + error.message;
            this._showToast('Python运行时加载失败', 'error');
        }
    }
    
    /**
     * 绑定事件
     */
    _bindEvents() {
        // 运行按钮
        document.getElementById('btn-run')?.addEventListener('click', () => this.runCode());
        document.getElementById('btn-stop')?.addEventListener('click', () => this.stopCode());
        
        // 清空控制台
        document.getElementById('btn-clear-console')?.addEventListener('click', () => {
            window.consoleManager.clear();
        });
        
        // 导出控制台
        document.getElementById('btn-export-console')?.addEventListener('click', () => {
            const content = window.consoleManager.export();
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'console_output.txt';
            a.click();
            URL.revokeObjectURL(url);
        });
        
        // 控制台过滤器
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                window.consoleManager.setFilter(btn.dataset.filter);
            });
        });
        
        // 语言选择
        document.getElementById('language-select')?.addEventListener('change', (e) => {
            window.i18n.setLanguage(e.target.value);
            this._showToast('语言已切换', 'success');
        });
        
        // 侧边栏标签
        document.querySelectorAll('.sidebar-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.sidebar-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.sidebar-panel').forEach(p => p.classList.remove('active'));
                
                tab.classList.add('active');
                document.getElementById('panel-' + tab.dataset.tab)?.classList.add('active');
            });
        });
        
        // 输出面板标签
        document.querySelectorAll('.output-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.output-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.output-view').forEach(v => v.classList.remove('active'));
                
                tab.classList.add('active');
                document.getElementById('view-' + tab.dataset.tab)?.classList.add('active');
            });
        });
        
        // 新建文件按钮
        document.getElementById('btn-new-file')?.addEventListener('click', () => {
            const name = prompt('文件名:', 'untitled.py');
            if (name) {
                window.fileManager.createFile(name);
                window.fileManager.updateFileTree();
            }
        });
        
        // 快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 's':
                        e.preventDefault();
                        this.saveFile();
                        break;
                    case 'o':
                        e.preventDefault();
                        window.fileManager.openFile();
                        break;
                    case 'n':
                        e.preventDefault();
                        document.getElementById('btn-new-file')?.click();
                        break;
                }
            }
            
            if (e.key === 'F5') {
                e.preventDefault();
                if (e.shiftKey) {
                    this.runSelection();
                } else {
                    this.runCode();
                }
            }
        });
    }
    
    /**
     * 绑定菜单动作
     */
    _bindMenuActions() {
        // 文件菜单
        this._bindAction('new-file', () => document.getElementById('btn-new-file')?.click());
        this._bindAction('open-file', () => window.fileManager.openFile());
        this._bindAction('save-file', () => this.saveFile());
        this._bindAction('download-py', () => window.fileManager.downloadPy());
        this._bindAction('download-html', () => window.fileManager.downloadHtml());
        
        // 编辑菜单
        this._bindAction('undo', () => window.editorManager.undo());
        this._bindAction('redo', () => window.editorManager.redo());
        this._bindAction('format-code', () => window.editorManager.formatCode());
        this._bindAction('comment-toggle', () => window.editorManager.toggleComment());
        
        // 运行菜单
        this._bindAction('run-code', () => this.runCode());
        this._bindAction('run-selection', () => this.runSelection());
        this._bindAction('stop', () => this.stopCode());
        this._bindAction('clear-console', () => window.consoleManager.clear());
        
        // 包菜单
        this._bindAction('install-package', () => this._showPackageDialog());
        this._bindAction('list-packages', () => this._showInstalledPackages());
        this._bindAction('install-numpy', () => this._installPackage('numpy'));
        this._bindAction('install-pandas', () => this._installPackage('pandas'));
        this._bindAction('install-matplotlib', () => this._installPackage('matplotlib'));
        
        // 示例菜单
        this._bindAction('example-hello', () => this._loadExample('hello'));
        this._bindAction('example-calculator', () => this._loadExample('calculator'));
        this._bindAction('example-loop', () => this._loadExample('loop'));
        this._bindAction('example-function', () => this._loadExample('function'));
        this._bindAction('example-class', () => this._loadExample('class'));
        this._bindAction('example-numpy', () => this._loadExample('numpy'));
        this._bindAction('example-matplotlib', () => this._loadExample('matplotlib'));
        
        // 帮助菜单
        this._bindAction('documentation', () => window.open('https://docs.python.org/zh-cn/3/', '_blank'));
        this._bindAction('shortcuts', () => this._showShortcuts());
        this._bindAction('about', () => this._showAbout());
        this._bindAction('disclaimer', () => window.open('disclaimer.html', '_blank'));
    }
    
    /**
     * 绑定动作
     */
    _bindAction(action, callback) {
        document.querySelector(`[data-action="${action}"]`)?.addEventListener('click', callback);
    }
    
    /**
     * 运行代码
     */
    async runCode() {
        if (!this.isReady) {
            this._showToast('Python运行时未就绪，请稍候...', 'warning');
            return;
        }
        
        const code = window.editorManager.getValue();
        
        if (!code.trim()) {
            this._showToast('代码为空', 'warning');
            return;
        }
        
        // 检查是否有input调用
        const inputCalls = window.pyodideManager.scanInputCalls(code);
        
        if (inputCalls.length > 0) {
            // 显示输入对话框
            const inputValues = await this._showInputDialog(inputCalls);
            if (inputValues === null) {
                // 用户取消了输入
                this._showToast('已取消运行', 'info');
                return;
            }
            // 执行带输入值的代码
            await this._executeCode(code, inputValues);
        } else {
            // 直接执行代码
            await this._executeCode(code);
        }
    }
    
    /**
     * 显示输入对话框
     * @param {Array} inputCalls input调用信息数组
     * @returns {Promise<string[]|null>} 输入值数组或null（取消）
     */
    _showInputDialog(inputCalls) {
        return new Promise((resolve) => {
            const container = document.getElementById('modal-container');
            if (!container) {
                resolve(null);
                return;
            }
            
            // 生成输入字段
            const inputFieldsHtml = inputCalls.map((input, index) => {
                const promptText = input.prompt || `输入 #${index + 1}`;
                return `
                    <div class="input-field-group">
                        <label class="input-label">${promptText}</label>
                        <input type="text" class="input-value" data-index="${index}" placeholder="请输入值...">
                    </div>
                `;
            }).join('');
            
            // 创建对话框HTML
            container.innerHTML = `
                <div class="modal" id="input-modal">
                    <div class="modal-content input-dialog">
                        <div class="modal-header">
                            <h3 class="modal-title">
                                <i class="fas fa-keyboard"></i> 程序需要输入
                            </h3>
                            <button class="btn btn-icon btn-ghost modal-close" id="input-cancel">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="modal-body">
                            <p class="input-hint">检测到 ${inputCalls.length} 个 input() 调用，请输入所需值：</p>
                            <div class="input-fields">
                                ${inputFieldsHtml}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-ghost" id="input-cancel-btn">取消</button>
                            <button class="btn btn-primary" id="input-confirm">
                                <i class="fas fa-play"></i> 继续运行
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            const modal = document.getElementById('input-modal');
            
            // 获取所有输入框
            const inputElements = modal.querySelectorAll('.input-value');
            
            // 聚焦第一个输入框
            setTimeout(() => {
                if (inputElements[0]) {
                    inputElements[0].focus();
                }
            }, 100);
            
            // 回车键确认
            inputElements.forEach((input, index) => {
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        if (index < inputElements.length - 1) {
                            inputElements[index + 1].focus();
                        } else {
                            confirmInput();
                        }
                    }
                });
            });
            
            // 确认输入
            const confirmInput = () => {
                const values = Array.from(inputElements).map(el => el.value);
                container.innerHTML = '';
                resolve(values);
            };
            
            // 取消输入
            const cancelInput = () => {
                container.innerHTML = '';
                resolve(null);
            };
            
            // 绑定事件
            document.getElementById('input-confirm')?.addEventListener('click', confirmInput);
            document.getElementById('input-cancel')?.addEventListener('click', cancelInput);
            document.getElementById('input-cancel-btn')?.addEventListener('click', cancelInput);
            
            // 点击背景关闭
            modal?.addEventListener('click', (e) => {
                if (e.target === modal) {
                    cancelInput();
                }
            });
            
            // ESC键关闭
            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    document.removeEventListener('keydown', escHandler);
                    cancelInput();
                }
            };
            document.addEventListener('keydown', escHandler);
        });
    }
    
    /**
     * 执行代码
     * @param {string} code 代码
     * @param {string[]} inputValues 输入值（可选）
     */
    async _executeCode(code, inputValues = null) {
        this.isRunning = true;
        this._updateStatus('运行中...');
        
        const startTime = performance.now();
        
        try {
            const result = await window.pyodideManager.runCode(code, inputValues);
            
            const endTime = performance.now();
            
            // 显示输出
            if (result.stdout) {
                window.consoleManager.write(result.stdout, 'output');
            }
            
            // 显示错误
            if (result.stderr) {
                window.consoleManager.write(result.stderr, 'error');
            }
            
            // 显示返回值
            if (result.success && result.result !== undefined && result.result !== null) {
                // 不要重复显示print的输出
                if (!result.stdout && String(result.result) !== 'None') {
                    window.consoleManager.write(String(result.result), 'output');
                }
            }
            
            // 显示错误信息
            if (!result.success && result.error) {
                window.consoleManager.write(result.error, 'error');
            }
            
            // 显示执行时间
            window.consoleManager.write(`[执行时间: ${(endTime - startTime).toFixed(2)}ms]`, 'info');
            
            // 更新变量视图
            this._updateVariablesView();
            
        } catch (error) {
            window.consoleManager.write('执行错误: ' + error.message, 'error');
        }
        
        this.isRunning = false;
        this._updateStatus('就绪');
    }
    
    /**
     * 运行选中代码
     */
    async runSelection() {
        const selection = window.editorManager.getSelection();
        
        if (!selection) {
            this._showToast('没有选中代码', 'warning');
            return;
        }
        
        if (!this.isReady) {
            this._showToast('Python运行时未就绪', 'warning');
            return;
        }
        
        const result = await window.pyodideManager.runCode(selection);
        
        if (result.stdout) {
            window.consoleManager.write(result.stdout, 'output');
        }
        
        if (result.success && result.result !== undefined && result.result !== null) {
            if (!result.stdout) {
                window.consoleManager.write(String(result.result), 'output');
            }
        } else if (!result.success) {
            window.consoleManager.write(result.error || '执行失败', 'error');
        }
    }
    
    /**
     * 停止代码
     */
    stopCode() {
        window.pyodideManager.interrupt();
        this.isRunning = false;
        this._updateStatus('已停止');
        this._showToast('已停止', 'info');
    }
    
    /**
     * 保存文件
     */
    saveFile() {
        window.fileManager.saveFile();
    }
    
    /**
     * 更新光标位置
     */
    updateCursorPosition(line, column) {
        const posEl = document.getElementById('status-position');
        const lineEl = document.getElementById('line-indicator');
        
        if (posEl) posEl.textContent = `行 ${line}, 列 ${column}`;
        if (lineEl) lineEl.querySelector('span').textContent = `行 ${line}, 列 ${column}`;
    }
    
    /**
     * 更新状态
     */
    _updateStatus(message) {
        const el = document.getElementById('status-message');
        if (el) el.textContent = message;
    }
    
    /**
     * 更新变量视图
     */
    _updateVariablesView() {
        const container = document.getElementById('variables-list');
        if (!container) return;
        
        const variables = window.pyodideManager.getVariables();
        
        container.innerHTML = '';
        
        if (variables.length === 0) {
            container.innerHTML = '<div style="color: #6E6E6E; padding: 10px;">无变量</div>';
            return;
        }
        
        variables.forEach(v => {
            const item = document.createElement('div');
            item.className = 'variable-item';
            item.style.cssText = 'display: flex; justify-content: space-between; padding: 4px 8px; font-size: 12px;';
            item.innerHTML = `
                <span style="color: #FFD43B;">${v.name}</span>
                <span style="color: #6E6E6E;">${v.type}</span>
                <span style="color: #CCCCCC;">${v.value}</span>
            `;
            container.appendChild(item);
        });
    }
    
    /**
     * 显示包安装对话框
     */
    async _showPackageDialog() {
        const packageName = prompt('输入要安装的包名:');
        if (packageName) {
            await this._installPackage(packageName);
        }
    }
    
    /**
     * 安装包
     */
    async _installPackage(packageName) {
        this._showToast(`正在安装 ${packageName}...`, 'info');
        
        const result = await window.pyodideManager.installPackage(packageName);
        
        if (result.success) {
            this._showToast(result.message, 'success');
        } else {
            this._showToast(`安装失败: ${result.error}`, 'error');
        }
    }
    
    /**
     * 显示已安装包
     */
    async _showInstalledPackages() {
        const packages = await window.pyodideManager.getInstalledPackages();
        alert('已安装的包:\n\n' + packages.join('\n'));
    }
    
    /**
     * 加载示例
     */
    _loadExample(name) {
        const examples = {
            hello: `# Hello World
print("Hello, World!")
print("你好，世界！ 🐍")`,
            calculator: `# 简单计算器
a = 10
b = 5

print(f"a = {a}")
print(f"b = {b}")
print(f"a + b = {a + b}")
print(f"a - b = {a - b}")
print(f"a * b = {a * b}")
print(f"a / b = {a / b}")`,
            loop: `# 循环示例
print("for 循环:")
for i in range(5):
    print(f"  i = {i}")

print()
print("while 循环:")
count = 0
while count < 5:
    print(f"  count = {count}")
    count += 1`,
            function: `# 函数示例
def greet(name):
    return f"你好, {name}!"

def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(greet("Python"))
print(f"5! = {factorial(5)}")`,
            class: `# 类示例
class Animal:
    def __init__(self, name):
        self.name = name
    
    def speak(self):
        return "..."

class Dog(Animal):
    def speak(self):
        return "汪汪!"

class Cat(Animal):
    def speak(self):
        return "喵喵!"

dog = Dog("小黑")
cat = Cat("小白")

print(f"{dog.name}: {dog.speak()}")
print(f"{cat.name}: {cat.speak()}")`,
            numpy: `# NumPy 示例
# 先安装numpy: 点击 包 -> 安装 NumPy

import numpy as np

arr = np.array([1, 2, 3, 4, 5])
print("数组:", arr)
print("平均值:", np.mean(arr))
print("总和:", np.sum(arr))`,
            matplotlib: `# Matplotlib 示例
# 需要先安装matplotlib

print("Matplotlib可以创建图表")
print("在浏览器环境中，图表会显示为图片")

# 简单示例
x = [1, 2, 3, 4, 5]
y = [1, 4, 9, 16, 25]

print("x:", x)
print("y:", y)
print("y = x^2")`
        };
        
        const code = examples[name];
        if (code) {
            window.editorManager.setValue(code);
            this._showToast(`已加载示例: ${name}`, 'success');
        }
    }
    
    /**
     * 加载代码片段
     */
    _loadSnippets() {
        const container = document.getElementById('snippets-list');
        if (!container) return;
        
        const snippets = [
            { name: 'print', code: 'print("Hello")' },
            { name: 'for循环', code: 'for i in range(10):\n    print(i)' },
            { name: 'if判断', code: 'if True:\n    pass' },
            { name: '函数定义', code: 'def func():\n    pass' },
            { name: '类定义', code: 'class MyClass:\n    pass' }
        ];
        
        container.innerHTML = '';
        
        snippets.forEach(s => {
            const item = document.createElement('div');
            item.className = 'snippet-item';
            item.textContent = s.name;
            item.style.cssText = 'padding: 6px 10px; cursor: pointer; font-size: 12px;';
            item.addEventListener('click', () => {
                window.editorManager.insertText(s.code);
            });
            item.addEventListener('mouseenter', () => {
                item.style.background = '#3C3C3C';
            });
            item.addEventListener('mouseleave', () => {
                item.style.background = '';
            });
            container.appendChild(item);
        });
    }
    
    /**
     * 显示快捷键
     */
    _showShortcuts() {
        alert(`快捷键列表:

F5 - 运行代码
Shift+F5 - 运行选中代码
Ctrl+S - 保存文件
Ctrl+O - 打开文件
Ctrl+N - 新建文件`);
    }
    
    /**
     * 显示关于
     */
    _showAbout() {
        alert(`蟒蛇 Python在线编译器

版本: ${this.version}

基于Pyodide的浏览器Python编程环境。`);
    }
    
    /**
     * 显示Toast通知
     */
    _showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: 'check-circle',
            error: 'times-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        
        toast.innerHTML = `
            <i class="fas fa-${icons[type]}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// 创建全局实例并初始化
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PythonIDE();
    window.app.init();
});

console.log('🚀 主应用加载完成');