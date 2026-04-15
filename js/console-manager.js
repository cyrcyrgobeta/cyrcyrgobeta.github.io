/**
 * 蟒蛇 Python在线编译器 - 控制台管理器
 */

class ConsoleManager {
    constructor() {
        this.outputElement = null;
        this.inputElement = null;
        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = 100;
        this.filter = 'all';
    }
    
    /**
     * 初始化控制台
     */
    init(outputId, inputId) {
        this.outputElement = document.getElementById(outputId);
        this.inputElement = document.getElementById(inputId);
        
        if (this.inputElement) {
            this._bindInputEvents();
        }
        
        console.log('🖥️ 控制台初始化完成');
    }
    
    /**
     * 绑定输入事件
     */
    _bindInputEvents() {
        // 回车执行
        this.inputElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.executeInput();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateHistory(-1);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateHistory(1);
            }
        });
        
        // 执行按钮
        document.getElementById('btn-console-enter')?.addEventListener('click', () => {
            this.executeInput();
        });
    }
    
    /**
     * 执行输入
     */
    async executeInput() {
        const code = this.inputElement.value.trim();
        
        if (!code) return;
        
        // 添加到历史
        this.addToHistory(code);
        
        // 显示输入
        this.writeInput(code);
        
        // 清空输入框
        this.inputElement.value = '';
        
        // 执行代码
        if (window.pyodideManager && window.pyodideManager.isReady) {
            const result = await window.pyodideManager.runCode(code);
            
            if (result.stdout) {
                this.write(result.stdout, 'output');
            }
            
            if (result.success && result.result !== undefined && result.result !== null) {
                if (!result.stdout && String(result.result) !== 'None') {
                    this.write(String(result.result), 'output');
                }
            } else if (!result.success) {
                this.write(result.error || 'Error', 'error');
            }
        } else {
            this.write('Python运行时未初始化', 'error');
        }
    }
    
    /**
     * 添加到历史
     */
    addToHistory(code) {
        this.history.push(code);
        
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }
        
        this.historyIndex = this.history.length;
    }
    
    /**
     * 导航历史
     */
    navigateHistory(direction) {
        this.historyIndex += direction;
        
        if (this.historyIndex < 0) {
            this.historyIndex = 0;
        } else if (this.historyIndex >= this.history.length) {
            this.historyIndex = this.history.length;
            this.inputElement.value = '';
            return;
        }
        
        this.inputElement.value = this.history[this.historyIndex];
    }
    
    /**
     * 写入输入行
     */
    writeInput(code) {
        const line = document.createElement('div');
        line.className = 'console-line';
        line.innerHTML = `
            <span class="prompt" style="color: #FFD43B;">&gt;&gt;&gt;</span>
            <span class="code" style="color: #D4D4D4;">${this._escapeHtml(code)}</span>
        `;
        this.outputElement.appendChild(line);
        this._scrollToBottom();
    }
    
    /**
     * 写入输出
     */
    write(text, type = 'output') {
        if (!this.outputElement) return;
        
        if (!text || text.trim() === '') return;
        
        // 检查过滤
        if (!this._shouldShow(type)) return;
        
        // 分行处理
        const lines = String(text).split('\n');
        
        lines.forEach(line => {
            if (line.trim()) {
                const div = document.createElement('div');
                div.className = `console-line ${type}`;
                div.dataset.type = type;
                
                // 根据类型设置样式
                if (type === 'error') {
                    div.style.color = '#F14C4C';
                    div.innerHTML = `<i class="fas fa-times-circle" style="margin-right: 5px;"></i>${this._escapeHtml(line)}`;
                } else if (type === 'warning') {
                    div.style.color = '#CCA700';
                    div.innerHTML = `<i class="fas fa-exclamation-triangle" style="margin-right: 5px;"></i>${this._escapeHtml(line)}`;
                } else if (type === 'info') {
                    div.style.color = '#3794FF';
                    div.innerHTML = `<i class="fas fa-info-circle" style="margin-right: 5px;"></i>${this._escapeHtml(line)}`;
                } else {
                    div.style.color = '#D4D4D4';
                    div.textContent = line;
                }
                
                this.outputElement.appendChild(div);
            }
        });
        
        this._scrollToBottom();
    }
    
    /**
     * 检查是否应该显示
     */
    _shouldShow(type) {
        if (this.filter === 'all') return true;
        return this.filter === type;
    }
    
    /**
     * 设置过滤
     */
    setFilter(filter) {
        this.filter = filter;
        
        const lines = this.outputElement.querySelectorAll('.console-line');
        lines.forEach(line => {
            const lineType = line.dataset.type;
            if (filter === 'all' || lineType === filter) {
                line.style.display = '';
            } else {
                line.style.display = 'none';
            }
        });
    }
    
    /**
     * 清空控制台
     */
    clear() {
        if (this.outputElement) {
            this.outputElement.innerHTML = '';
        }
    }
    
    /**
     * 导出控制台内容
     */
    export() {
        const lines = [];
        this.outputElement.querySelectorAll('.console-line').forEach(line => {
            lines.push(line.textContent);
        });
        return lines.join('\n');
    }
    
    /**
     * 设置Python版本显示
     */
    setPythonVersion(version) {
        const element = document.getElementById('python-version');
        if (element) {
            element.textContent = `Python ${version}`;
        }
    }
    
    /**
     * 滚动到底部
     */
    _scrollToBottom() {
        if (this.outputElement) {
            this.outputElement.scrollTop = this.outputElement.scrollHeight;
        }
    }
    
    /**
     * HTML转义
     */
    _escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 创建全局实例
window.consoleManager = new ConsoleManager();

console.log('控制台管理器加载完成');
