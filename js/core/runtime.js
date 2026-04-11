/**
 * Scratch S2 编辑器 - 运行时引擎
 * 核心执行系统，管理所有角色和线程
 */

class RuntimeEngine {
    constructor() {
        // 舞台属性
        this.stageWidth = 480;
        this.stageHeight = 360;
        
        // 角色列表
        this.sprites = [];
        this.targetStage = null; // 舞台对象
        
        // 线程管理
        this.threads = [];
        this.activeThread = null;
        
        // 运行状态
        this.isRunning = false;
        this.isTurbo = false;
        this.isPaused = false;
        
        // 计时器
        this.timerStart = 0;
        this.timerValue = 0;
        
        // 变量和列表
        this.variables = new Map();
        this.lists = new Map();
        
        // 消息系统
        this.broadcasts = new Map();
        this.broadcastWaitCallbacks = new Map();
        
        // 输入状态
        this.keysPressed = new Set();
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseDown = false;
        
        // 询问回答
        this.answer = '';
        this.asking = false;
        this.askCallback = null;
        
        // 克隆计数
        this.cloneCount = 0;
        
        // 事件监听器
        this.listeners = new Map();
        
        // 初始化
        this._init();
    }
    
    /**
     * 初始化运行时
     */
    _init() {
        // 创建舞台目标
        this.targetStage = {
            id: 'stage',
            name: '舞台',
            isStage: true,
            variables: new Map(),
            lists: new Map(),
            costumes: [],
            currentCostume: 0,
            sounds: [],
            volume: 100,
            tempo: 60,
            videoState: 'off',
            videoTransparency: 50
        };
        
        // 监听键盘事件
        this._setupKeyboardListeners();
        
        // 监听鼠标事件
        this._setupMouseListeners();
        
        console.log('运行时引擎初始化完成');
    }
    
    /**
     * 设置键盘监听
     */
    _setupKeyboardListeners() {
        document.addEventListener('keydown', (e) => {
            const key = this._normalizeKey(e.key);
            this.keysPressed.add(key);
            this._emit('keyPressed', key);
        });
        
        document.addEventListener('keyup', (e) => {
            const key = this._normalizeKey(e.key);
            this.keysPressed.delete(key);
        });
    }
    
    /**
     * 标准化键名
     */
    _normalizeKey(key) {
        const keyMap = {
            ' ': 'space',
            'ArrowUp': 'up arrow',
            'ArrowDown': 'down arrow',
            'ArrowLeft': 'left arrow',
            'ArrowRight': 'right arrow',
            'Enter': 'enter',
            'Escape': 'escape',
            'Backspace': 'backspace',
            'Delete': 'delete',
            'Tab': 'tab'
        };
        return keyMap[key] || key.toLowerCase();
    }
    
    /**
     * 设置鼠标监听
     */
    _setupMouseListeners() {
        document.addEventListener('mousemove', (e) => {
            // 需要根据舞台画布计算坐标
            this._emit('mouseMove', { x: e.clientX, y: e.clientY });
        });
        
        document.addEventListener('mousedown', () => {
            this.mouseDown = true;
            this._emit('mouseDown');
        });
        
        document.addEventListener('mouseup', () => {
            this.mouseDown = false;
            this._emit('mouseUp');
        });
    }
    
    /**
     * 添加角色
     */
    addSprite(sprite) {
        if (!sprite.id) {
            sprite.id = 'sprite_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        this.sprites.push(sprite);
        this._emit('spriteAdded', sprite);
        return sprite;
    }
    
    /**
     * 删除角色
     */
    removeSprite(spriteId) {
        const index = this.sprites.findIndex(s => s.id === spriteId);
        if (index > -1) {
            const sprite = this.sprites[index];
            this.sprites.splice(index, 1);
            this._emit('spriteRemoved', sprite);
            return true;
        }
        return false;
    }
    
    /**
     * 获取角色
     */
    getSprite(spriteId) {
        return this.sprites.find(s => s.id === spriteId);
    }
    
    /**
     * 获取所有角色
     */
    getAllSprites() {
        return this.sprites;
    }
    
    /**
     * 克隆角色
     */
    cloneSprite(sprite) {
        if (this.cloneCount >= 300) {
            console.warn('克隆数量已达上限');
            return null;
        }
        
        const clone = {
            ...sprite,
            id: 'clone_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            isClone: true,
            cloneSource: sprite.id
        };
        
        this.sprites.push(clone);
        this.cloneCount++;
        this._emit('cloneCreated', clone);
        
        return clone;
    }
    
    /**
     * 删除克隆体
     */
    deleteClone(cloneId) {
        const clone = this.sprites.find(s => s.id === cloneId && s.isClone);
        if (clone) {
            this.removeSprite(cloneId);
            this.cloneCount--;
            return true;
        }
        return false;
    }
    
    /**
     * 启动绿旗
     */
    startGreenFlag() {
        console.log('启动绿旗');
        
        // 停止所有现有线程
        this.stopAll();
        
        // 重置计时器
        this.timerStart = Date.now();
        this.timerValue = 0;
        
        // 开始运行
        this.isRunning = true;
        
        // 为每个角色启动绿旗脚本
        for (const sprite of this.sprites) {
            const greenFlagBlocks = this._findGreenFlagBlocks(sprite);
            for (const block of greenFlagBlocks) {
                this._startThread(sprite, block);
            }
        }
        
        // 舞台也有可能有绿旗脚本
        const stageGreenFlagBlocks = this._findGreenFlagBlocks(this.targetStage);
        for (const block of stageGreenFlagBlocks) {
            this._startThread(this.targetStage, block);
        }
        
        this._emit('greenFlagStarted');
    }
    
    /**
     * 查找绿旗积木
     */
    _findGreenFlagBlocks(target) {
        if (!target || !target.blocks) return [];
        return target.blocks.filter(b => b.opcode === 'event_whenflagclicked');
    }
    
    /**
     * 启动线程
     */
    _startThread(target, block) {
        const thread = new Thread(target, block, this);
        this.threads.push(thread);
        return thread;
    }
    
    /**
     * 停止所有
     */
    stopAll() {
        console.log('停止所有脚本');
        
        // 停止所有线程
        for (const thread of this.threads) {
            thread.stop();
        }
        this.threads = [];
        
        // 重置状态
        this.isRunning = false;
        
        // 清除所有克隆体
        const clones = this.sprites.filter(s => s.isClone);
        for (const clone of clones) {
            this.removeSprite(clone.id);
        }
        this.cloneCount = 0;
        
        // 清除说话气泡
        for (const sprite of this.sprites) {
            if (sprite.say) {
                sprite.say = null;
            }
        }
        
        this._emit('stopped');
    }
    
    /**
     * 停止角色的脚本
     */
    stopSprite(spriteId) {
        const threads = this.threads.filter(t => t.target.id === spriteId);
        for (const thread of threads) {
            thread.stop();
        }
        this.threads = this.threads.filter(t => t.target.id !== spriteId);
    }
    
    /**
     * 广播消息
     */
    broadcast(message, wait = false) {
        console.log('广播消息:', message);
        
        // 触发广播接收事件
        const receivers = [];
        
        for (const sprite of this.sprites) {
            const receiveBlocks = this._findBroadcastReceiveBlocks(sprite, message);
            for (const block of receiveBlocks) {
                const thread = this._startThread(sprite, block);
                receivers.push(thread);
            }
        }
        
        if (wait && receivers.length > 0) {
            // 等待所有接收者完成
            return new Promise(resolve => {
                const checkComplete = () => {
                    const allDone = receivers.every(t => t.status === 'done');
                    if (allDone) {
                        resolve();
                    } else {
                        requestAnimationFrame(checkComplete);
                    }
                };
                checkComplete();
            });
        }
        
        return Promise.resolve();
    }
    
    /**
     * 查找广播接收积木
     */
    _findBroadcastReceiveBlocks(target, message) {
        if (!target || !target.blocks) return [];
        return target.blocks.filter(b => 
            b.opcode === 'event_whenbroadcastreceived' && 
            b.inputs.message === message
        );
    }
    
    /**
     * 设置变量
     */
    setVariable(name, value, target = null) {
        if (target) {
            if (!target.variables) {
                target.variables = new Map();
            }
            target.variables.set(name, value);
        } else {
            this.variables.set(name, value);
        }
        this._emit('variableChanged', { name, value, target });
    }
    
    /**
     * 获取变量
     */
    getVariable(name, target = null) {
        if (target && target.variables && target.variables.has(name)) {
            return target.variables.get(name);
        }
        if (this.variables.has(name)) {
            return this.variables.get(name);
        }
        return 0;
    }
    
    /**
     * 列表操作
     */
    getList(name, target = null) {
        if (target && target.lists && target.lists.has(name)) {
            return target.lists.get(name);
        }
        if (this.lists.has(name)) {
            return this.lists.get(name);
        }
        return [];
    }
    
    setList(name, value, target = null) {
        if (target) {
            if (!target.lists) {
                target.lists = new Map();
            }
            target.lists.set(name, value);
        } else {
            this.lists.set(name, value);
        }
    }
    
    /**
     * 计时器
     */
    getTimer() {
        return (Date.now() - this.timerStart) / 1000;
    }
    
    resetTimer() {
        this.timerStart = Date.now();
    }
    
    /**
     * 按键检测
     */
    keyPressed(key) {
        if (key === 'any') {
            return this.keysPressed.size > 0;
        }
        return this.keysPressed.has(key.toLowerCase());
    }
    
    /**
     * 鼠标位置
     */
    setMousePosition(x, y) {
        this.mouseX = x;
        this.mouseY = y;
    }
    
    /**
     * 询问并等待
     */
    askAndWait(question) {
        return new Promise(resolve => {
            this.asking = true;
            this.answer = '';
            this.askCallback = resolve;
            this._emit('ask', question);
        });
    }
    
    /**
     * 回答询问
     */
    submitAnswer(answer) {
        this.answer = answer;
        this.asking = false;
        if (this.askCallback) {
            this.askCallback(answer);
            this.askCallback = null;
        }
    }
    
    /**
     * 主执行循环
     */
    step() {
        if (!this.isRunning || this.isPaused) return;
        
        // 执行所有活动线程
        for (const thread of this.threads) {
            if (thread.status === 'running') {
                thread.step();
            }
        }
        
        // 移除完成的线程
        this.threads = this.threads.filter(t => t.status !== 'done');
        
        // 发出步进事件
        this._emit('stepped');
    }
    
    /**
     * 开始执行循环
     */
    start() {
        const loop = () => {
            if (this.isRunning) {
                this.step();
                requestAnimationFrame(loop);
            }
        };
        loop();
    }
    
    /**
     * 事件系统
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    
    _emit(event, data) {
        if (this.listeners.has(event)) {
            for (const callback of this.listeners.get(event)) {
                callback(data);
            }
        }
    }
}

// 线程类
class Thread {
    constructor(target, block, runtime) {
        this.id = 'thread_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        this.target = target;
        this.runtime = runtime;
        this.status = 'running'; // running, waiting, done
        this.blockStack = [block];
        this.currentBlock = block;
        this.stackFrame = {
            loopCounter: 0,
            loopLimit: 0,
            isLoop: false,
            waiting: false,
            waitUntil: 0
        };
    }
    
    /**
     * 执行一步
     */
    step() {
        if (this.status !== 'running') return;
        
        // 检查是否在等待
        if (this.stackFrame.waiting) {
            if (Date.now() < this.stackFrame.waitUntil) {
                return;
            }
            this.stackFrame.waiting = false;
        }
        
        // 执行当前积木
        if (this.currentBlock) {
            this.executeBlock(this.currentBlock);
        }
    }
    
    /**
     * 执行积木
     */
    async executeBlock(block) {
        if (!block || !block.opcode) return;
        
        const opcode = block.opcode;
        const inputs = block.inputs || {};
        
        try {
            // 根据操作码执行不同逻辑
            switch (opcode) {
                // 运动积木
                case 'motion_movesteps':
                    this.target.moveSteps(inputs.steps || 10);
                    break;
                case 'motion_turnright':
                    this.target.turnRight(inputs.degrees || 15);
                    break;
                case 'motion_turnleft':
                    this.target.turnLeft(inputs.degrees || 15);
                    break;
                case 'motion_goto':
                    this.target.goTo(inputs.x || 0, inputs.y || 0);
                    break;
                case 'motion_changexby':
                    this.target.changeXBy(inputs.dx || 10);
                    break;
                case 'motion_setx':
                    this.target.setXTo(inputs.x || 0);
                    break;
                case 'motion_changeyby':
                    this.target.changeYBy(inputs.dy || 10);
                    break;
                case 'motion_sety':
                    this.target.setYTo(inputs.y || 0);
                    break;
                    
                // 控制积木
                case 'control_wait':
                    this.stackFrame.waiting = true;
                    this.stackFrame.waitUntil = Date.now() + (inputs.secs || 1) * 1000;
                    break;
                case 'control_stop':
                    if (inputs.what === '全部') {
                        this.runtime.stopAll();
                    } else if (inputs.what === '这个脚本') {
                        this.stop();
                    }
                    break;
                    
                // 事件积木
                case 'event_broadcast':
                    this.runtime.broadcast(inputs.message || '消息1');
                    break;
                    
                // 更多积木实现...
                default:
                    console.log('未实现的积木:', opcode);
            }
        } catch (error) {
            console.error('执行积木出错:', opcode, error);
        }
        
        // 移动到下一个积木
        this.currentBlock = block.next;
        
        if (!this.currentBlock) {
            this.status = 'done';
        }
    }
    
    /**
     * 停止线程
     */
    stop() {
        this.status = 'done';
    }
}

// 导出
if (typeof window !== 'undefined') {
    window.RuntimeEngine = RuntimeEngine;
    window.Thread = Thread;
}

console.log('运行时引擎加载完成');
