/**
 * @module modules/timeline
 * @description Menangani progress bar audio dan fitur seeking.
 */
import { eventBus } from '../../core/eventBus.js';
import { state } from '../../core/state.js';

export class TimelineModule {
    constructor() {
        this.progressContainer = document.getElementById('progress-container');
        this.progressBar = document.getElementById('progress-bar');

        this._initListeners();
    }

    /** @private */
    _initListeners() {
        // Update bar saat waktu audio berjalan
        eventBus.on('AUDIO_TIME_UPDATE', () => this._updateProgressBar());

        // Seek audio saat progress bar diklik
        this.progressContainer.addEventListener('click', (e) => this._handleSeek(e));
    }

    /** @private */
    _updateProgressBar() {
        if (state.audio.duration === 0) return;
        const percentage = (state.audio.currentTime / state.audio.duration) * 100;
        this.progressBar.style.width = `${percentage}%`;
    }

    /**
     * @param {MouseEvent} e 
     * @private 
     */
    _handleSeek(e) {
        if (!state.audio.hasAudio) return;

        const rect = this.progressContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, clickX / rect.width));
        const newTime = percentage * state.audio.duration;
        
        // Memancarkan event untuk mengubah waktu audio
        eventBus.emit('TIMELINE_SEEK', newTime);
    }
}
