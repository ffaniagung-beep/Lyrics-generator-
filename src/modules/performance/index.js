/**
 * @module modules/performance
 * @description Menangani perubahan kualitas (Resolusi, FPS) dan mengelola skala kanvas agar rendering tetap proporsional.
 */
import { eventBus } from '../../core/eventBus.js';
import { state } from '../../core/state.js';

export class PerformanceModule {
    constructor() {
        this.resSelect = document.getElementById('setting-resolution');
        this.fpsSelect = document.getElementById('setting-fps');

        this._initListeners();
    }

    /** @private */
    _initListeners() {
        this.resSelect.addEventListener('change', (e) => this._updateResolution(Number(e.target.value)));
        this.fpsSelect.addEventListener('change', (e) => this._updateFPS(Number(e.target.value)));
    }

    /** @private */
    _updateResolution(height) {
        // Asumsi aspek rasio 16:9
        const width = Math.round((height * 16) / 9);
        
        state.settings.width = width;
        state.settings.height = height;
        // Skala referensi dihitung berdasarkan baseline 720p (720px height)
        state.settings.scale = height / 720;

        console.log(`[Performance] Resolusi diubah ke: ${width}x${height} (Scale: ${state.settings.scale})`);
        eventBus.emit('SETTINGS_UPDATED');
    }

    /** @private */
    _updateFPS(fps) {
        state.settings.fps = fps;
        console.log(`[Performance] FPS dibatasi ke: ${fps}`);
        eventBus.emit('SETTINGS_UPDATED');
    }
}
