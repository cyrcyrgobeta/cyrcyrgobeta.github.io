/**
 * Scratch S2 编辑器 - UI组件：模态框
 */

class ModalManager {
    constructor() {
        this.activeModal = null;
    }
    
    show(options) {
        const { title, content, buttons = [], width = 'md' } = options;
        
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        
        const modal = document.createElement('div');
        modal.className = `modal modal-${width}`;
        
        modal.innerHTML = `
            <div class="modal-header">
                <h3 class="modal-title">${title}</h3>
                <button class="modal-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">${content}</div>
            <div class="modal-footer"></div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        this.activeModal = overlay;
        
        return new Promise(resolve => {
            modal.querySelector('.modal-close').onclick = () => {
                this.close();
                resolve(null);
            };
        });
    }
    
    close() {
        if (this.activeModal) {
            this.activeModal.classList.remove('active');
            setTimeout(() => {
                this.activeModal.remove();
                this.activeModal = null;
            }, 300);
        }
    }
}

window.modalManager = new ModalManager();
console.log('模态框组件加载完成');
