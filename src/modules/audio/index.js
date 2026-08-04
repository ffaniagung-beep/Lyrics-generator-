/**
 * @module modules/audio
 * @description Menangani logika pemutaran audio, unggah file, dan Web Audio API stream untuk export.
 */
import { eventBus } from '../../core/eventBus.js';
import { state } from '../../core/state.js';

export class AudioModule {
    constructor() {
        this.audioElement = new Audio();
        // Mengizinkan CORS jika nantinya menggunakan URL eksternal
        this.audioElement.crossOrigin = 'anonymous'; 
        
        this.uploadInput = document.getElementById('audio-upload');
        this.playPauseBtn = document.getElementById('play-pause-btn');
        this.timeDisplay = document.getElementById('time-display');

        this.audioCtx = null;
        this.audioSource = null;
        this.streamDestination = null;

        this._initListeners();
    }

    /** @private */
    _initListeners() {
        this.uploadInput.addEventListener('change', (e) => this._handleFileUpload(e));
        this.playPauseBtn.addEventListener('click', () => this._togglePlayPause());

        this.audioElement.addEventListener('timeupdate', () => this._handleTimeUpdate());
        this.audioElement.addEventListener('loadedmetadata', () => this._handleMetadataLoaded());
        this.audioElement.addEventListener('ended', () => this._handleAudioEnded());

        // Event listener untuk pengoperasian dari modul lain
        eventBus.on('TIMELINE_SEEK', (time) => {
            try {
                this.audioElement.currentTime = time;
                this._handleTimeUpdate();
            } catch (error) {
                console.error('[AudioModule] Gagal melakukan seek:', error);
            }
        });

        // Trigger Play/Pause dari luar (seperti Export Module)
        eventBus.on('TRIGGER_PLAY', () => {
            if (this.audioElement.paused) this._togglePlayPause();
        });
        eventBus.on('TRIGGER_PAUSE', () => {
            if (!this.audioElement.paused) this._togglePlayPause();
        });
    }

    /**
     * Mempersiapkan node Web Audio API untuk perekaman stream dan analisis visual.
     * @returns {MediaStreamTrack|null}
     */
    getAudioTrack() {
        if (!this.audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContextClass();
            this.audioSource = this.audioCtx.createMediaElementSource(this.audioElement);
            this.streamDestination = this.audioCtx.createMediaStreamDestination();
            
            // Tambahan Milestone 8: Analyser untuk Plugin Visualizer
            this.analyser = this.audioCtx.createAnalyser();
            this.analyser.fftSize = 256;

            // Rantai koneksi: Source -> Analyser -> Destination & Stream
            this.audioSource.connect(this.analyser);
            this.analyser.connect(this.streamDestination);
            this.analyser.connect(this.audioCtx.destination);
        }

        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        const tracks = this.streamDestination.stream.getAudioTracks();
        return tracks.length > 0 ? tracks[0] : null;
    }

    /**
     * API Publik untuk Plugin: Mengambil data frekuensi saat ini.
     * @returns {Uint8Array|null} Array data frekuensi (0-255)
     */
    getFrequencyData() {
        if (!this.analyser) return null;
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(dataArray);
        return dataArray;
    }

    /** @private */
    async _handleFileUpload(e) {
        try {
            const file = e.target.files[0];
            if (!file) return;

            const url = URL.createObjectURL(file);
            this.audioElement.src = url;
            
            state.audio.hasAudio = true;
            this.playPauseBtn.disabled = false;
            
            eventBus.emit('AUDIO_LOADED', file.name);
        } catch (error) {
            console.error('[AudioModule] Gagal memuat audio:', error);
            alert('Gagal memuat file audio.');
        }
    }

    /** @private */
    async _togglePlayPause() {
        try {
            // Resume AudioContext jika dalam keadaan suspended
            if (this.audioCtx && this.audioCtx.state === 'suspended') {
                await this.audioCtx.resume();
            }

            if (this.audioElement.paused) {
                await this.audioElement.play();
                state.audio.isPlaying = true;
                this.playPauseBtn.textContent = 'Pause';
                eventBus.emit('AUDIO_PLAY');
            } else {
                this.audioElement.pause();
                state.audio.isPlaying = false;
                this.playPauseBtn.textContent = 'Play';
                eventBus.emit('AUDIO_PAUSE');
            }
        } catch (error) {
            console.error('[AudioModule] Error play/pause:', error);
        }
    }

    /** @private */
    _handleTimeUpdate() {
        state.audio.currentTime = this.audioElement.currentTime;
        this._updateTimeDisplay();
        eventBus.emit('AUDIO_TIME_UPDATE', state.audio.currentTime);
    }

    /** @private */
    _handleMetadataLoaded() {
        state.audio.duration = this.audioElement.duration;
        this._updateTimeDisplay();
    }

    /** @private */
    _handleAudioEnded() {
        state.audio.isPlaying = false;
        this.playPauseBtn.textContent = 'Play';
        eventBus.emit('AUDIO_ENDED');
    }

    /** @private */
    _updateTimeDisplay() {
        const formatTime = (time) => {
            const mins = Math.floor(time / 60).toString().padStart(2, '0');
            const secs = Math.floor(time % 60).toString().padStart(2, '0');
            return `${mins}:${secs}`;
        };
        this.timeDisplay.textContent = `${formatTime(state.audio.currentTime)} / ${formatTime(state.audio.duration)}`;
    }
}
