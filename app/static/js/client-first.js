/* Progressive enhancement only: content, navigation and email work without JS. */
(() => {
    const themeButton = document.querySelector('[data-theme-toggle]');
    if (themeButton) {
        const label = () => { themeButton.textContent = document.documentElement.dataset.theme === 'light' ? 'Use dark colors' : 'Use light colors'; };
        themeButton.hidden = false;
        label();
        themeButton.addEventListener('click', () => {
            const theme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
            document.documentElement.dataset.theme = theme;
            try { localStorage.setItem('holtsnider-theme', theme); } catch (_) { /* Theme still works without storage. */ }
            label();
        });
    }
    const notes = document.getElementById('project-notes');
    const draft = document.getElementById('email-draft');
    const email = document.getElementById('email-chris');
    const notice = document.getElementById('draft-notice');
    if (notes && draft && email) {
        const update = () => {
            draft.value = "Hi Chris,\n\nI'd like to talk about a problem or project.\n\n" + (notes.value.trim() || "Here's what's happening:\n");
            const base = 'mailto:chris@holtsnidertech.com?subject=Holtsnider%20Tech%20inquiry';
            const composed = base + '&body=' + encodeURIComponent(draft.value);
            // Long mailto URLs are not handled consistently across mail clients.
            email.href = composed.length <= 1800 ? composed : base;
            notice.textContent = composed.length <= 1800 ? '' : 'For longer notes, copy this draft into your email. The Email Chris button will open an email without the draft attached.';
        };
        notes.addEventListener('input', update);
        update();
    }
    const status = document.querySelector('[data-copy-status]');
    document.querySelectorAll('[data-copy]').forEach(button => {
        const target = document.getElementById(button.dataset.copy);
        if (!target) return;
        button.hidden = false;
        button.addEventListener('click', async () => {
            const text = target.value === undefined ? target.textContent.trim() : target.value;
            const message = button.dataset.copy === 'email-draft' ? notice : status;
            try {
                if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
                await navigator.clipboard.writeText(text);
                message.textContent = button.dataset.copy === 'email-draft' ? 'Draft copied. Paste it into your email.' : 'Email address copied.';
            } catch (_) {
                target.focus();
                if (target.select) target.select();
                else {
                    const range = document.createRange();
                    range.selectNodeContents(target);
                    const selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
                message.textContent = 'Automatic copy was blocked. The text is selected: use Copy, Ctrl+C, or Command+C.';
            }
        });
    });
    // Preserve previously shared homepage anchors without making navigation a wizard.
    const routeLegacyHash = () => {
        if (location.pathname !== '/') return;
        if (['#experience','#case-shapes'].includes(location.hash)) {
            location.replace('/technical');
        } else if (['#start','#guided-flow'].includes(location.hash)) {
            location.replace('/guided' + location.hash);
        }
    };
    // Hash-only navigation does not reload the document or rerun this script.
    window.addEventListener('hashchange', routeLegacyHash);
    routeLegacyHash();
})();
