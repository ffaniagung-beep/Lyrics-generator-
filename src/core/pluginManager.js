/**
 * @module core/pluginManager
 * @description Bertugas mengelola registrasi dan siklus hidup (lifecycle) dari semua plugin eksternal.
 */
import { eventBus } from './eventBus.js';
import { state } from './state.js';

export class PluginManager {
    /**
     * @param {Object} appContext - Referensi ke modul-modul inti yang boleh diakses plugin (Dependency Injection).
     */
    constructor(appContext) {
        this.appContext = appContext;
        this.plugins = [];
        this.pluginListUI = document.getElementById('plugin-list');
    }

    /**
     * Mendaftarkan dan menginisiasi sebuah plugin.
     * @param {Object} pluginInstance - Instance dari kelas plugin.
     */
    use(pluginInstance) {
        try {
            if (typeof pluginInstance.install !== 'function') {
                throw new Error("Plugin harus memiliki metode install()");
            }

            // Injeksi dependencies (API) ke dalam plugin
            pluginInstance.install({
                eventBus,
                state,
                audioModule: this.appContext.audioModule
            });

            this.plugins.push(pluginInstance);
            state.plugins.active.push(pluginInstance.name);

            this._updateUI(pluginInstance.name);
            console.log(`[PluginManager] Plugin '${pluginInstance.name}' berhasil di-install.`);
        } catch (error) {
            console.error(`[PluginManager] Gagal memuat plugin:`, error);
        }
    }

    /** @private */
    _updateUI(pluginName) {
        if (!this.pluginListUI) return;
        const li = document.createElement('li');
        li.textContent = `✅ ${pluginName} (Running)`;
        this.pluginListUI.appendChild(li);
    }
}
