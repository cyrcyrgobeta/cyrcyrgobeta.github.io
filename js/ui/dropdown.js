/**
 * Scratch S2 编辑器 - UI组件：下拉菜单
 */

class DropdownManager {
    constructor() {
        this.activeDropdown = null;
        this._initListeners();
    }
    
    _initListeners() {
        document.addEventListener('click', (e) => {
            if (this.activeDropdown && !e.target.closest('.dropdown')) {
                this.closeAll();
            }
        });
    }
    
    closeAll() {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.style.display = '';
        });
        this.activeDropdown = null;
    }
}

window.dropdownManager = new DropdownManager();
console.log('下拉菜单组件加载完成');
