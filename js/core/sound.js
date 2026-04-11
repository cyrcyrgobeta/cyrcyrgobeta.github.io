/**
 * Scratch S2 编辑器 - 声音引擎
 * Web Audio API 实现
 */

class SoundEngine {
    constructor() {
        this.context = null;
        this.sounds = new Map();
        this.playing = [];
        this.volume = 100;
        this.isInitialized = false;
    }
    
    /**
     * 初始化音频上下文
     */
    init() {
        if (this.isInitialized) return;
        
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.context.createGain();
            this.masterGain.connect(this.context.destination);
            this.masterGain.gain.value = this.volume / 100;
            this.isInitialized = true;
            console.log('声音引擎初始化成功');
        } catch (e) {
            console.error('声音引擎初始化失败:', e);
        }
    }
    
    /**
     * 加载声音
     */
    async loadSound(name, url) {
        this.init();
        
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
            this.sounds.set(name, audioBuffer);
            return true;
        } catch (e) {
            console.error('加载声音失败:', name, e);
            return false;
        }
    }
    
    /**
     * 播放声音
     */
    play(name, wait = false) {
        this.init();
        
        const buffer = this.sounds.get(name);
        if (!buffer) {
            console.warn('声音不存在:', name);
            return Promise.resolve();
        }
        
        const source = this.context.createBufferSource();
        source.buffer = buffer;
        source.connect(this.masterGain);
        
        const playPromise = new Promise(resolve => {
            source.onended = resolve;
        });
        
        source.start(0);
        this.playing.push(source);
        
        if (wait) {
            return playPromise;
        }
        
        return Promise.resolve();
    }
    
    /**
     * 停止所有声音
     */
    stopAll() {
        for (const source of this.playing) {
            try {
                source.stop();
            } catch (e) {}
        }
        this.playing = [];
    }
    
    /**
     * 设置音量
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(100, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.volume / 100;
        }
    }
    
    /**
     * 获取音量
     */
    getVolume() {
        return this.volume;
    }
}

// 创建全局实例
window.soundEngine = new SoundEngine();

console.log('声音引擎加载完成');
