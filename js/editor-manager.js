/**
 * 蟒蛇 Python在线编译器 - 编辑器管理器
 * 处理Monaco编辑器的初始化和管理
 */

class EditorManager {
    constructor() {
        this.editor = null;
        this.monaco = null;
        this.currentFile = 'main.py';
        this.files = new Map();
        this.themes = {
            'vs-dark': 'vs-dark',
            'light': 'vs',
            'python-dark': 'python-dark'
        };
        this.currentTheme = 'python-dark';
    }
    
    /**
     * 初始化Monaco编辑器
     */
    async init(containerId) {
        try {
            // 加载Monaco
            await this._loadMonaco();
            
            // 定义自定义Python主题
            this._definePythonTheme();
            
            // 创建编辑器
            const container = document.getElementById(containerId);
            
            this.editor = this.monaco.editor.create(container, {
                value: this._getDefaultCode(),
                language: 'python',
                theme: this.currentTheme,
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                fontLigatures: true,
                lineHeight: 22,
                minimap: {
                    enabled: true,
                    scale: 1
                },
                renderWhitespace: 'selection',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                insertSpaces: true,
                wordWrap: 'on',
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                smoothScrolling: true,
                padding: { top: 10 },
                suggest: {
                    showKeywords: true,
                    showSnippets: true
                },
                quickSuggestions: {
                    other: true,
                    comments: false,
                    strings: false
                },
                parameterHints: { enabled: true },
                formatOnPaste: true,
                formatOnType: true,
                folding: true,
                foldingHighlight: true,
                bracketPairColorization: { enabled: true },
                guides: {
                    bracketPairs: true,
                    indentation: true
                }
            });
            
            // 绑定事件
            this._bindEvents();
            
            // 注册Python代码片段
            this._registerSnippets();
            
            console.log('📝 Monaco编辑器初始化完成');
            
            return true;
            
        } catch (error) {
            console.error('编辑器初始化失败:', error);
            throw error;
        }
    }
    
    /**
     * 加载Monaco - 使用国内镜像
     */
    async _loadMonaco() {
        return new Promise((resolve, reject) => {
            // 国内镜像列表
            const cdnUrls = [
                'https://cdn.jsdmirror.com/npm/monaco-editor@0.45.0/min/vs',
                'https://fastly.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs',
                'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs'
            ];
            
            require.config({
                paths: {
                    'vs': cdnUrls[0]  // 使用JSDMirror国内镜像
                }
            });
            
            require(['vs/editor/editor.main'], (monaco) => {
                this.monaco = monaco;
                resolve();
            }, (error) => {
                // 尝试备用CDN
                console.warn('主CDN加载失败，尝试备用...');
                require.config({
                    paths: {
                        'vs': cdnUrls[1]
                    }
                });
                require(['vs/editor/editor.main'], (monaco) => {
                    this.monaco = monaco;
                    resolve();
                }, reject);
            });
        });
    }
    
    /**
     * 定义Python主题
     */
    _definePythonTheme() {
        this.monaco.editor.defineTheme('python-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                // Python关键字
                { token: 'keyword.python', foreground: 'FF79C6', fontStyle: 'bold' },
                // 字符串
                { token: 'string.python', foreground: 'F1FA8C' },
                // 数字
                { token: 'number.python', foreground: 'BD93F9' },
                // 注释
                { token: 'comment.python', foreground: '6272A4', fontStyle: 'italic' },
                // 函数名
                { token: 'entity.name.function.python', foreground: '50FA7B' },
                // 类名
                { token: 'entity.name.type.class.python', foreground: '8BE9FD' },
                // 装饰器
                { token: 'meta.function.decorator.python', foreground: 'FFB86C' },
                // 变量
                { token: 'variable.python', foreground: 'F8F8F2' },
                // 运算符
                { token: 'keyword.operator.python', foreground: 'FF79C6' },
                // 内置函数
                { token: 'support.function.builtin.python', foreground: '8BE9FD' }
            ],
            colors: {
                'editor.background': '#1E1E1E',
                'editor.foreground': '#D4D4D4',
                'editorLineNumber.foreground': '#6E7681',
                'editorLineNumber.activeForeground': '#E0E0E0',
                'editor.selectionBackground': '#264F78',
                'editor.lineHighlightBackground': '#2A2D2E',
                'editorCursor.foreground': '#AEAFAD',
                'editorWhitespace.foreground': '#3B3B3B',
                'editorIndentGuide.background': '#404040',
                'editorIndentGuide.activeBackground': '#707070'
            }
        });
    }
    
    /**
     * 绑定事件
     */
    _bindEvents() {
        // 内容变化
        this.editor.onDidChangeModelContent((e) => {
            this._onContentChange(e);
        });
        
        // 光标位置变化
        this.editor.onDidChangeCursorPosition((e) => {
            this._onCursorChange(e);
        });
        
        // 选择变化
        this.editor.onDidChangeCursorSelection((e) => {
            this._onSelectionChange(e);
        });
        
        // 保存快捷键
        this.editor.addCommand(this.monaco.KeyMod.CtrlCmd | this.monaco.KeyCode.KeyS, () => {
            window.app?.saveFile();
        });
        
        // 运行快捷键
        this.editor.addCommand(this.monaco.KeyCode.F5, () => {
            window.app?.runCode();
        });
        
        // 格式化快捷键
        this.editor.addCommand(
            this.monaco.KeyMod.Shift | this.monaco.KeyMod.Alt | this.monaco.KeyCode.KeyF,
            () => {
                this.formatCode();
            }
        );
        
        // 注释快捷键
        this.editor.addCommand(this.monaco.KeyMod.CtrlCmd | this.monaco.KeyCode.Slash, () => {
            this.toggleComment();
        });
    }
    
    /**
     * 内容变化处理
     */
    _onContentChange(e) {
        const content = this.editor.getValue();
        this.files.set(this.currentFile, content);
        
        // 通知应用
        window.app?.onEditorContentChange?.(content);
    }
    
    /**
     * 光标位置变化处理
     */
    _onCursorChange(e) {
        const position = e.position;
        window.app?.updateCursorPosition?.(position.lineNumber, position.column);
    }
    
    /**
     * 选择变化处理
     */
    _onSelectionChange(e) {
        // 可以用于更新状态栏选择信息
    }
    
    /**
     * 注册代码片段
     */
    _registerSnippets() {
        // Python代码片段由Monaco内置支持
    }
    
    /**
     * 获取代码内容
     */
    getValue() {
        return this.editor?.getValue() || '';
    }
    
    /**
     * 设置代码内容
     */
    setValue(code) {
        if (this.editor) {
            this.editor.setValue(code);
        }
    }
    
    /**
     * 获取选中的代码
     */
    getSelection() {
        if (!this.editor) return '';
        
        const selection = this.editor.getSelection();
        const model = this.editor.getModel();
        
        if (selection.isEmpty()) {
            return '';
        }
        
        return model.getValueInRange(selection);
    }
    
    /**
     * 获取当前行号
     */
    getCurrentLine() {
        return this.editor?.getPosition()?.lineNumber || 1;
    }
    
    /**
     * 获取当前列号
     */
    getCurrentColumn() {
        return this.editor?.getPosition()?.column || 1;
    }
    
    /**
     * 跳转到指定行
     */
    goToLine(lineNumber) {
        if (this.editor) {
            this.editor.revealLineInCenter(lineNumber);
            this.editor.setPosition({
                lineNumber,
                column: 1
            });
        }
    }
    
    /**
     * 跳转到指定位置
     */
    goToPosition(lineNumber, column) {
        if (this.editor) {
            this.editor.setPosition({ lineNumber, column });
            this.editor.revealPositionInCenter({ lineNumber, column });
        }
    }
    
    /**
     * 撤销
     */
    undo() {
        this.editor?.trigger('keyboard', 'undo', null);
    }
    
    /**
     * 重做
     */
    redo() {
        this.editor?.trigger('keyboard', 'redo', null);
    }
    
    /**
     * 格式化代码
     */
    formatCode() {
        this.editor?.getAction('editor.action.formatDocument')?.run();
    }
    
    /**
     * 切换注释
     */
    toggleComment() {
        this.editor?.getAction('editor.action.commentLine')?.run();
    }
    
    /**
     * 插入文本
     */
    insertText(text) {
        if (this.editor) {
            const position = this.editor.getPosition();
            this.editor.executeEdits('', [{
                range: new this.monaco.Range(
                    position.lineNumber,
                    position.column,
                    position.lineNumber,
                    position.column
                ),
                text
            }]);
        }
    }
    
    /**
     * 高亮错误行
     */
    highlightError(lineNumber, message) {
        if (!this.editor || !this.monaco) return;
        
        const decorations = this.editor.deltaDecorations([], [
            {
                range: new this.monaco.Range(lineNumber, 1, lineNumber, 1),
                options: {
                    isWholeLine: true,
                    className: 'error-line',
                    glyphMarginClassName: 'error-glyph',
                    glyphMarginHoverMessage: { value: message }
                }
            }
        ]);
        
        return decorations;
    }
    
    /**
     * 清除高亮
     */
    clearHighlights() {
        this.editor?.deltaDecorations(this.editor.getModel()?.getAllDecorations() || [], []);
    }
    
    /**
     * 设置主题
     */
    setTheme(theme) {
        if (this.monaco && this.themes[theme]) {
            this.monaco.editor.setTheme(this.themes[theme]);
            this.currentTheme = theme;
        }
    }
    
    /**
     * 获取语法树大纲
     */
    getOutline() {
        const code = this.getValue();
        const outline = [];
        
        // 简单的正则匹配
        const lines = code.split('\n');
        
        lines.forEach((line, index) => {
            // 匹配类定义
            const classMatch = line.match(/^class\s+(\w+)/);
            if (classMatch) {
                outline.push({
                    type: 'class',
                    name: classMatch[1],
                    line: index + 1
                });
            }
            
            // 匹配函数定义
            const funcMatch = line.match(/^def\s+(\w+)/);
            if (funcMatch) {
                outline.push({
                    type: 'function',
                    name: funcMatch[1],
                    line: index + 1
                });
            }
            
            // 匹配导入
            const importMatch = line.match(/^(?:import|from)\s+(\w+)/);
            if (importMatch) {
                outline.push({
                    type: 'import',
                    name: importMatch[1],
                    line: index + 1
                });
            }
        });
        
        return outline;
    }
    
    /**
     * 获取默认代码
     */
    _getDefaultCode() {
        return `# 蟒蛇 Python在线编译器
# Python Online Compiler

# 欢迎使用蟒蛇Python在线编译器！
# 在这里编写你的Python代码，然后点击"运行"按钮执行。

# 示例：Hello World
print("Hello, Python! 🐍")

# 示例：简单计算
a = 10
b = 20
print(f"a + b = {a + b}")

# 示例：列表操作
numbers = [1, 2, 3, 4, 5]
print(f"列表: {numbers}")
print(f"总和: {sum(numbers)}")
print(f"平均值: {sum(numbers) / len(numbers)}")
`;
    }
    
    /**
     * 销毁编辑器
     */
    dispose() {
        if (this.editor) {
            this.editor.dispose();
            this.editor = null;
        }
    }
}

// 创建全局实例
window.editorManager = new EditorManager();

console.log('编辑器管理器加载完成');
