/**
 * Scratch S2 编辑器 - 历史管理（撤销/重做）
 */

class HistoryManager {
    constructor(maxSize = 50) {
        this.history = [];
        this.currentIndex = -1;
        this.maxSize = maxSize;
        this.isRecording = true;
    }
    
    /**
     * 记录状态
     */
    push(state) {
        if (!this.isRecording) return;
        
        // 删除当前位置之后的所有状态
        this.history = this.history.slice(0, this.currentIndex + 1);
        
        // 添加新状态
        this.history.push({
            state: this._clone(state),
            timestamp: Date.now()
        });
        
        // 限制大小
        if (this.history.length > this.maxSize) {
            this.history.shift();
        } else {
            this.currentIndex++;
        }
        
        this._emitChange();
    }
    
    /**
     * 撤销
     */
    undo() {
        if (!this.canUndo()) return null;
        
        this.currentIndex--;
        this._emitChange();
        
        return this._clone(this.history[this.currentIndex].state);
    }
    
    /**
     * 重做
     */
    redo() {
        if (!this.canRedo()) return null;
        
        this.currentIndex++;
        this._emitChange();
        
        return this._clone(this.history[this.currentIndex].state);
    }
    
    /**
     * 获取当前状态
     */
    getCurrent() {
        if (this.currentIndex < 0 || this.currentIndex >= this.history.length) {
            return null;
        }
        return this._clone(this.history[this.currentIndex].state);
    }
    
    /**
     * 是否可以撤销
     */
    canUndo() {
        return this.currentIndex > 0;
    }
    
    /**
     * 是否可以重做
     */
    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }
    
    /**
     * 清除历史
     */
    clear() {
        this.history = [];
        this.currentIndex = -1;
        this._emitChange();
    }
    
    /**
     * 获取历史长度
     */
    getLength() {
        return this.history.length;
    }
    
    /**
     * 暂停记录
     */
    pauseRecording() {
        this.isRecording = false;
    }
    
    /**
     * 恢复记录
     */
    resumeRecording() {
        this.isRecording = true;
    }
    
    /**
     * 克隆对象
     */
    _clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    
    /**
     * 发送变化事件
     */
    _emitChange() {
        if (window.eventBus) {
            window.eventBus.emit('historyChange', {
                canUndo: this.canUndo(),
                canRedo: this.canRedo(),
                length: this.history.length,
                index: this.currentIndex
            });
        }
    }
}

// 创建全局实例
window.historyManager = new HistoryManager();

console.log('历史管理器加载完成');
