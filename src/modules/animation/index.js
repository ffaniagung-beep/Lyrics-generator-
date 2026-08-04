/**
 * @module modules/animation
 * @description Menghitung properti visual (opacity, pemotongan teks) berdasarkan waktu (Functional Core).
 * Tidak bergantung pada Canvas atau DOM secara langsung.
 */

export class AnimationEngine {
    /**
     * Mengembalikan state render teks berdasarkan waktu yang telah berlalu.
     * @param {Object} lyric - Objek lirik aktif {text, time}
     * @param {number} currentTime - Waktu audio saat ini dalam detik
     * @param {Object} theme - Konfigurasi tema yang aktif
     * @returns {Object} - { textToRender, opacity }
     */
    static getRenderState(lyric, currentTime, theme) {
        // Fallback jika tidak ada lirik aktif
        if (!lyric || lyric.time === undefined) {
            return { textToRender: '...', opacity: 0.3 };
        }

        const elapsedTime = Math.max(0, currentTime - lyric.time);
        let textToRender = lyric.text;
        let opacity = 1.0;
        let showCursor = false;

        switch (theme.effect) {
            case 'fade':
                const fadeDuration = theme.fadeDuration || 0.5;
                if (elapsedTime < fadeDuration) {
                    opacity = elapsedTime / fadeDuration;
                }
                break;

            case 'typewriter':
                const typeSpeed = theme.typeSpeed || 0.05;
                const charCount = Math.floor(elapsedTime / typeSpeed);
                
                // Jika masih dalam proses pengetikan
                if (charCount < lyric.text.length) {
                    textToRender = lyric.text.substring(0, charCount);
                    showCursor = true;
                } else {
                    // Berkedip jika pengetikan selesai (Blink setiap 0.5 detik)
                    showCursor = Math.floor(elapsedTime * 2) % 2 === 0;
                }

                if (showCursor && theme.cursorChar) {
                    textToRender += theme.cursorChar;
                }
                break;

            case 'none':
            default:
                // Tampilan statis, tapi tambahkan kursor statis jika di Notepad
                if (theme.cursorChar) {
                    // Blink statis
                    if (Math.floor(elapsedTime * 2) % 2 === 0) {
                        textToRender += theme.cursorChar;
                    }
                }
                break;
        }

        return { textToRender, opacity };
    }
                }
