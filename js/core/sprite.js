/**
 * Scratch S2 编辑器 - 精灵类
 * 角色对象，包含所有属性和方法
 */

class Sprite {
    constructor(name, options = {}) {
        // 唯一ID
        this.id = 'sprite_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // 基本信息
        this.name = name || '角色';
        this.isStage = false;
        this.isClone = false;
        
        // 位置
        this.x = options.x !== undefined ? options.x : 0;
        this.y = options.y !== undefined ? options.y : 0;
        
        // 方向 (0-360, 90为向上)
        this.direction = options.direction !== undefined ? options.direction : 90;
        
        // 大小 (百分比)
        this.size = options.size !== undefined ? options.size : 100;
        
        // 可见性
        this.visible = options.visible !== undefined ? options.visible : true;
        
        // 图层顺序
        this.layerOrder = options.layerOrder || 0;
        
        // 旋转样式: 'all around', 'left-right', "don't rotate"
        this.rotationStyle = options.rotationStyle || 'all around';
        
        // 是否可拖动
        this.draggable = options.draggable || false;
        
        // 造型
        this.costumes = options.costumes || [];
        this.currentCostume = options.currentCostume || 0;
        
        // 声音
        this.sounds = options.sounds || [];
        this.volume = options.volume !== undefined ? options.volume : 100;
        
        // 说话/思考气泡
        this.say = null;
        this.think = null;
        this.sayTimer = null;
        
        // 图形特效
        this.effects = {
            color: 0,
            fisheye: 0,
            whirl: 0,
            pixelate: 0,
            mosaic: 0,
            brightness: 0,
            ghost: 0
        };
        
        // 变量和列表
        this.variables = new Map();
        this.lists = new Map();
        
        // 积木
        this.blocks = options.blocks || [];
        
        // 渲染器引用
        this.renderer = null;
    }
    
    // ==========================================
    // 运动方法
    // ==========================================
    
    /**
     * 移动指定步数
     */
    moveSteps(steps) {
        const radians = (this.direction - 90) * Math.PI / 180;
        this.x += Math.cos(radians) * steps;
        this.y += Math.sin(radians) * steps;
        this._updatePosition();
    }
    
    /**
     * 右转
     */
    turnRight(degrees) {
        this.direction = (this.direction + degrees) % 360;
        this._updateDirection();
    }
    
    /**
     * 左转
     */
    turnLeft(degrees) {
        this.direction = (this.direction - degrees + 360) % 360;
        this._updateDirection();
    }
    
    /**
     * 移动到指定位置
     */
    goTo(x, y) {
        this.x = x;
        this.y = y;
        this._updatePosition();
    }
    
    /**
     * 移动到目标（鼠标指针、随机位置、其他角色）
     */
    goToTarget(target) {
        if (target === 'mouse' || target === '鼠标指针') {
            // 需要运行时提供鼠标位置
            if (this._runtime) {
                this.x = this._runtime.mouseX;
                this.y = this._runtime.mouseY;
            }
        } else if (target === 'random' || target === '随机位置') {
            this.x = Math.random() * 480 - 240;
            this.y = Math.random() * 360 - 180;
        } else {
            // 移动到其他角色
            const other = this._findSprite(target);
            if (other) {
                this.x = other.x;
                this.y = other.y;
            }
        }
        this._updatePosition();
    }
    
    /**
     * 滑行到指定位置
     */
    glideTo(x, y, duration) {
        return new Promise(resolve => {
            const startX = this.x;
            const startY = this.y;
            const startTime = Date.now();
            const durationMs = duration * 1000;
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / durationMs, 1);
                
                // 缓动函数
                const ease = progress; // 可以换成其他缓动
                
                this.x = startX + (x - startX) * ease;
                this.y = startY + (y - startY) * ease;
                this._updatePosition();
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            animate();
        });
    }
    
    /**
     * 改变X坐标
     */
    changeXBy(dx) {
        this.x += dx;
        this._updatePosition();
    }
    
    /**
     * 设置X坐标
     */
    setXTo(x) {
        this.x = x;
        this._updatePosition();
    }
    
    /**
     * 改变Y坐标
     */
    changeYBy(dy) {
        this.y += dy;
        this._updatePosition();
    }
    
    /**
     * 设置Y坐标
     */
    setYTo(y) {
        this.y = y;
        this._updatePosition();
    }
    
    /**
     * 碰到边缘就反弹
     */
    ifOnEdgeBounce() {
        const bounds = this.getBounds();
        const stageWidth = 240;
        const stageHeight = 180;
        
        let bounced = false;
        
        // 左右边缘
        if (bounds.left < -stageWidth) {
            this.x = -stageWidth + bounds.width / 2;
            this.direction = 180 - this.direction;
            bounced = true;
        } else if (bounds.right > stageWidth) {
            this.x = stageWidth - bounds.width / 2;
            this.direction = 180 - this.direction;
            bounced = true;
        }
        
        // 上下边缘
        if (bounds.top > stageHeight) {
            this.y = stageHeight - bounds.height / 2;
            this.direction = -this.direction;
            bounced = true;
        } else if (bounds.bottom < -stageHeight) {
            this.y = -stageHeight + bounds.height / 2;
            this.direction = -this.direction;
            bounced = true;
        }
        
        if (bounced) {
            this.direction = (this.direction + 360) % 360;
            this._updatePosition();
            this._updateDirection();
        }
    }
    
    /**
     * 设置方向
     */
    pointInDirection(direction) {
        this.direction = direction % 360;
        this._updateDirection();
    }
    
    /**
     * 面向目标
     */
    pointTowards(target) {
        let targetX, targetY;
        
        if (target === 'mouse' || target === '鼠标指针') {
            if (this._runtime) {
                targetX = this._runtime.mouseX;
                targetY = this._runtime.mouseY;
            }
        } else {
            const other = this._findSprite(target);
            if (other) {
                targetX = other.x;
                targetY = other.y;
            }
        }
        
        if (targetX !== undefined && targetY !== undefined) {
            const dx = targetX - this.x;
            const dy = targetY - this.y;
            this.direction = Math.atan2(dy, dx) * 180 / Math.PI + 90;
            this._updateDirection();
        }
    }
    
    /**
     * 设置旋转样式
     */
    setRotationStyle(style) {
        this.rotationStyle = style;
        this._updateDirection();
    }
    
    // ==========================================
    // 外观方法
    // ==========================================
    
    /**
     * 说话
     */
    sayMessage(message, duration = null) {
        this.say = {
            type: 'say',
            message: String(message)
        };
        this.think = null;
        this._updateSayBubble();
        
        if (duration !== null) {
            if (this.sayTimer) {
                clearTimeout(this.sayTimer);
            }
            this.sayTimer = setTimeout(() => {
                this.say = null;
                this._updateSayBubble();
            }, duration * 1000);
        }
    }
    
    /**
     * 思考
     */
    thinkMessage(message, duration = null) {
        this.think = {
            type: 'think',
            message: String(message)
        };
        this.say = null;
        this._updateSayBubble();
        
        if (duration !== null) {
            if (this.sayTimer) {
                clearTimeout(this.sayTimer);
            }
            this.sayTimer = setTimeout(() => {
                this.think = null;
                this._updateSayBubble();
            }, duration * 1000);
        }
    }
    
    /**
     * 显示
     */
    show() {
        this.visible = true;
        this._updateVisibility();
    }
    
    /**
     * 隐藏
     */
    hide() {
        this.visible = false;
        this._updateVisibility();
    }
    
    /**
     * 切换造型
     */
    switchCostumeTo(costume) {
        if (typeof costume === 'number') {
            this.currentCostume = costume % this.costumes.length;
        } else if (typeof costume === 'string') {
            const index = this.costumes.findIndex(c => c.name === costume);
            if (index > -1) {
                this.currentCostume = index;
            }
        }
        this._updateCostume();
    }
    
    /**
     * 下一个造型
     */
    nextCostume() {
        if (this.costumes.length > 0) {
            this.currentCostume = (this.currentCostume + 1) % this.costumes.length;
            this._updateCostume();
        }
    }
    
    /**
     * 改变大小
     */
    changeSizeBy(change) {
        this.size = Math.max(1, this.size + change);
        this._updateSize();
    }
    
    /**
     * 设置大小
     */
    setSizeTo(size) {
        this.size = Math.max(1, size);
        this._updateSize();
    }
    
    /**
     * 设置图形特效
     */
    setEffect(effect, value) {
        this.effects[effect] = value;
        this._updateEffects();
    }
    
    /**
     * 改变图形特效
     */
    changeEffectBy(effect, change) {
        this.effects[effect] += change;
        this._updateEffects();
    }
    
    /**
     * 清除所有图形特效
     */
    clearEffects() {
        for (const effect in this.effects) {
            this.effects[effect] = 0;
        }
        this._updateEffects();
    }
    
    // ==========================================
    // 碰撞检测方法
    // ==========================================
    
    /**
     * 碰到物体？
     */
    touchingObject(object) {
        if (object === 'edge' || object === '边缘') {
            return this.touchingEdge();
        }
        if (object === 'mouse' || object === '鼠标指针') {
            return this.touchingMouse();
        }
        const other = this._findSprite(object);
        if (other) {
            return this.touchingSprite(other);
        }
        return false;
    }
    
    /**
     * 碰到边缘？
     */
    touchingEdge() {
        const bounds = this.getBounds();
        return bounds.left <= -240 || bounds.right >= 240 ||
               bounds.top >= 180 || bounds.bottom <= -180;
    }
    
    /**
     * 碰到鼠标？
     */
    touchingMouse() {
        if (!this._runtime) return false;
        const mx = this._runtime.mouseX;
        const my = this._runtime.mouseY;
        const bounds = this.getBounds();
        return mx >= bounds.left && mx <= bounds.right &&
               my >= bounds.bottom && my <= bounds.top;
    }
    
    /**
     * 碰到其他角色？
     */
    touchingSprite(other) {
        if (!other || !other.visible) return false;
        // 简单的矩形碰撞检测
        const b1 = this.getBounds();
        const b2 = other.getBounds();
        return !(b1.right < b2.left || b1.left > b2.right ||
                 b1.top < b2.bottom || b1.bottom > b2.top);
    }
    
    /**
     * 碰到颜色？
     */
    touchingColor(color) {
        // 需要渲染器支持
        if (this.renderer) {
            return this.renderer.spriteTouchingColor(this, color);
        }
        return false;
    }
    
    /**
     * 到目标的距离
     */
    distanceTo(target) {
        let targetX, targetY;
        
        if (target === 'mouse' || target === '鼠标指针') {
            if (this._runtime) {
                targetX = this._runtime.mouseX;
                targetY = this._runtime.mouseY;
            }
        } else {
            const other = this._findSprite(target);
            if (other) {
                targetX = other.x;
                targetY = other.y;
            }
        }
        
        if (targetX !== undefined && targetY !== undefined) {
            const dx = targetX - this.x;
            const dy = targetY - this.y;
            return Math.sqrt(dx * dx + dy * dy);
        }
        return 10000;
    }
    
    // ==========================================
    // 辅助方法
    // ==========================================
    
    /**
     * 获取边界
     */
    getBounds() {
        const costume = this.costumes[this.currentCostume];
        const width = costume ? costume.width * this.size / 100 : 48;
        const height = costume ? costume.height * this.size / 100 : 48;
        
        return {
            left: this.x - width / 2,
            right: this.x + width / 2,
            top: this.y + height / 2,
            bottom: this.y - height / 2,
            width: width,
            height: height
        };
    }
    
    /**
     * 克隆
     */
    clone() {
        const clone = new Sprite(this.name + ' (克隆)', {
            x: this.x,
            y: this.y,
            direction: this.direction,
            size: this.size,
            visible: this.visible,
            rotationStyle: this.rotationStyle,
            costumes: this.costumes,
            currentCostume: this.currentCostume,
            sounds: this.sounds,
            volume: this.volume,
            blocks: this.blocks
        });
        clone.isClone = true;
        clone.cloneSource = this.id;
        return clone;
    }
    
    /**
     * 转换为JSON
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            isStage: this.isStage,
            x: this.x,
            y: this.y,
            direction: this.direction,
            size: this.size,
            visible: this.visible,
            layerOrder: this.layerOrder,
            rotationStyle: this.rotationStyle,
            draggable: this.draggable,
            costumes: this.costumes,
            currentCostume: this.currentCostume,
            sounds: this.sounds,
            volume: this.volume,
            effects: this.effects,
            blocks: this.blocks
        };
    }
    
    /**
     * 从JSON创建
     */
    static fromJSON(json) {
        const sprite = new Sprite(json.name, json);
        sprite.id = json.id;
        sprite.isStage = json.isStage;
        return sprite;
    }
    
    // 内部方法
    _findSprite(name) {
        if (this._runtime) {
            return this._runtime.sprites.find(s => s.name === name);
        }
        return null;
    }
    
    _updatePosition() {
        if (this.renderer) {
            this.renderer.updateSpritePosition(this);
        }
    }
    
    _updateDirection() {
        if (this.renderer) {
            this.renderer.updateSpriteDirection(this);
        }
    }
    
    _updateVisibility() {
        if (this.renderer) {
            this.renderer.updateSpriteVisibility(this);
        }
    }
    
    _updateSize() {
        if (this.renderer) {
            this.renderer.updateSpriteSize(this);
        }
    }
    
    _updateCostume() {
        if (this.renderer) {
            this.renderer.updateSpriteCostume(this);
        }
    }
    
    _updateEffects() {
        if (this.renderer) {
            this.renderer.updateSpriteEffects(this);
        }
    }
    
    _updateSayBubble() {
        if (this.renderer) {
            this.renderer.updateSayBubble(this);
        }
    }
}

// 导出
if (typeof window !== 'undefined') {
    window.Sprite = Sprite;
}

console.log('精灵类加载完成');
