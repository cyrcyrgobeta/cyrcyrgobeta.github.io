/**
 * Scratch S2 编辑器 - 拼图连接系统
 * 精美的积木拖拽和连接效果
 */

class PuzzleConnectionManager {
    constructor() {
        // 配置
        this.config = {
            notchWidth: 18,
            notchHeight: 6,
            notchOffset: 20,
            snapDistance: 30,
            animationDuration: 150
        };
        
        // 连接关系
        this.connections = new Map();
        
        // UI元素
        this.snapIndicator = null;
        this.isDragging = false;
        
        // 初始化
        this._init();
    }
    
    _init() {
        // 创建连接指示器
        this.snapIndicator = document.createElement('div');
        this.snapIndicator.className = 'connection-indicator';
        this.snapIndicator.style.display = 'none';
        document.body.appendChild(this.snapIndicator);
        
        console.log('拼图连接系统初始化完成');
    }
    
    /**
     * 获取积木的连接点
     */
    getConnectionPoints(block) {
        const rect = block.getBoundingClientRect();
        const workspace = document.getElementById('workspace-canvas');
        const workspaceRect = workspace ? workspace.getBoundingClientRect() : { left: 0, top: 0 };
        
        return {
            top: {
                x: rect.left - workspaceRect.left + this.config.notchOffset + this.config.notchWidth / 2,
                y: rect.top - workspaceRect.top
            },
            bottom: {
                x: rect.left - workspaceRect.left + this.config.notchOffset + this.config.notchWidth / 2,
                y: rect.bottom - workspaceRect.top
            }
        };
    }
    
    /**
     * 检测是否可以连接
     */
    canConnect(dragged, target) {
        if (dragged === target) return { canConnect: false };
        
        const draggedPoints = this.getConnectionPoints(dragged);
        const targetPoints = this.getConnectionPoints(target);
        
        // 计算距离
        const bottomDist = this._distance(draggedPoints.top, targetPoints.bottom);
        const topDist = this._distance(draggedPoints.bottom, targetPoints.top);
        
        const threshold = this.config.snapDistance;
        
        if (bottomDist < threshold) {
            return { canConnect: true, position: 'below', target: target };
        }
        
        if (topDist < threshold) {
            return { canConnect: true, position: 'above', target: target };
        }
        
        return { canConnect: false };
    }
    
    /**
     * 计算两点距离
     */
    _distance(p1, p2) {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    }
    
    /**
     * 找到最佳连接目标
     */
    findBestConnection(dragged) {
        const blocks = document.querySelectorAll('.workspace-block');
        let bestConnection = null;
        let minDistance = Infinity;
        
        blocks.forEach(target => {
            if (target === dragged) return;
            
            const connection = this.canConnect(dragged, target);
            
            if (connection.canConnect) {
                const draggedPoints = this.getConnectionPoints(dragged);
                const targetPoints = this.getConnectionPoints(target);
                
                let distance;
                if (connection.position === 'below') {
                    distance = this._distance(draggedPoints.top, targetPoints.bottom);
                } else {
                    distance = this._distance(draggedPoints.bottom, targetPoints.top);
                }
                
                if (distance < minDistance) {
                    minDistance = distance;
                    bestConnection = connection;
                }
            }
        });
        
        return bestConnection;
    }
    
    /**
     * 执行连接动画
     */
    animateConnection(block, targetPosition) {
        return new Promise(resolve => {
            const startX = parseFloat(block.style.left);
            const startY = parseFloat(block.style.top);
            const targetX = targetPosition.x;
            const targetY = targetPosition.y;
            
            const startTime = performance.now();
            const duration = this.config.animationDuration;
            
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // 缓动函数
                const ease = 1 - Math.pow(1 - progress, 3);
                
                const currentX = startX + (targetX - startX) * ease;
                const currentY = startY + (targetY - startY) * ease;
                
                block.style.left = currentX + 'px';
                block.style.top = currentY + 'px';
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    block.classList.add('connected');
                    setTimeout(() => block.classList.remove('connected'), 300);
                    resolve();
                }
            };
            
            requestAnimationFrame(animate);
        });
    }
    
    /**
     * 吸附到目标位置
     */
    snapToTarget(dragged, target, position) {
        const targetRect = target.getBoundingClientRect();
        const workspace = document.getElementById('workspace-canvas');
        const workspaceRect = workspace ? workspace.getBoundingClientRect() : { left: 0, top: 0 };
        const draggedRect = dragged.getBoundingClientRect();
        
        let snapX, snapY;
        
        if (position === 'below') {
            snapX = parseFloat(target.style.left);
            snapY = parseFloat(target.style.top) + targetRect.height - this.config.notchHeight;
        } else {
            snapX = parseFloat(target.style.left);
            snapY = parseFloat(target.style.top) - draggedRect.height + this.config.notchHeight;
        }
        
        return { x: snapX, y: snapY };
    }
    
    /**
     * 记录连接关系
     */
    recordConnection(aboveBlock, belowBlock) {
        const aboveId = aboveBlock.dataset.blockId;
        const belowId = belowBlock.dataset.blockId;
        
        // 更新连接映射
        if (!this.connections.has(aboveId)) {
            this.connections.set(aboveId, {});
        }
        this.connections.get(aboveId).below = belowId;
        
        if (!this.connections.has(belowId)) {
            this.connections.set(belowId, {});
        }
        this.connections.get(belowId).above = aboveId;
        
        // 更新样式类
        aboveBlock.classList.add('has-block-below');
        belowBlock.classList.add('has-block-above');
        
        console.log('连接记录:', aboveBlock.dataset.opcode, '->', belowBlock.dataset.opcode);
    }
    
    /**
     * 断开连接
     */
    breakConnection(block) {
        const blockId = block.dataset.blockId;
        const connection = this.connections.get(blockId);
        
        if (connection) {
            // 断开上方连接
            if (connection.above) {
                const aboveBlock = document.querySelector(`[data-block-id="${connection.above}"]`);
                if (aboveBlock) {
                    aboveBlock.classList.remove('has-block-below');
                    const aboveConn = this.connections.get(connection.above);
                    if (aboveConn) {
                        aboveConn.below = null;
                    }
                }
            }
            
            // 断开下方连接
            if (connection.below) {
                const belowBlock = document.querySelector(`[data-block-id="${connection.below}"]`);
                if (belowBlock) {
                    belowBlock.classList.remove('has-block-above');
                    const belowConn = this.connections.get(connection.below);
                    if (belowConn) {
                        belowConn.above = null;
                    }
                }
            }
            
            this.connections.delete(blockId);
        }
        
        block.classList.remove('has-block-above', 'has-block-below');
    }
    
    /**
     * 显示连接指示器
     */
    showIndicator(x, y) {
        this.snapIndicator.style.left = (x - 12) + 'px';
        this.snapIndicator.style.top = (y - 12) + 'px';
        this.snapIndicator.style.display = 'block';
    }
    
    /**
     * 隐藏连接指示器
     */
    hideIndicator() {
        this.snapIndicator.style.display = 'none';
    }
    
    /**
     * 获取连接链
     */
    getConnectionChain(blockId) {
        const chain = [];
        let currentId = blockId;
        
        // 向上查找
        while (currentId) {
            const connection = this.connections.get(currentId);
            if (connection && connection.above) {
                currentId = connection.above;
            } else {
                break;
            }
        }
        
        // 从顶部向下遍历
        const topId = currentId;
        currentId = topId;
        
        while (currentId) {
            chain.push(currentId);
            const connection = this.connections.get(currentId);
            if (connection && connection.below) {
                currentId = connection.below;
            } else {
                break;
            }
        }
        
        return chain;
    }
}

// 创建全局实例
window.puzzleManager = new PuzzleConnectionManager();

console.log('拼图连接系统加载完成');
