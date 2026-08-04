/**
 * @module themes/registry
 * @description Menyimpan konfigurasi JSON untuk semua tema (Theme Plugin System).
 * Setiap tema mendefinisikan tampilannya sendiri secara deklaratif.
 */


export const themeRegistry = {
    "default_minimal": {
        id: "default_minimal",
        name: "Default Minimal",
        bgColor: "#ffffff",
        fontColor: "#000000",
        fontFamily: "'Inter', sans-serif",
        fontSize: 60,
        fontWeight: "bold",
        textAlign: "center",
        textBaseline: "middle",
        paddingX: 0,
        effect: "fade",
        fadeDuration: 0.5 // Durasi fade in dalam detik
    },
    "dark_minimal": {
        id: "dark_minimal",
        name: "Dark Minimal",
        bgColor: "#121212",
        fontColor: "#ffffff",
        fontFamily: "'Inter', sans-serif",
        fontSize: 60,
        fontWeight: "bold",
        textAlign: "center",
        textBaseline: "middle",
        paddingX: 0,
        effect: "fade",
        fadeDuration: 0.8
    },
    "hacker": {
        id: "hacker",
        name: "Hacker Terminal",
        bgColor: "#000000",
        fontColor: "#00ff00",
        fontFamily: "monospace",
        fontSize: 40,
        fontWeight: "normal",
        textAlign: "left",
        textBaseline: "middle",
        paddingX: 100,
        effect: "typewriter",
        typeSpeed: 0.05, // Waktu (detik) per karakter
        cursorChar: "█" // Kursor khas terminal
    },
    "windows_notepad": {
        id: "windows_notepad",
        name: "Windows Notepad",
        bgColor: "#ffffff",
        fontColor: "#000000",
        fontFamily: "'Consolas', monospace",
        fontSize: 45,
        fontWeight: "normal",
        textAlign: "left",
        textBaseline: "top",
        paddingX: 50,
        effect: "none",
        cursorChar: "|" // Kursor garis vertikal standar
    },
    "minecraft": {
        id: "minecraft", name: "Minecraft", bgColor: "#5c4033", fontColor: "#ffffff", fontFamily: "'Courier New', monospace", fontSize: 50, fontWeight: "bold", textAlign: "center", textBaseline: "middle", paddingX: 0, effect: "none"
    },
    "cyberpunk": {
        id: "cyberpunk", name: "Cyberpunk Neon", bgColor: "#fcee0a", fontColor: "#00ffff", fontFamily: "'Inter', sans-serif", fontSize: 65, fontWeight: "900", textAlign: "center", textBaseline: "middle", paddingX: 0, effect: "fade", fadeDuration: 0.2
    },
    "vaporwave": {
        id: "vaporwave", name: "Vaporwave", bgColor: "#ff71ce", fontColor: "#01cdfe", fontFamily: "'Times New Roman', serif", fontSize: 55, fontWeight: "normal", textAlign: "center", textBaseline: "middle", paddingX: 0, effect: "fade", fadeDuration: 1.0
    }
};
      
