/**
 * Scratch S2 编辑器 - 事件总线
 * 全局事件发布/订阅系统
 */

class EventBus {
    constructor() {
        this.events = new Map();
        this.onceEvents = new Map();
    }
    
    /**
     * 订阅事件
     */
    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(callback);
        
        // 返回取消订阅函数
        return () => this.off(event, callback);
    }
    
    /**
     * 订阅一次性事件
     */
    once(event, callback) {
        if (!this.onceEvents.has(event)) {
            this.onceEvents.set(event, []);
        }
        this.onceEvents.get(event).push(callback);
    }
    
    /**
     * 取消订阅
     */
    off(event, callback) {
        if (this.events.has(event)) {
            const callbacks = this.events.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    
    /**
     * 触发事件
     */
    emit(event, data) {
        // 触发普通订阅
        if (this.events.has(event)) {
            for (const callback of this.events.get(event)) {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`事件处理器错误 [${event}]:`, error);
                }
            }
        }
        
        // 触发一次性订阅
        if (this.onceEvents.has(event)) {
            const callbacks = this.onceEvents.get(event);
            this.onceEvents.delete(event);
            
            for (const callback of callbacks) {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`事件处理器错误 [${event}]:`, error);
                }
            }
        }
    }
    
    /**
     * 清除所有事件
     */
    clear() {
        this.events.clear();
        this.onceEvents.clear();
    }
    
    /**
     * 获取事件列表
     */
    getEvents() {
        return Array.from(this.events.keys());
    }
    
    /**
     * 检查是否有订阅者
     */
    hasListeners(event) {
        return (this.events.has(event) && this.events.get(event).length > 0) ||
               (this.onceEvents.has(event) && this.onceEvents.get(event).length > 0);
    }
}

// 创建全局事件总线
window.eventBus = new EventBus();

console.log('事件总线加载完成');
