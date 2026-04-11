/**
 * Scratch S2 编辑器 - 日志系统
 */

class Logger {
    constructor(prefix = 'S2') {
        this.prefix = prefix;
        this.level = 'debug'; // debug, info, warn, error
        this.logs = [];
        this.maxLogs = 1000;
    }
    
    /**
     * 格式化时间戳
     */
    _timestamp() {
        const now = new Date();
        return now.toLocaleTimeString('zh-CN', { hour12: false }) + '.' + 
               now.getMilliseconds().toString().padStart(3, '0');
    }
    
    /**
     * 记录日志
     */
    _log(level, ...args) {
        const timestamp = this._timestamp();
        const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ');
        
        const logEntry = {
            timestamp,
            level,
            prefix: this.prefix,
            message
        };
        
        this.logs.push(logEntry);
        
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        
        const style = {
            debug: 'color: #999',
            info: 'color: #4C97FF',
            warn: 'color: #FFAB19',
            error: 'color: #FF661A'
        };
        
        const icons = {
            debug: '🔍',
            info: 'ℹ️',
            warn: '⚠️',
            error: '❌'
        };
        
        console[level](
            `%c${icons[level]} [${timestamp}] [${this.prefix}] ${message}`,
            style[level]
        );
    }
    
    debug(...args) {
        if (this.level === 'debug') {
            this._log('debug', ...args);
        }
    }
    
    info(...args) {
        this._log('info', ...args);
    }
    
    warn(...args) {
        this._log('warn', ...args);
    }
    
    error(...args) {
        this._log('error', ...args);
    }
    
    /**
     * 获取所有日志
     */
    getLogs() {
        return this.logs;
    }
    
    /**
     * 清除日志
     */
    clearLogs() {
        this.logs = [];
    }
    
    /**
     * 导出日志
     */
    exportLogs() {
        const text = this.logs.map(log => 
            `[${log.timestamp}] [${log.level.toUpperCase()}] [${log.prefix}] ${log.message}`
        ).join('\n');
        
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `s2-logs-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// 创建全局日志实例
window.logger = new Logger();

console.log('日志系统加载完成');
