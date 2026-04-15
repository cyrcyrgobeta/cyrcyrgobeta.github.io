/**
 * 蟒蛇 Python在线编译器 - Pyodide管理器
 * 支持多镜像源切换和本地化加载
 */

class PyodideManager {
    constructor() {
        this.pyodide = null;
        this.isReady = false;
        this.isInitializing = false;
        this.installedPackages = new Set();
        this.outputBuffer = [];
        this.errorBuffer = [];
        
        // input() 支持
        this.inputValues = [];      // 预输入的值
        this.inputIndex = 0;        // 当前输入索引
        this.inputPrompts = [];     // input提示信息
        
        // 镜像源列表（优先级从高到低）
        this.mirrorUrls = [
            'https://cdn.jsdmirror.com/pyodide/v0.26.0/full/',  // JSDMirror国内镜像
            'https://fastly.jsdelivr.net/pyodide/v0.26.0/full/', // Fastly镜像
            'https://cdn.jsdelivr.net/pyodide/v0.26.0/full/',    // jsDelivr官方
            'https://pyodide-cdn2.iodide.io/v0.26.0/full/'      // 官方CDN
        ];
        
        // 本地路径（如果用户下载了Pyodide）
        this.localUrl = './pyodide/';
        this.useLocal = false;
    }
    
    /**
     * 初始化Pyodide
     */
    async init(progressCallback) {
        if (this.isReady || this.isInitializing) {
            return this.isReady;
        }
        
        this.isInitializing = true;
        
        try {
            progressCallback?.('正在检查加速镜像...', 5);
            
            // 尝试加载Pyodide
            let loaded = false;
            let lastError = null;
            
            // 首先尝试本地版本
            if (this.useLocal) {
                progressCallback?.('尝试加载本地Python运行时...', 10);
                try {
                    loaded = await this._loadFromUrl(this.localUrl, progressCallback);
                } catch (e) {
                    console.warn('本地加载失败:', e);
                }
            }
            
            // 如果本地失败，尝试镜像源
            if (!loaded) {
                for (let i = 0; i < this.mirrorUrls.length; i++) {
                    const url = this.mirrorUrls[i];
                    const mirrorName = this._getMirrorName(url);
                    
                    progressCallback?.(`正在从${mirrorName}加载...`, 10 + (i + 1) * 15);
                    
                    try {
                        loaded = await this._loadFromUrl(url, progressCallback);
                        if (loaded) {
                            console.log(`✅ 成功从${mirrorName}加载Pyodide`);
                            break;
                        }
                    } catch (e) {
                        console.warn(`${mirrorName}加载失败:`, e.message);
                        lastError = e;
                    }
                }
            }
            
            if (!loaded) {
                throw new Error('所有镜像源加载失败: ' + (lastError?.message || '未知错误'));
            }
            
            // 设置输出重定向
            this._setupOutputCapture();
            
            progressCallback?.('初始化完成', 100);
            
            this.isReady = true;
            this.isInitializing = false;
            
            console.log('🐍 Pyodide初始化完成');
            console.log('Python版本:', this.pyodide.runPython('import sys; sys.version'));
            
            return true;
            
        } catch (error) {
            console.error('Pyodide初始化失败:', error);
            this.isInitializing = false;
            throw error;
        }
    }
    
    /**
     * 从指定URL加载Pyodide
     */
    async _loadFromUrl(indexUrl, progressCallback) {
        return new Promise((resolve, reject) => {
            // 动态加载pyodide.js
            const script = document.createElement('script');
            script.src = indexUrl + 'pyodide.js';
            script.async = true;
            
            script.onload = async () => {
                try {
                    progressCallback?.('正在初始化Python环境...', 50);
                    
                    this.pyodide = await loadPyodide({
                        indexURL: indexUrl
                    });
                    
                    resolve(true);
                } catch (e) {
                    reject(e);
                }
            };
            
            script.onerror = () => {
                reject(new Error('脚本加载失败'));
            };
            
            // 设置超时
            const timeout = setTimeout(() => {
                script.remove();
                reject(new Error('加载超时'));
            }, 60000); // 60秒超时
            
            document.head.appendChild(script);
        });
    }
    
    /**
     * 获取镜像名称
     */
    _getMirrorName(url) {
        if (url.includes('jsdmirror')) return 'JSDMirror国内镜像';
        if (url.includes('fastly')) return 'Fastly镜像';
        if (url.includes('jsdelivr')) return 'jsDelivr';
        if (url.includes('iodide')) return '官方CDN';
        if (url.includes('./')) return '本地';
        return 'CDN';
    }
    
    /**
     * 设置输出捕获和输入处理
     */
    _setupOutputCapture() {
        // 使用Pyodide的setStdout和setStderr
        this.pyodide.setStdout({
            batched: (text) => {
                this.outputBuffer.push(text);
            }
        });
        
        this.pyodide.setStderr({
            batched: (text) => {
                this.errorBuffer.push(text);
            }
        });
        
        // 设置stdin支持input()
        this.pyodide.setStdin({
            stdin: () => {
                if (this.inputIndex < this.inputValues.length) {
                    const value = this.inputValues[this.inputIndex];
                    this.inputIndex++;
                    return value;
                }
                return '';  // 没有更多输入时返回空字符串
            }
        });
        
        // 覆盖Python的input函数
        this.pyodide.runPython(`
import sys
import builtins

class _InputFunction:
    """自定义input函数，支持预输入值"""
    _values = []
    _index = 0
    
    def __call__(self, prompt=""):
        if prompt:
            print(prompt, end="")
        
        if _InputFunction._index < len(_InputFunction._values):
            value = _InputFunction._values[_InputFunction._index]
            _InputFunction._index += 1
            return str(value)
        return ""

# 替换内置input (Python 3.12兼容方式)
_input_func = _InputFunction()
builtins.input = _input_func
        `);
    }
    
    /**
     * 设置预输入值（用于input()函数）
     */
    setInputValues(values) {
        this.inputValues = values.map(v => String(v));
        this.inputIndex = 0;
        
        // 同步到Python端（使用类属性）
        if (this.isReady) {
            this.pyodide.runPython(`
_InputFunction._values = ${JSON.stringify(this.inputValues)}
_InputFunction._index = 0
            `);
        }
    }
    
    /**
     * 重置输入状态
     */
    resetInput() {
        this.inputValues = [];
        this.inputIndex = 0;
        this.inputPrompts = [];
        
        if (this.isReady) {
            this.pyodide.runPython(`
_InputFunction._values = []
_InputFunction._index = 0
            `);
        }
    }
    
    /**
     * 扫描代码中input()调用次数和提示信息
     */
    scanInputCalls(code) {
        const inputs = [];
        // 匹配 input() 或 input("提示") 或 input('提示')
        const regex = /input\s*\(\s*(['"]([^'"]*)['"])?\s*\)/g;
        let match;
        
        while ((match = regex.exec(code)) !== null) {
            const prompt = match[2] || '';  // 提取提示文字
            inputs.push({
                full: match[0],
                prompt: prompt
            });
        }
        
        return inputs;
    }
    
    /**
     * 统计input()调用次数
     */
    countInputCalls(code) {
        return this.scanInputCalls(code).length;
    }
    
    /**
     * 运行Python代码
     * @param {string} code Python代码
     * @param {string[]} inputValues 可选的预输入值数组
     */
    async runCode(code, inputValues = null) {
        if (!this.isReady) {
            throw new Error('Python运行时未初始化');
        }
        
        // 清空缓冲区
        this.outputBuffer = [];
        this.errorBuffer = [];
        
        // 设置输入值（如果提供）
        if (inputValues && inputValues.length > 0) {
            this.setInputValues(inputValues);
        } else {
            // 重置输入索引
            this.inputIndex = 0;
            if (this.isReady) {
                this.pyodide.runPython(`_InputFunction._index = 0`);
            }
        }
        
        let result = null;
        let error = null;
        
        try {
            result = await this.pyodide.runPythonAsync(code);
        } catch (e) {
            error = e;
        }
        
        // 获取输出
        const stdout = this.outputBuffer.join('');
        const stderr = this.errorBuffer.join('');
        
        return {
            success: !error,
            result: result,
            stdout: stdout,
            stderr: stderr,
            error: error ? this._formatError(error) : null
        };
    }
    
    /**
     * 格式化错误信息
     */
    _formatError(error) {
        if (!error) return null;
        
        let message = error.message || String(error);
        const lines = message.split('\n');
        const errorLines = [];
        let foundError = false;
        
        for (const line of lines) {
            if (line.includes('Error:') || line.includes('Exception:') || line.includes('Traceback')) {
                foundError = true;
            }
            if (foundError) {
                errorLines.push(line);
            }
        }
        
        return errorLines.length > 0 ? errorLines.join('\n') : message;
    }
    
    /**
     * 安装包
     */
    async installPackage(packageName) {
        if (!this.isReady) {
            throw new Error('Python运行时未初始化');
        }
        
        if (this.installedPackages.has(packageName)) {
            return { success: true, message: `${packageName} 已安装` };
        }
        
        try {
            // 先尝试使用loadPackage（更快）
            await this.pyodide.loadPackage(packageName);
            this.installedPackages.add(packageName);
            return { success: true, message: `${packageName} 安装成功` };
        } catch (error) {
            // 再尝试micropip
            try {
                await this.pyodide.runPythonAsync(`
import micropip
await micropip.install('${packageName}')
                `);
                this.installedPackages.add(packageName);
                return { success: true, message: `${packageName} 安装成功` };
            } catch (e) {
                return { success: false, error: e.message };
            }
        }
    }
    
    /**
     * 获取已安装包列表
     */
    async getInstalledPackages() {
        if (!this.isReady) return [];
        return Array.from(this.installedPackages);
    }
    
    /**
     * 获取Python版本
     */
    getVersion() {
        if (!this.isReady) return null;
        try {
            return this.pyodide.runPython(`
import sys
f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
            `);
        } catch {
            return 'Unknown';
        }
    }
    
    /**
     * 获取变量列表
     */
    getVariables() {
        if (!this.isReady) return [];
        try {
            const vars = this.pyodide.runPython(`
import sys
result = []
for name, value in globals().items():
    if not name.startswith('_'):
        try:
            result.append((name, type(value).__name__, str(value)[:100]))
        except:
            pass
result
            `);
            return vars.toJs().map(([name, type, value]) => ({ name, type, value }));
        } catch {
            return [];
        }
    }
    
    /**
     * 重置环境
     */
    reset() {
        if (!this.isReady) return;
        try {
            this.pyodide.runPython(`
for name in list(globals().keys()):
    if not name.startswith('_') and name not in ['sys', 'os', 'micropip']:
        del globals()[name]
            `);
        } catch (error) {
            console.error('重置环境失败:', error);
        }
    }
    
    /**
     * 中断执行
     */
    interrupt() {
        console.warn('中断请求已发送');
    }
    
    /**
     * 获取内存使用
     */
    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize
            };
        }
        return null;
    }
}

// 创建全局实例
window.pyodideManager = new PyodideManager();

console.log('Pyodide管理器加载完成');
