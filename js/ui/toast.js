/**
 * Scratch S2 编辑器 - UI组件：Toast通知
 */

class ToastManager {
    constructor() {
        this.container = document.getElementById('toast-container');
    }
    
    show(message, type = 'info', duration = 3000) {
        if (!this.container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: 'check',
            error: 'times',
            warning: 'exclamation',
            info: 'info'
        };
        
        toast.innerHTML = `
            <div class="toast-icon"><i class="fas fa-${icons[type]}"></i></div>
            <div class="toast-content"><div class="toast-message">${message}</div></div>
        `;
        
        this.container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('toast-exit');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
    
    success(message) { this.show(message, 'success'); }
    error(message) { this.show(message, 'error'); }
    warning(message) { this.show(message, 'warning'); }
    info(message) { this.show(message, 'info'); }
}

window.toastManager = new ToastManager();
console.log('Toast组件加载完成');
