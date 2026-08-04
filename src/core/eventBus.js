/**
 * @module core/eventBus
 * @description Menangani komunikasi antar module (Pub/Sub pattern) untuk menjaga Clean Architecture.
 */
class EventBus {
    constructor() {
        this.listeners = {};
    }

    /**
     * Mendaftarkan listener untuk sebuah event.
     * @param {string} event - Nama event.
     * @param {Function} callback - Fungsi yang dijalankan saat event dipicu.
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    /**
     * Memicu sebuah event dan mengirimkan data ke semua listener.
     * @param {string} event - Nama event.
     * @param {any} [data] - Data payload.
     */
    emit(event, data = null) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`[EventBus Error] Event: ${event}`, error);
                }
            });
        }
    }
}

export const eventBus = new EventBus();
