/**
 * @module modules/subtitle
 * @description Menangani ekspor data lirik yang sudah disinkronisasi ke dalam format file teks LRC (.lrc).
 */
import { eventBus } from '../../core/eventBus.js';
import { state } from '../../core/state.js';

export class SubtitleModule {
    constructor() {
        this.exportSubtitleBtn = document.getElementById('export-subtitle-btn');
        
        this._initListeners();
    }

    /** @private */
    _initListeners() {
        // Cek status tombol setiap kali data lirik diperbarui/disinkronisasi
        eventBus.on('LYRICS_UPDATED', () => this._checkEnableStatus());
        
        // Trigger proses ekspor saat tombol diklik
        this.exportSubtitleBtn.addEventListener('click', () => this._exportLRC());
    }

    /**
     * Mengaktifkan tombol ekspor jika ada minimal satu lirik yang sudah disinkronisasi (time >= 0).
     * @private
     */
    _checkEnableStatus() {
        const hasSyncedLyrics = state.lyrics.parsed.some(lyric => lyric.time >= 0);
        this.exportSubtitleBtn.disabled = !hasSyncedLyrics;
    }

    /**
     * Memformat detik ke format standar LRC: [mm:ss.xx]
     * @param {number} seconds - Waktu dalam satuan detik.
     * @returns {string} String format LRC.
     * @private
     */
    _formatLRCTime(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
        // Ambil 2 digit desimal (ratusan milidetik)
        const ms = Math.floor((seconds % 1) * 100).toString().padStart(2, '0');
        return `[${m}:${s}.${ms}]`;
    }

    /**
     * Menyusun metadata dan lirik menjadi format string teks dan memicu unduhan file browser.
     * @private
     */
    _exportLRC() {
        try {
            const parsedLyrics = state.lyrics.parsed;
            
            // Filter hanya lirik yang telah disinkronisasi dan urutkan sesuai waktu yang direkam
            const syncedLyrics = parsedLyrics
                .filter(l => l.time >= 0)
                .sort((a, b) => a.time - b.time);

            if (syncedLyrics.length === 0) {
                alert('Belum ada lirik yang disinkronisasi.');
                return;
            }

            // 1. Tambahkan Metadata LRC Standar
            let lrcContent = '[ar:Unknown Artist]\n';
            lrcContent += '[ti:Unknown Title]\n';
            lrcContent += '[by:Lyrics Video Generator]\n';
            lrcContent += '\n'; // Spasi pemisah

            // 2. Format baris lirik dengan time tag
            syncedLyrics.forEach(lyric => {
                const timeTag = this._formatLRCTime(lyric.time);
                lrcContent += `${timeTag} ${lyric.text}\n`;
            });

            // 3. Buat file Blob (teks)
            const blob = new Blob([lrcContent], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            
            // 4. Trigger download tersembunyi
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `subtitle-${Date.now()}.lrc`;
            
            document.body.appendChild(a);
            a.click();

            // 5. Bersihkan memory (Garbage Collection)
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);

            console.log('[SubtitleModule] Berhasil mengekspor file .lrc');
        } catch (error) {
            console.error('[SubtitleModule] Gagal mengekspor file .lrc:', error);
            alert(`Terjadi kesalahan saat mengekspor subtitle: ${error.message}`);
        }
    }
}
