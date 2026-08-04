/**
 * @module core/state
 * @description Global state manager untuk aplikasi.
 */
export const state = {
    audio: {
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        hasAudio: false
    },
    lyrics: {
        raw: '',
        parsed: []
    },
    theme: {
        activeId: 'default_minimal',
        activeConfig: null,
        registry: {},
        favorites: []
    },
    export: {
        isExporting: false
    },
    plugins: {
        active: []
    },
    // Tambahan Milestone 9
    settings: {
        fps: 60,
        width: 1280,
        height: 720,
        scale: 1.0
    }
};