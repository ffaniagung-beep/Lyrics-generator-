import { AudioModule } from '../modules/audio/index.js';
import { PreviewModule } from '../modules/preview/index.js';
import { TimelineModule } from '../modules/timeline/index.js';
import { LyricsModule } from '../modules/lyrics/index.js';
import { ThemeModule } from '../modules/themes/index.js';
import { ExportModule } from '../modules/export/index.js';
import { SubtitleModule } from '../modules/subtitle/index.js';
import { PerformanceModule } from '../modules/performance/index.js';
import { DocsModule } from '../modules/docs/index.js';

import { PluginManager } from './pluginManager.js';
import { SpectrumVisualizerPlugin } from '../plugins/spectrumVisualizer.js';

class App {

    constructor() {

        console.log('[App] Memulai aplikasi Lyrics Video Generator...');

        try {

            this._bootstrapModules();

            console.log('[App] Semua modul berhasil dimuat.');

        } catch (error) {

            console.error('[App] Kesalahan kritis saat memuat aplikasi:', error);

        }

    }

    _bootstrapModules() {

        console.log("Docs");
        this.docsModule = new DocsModule();

        console.log("Performance");
        this.performanceModule = new PerformanceModule();

        console.log("Theme");
        this.themeModule = new ThemeModule();

        console.log("Audio");
        this.audioModule = new AudioModule();

        console.log("Preview");
        this.previewModule = new PreviewModule();

        console.log("Timeline");
        this.timelineModule = new TimelineModule();

        console.log("Lyrics");
        this.lyricsModule = new LyricsModule();

        console.log("Export");
        this.exportModule = new ExportModule(this.audioModule);

        console.log("Subtitle");
        this.subtitleModule = new SubtitleModule();

        console.log("Plugin");
        const pluginContext = {
            audioModule: this.audioModule
        };

        this.pluginManager = new PluginManager(pluginContext);

        this.pluginManager.use(new SpectrumVisualizerPlugin());

        console.log("Selesai");

    }

}

document.addEventListener('DOMContentLoaded', () => {
    new App();
});
