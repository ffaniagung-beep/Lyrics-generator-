/**
 * @module plugins/spectrumVisualizer
 * @description Plugin untuk menggambar bar frekuensi audio (Spectrum) di bagian bawah canvas.
 * Berjalan secara mandiri menggunakan hook 'AFTER_RENDER'.
 */

export class SpectrumVisualizerPlugin {
    constructor() {
        this.name = "Audio Spectrum Visualizer Plugin";
    }

    /**
     * Metode wajib untuk standar Plugin API.
     * @param {Object} context - Di-inject oleh PluginManager.
     */
    install({ eventBus, state, audioModule }) {
        // Daftarkan aksi pada hook AFTER_RENDER di Canvas
        eventBus.on('AFTER_RENDER', ({ ctx, canvas, theme }) => {
            // Hanya gambar jika audio sedang diputar atau ada lagu
            if (!state.audio.hasAudio) return;

            // Ambil data frekuensi (jika analyser belum siap, kembalikan null)
            const dataArray = audioModule.getFrequencyData();
            if (!dataArray) return;

            const bufferLength = dataArray.length;
            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            // Gunakan warna yang kontras dengan background tema
            ctx.fillStyle = theme.fontColor;
            
            // Buat efek semi-transparan
            ctx.globalAlpha = 0.3;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] * 1.5; // Skalakan tinggi bar
                
                // Gambar bar dari bawah ke atas
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

                x += barWidth + 2;
            }

            // Reset opacity agar tidak merusak render frame berikutnya
            ctx.globalAlpha = 1.0;
        });

        // Trigger inisialisasi AudioContext (jika belum) saat lagu di-play
        eventBus.on('AUDIO_PLAY', () => {
             audioModule.getAudioTrack();
        });
    }
}
