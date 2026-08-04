/**
 * @module modules/export
 * @description Menangani perekaman Canvas dan Audio menjadi file video (WebM) secara offline via MediaRecorder API.
 */
import { eventBus } from '../../core/eventBus.js';
import { state } from '../../core/state.js';

export class ExportModule {
    /**
     * @param {Object} audioModule - Injeksi modul audio untuk mengakses audio track.
     */
    constructor(audioModule) {
        this.audioModule = audioModule;
        this.exportBtn = document.getElementById('export-video-btn');
        this.exportStatus = document.getElementById('export-status');
        this.canvas = document.getElementById('preview-canvas');

        this.mediaRecorder = null;
        this.recordedChunks = [];

        this._initListeners();
    }

    /** @private */
    _initListeners() {
        this.exportBtn.addEventListener('click', () => this.startExport());

        eventBus.on('AUDIO_LOADED', () => {
            this.exportBtn.disabled = false;
        });
    }

    /**
     * Memulai proses perekaman video dari Canvas dan Audio dari awal durasi.
     * @async
     */
    async startExport() {
        if (!state.audio.hasAudio || state.export.isExporting) return;

        try {
            state.export.isExporting = true;
            this.exportBtn.disabled = true;
            this.exportStatus.textContent = 'Mempersiapkan rekaman...';

                        // 1. Ambil video stream dari Canvas sesuai dengan pengaturan FPS terbaru
            const canvasStream = this.canvas.captureStream(state.settings.fps);

            // 2. Ambil audio track dari Web Audio API
            const audioTrack = this.audioModule.getAudioTrack();

            // 3. Gabungkan video & audio track ke MediaStream baru
            const combinedStream = new MediaStream();
            canvasStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
            if (audioTrack) combinedStream.addTrack(audioTrack);

            // 4. Inisialisasi MediaRecorder dengan codec WebM dan optimasi bitrate
            // Hitung bit rate ideal. (Misal: 720p ~ 2.5Mbps, 1080p ~ 5Mbps, 4K ~ 15Mbps)
            const videoBitsPerSecond = Math.round(2500000 * Math.pow(state.settings.scale, 2));

            const options = { 
                mimeType: 'video/webm;codecs=vp9,opus',
                videoBitsPerSecond: videoBitsPerSecond 
            };
            
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options.mimeType = 'video/webm';
            }

            this.recordedChunks = [];
            this.mediaRecorder = new MediaRecorder(combinedStream, options);

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                this._handleRecordingComplete();
            };

            // 5. Kembalikan waktu lagu ke posisi awal (0s)
            eventBus.emit('TIMELINE_SEEK', 0);

            // 6. Jalankan recorder & putar lagu
            this.mediaRecorder.start(1000); // Kumpulkan data chunk per 1 detik
            this.exportStatus.textContent = 'Merekam video... Silakan tunggu hingga lagu selesai.';

            // Pasang handler untuk menghentikan rekaman saat lagu selesai diputar
            const onAudioEnded = () => {
                if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
                    this.mediaRecorder.stop();
                }
            };

            eventBus.on('AUDIO_ENDED', onAudioEnded);

            // Mulai playback lagu secara otomatis untuk perekaman real-time
            eventBus.emit('TRIGGER_PLAY');

        } catch (error) {
            console.error('[ExportModule] Gagal merekam video:', error);
            alert(`Gagal merekam video: ${error.message}`);
            this._resetExportState();
        }
    }

    /**
     * Memproses data chunk rekaman dan memicu unduhan otomatis di browser.
     * @private
     */
    _handleRecordingComplete() {
        this.exportStatus.textContent = 'Menyusun file video...';

        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `lyrics-video-${Date.now()}.webm`;
        
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);

        this.exportStatus.textContent = 'Selesai! File video WebM berhasil diunduh.';
        this._resetExportState();
    }

    /** @private */
    _resetExportState() {
        state.export.isExporting = false;
        this.exportBtn.disabled = !state.audio.hasAudio;
    }
}
