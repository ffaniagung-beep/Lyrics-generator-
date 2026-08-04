
import { eventBus } from '../../core/eventBus.js';
import { state } from '../../core/state.js';

export class LyricsModule {
    constructor() {
        this.inputArea = document.getElementById('lyrics-input');
        this.parseBtn = document.getElementById('parse-lyrics-btn');
        this.listContainer = document.getElementById('lyrics-list');

        this._initListeners();
    }

    _initListeners() {
        this.parseBtn.addEventListener('click', () => this._parseLyrics());
        eventBus.on('AUDIO_TIME_UPDATE', () => this._highlightActiveLyric());
    }

    _parseLyrics() {
        const rawText = this.inputArea.value.trim();
        if (!rawText) return;

        state.lyrics.raw = rawText;
        const lines = rawText.split('\n');
        
        state.lyrics.parsed = lines
            .filter(line => line.trim() !== '')
            .map((line, index) => {
                const lrcMatch = line.match(/^\[(\d+):(\d+\.\d+|\d+)\](.*)/);
                let time = -1; 
                let text = line;

                if (lrcMatch) {
                    const mins = parseInt(lrcMatch[1], 10);
                    const secs = parseFloat(lrcMatch[2]);
                    time = (mins * 60) + secs;
                    text = lrcMatch[3].trim();
                }
                return { id: index, time, text: text.trim() };
            });

        this._renderList();
        eventBus.emit('LYRICS_UPDATED');
    }

    _renderList() {
        this.listContainer.innerHTML = '';

        state.lyrics.parsed.forEach((lyric) => {
            const item = document.createElement('div');
            item.className = 'lyric-item';
            item.id = `lyric-item-${lyric.id}`;

            const textEl = document.createElement('div');
            textEl.className = 'lyric-text';
            textEl.textContent = lyric.text;

            const timeEl = document.createElement('div');
            timeEl.className = 'lyric-time';
            timeEl.textContent = lyric.time >= 0 ? this._formatTime(lyric.time) : '--:--';

            const syncBtn = document.createElement('button');
            syncBtn.className = 'sync-btn';
            syncBtn.textContent = 'Sync';
            syncBtn.onclick = () => this._syncLyricTime(lyric.id);

            item.appendChild(textEl);
            item.appendChild(timeEl);
            item.appendChild(syncBtn);

            this.listContainer.appendChild(item);
        });
    }

    _syncLyricTime(id) {
        const lyric = state.lyrics.parsed.find(l => l.id === id);
        if (lyric) {
            lyric.time = state.audio.currentTime;
            state.lyrics.parsed.sort((a, b) => {
                if (a.time === -1) return 1;
                if (b.time === -1) return -1;
                return a.time - b.time;
            });
            this._renderList();
            eventBus.emit('LYRICS_UPDATED');
        }
    }

    _highlightActiveLyric() {
        if (state.lyrics.parsed.length === 0) return;
        const currentTime = state.audio.currentTime;
        let activeId = -1;

        for (let i = 0; i < state.lyrics.parsed.length; i++) {
            const lyric = state.lyrics.parsed[i];
            if (lyric.time >= 0 && lyric.time <= currentTime) {
                activeId = lyric.id;
            }
        }

        document.querySelectorAll('.lyric-item').forEach(el => el.classList.remove('active'));

        if (activeId !== -1) {
            const activeEl = document.getElementById(`lyric-item-${activeId}`);
            if (activeEl) {
                activeEl.classList.add('active');
                if (state.audio.isPlaying) {
                    activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }
    }

    _formatTime(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
        const ms = Math.floor((seconds % 1) * 100).toString().padStart(2, '0');
        return `${m}:${s}.${ms}`;
    }
}
