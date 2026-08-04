/**
 * @module modules/docs
 * @description Menangani UI Modal Dokumentasi untuk end-user.
 */

export class DocsModule {
    constructor() {
        this.btnShow = document.getElementById('btn-show-docs');
        this.btnClose = document.getElementById('btn-close-docs');
        this.modal = document.getElementById('docs-modal');

        this._initListeners();
    }

    /** @private */
    _initListeners() {
        if (!this.btnShow || !this.btnClose || !this.modal) return;

        this.btnShow.addEventListener('click', () => {
            this.modal.style.display = 'flex';
        });

        this.btnClose.addEventListener('click', () => {
            this.modal.style.display = 'none';
        });

        // Tutup modal jika mengklik area luar (overlay)
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.modal.style.display = 'none';
            }
        });
    }
}
