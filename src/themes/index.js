/**
 * @module modules/themes
 * @description Mengelola Theme Registry, UI Marketplace, Visual Creator, Import/Export, dan Mock AI Generator.
 */
import { eventBus } from '../../core/eventBus.js';
import { state } from '../../core/state.js';
import { themeRegistry } from '../../themes/registry.js';

export class ThemeModule {
    constructor() {
        this._initRegistry();
        this._initUIElements();
        this._initListeners();
        
        this.renderMarketplace();
        this.applyTheme(state.theme.activeId);
    }

    /** @private */
    _initRegistry() {
        // Gabungkan tema bawaan dengan tema kustom dari localStorage
        state.theme.registry = { ...themeRegistry };
        const savedCustomThemes = JSON.parse(localStorage.getItem('customThemes') || '{}');
        state.theme.registry = { ...state.theme.registry, ...savedCustomThemes };
        state.theme.favorites = JSON.parse(localStorage.getItem('favoriteThemes') || '[]');
    }

    /** @private */
    _initUIElements() {
        // Tabs
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
        
        // Marketplace Grid
        this.themeGrid = document.getElementById('theme-grid');
        
        // Actions
        this.btnRandom = document.getElementById('btn-random-theme');
        this.btnImport = document.getElementById('btn-import-theme');
        this.btnExport = document.getElementById('btn-export-theme');
        this.importInput = document.getElementById('import-theme-input');
        
        // Creator
        this.btnSaveTheme = document.getElementById('btn-save-theme');
        
        // AI
        this.btnGenerateAI = document.getElementById('btn-generate-ai');
        this.aiPrompt = document.getElementById('ai-prompt');
        this.aiStatus = document.getElementById('ai-status');
    }

    /** @private */
    _initListeners() {
        // Tab Switcher
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.tabBtns.forEach(b => b.classList.remove('active'));
                this.tabContents.forEach(c => c.style.display = 'none');
                
                e.target.classList.add('active');
                document.getElementById(e.target.dataset.target).style.display = 'block';
            });
        });

        // Actions
        this.btnRandom.addEventListener('click', () => this.applyRandomTheme());
        this.btnExport.addEventListener('click', () => this.exportActiveTheme());
        this.btnImport.addEventListener('click', () => this.importInput.click());
        this.importInput.addEventListener('change', (e) => this.importTheme(e));

        // Creator
        this.btnSaveTheme.addEventListener('click', () => this.saveCustomTheme());

        // AI Generator
        this.btnGenerateAI.addEventListener('click', () => this.generateAITheme());
    }

    // ==========================================
    // CORE PLUGIN SYSTEM
    // ==========================================

    applyTheme(themeId) {
        const theme = state.theme.registry[themeId];
        if (!theme) return;

        state.theme.activeId = themeId;
        state.theme.activeConfig = JSON.parse(JSON.stringify(theme));
        eventBus.emit('THEME_CHANGED');
        this.renderMarketplace(); // Update active highlight
    }

    addThemeToRegistry(themeConfig) {
        state.theme.registry[themeConfig.id] = themeConfig;
        
        // Simpan ke localStorage agar persisten
        const customThemes = JSON.parse(localStorage.getItem('customThemes') || '{}');
        customThemes[themeConfig.id] = themeConfig;
        localStorage.setItem('customThemes', JSON.stringify(customThemes));

        this.renderMarketplace();
        this.applyTheme(themeConfig.id);
    }

    // ==========================================
    // MARKETPLACE & THUMBNAIL
    // ==========================================

    renderMarketplace() {
        this.themeGrid.innerHTML = '';
        
        Object.values(state.theme.registry).forEach(theme => {
            const card = document.createElement('div');
            card.className = `theme-card ${state.theme.activeId === theme.id ? 'active' : ''}`;
            card.onclick = () => this.applyTheme(theme.id);

            // Thumbnail Image generated dari offscreen canvas
            const thumb = document.createElement('img');
            thumb.className = 'theme-thumb';
            thumb.src = this._generateThumbnailDataURL(theme);

            const info = document.createElement('div');
            info.className = 'theme-info';
            
            const name = document.createElement('span');
            name.className = 'theme-name';
            name.textContent = theme.name;

            const favBtn = document.createElement('button');
            const isFav = state.theme.favorites.includes(theme.id);
            favBtn.className = `btn-fav ${isFav ? 'favorited' : ''}`;
            favBtn.innerHTML = isFav ? '♥' : '♡';
            favBtn.onclick = (e) => {
                e.stopPropagation();
                this.toggleFavorite(theme.id);
            };

            info.appendChild(name);
            info.appendChild(favBtn);
            card.appendChild(thumb);
            card.appendChild(info);

            // Urutkan favorit di atas
            if (isFav) {
                this.themeGrid.prepend(card);
            } else {
                this.themeGrid.appendChild(card);
            }
        });
    }

    _generateThumbnailDataURL(theme) {
        // Gunakan Offscreen Canvas murni
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 180;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = theme.bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = theme.fontColor;
        ctx.font = `${theme.fontWeight} ${theme.fontSize / 3}px ${theme.fontFamily}`;
        ctx.textAlign = theme.textAlign;
        ctx.textBaseline = theme.textBaseline;

        const posX = theme.textAlign === 'center' ? (canvas.width / 2) : 20;
        const posY = theme.textBaseline === 'middle' ? (canvas.height / 2) : 20;

        ctx.fillText("Lyrics Preview", posX, posY);

        return canvas.toDataURL('image/jpeg', 0.5);
    }

    toggleFavorite(themeId) {
        const index = state.theme.favorites.indexOf(themeId);
        if (index > -1) {
            state.theme.favorites.splice(index, 1);
        } else {
            state.theme.favorites.push(themeId);
        }
        localStorage.setItem('favoriteThemes', JSON.stringify(state.theme.favorites));
        this.renderMarketplace();
    }

    applyRandomTheme() {
        const keys = Object.keys(state.theme.registry);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        this.applyTheme(randomKey);
    }

    // ==========================================
    // CREATOR, IMPORT & EXPORT
    // ==========================================

    saveCustomTheme() {
        const name = document.getElementById('create-name').value || 'My Custom Theme';
        const newTheme = {
            id: `custom_${Date.now()}`,
            name: name,
            bgColor: document.getElementById('create-bg').value,
            fontColor: document.getElementById('create-color').value,
            fontFamily: document.getElementById('create-font').value,
            fontSize: 50,
            fontWeight: "bold",
            textAlign: "center",
            textBaseline: "middle",
            paddingX: 0,
            effect: document.getElementById('create-effect').value,
            fadeDuration: 0.5,
            typeSpeed: 0.05,
            cursorChar: "|"
        };
        this.addThemeToRegistry(newTheme);
        alert(`Tema "${name}" berhasil dibuat dan diterapkan!`);
    }

    exportActiveTheme() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.theme.activeConfig, null, 2));
        const a = document.createElement('a');
        a.href = dataStr;
        a.download = `theme-${state.theme.activeId}.json`;
        a.click();
    }

    importTheme(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedTheme = JSON.parse(e.target.result);
                // Validasi minimal
                if (!importedTheme.id || !importedTheme.bgColor) throw new Error("Format JSON tidak valid");
                
                importedTheme.id = `imported_${Date.now()}`; // Hindari bentrok ID
                importedTheme.name += " (Imported)";
                
                this.addThemeToRegistry(importedTheme);
                alert("Tema berhasil diimport!");
            } catch (error) {
                alert("Gagal mengimport tema: " + error.message);
            }
        };
        reader.readAsText(file);
    }

    // ==========================================
    // AI THEME GENERATOR (Heuristic Offline Mock)
    // ==========================================

    generateAITheme() {
        const prompt = this.aiPrompt.value.toLowerCase();
        if (!prompt) return;

        this.aiStatus.textContent = "AI sedang meracik tema...";
        
        setTimeout(() => {
            // Heuristic Parsing
            let theme = {
                id: `ai_${Date.now()}`,
                name: `AI: ${this.aiPrompt.value.substring(0, 15)}...`,
                bgColor: "#111111",
                fontColor: "#ffffff",
                fontFamily: "'Inter', sans-serif",
                fontSize: 60,
                fontWeight: "bold",
                textAlign: "center",
                textBaseline: "middle",
                paddingX: 0,
                effect: "fade",
                fadeDuration: 0.5,
                typeSpeed: 0.05,
                cursorChar: ""
            };

            // Warna Background
            if (prompt.includes("malam") || prompt.includes("dark")) theme.bgColor = "#0a0a0a";
            if (prompt.includes("putih") || prompt.includes("terang")) theme.bgColor = "#ffffff";
            if (prompt.includes("merah") || prompt.includes("darah") || prompt.includes("horror")) theme.bgColor = "#4a0000";
            if (prompt.includes("biru") || prompt.includes("laut") || prompt.includes("ocean")) theme.bgColor = "#001f3f";
            if (prompt.includes("hutan") || prompt.includes("alam")) theme.bgColor = "#143306";
            if (prompt.includes("vaporwave") || prompt.includes("retro")) theme.bgColor = "#ff71ce";
            if (prompt.includes("cyberpunk") || prompt.includes("neon")) theme.bgColor = "#fcee0a";
            if (prompt.includes("minecraft")) theme.bgColor = "#5c4033";

            // Font & Warna Font
            if (prompt.includes("hacker") || prompt.includes("terminal") || prompt.includes("komputer")) {
                theme.fontFamily = "monospace";
                theme.fontColor = "#00ff00";
                theme.effect = "typewriter";
                theme.cursorChar = "█";
                theme.textAlign = "left";
                theme.paddingX = 50;
            } else if (prompt.includes("vaporwave")) {
                theme.fontFamily = "'Times New Roman', serif";
                theme.fontColor = "#01cdfe";
            } else if (prompt.includes("minecraft") || prompt.includes("pixel")) {
                theme.fontFamily = "'Courier New', monospace";
                theme.fontColor = "#ffffff";
                theme.effect = "none";
            } else if (prompt.includes("cyberpunk")) {
                theme.fontColor = "#00ffff";
                theme.fontWeight = "900";
            }

            this.addThemeToRegistry(theme);
            this.aiStatus.textContent = "Selesai! Tema AI berhasil diterapkan.";
        }, 800); // Simulasi delay AI
    }
              }
  
