/**
 * Scratch S2 编辑器 - 输入编辑器
 * 处理积木中的各种输入类型
 */

class InputEditor {
    constructor() {
        this.activeInput = null;
    }
    
    /**
     * 创建数字输入
     */
    createNumberInput(value = 0) {
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'block-input number-input';
        input.value = value;
        return input;
    }
    
    /**
     * 创建字符串输入
     */
    createStringInput(value = '') {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'block-input string-input';
        input.value = value;
        return input;
    }
    
    /**
     * 创建下拉选择
     */
    createDropdown(options, selected = '') {
        const select = document.createElement('select');
        select.className = 'block-input dropdown-input';
        
        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt;
            option.textContent = opt;
            if (opt === selected) option.selected = true;
            select.appendChild(option);
        });
        
        return select;
    }
    
    /**
     * 创建颜色输入
     */
    createColorInput(color = '#FF0000') {
        const input = document.createElement('input');
        input.type = 'color';
        input.className = 'block-input color-input';
        input.value = color;
        return input;
    }
}

window.inputEditor = new InputEditor();

console.log('输入编辑器加载完成');
