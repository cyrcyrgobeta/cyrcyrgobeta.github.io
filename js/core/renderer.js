/**
 * Scratch S2 编辑器 - 舞台渲染器
 * 使用Canvas渲染舞台和所有角色
 */

class StageRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // 舞台尺寸
        this.width = canvas.width || 480;
        this.height = canvas.height || 360;
        
        // 背景
        this.backgrounds = [];
        this.currentBackground = 0;
        this.backgroundColor = '#FFFFFF';
        
        // 精灵列表
        this.sprites = [];
        
        // 缩放
        this.zoom = 1;
        
        // 渲染循环
        this.animationId = null;
        this.needsRedraw = true;
        
        // 说话气泡层
        this.speechLayer = document.getElementById('speech-layer');
        
        console.log('舞台渲染器初始化完成');
    }
    
    /**
     * 开始渲染循环
     */
    start() {
        const render = () => {
            if (this.needsRedraw) {
                this.render();
                this.needsRedraw = false;
            }
            this.animationId = requestAnimationFrame(render);
        };
        render();
    }
    
    /**
     * 停止渲染循环
     */
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    /**
     * 主渲染方法
     */
    render() {
        // 清除画布
        this.clear();
        
        // 绘制背景
        this.renderBackground();
        
        // 按图层顺序绘制精灵
        this.renderSprites();
        
        // 绘制说话气泡
        this.renderSpeechBubbles();
    }
    
    /**
     * 清除画布
     */
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
    
    /**
     * 渲染背景
     */
    renderBackground() {
        if (this.backgrounds.length > 0 && this.backgrounds[this.currentBackground]) {
            const bg = this.backgrounds[this.currentBackground];
            
            if (bg.image) {
                // 图片背景
                if (bg.image.complete) {
                    this.ctx.drawImage(bg.image, 0, 0, this.width, this.height);
                } else {
                    // 图片未加载，显示默认背景
                    this._renderDefaultBackground();
                }
            } else if (bg.color) {
                // 颜色背景
                this.ctx.fillStyle = bg.color;
                this.ctx.fillRect(0, 0, this.width, this.height);
            }
        } else {
            // 默认背景
            this._renderDefaultBackground();
        }
    }
    
    /**
     * 渲染默认背景
     */
    _renderDefaultBackground() {
        // 渐变天空背景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, '#87CEEB');
        gradient.addColorStop(0.7, '#7CFC00');
        gradient.addColorStop(1, '#228B22');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // 绘制网格点
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        for (let x = 0; x < this.width; x += 20) {
            for (let y = 0; y < this.height; y += 20) {
                this.ctx.beginPath();
                this.ctx.arc(x, y, 1, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }
    
    /**
     * 渲染所有精灵
     */
    renderSprites() {
        // 按图层排序
        const sortedSprites = [...this.sprites].sort((a, b) => a.layerOrder - b.layerOrder);
        
        for (const sprite of sortedSprites) {
            if (sprite.visible) {
                this.renderSprite(sprite);
            }
        }
    }
    
    /**
     * 渲染单个精灵
     */
    renderSprite(sprite) {
        // 转换坐标 (Scratch中心坐标 -> Canvas坐标)
        const canvasX = this.width / 2 + sprite.x;
        const canvasY = this.height / 2 - sprite.y; // Y轴反向
        
        // 保存上下文
        this.ctx.save();
        
        // 移动到精灵位置
        this.ctx.translate(canvasX, canvasY);
        
        // 旋转
        const rotationDeg = sprite.direction - 90;
        
        // 根据旋转样式
        if (sprite.rotationStyle === 'left-right') {
            if (sprite.direction > 180) {
                this.ctx.scale(-1, 1);
            }
        } else if (sprite.rotationStyle !== "don't rotate") {
            this.ctx.rotate(rotationDeg * Math.PI / 180);
        }
        
        // 缩放
        const scale = sprite.size / 100;
        this.ctx.scale(scale, scale);
        
        // 应用图形特效
        this._applyEffects(sprite.effects);
        
        // 绘制精灵
        if (sprite.costumes && sprite.costumes.length > 0) {
            const costume = sprite.costumes[sprite.currentCostume];
            if (costume) {
                if (costume.image) {
                    // 有造型图片
                    this._renderCostumeImage(costume);
                } else {
                    // 绘制占位符
                    this._renderPlaceholder(sprite);
                }
            } else {
                this._renderPlaceholder(sprite);
            }
        } else {
            this._renderPlaceholder(sprite);
        }
        
        // 恢复上下文
        this.ctx.restore();
    }
    
    /**
     * 渲染造型图片
     */
    _renderCostumeImage(costume) {
        if (costume.image.complete) {
            const width = costume.image.width;
            const height = costume.image.height;
            this.ctx.drawImage(costume.image, -width / 2, -height / 2, width, height);
        } else {
            // 图片未加载完成，绘制占位符
            this.ctx.fillStyle = '#FF6B6B';
            this.ctx.fillRect(-24, -24, 48, 48);
        }
    }
    
    /**
     * 渲染占位符（默认小猫）
     */
    _renderPlaceholder(sprite) {
        // 绘制小猫样式的占位符
        this.ctx.fillStyle = '#FF8C1A';
        this.ctx.strokeStyle = '#CC6600';
        this.ctx.lineWidth = 2;
        
        // 身体
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 24, 20, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        // 头
        this.ctx.beginPath();
        this.ctx.arc(0, -20, 16, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        // 耳朵
        this.ctx.beginPath();
        this.ctx.moveTo(-12, -32);
        this.ctx.lineTo(-8, -42);
        this.ctx.lineTo(-4, -32);
        this.ctx.fill();
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(12, -32);
        this.ctx.lineTo(8, -42);
        this.ctx.lineTo(4, -32);
        this.ctx.fill();
        this.ctx.stroke();
        
        // 眼睛
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(-6, -22, 5, 0, Math.PI * 2);
        this.ctx.arc(6, -22, 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 瞳孔
        this.ctx.fillStyle = '#333';
        this.ctx.beginPath();
        this.ctx.arc(-6, -22, 2, 0, Math.PI * 2);
        this.ctx.arc(6, -22, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 鼻子
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.beginPath();
        this.ctx.arc(0, -16, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 嘴巴
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -13);
        this.ctx.lineTo(0, -10);
        this.ctx.moveTo(-3, -10);
        this.ctx.quadraticCurveTo(0, -7, 3, -10);
        this.ctx.stroke();
        
        // 尾巴
        this.ctx.strokeStyle = '#FF8C1A';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(20, 10);
        this.ctx.quadraticCurveTo(35, 5, 30, -10);
        this.ctx.stroke();
    }
    
    /**
     * 应用图形特效
     */
    _applyEffects(effects) {
        const filters = [];
        
        if (effects.brightness !== 0) {
            filters.push(`brightness(${100 + effects.brightness}%)`);
        }
        if (effects.ghost !== 0) {
            this.ctx.globalAlpha = 1 - effects.ghost / 100;
        }
        if (effects.color !== 0) {
            filters.push(`hue-rotate(${effects.color * 3.6}deg)`);
        }
        
        if (filters.length > 0) {
            this.ctx.filter = filters.join(' ');
        }
    }
    
    /**
     * 渲染说话气泡
     */
    renderSpeechBubbles() {
        if (!this.speechLayer) return;
        
        // 清除现有气泡
        this.speechLayer.innerHTML = '';
        
        for (const sprite of this.sprites) {
            if (!sprite.visible) continue;
            
            const speech = sprite.say || sprite.think;
            if (!speech) continue;
            
            // 创建气泡元素
            const bubble = document.createElement('div');
            bubble.className = `speech-bubble speech-bubble-${speech.type}`;
            bubble.textContent = speech.message;
            
            // 计算位置
            const canvasX = this.width / 2 + sprite.x;
            const canvasY = this.height / 2 - sprite.y;
            const size = sprite.size / 100;
            const topOffset = -40 * size;
            
            bubble.style.left = `${canvasX}px`;
            bubble.style.top = `${canvasY + topOffset}px`;
            
            this.speechLayer.appendChild(bubble);
        }
    }
    
    /**
     * 更新精灵位置
     */
    updateSpritePosition(sprite) {
        this.needsRedraw = true;
    }
    
    /**
     * 更新精灵方向
     */
    updateSpriteDirection(sprite) {
        this.needsRedraw = true;
    }
    
    /**
     * 更新精灵可见性
     */
    updateSpriteVisibility(sprite) {
        this.needsRedraw = true;
    }
    
    /**
     * 更新精灵大小
     */
    updateSpriteSize(sprite) {
        this.needsRedraw = true;
    }
    
    /**
     * 更新精灵造型
     */
    updateSpriteCostume(sprite) {
        this.needsRedraw = true;
    }
    
    /**
     * 更新精灵特效
     */
    updateSpriteEffects(sprite) {
        this.needsRedraw = true;
    }
    
    /**
     * 更新说话气泡
     */
    updateSayBubble(sprite) {
        this.renderSpeechBubbles();
    }
    
    /**
     * 设置精灵列表
     */
    setSprites(sprites) {
        this.sprites = sprites;
        this.needsRedraw = true;
    }
    
    /**
     * 添加背景
     */
    addBackground(background) {
        this.backgrounds.push(background);
        this.needsRedraw = true;
    }
    
    /**
     * 设置当前背景
     */
    setCurrentBackground(index) {
        if (index >= 0 && index < this.backgrounds.length) {
            this.currentBackground = index;
            this.needsRedraw = true;
        }
    }
    
    /**
     * 下一个背景
     */
    nextBackground() {
        this.currentBackground = (this.currentBackground + 1) % this.backgrounds.length;
        this.needsRedraw = true;
    }
    
    /**
     * 设置缩放
     */
    setZoom(zoom) {
        this.zoom = Math.max(0.5, Math.min(3, zoom));
        this.needsRedraw = true;
    }
    
    /**
     * 导出为图片
     */
    toDataURL(format = 'image/png') {
        return this.canvas.toDataURL(format);
    }
    
    /**
     * 截图
     */
    snapshot() {
        const dataURL = this.toDataURL();
        const link = document.createElement('a');
        link.download = `scratch-snapshot-${Date.now()}.png`;
        link.href = dataURL;
        link.click();
    }
    
    /**
     * 精灵碰到颜色检测
     */
    spriteTouchingColor(sprite, color) {
        // 简化实现：获取精灵位置的像素颜色
        const canvasX = this.width / 2 + sprite.x;
        const canvasY = this.height / 2 - sprite.y;
        
        const imageData = this.ctx.getImageData(canvasX, canvasY, 1, 1);
        const pixel = imageData.data;
        
        // 将颜色转换为RGB
        const targetColor = this._hexToRgb(color);
        
        // 比较
        return Math.abs(pixel[0] - targetColor.r) < 20 &&
               Math.abs(pixel[1] - targetColor.g) < 20 &&
               Math.abs(pixel[2] - targetColor.b) < 20;
    }
    
    /**
     * 十六进制转RGB
     */
    _hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }
    
    /**
     * 调整大小
     */
    resize(width, height) {
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
        this.needsRedraw = true;
    }
}

// 导出
if (typeof window !== 'undefined') {
    window.StageRenderer = StageRenderer;
}

console.log('舞台渲染器加载完成');
