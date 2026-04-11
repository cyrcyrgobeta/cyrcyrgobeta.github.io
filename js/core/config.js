/**
 * Scratch S2 编辑器 - 配置文件
 * 全局配置和常量定义
 */

const CONFIG = {
    // 应用信息
    APP_NAME: 'Scratch S2',
    VERSION: '1.0.0',
    BUILD_DATE: '2026-04-11',
    
    // 舞台尺寸
    STAGE: {
        WIDTH: 480,
        HEIGHT: 360,
        WIDTH_HALF: 240,
        HEIGHT_HALF: 180,
        MIN_ZOOM: 0.5,
        MAX_ZOOM: 3,
        DEFAULT_ZOOM: 1
    },
    
    // 积木配置
    BLOCKS: {
        // 凹槽尺寸
        NOTCH_WIDTH: 18,
        NOTCH_HEIGHT: 6,
        NOTCH_OFFSET: 20,
        
        // 连接配置
        SNAP_DISTANCE: 30,
        SNAP_THRESHOLD: 15,
        
        // 动画
        CONNECT_ANIMATION_DURATION: 150,
        CONNECT_ANIMATION_EASING: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        
        // 最小尺寸
        MIN_WIDTH: 140,
        MIN_HEIGHT: 36
    },
    
    // 积木颜色 - Scratch官方配色
    COLORS: {
        CATEGORIES: {
            motion: '#4C97FF',
            looks: '#9966FF',
            sound: '#D65CD6',
            events: '#FFBF00',
            control: '#FFAB19',
            sensing: '#5CB1D6',
            operators: '#59C059',
            variables: '#FF8C1A',
            myblocks: '#FF6680'
        },
        CATEGORIES_DARK: {
            motion: '#3373CC',
            looks: '#774DCB',
            sound: '#BB42BB',
            events: '#CC9900',
            control: '#CF8B17',
            sensing: '#2E8EB8',
            operators: '#389438',
            variables: '#DB6E00',
            myblocks: '#CC4466'
        },
        UI: {
            primary: '#4C97FF',
            primaryDark: '#3373CC',
            primaryLight: '#8BB8FF',
            success: '#2DC653',
            warning: '#FFAB19',
            danger: '#FF661A',
            info: '#5CB1D6'
        }
    },
    
    // 运行时配置
    RUNTIME: {
        // 最大线程数
        MAX_THREADS: 100,
        
        // 帧率
        TARGET_FPS: 60,
        TURBO_FPS: 1000,
        
        // 步进模式延迟
        STEP_INTERVAL: 100,
        
        // 克隆限制
        MAX_CLONES: 300,
        
        // 列表长度限制
        MAX_LIST_LENGTH: 100000,
        
        // 字符串长度限制
        MAX_STRING_LENGTH: 10000
    },
    
    // 声音配置
    SOUND: {
        MAX_VOLUME: 100,
        MIN_VOLUME: 0,
        DEFAULT_VOLUME: 100
    },
    
    // 存储配置
    STORAGE: {
        AUTO_SAVE_INTERVAL: 30000, // 30秒
        MAX_LOCAL_STORAGE: 5 * 1024 * 1024, // 5MB
        PROJECT_PREFIX: 's2_project_'
    },
    
    // 快捷键
    SHORTCUTS: {
        SAVE: 'Ctrl+S',
        OPEN: 'Ctrl+O',
        NEW: 'Ctrl+N',
        UNDO: 'Ctrl+Z',
        REDO: 'Ctrl+Y',
        RUN: 'Ctrl+R',
        DELETE: 'Delete',
        COPY: 'Ctrl+C',
        CUT: 'Ctrl+X',
        PASTE: 'Ctrl+V',
        FIND: 'Ctrl+F',
        FULLSCREEN: 'F11'
    },
    
    // 支持的文件格式
    FILE_FORMATS: {
        PROJECT: '.sb3',
        PROJECT_JSON: '.json',
        SPRITE: '.sprite3',
        IMAGE: ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.bmp'],
        SOUND: ['.mp3', '.wav', '.ogg', '.m4a']
    },
    
    // 默认角色
    DEFAULT_SPRITE: {
        name: '角色1',
        x: 0,
        y: 0,
        direction: 90,
        size: 100,
        visible: true,
        draggable: false,
        rotationStyle: 'all around'
    },
    
    // UI配置
    UI: {
        PANEL_MIN_WIDTH: 200,
        BLOCKS_PANEL_WIDTH: 280,
        STAGE_PANEL_WIDTH: 480,
        TOAST_DURATION: 3000,
        MODAL_ANIMATION_DURATION: 300
    },
    
    // 国际化
    I18N: {
        DEFAULT_LANGUAGE: 'zh-CN',
        SUPPORTED_LANGUAGES: ['zh-CN', 'en']
    },
    
    // 扩展
    EXTENSIONS: {
        ENABLED_BY_DEFAULT: [],
        MAX_EXTENSIONS: 20
    }
};

// 积木定义 - 完整的Scratch积木集
const BLOCKS_DEFINITION = {
    // 运动积木
    motion: {
        id: 'motion',
        name: '运动',
        color: '#4C97FF',
        icon: 'fa-running',
        blocks: [
            { opcode: 'motion_movesteps', text: '移动 {steps} 步', defaults: { steps: 10 } },
            { opcode: 'motion_turnright', text: '右转 {degrees} 度', defaults: { degrees: 15 } },
            { opcode: 'motion_turnleft', text: '左转 {degrees} 度', defaults: { degrees: 15 } },
            { opcode: 'motion_goto', text: '移到 x:{x} y:{y}', defaults: { x: 0, y: 0 } },
            { opcode: 'motion_goto_menu', text: '移到 {target}', defaults: { target: '随机位置' } },
            { opcode: 'motion_glidesecstoxy', text: '在 {secs} 秒内滑行到 x:{x} y:{y}', defaults: { secs: 1, x: 0, y: 0 } },
            { opcode: 'motion_glideto', text: '在 {secs} 秒内滑行到 {target}', defaults: { secs: 1, target: '随机位置' } },
            { opcode: 'motion_changexby', text: '将 x 坐标增加 {dx}', defaults: { dx: 10 } },
            { opcode: 'motion_setx', text: '将 x 坐标设为 {x}', defaults: { x: 0 } },
            { opcode: 'motion_changeyby', text: '将 y 坐标增加 {dy}', defaults: { dy: 10 } },
            { opcode: 'motion_sety', text: '将 y 坐标设为 {y}', defaults: { y: 0 } },
            { opcode: 'motion_ifonedgebounce', text: '碰到边缘就反弹' },
            { opcode: 'motion_setrotationstyle', text: '将旋转方式设为 {style}', defaults: { style: '左右翻转' } },
            { opcode: 'motion_pointindirection', text: '面向 {direction} 方向', defaults: { direction: 90 } },
            { opcode: 'motion_pointtowards', text: '面向 {target}', defaults: { target: '鼠标指针' } },
            { opcode: 'motion_xposition', text: 'x 坐标', type: 'reporter' },
            { opcode: 'motion_yposition', text: 'y 坐标', type: 'reporter' },
            { opcode: 'motion_direction', text: '方向', type: 'reporter' },
            { opcode: 'motion_scroll_right', text: '向右滚动 {pixels} 像素', defaults: { pixels: 10 } },
            { opcode: 'motion_scroll_up', text: '向上滚动 {pixels} 像素', defaults: { pixels: 10 } },
            { opcode: 'motion_align_scene', text: '对齐场景 {alignment}', defaults: { alignment: '中间' } },
            { opcode: 'motion_x_scroll', text: 'x 滚动位置', type: 'reporter' },
            { opcode: 'motion_y_scroll', text: 'y 滚动位置', type: 'reporter' }
        ]
    },
    
    // 外观积木
    looks: {
        id: 'looks',
        name: '外观',
        color: '#9966FF',
        icon: 'fa-tshirt',
        blocks: [
            { opcode: 'looks_say', text: '说 {message}', defaults: { message: '你好！' } },
            { opcode: 'looks_sayforsecs', text: '说 {message} {secs} 秒', defaults: { message: '你好！', secs: 2 } },
            { opcode: 'looks_think', text: '想 {message}', defaults: { message: '嗯...' } },
            { opcode: 'looks_thinkforsecs', text: '想 {message} {secs} 秒', defaults: { message: '嗯...', secs: 2 } },
            { opcode: 'looks_show', text: '显示' },
            { opcode: 'looks_hide', text: '隐藏' },
            { opcode: 'looks_switchcostumeto', text: '换成 {costume} 造型', defaults: { costume: '造型1' } },
            { opcode: 'looks_nextcostume', text: '下一个造型' },
            { opcode: 'looks_switchbackdropto', text: '换成 {backdrop} 背景', defaults: { backdrop: '背景1' } },
            { opcode: 'looks_nextbackdrop', text: '下一个背景' },
            { opcode: 'looks_changesizeby', text: '将大小增加 {change}', defaults: { change: 10 } },
            { opcode: 'looks_setsizeto', text: '将大小设为 {size}%', defaults: { size: 100 } },
            { opcode: 'looks_changeeffectby', text: '将 {effect} 特效增加 {change}', defaults: { effect: '颜色', change: 25 } },
            { opcode: 'looks_seteffectto', text: '将 {effect} 特效设为 {value}', defaults: { effect: '颜色', value: 0 } },
            { opcode: 'looks_cleargraphiceffects', text: '清除所有图形特效' },
            { opcode: 'looks_size', text: '大小', type: 'reporter' },
            { opcode: 'looks_costumeorder', text: '造型编号', type: 'reporter' },
            { opcode: 'looks_backdroporder', text: '背景编号', type: 'reporter' },
            { opcode: 'looks_backdropname', text: '背景名称', type: 'reporter' },
            { opcode: 'looks_goforwardbackwardlayers', text: '{direction} {layers} 层', defaults: { direction: '前移', layers: 1 } },
            { opcode: 'looks_gotofrontback', text: '移到 {where}', defaults: { where: '最前面' } }
        ]
    },
    
    // 声音积木
    sound: {
        id: 'sound',
        name: '声音',
        color: '#D65CD6',
        icon: 'fa-volume-up',
        blocks: [
            { opcode: 'sound_play', text: '播放声音 {sound}', defaults: { sound: '喵' } },
            { opcode: 'sound_playuntildone', text: '播放声音 {sound} 直到播放完毕', defaults: { sound: '喵' } },
            { opcode: 'sound_stopallsounds', text: '停止所有声音' },
            { opcode: 'sound_changevolumeby', text: '将音量增加 {volume}', defaults: { volume: 10 } },
            { opcode: 'sound_setvolumeto', text: '将音量设为 {volume}%', defaults: { volume: 100 } },
            { opcode: 'sound_volume', text: '音量', type: 'reporter' },
            { opcode: 'sound_changeeffectby', text: '将 {effect} 特效增加 {value}', defaults: { effect: '音调', value: 10 } },
            { opcode: 'sound_seteffectto', text: '将 {effect} 特效设为 {value}', defaults: { effect: '音调', value: 100 } },
            { opcode: 'sound_cleareffects', text: '清除所有音效' }
        ]
    },
    
    // 事件积木
    events: {
        id: 'events',
        name: '事件',
        color: '#FFBF00',
        icon: 'fa-flag',
        blocks: [
            { opcode: 'event_whenflagclicked', text: '当 ⚑ 被点击', type: 'hat' },
            { opcode: 'event_whenkeypressed', text: '当按下 {key} 键', defaults: { key: '空格' }, type: 'hat' },
            { opcode: 'event_whenstageclicked', text: '当舞台被点击', type: 'hat' },
            { opcode: 'event_whenthisspriteclicked', text: '当角色被点击', type: 'hat' },
            { opcode: 'event_whenbackdropswitchesto', text: '当背景换成 {backdrop}', defaults: { backdrop: '背景1' }, type: 'hat' },
            { opcode: 'event_whengreaterthan', text: '当 {variable} > {value}', defaults: { variable: '计时器', value: 10 }, type: 'hat' },
            { opcode: 'event_whenbroadcastreceived', text: '当接收到 {message}', defaults: { message: '消息1' }, type: 'hat' },
            { opcode: 'event_broadcast', text: '广播 {message}', defaults: { message: '消息1' } },
            { opcode: 'event_broadcastandwait', text: '广播 {message} 并等待', defaults: { message: '消息1' } },
            { opcode: 'event_broadcast_menu', text: '{message}', type: 'reporter', defaults: { message: '消息1' } }
        ]
    },
    
    // 控制积木
    control: {
        id: 'control',
        name: '控制',
        color: '#FFAB19',
        icon: 'fa-sync',
        blocks: [
            { opcode: 'control_wait', text: '等待 {secs} 秒', defaults: { secs: 1 } },
            { opcode: 'control_waituntil', text: '等待直到 {condition}', type: 'wait' },
            { opcode: 'control_repeat', text: '重复 {times} 次', type: 'loop', defaults: { times: 10 } },
            { opcode: 'control_forever', text: '重复执行', type: 'loop' },
            { opcode: 'control_if', text: '如果 {condition} 那么', type: 'conditional' },
            { opcode: 'control_if_else', text: '如果 {condition} 那么 否则', type: 'conditional' },
            { opcode: 'control_while', text: '当 {condition} 时执行', type: 'loop' },
            { opcode: 'control_stop', text: '停止 {what}', defaults: { what: '全部' } },
            { opcode: 'control_create_clone_of', text: '克隆 {target}', defaults: { target: '自己' } },
            { opcode: 'control_create_clone_of_menu', text: '{target}', type: 'reporter', defaults: { target: '自己' } },
            { opcode: 'control_delete_this_clone', text: '删除此克隆体' },
            { opcode: 'control_start_as_clone', text: '当作为克隆体启动时', type: 'hat' },
            { opcode: 'control_get_counter', text: '计数器', type: 'reporter' },
            { opcode: 'control_incr_counter', text: '计数器增加' },
            { opcode: 'control_clear_counter', text: '清除计数器' }
        ]
    },
    
    // 侦测积木
    sensing: {
        id: 'sensing',
        name: '侦测',
        color: '#5CB1D6',
        icon: 'fa-eye',
        blocks: [
            { opcode: 'sensing_touchingobject', text: '碰到 {object}?', type: 'boolean', defaults: { object: '鼠标指针' } },
            { opcode: 'sensing_touchingobjectmenu', text: '{object}', type: 'reporter', defaults: { object: '鼠标指针' } },
            { opcode: 'sensing_touchingcolor', text: '碰到颜色 {color}?', type: 'boolean', defaults: { color: '#FF0000' } },
            { opcode: 'sensing_coloristouchingcolor', text: '颜色 {color1} 碰到颜色 {color2}?', type: 'boolean', defaults: { color1: '#FF0000', color2: '#00FF00' } },
            { opcode: 'sensing_distanceto', text: '到 {object} 的距离', type: 'reporter', defaults: { object: '鼠标指针' } },
            { opcode: 'sensing_distancetomenu', text: '{object}', type: 'reporter', defaults: { object: '鼠标指针' } },
            { opcode: 'sensing_askandwait', text: '询问 {question} 并等待', defaults: { question: '你叫什么名字？' } },
            { opcode: 'sensing_answer', text: '回答', type: 'reporter' },
            { opcode: 'sensing_keypressed', text: '按下 {key} 键?', type: 'boolean', defaults: { key: '空格' } },
            { opcode: 'sensing_keyoptions', text: '{key}', type: 'reporter', defaults: { key: '空格' } },
            { opcode: 'sensing_mousedown', text: '鼠标按下?', type: 'boolean' },
            { opcode: 'sensing_mousex', text: '鼠标的 x 坐标', type: 'reporter' },
            { opcode: 'sensing_mousey', text: '鼠标的 y 坐标', type: 'reporter' },
            { opcode: 'sensing_setdragmode', text: '将拖动模式设为 {mode}', defaults: { mode: '可拖动' } },
            { opcode: 'sensing_timer', text: '计时器', type: 'reporter' },
            { opcode: 'sensing_resettimer', text: '计时器归零' },
            { opcode: 'sensing_of', text: '{property} of {object}', type: 'reporter', defaults: { property: 'x坐标', object: '角色1' } },
            { opcode: 'sensing_of_object_menu', text: '{object}', type: 'reporter', defaults: { object: '角色1' } },
            { opcode: 'sensing_current', text: '当前 {date}', type: 'reporter', defaults: { date: '年' } },
            { opcode: 'sensing_dayssince2000', text: '从 2000 年至今的天数', type: 'reporter' },
            { opcode: 'sensing_loudness', text: '响度', type: 'reporter' },
            { opcode: 'sensing_loud', text: '响亮?', type: 'boolean' }
        ]
    },
    
    // 运算积木
    operators: {
        id: 'operators',
        name: '运算',
        color: '#59C059',
        icon: 'fa-calculator',
        blocks: [
            { opcode: 'operator_add', text: '{num1} + {num2}', type: 'reporter', defaults: { num1: '', num2: '' } },
            { opcode: 'operator_subtract', text: '{num1} - {num2}', type: 'reporter', defaults: { num1: '', num2: '' } },
            { opcode: 'operator_multiply', text: '{num1} * {num2}', type: 'reporter', defaults: { num1: '', num2: '' } },
            { opcode: 'operator_divide', text: '{num1} / {num2}', type: 'reporter', defaults: { num1: '', num2: '' } },
            { opcode: 'operator_random', text: '在 {from} 到 {to} 之间取随机数', type: 'reporter', defaults: { from: 1, to: 10 } },
            { opcode: 'operator_gt', text: '{operand1} > {operand2}', type: 'boolean', defaults: { operand1: '', operand2: 50 } },
            { opcode: 'operator_lt', text: '{operand1} < {operand2}', type: 'boolean', defaults: { operand1: '', operand2: 50 } },
            { opcode: 'operator_equals', text: '{operand1} = {operand2}', type: 'boolean', defaults: { operand1: '', operand2: 50 } },
            { opcode: 'operator_and', text: '{operand1} 且 {operand2}', type: 'boolean' },
            { opcode: 'operator_or', text: '{operand1} 或 {operand2}', type: 'boolean' },
            { opcode: 'operator_not', text: '不成立 {operand}', type: 'boolean' },
            { opcode: 'operator_join', text: '连接 {string1} 和 {string2}', type: 'reporter', defaults: { string1: '苹果', string2: '香蕉' } },
            { opcode: 'operator_letter_of', text: '第 {letter} 个字符 的 {string}', type: 'reporter', defaults: { letter: 1, string: '世界' } },
            { opcode: 'operator_length', text: '{string} 的长度', type: 'reporter', defaults: { string: '世界' } },
            { opcode: 'operator_contains', text: '{string1} 包含 {string2}?', type: 'boolean', defaults: { string1: '苹果', string2: '果' } },
            { opcode: 'operator_mod', text: '{num1} 除以 {num2} 的余数', type: 'reporter', defaults: { num1: '', num2: '' } },
            { opcode: 'operator_round', text: '将 {num} 四舍五入', type: 'reporter', defaults: { num: '' } },
            { opcode: 'operator_mathop', text: '{operator} of {num}', type: 'reporter', defaults: { operator: '绝对值', num: 10 } },
            { opcode: 'operator_sin', text: 'sin {degrees}', type: 'reporter', defaults: { degrees: 90 } },
            { opcode: 'operator_cos', text: 'cos {degrees}', type: 'reporter', defaults: { degrees: 90 } },
            { opcode: 'operator_tan', text: 'tan {degrees}', type: 'reporter', defaults: { degrees: 45 } },
            { opcode: 'operator_asin', text: 'asin {num}', type: 'reporter', defaults: { num: 0.5 } },
            { opcode: 'operator_acos', text: 'acos {num}', type: 'reporter', defaults: { num: 0.5 } },
            { opcode: 'operator_atan', text: 'atan {num}', type: 'reporter', defaults: { num: 1 } },
            { opcode: 'operator_ln', text: 'ln {num}', type: 'reporter', defaults: { num: 10 } },
            { opcode: 'operator_log', text: 'log {num}', type: 'reporter', defaults: { num: 100 } },
            { opcode: 'operator_exp', text: 'e ^ {num}', type: 'reporter', defaults: { num: 1 } },
            { opcode: 'operator_pow10', text: '10 ^ {num}', type: 'reporter', defaults: { num: 1 } }
        ]
    },
    
    // 变量积木
    variables: {
        id: 'variables',
        name: '变量',
        color: '#FF8C1A',
        icon: 'fa-database',
        blocks: [
            { opcode: 'data_setvariableto', text: '将 {variable} 设为 {value}', defaults: { variable: '我的变量', value: 0 } },
            { opcode: 'data_changevariableby', text: '将 {variable} 增加 {value}', defaults: { variable: '我的变量', value: 1 } },
            { opcode: 'data_showvariable', text: '显示变量 {variable}', defaults: { variable: '我的变量' } },
            { opcode: 'data_hidevariable', text: '隐藏变量 {variable}', defaults: { variable: '我的变量' } },
            { opcode: 'data_variable', text: '{variable}', type: 'reporter', defaults: { variable: '我的变量' } },
            { opcode: 'data_listcontents', text: '{list}', type: 'reporter', defaults: { list: '我的列表' } },
            { opcode: 'data_addtolist', text: '将 {item} 加入 {list}', defaults: { item: '项目', list: '我的列表' } },
            { opcode: 'data_deleteoflist', text: '删除 {list} 的第 {index} 项', defaults: { list: '我的列表', index: 1 } },
            { opcode: 'data_deletealloflist', text: '删除 {list} 的全部项目', defaults: { list: '我的列表' } },
            { opcode: 'data_insertoflist', text: '在 {list} 的第 {index} 项前插入 {item}', defaults: { item: '项目', list: '我的列表', index: 1 } },
            { opcode: 'data_replaceitemoflist', text: '将 {list} 的第 {index} 项替换为 {item}', defaults: { item: '项目', list: '我的列表', index: 1 } },
            { opcode: 'data_itemoflist', text: '{list} 的第 {index} 项', type: 'reporter', defaults: { list: '我的列表', index: 1 } },
            { opcode: 'data_itemnumoflist', text: '{list} 中 {item} 的编号', type: 'reporter', defaults: { item: '项目', list: '我的列表' } },
            { opcode: 'data_lengthoflist', text: '{list} 的长度', type: 'reporter', defaults: { list: '我的列表' } },
            { opcode: 'data_listcontainsitem', text: '{list} 包含 {item}?', type: 'boolean', defaults: { item: '项目', list: '我的列表' } },
            { opcode: 'data_showlist', text: '显示列表 {list}', defaults: { list: '我的列表' } },
            { opcode: 'data_hidelist', text: '隐藏列表 {list}', defaults: { list: '我的列表' } }
        ]
    },
    
    // 自制积木
    myblocks: {
        id: 'myblocks',
        name: '自制积木',
        color: '#FF6680',
        icon: 'fa-cube',
        blocks: [
            { opcode: 'procedures_definition', text: '定义 {block}', type: 'hat' },
            { opcode: 'procedures_call', text: '调用 {block}', defaults: { block: '自制积木' } },
            { opcode: 'procedures_prototype', text: '{block}', type: 'reporter', defaults: { block: '自制积木' } }
        ]
    }
};

// 导出配置
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
    window.BLOCKS_DEFINITION = BLOCKS_DEFINITION;
}

console.log('Scratch S2 配置加载完成');
