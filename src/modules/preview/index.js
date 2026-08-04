import { eventBus } from '../../core/eventBus.js';
import { state } from '../../core/state.js';
import { AnimationEngine } from '../animation/index.js';

export class PreviewModule {
    constructor() {
        this.canvas = document.getElementById('preview-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.animationFrameId = null;
        this.lastRenderTime = 0; // Untuk FPS Throttling

        this._initEventBusListeners();
        this._applySettings(); // Terapkan resolusi awal
        this._render();
    }

    /** @private */
    _initEventBusListeners() {
        eventBus.on('AUDIO_PLAY', () => this._startRenderLoop());
        eventBus.on('AUDIO_PAUSE', () => this._stopRenderLoop());
        eventBus.on('AUDIO_TIME_UPDATE', () => {
            if (!state.audio.isPlaying) this._render();
        });
        
        eventBus.on('THEME_CHANGED', () => this._render());
        eventBus.on('LYRICS_UPDATED', () => this._render());
        
        // Listener Milestone 9
        eventBus.on('SETTINGS_UPDATED', () => {
            this._applySettings();
            this._render();
        });
    }

    /**
     * Menerapkan ukuran (resolusi fisik) kanvas dari state.
     * @private
     */
    _applySettings() {
        this.canvas.width = state.settings.width;
        this.canvas.height = state.settings.height;
    }

    /**
     * Loop render dengan FPS Throttling untuk menghemat siklus CPU.
     * @private
     */
    _startRenderLoop() {
        if (!this.animationFrameId) {
            const loop = (timestamp) => {
                this.animationFrameId = requestAnimationFrame(loop);

                // Hitung interval berdasarkan target FPS
                const fpsInterval = 1000 / state.settings.fps;
                const elapsed = timestamp - this.lastRenderTime;

                // Jika waktu yang berlalu lebih besar dari interval, render frame baru
                if (elapsed > fpsInterval) {
                    // Sesuaikan lastRenderTime (kompensasi drift waktu)
                    this.lastRenderTime = timestamp - (elapsed % fpsInterval);
                    this._render();
                }
            };
            this.animationFrameId = requestAnimationFrame(loop);
        }
    }

    /** @private */
    _stopRenderLoop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        this._render();
    }

    /** @private */
    _render() {
        const { width, height } = this.canvas;
        const theme = state.theme.activeConfig;
        const scale = state.settings.scale; // Ambil skala resolusi saat ini

        if (!theme) return;

        eventBus.emit('BEFORE_RENDER', { ctx: this.ctx, canvas: this.canvas, theme });

        // Background
        this.ctx.fillStyle = theme.bgColor;
        this.ctx.fillRect(0, 0, width, height);

        if (!state.audio.hasAudio) {
            this.ctx.fillStyle = theme.fontColor;
            // Skalakan ukuran font fallback
            this.ctx.font = `${40 * scale}px ${theme.fontFamily}`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('Unggah Audio untuk Memulai', width / 2, height / 2);
            return;
        }

        const parsedLyrics = state.lyrics.parsed;
        const currentTime = state.audio.currentTime;

        let currentLyric = null;
        if (parsedLyrics && parsedLyrics.length > 0) {
            const validLyrics = parsedLyrics.filter(l => l.time >= 0 && l.time <= currentTime);
            if (validLyrics.length > 0) currentLyric = validLyrics[validLyrics.length - 1];
        }

        const renderState = AnimationEngine.getRenderState(currentLyric, currentTime, theme);

        this.ctx.fillStyle = theme.fontColor;
        
        // Terapkan skala pada FontSize agar tidak mengecil di resolusi tinggi (4K/1080p)
        const scaledFontSize = theme.fontSize * scale;
        this.ctx.font = `${theme.fontWeight} ${scaledFontSize}px ${theme.fontFamily}`;
        this.ctx.textAlign = theme.textAlign;
        this.ctx.textBaseline = theme.textBaseline;
        
        this.ctx.globalAlpha = renderState.opacity;

        // Terapkan skala pada kordinat posisi & padding
        const scaledPaddingX = theme.paddingX * scale;
        let posX = theme.textAlign === 'center' ? (width / 2) : scaledPaddingX;
        let posY = theme.textBaseline === 'middle' ? (height / 2) : (scaledPaddingX + (20 * scale));

        this.ctx.fillText(renderState.textToRender, posX, posY);
        this.ctx.globalAlpha = 1.0;

        // Skalakan ukuran watermark
        this.ctx.font = `${20 * scale}px sans-serif`;
        this.ctx.fillStyle = theme.bgColor === '#ffffff' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(`Time: ${currentTime.toFixed(2)}s | Res: ${width}x${height} | FPS: ${state.settings.fps}`, 20 * scale, 20 * scale);

        eventBus.emit('AFTER_RENDER', { ctx: this.ctx, canvas: this.canvas, theme });
    }
}
