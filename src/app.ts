import { toolSkeleton } from './components/ToolSkeleton.component';
import { copyText } from './core/clipboard';
import { countLines, joinWithSeparator, removeDuplicateLines, replaceAll, splitBySeparator, wrapLines } from './core/transforms';
import styles from './styles/styles.scss?inline';

type OperationResult = { ok: true; text: string } | { ok: false; message: string };

(() => {
    const existing = document.querySelector<HTMLElement>('.mw-dmt');
    if (existing) {
        existing.classList.add('mw-dmt--flash');
        existing.addEventListener('animationend', () => existing.classList.remove('mw-dmt--flash'), { once: true });
        return;
    }

    const overlay = document.createElement('div');
    overlay.classList.add('mw-dmt-overlay');

    const panel = document.createElement('div');
    panel.classList.add('mw-dmt');
    panel.innerHTML = toolSkeleton;

    const styleTag = document.createElement('style');
    styleTag.textContent = styles;
    panel.appendChild(styleTag);

    const input = panel.querySelector<HTMLTextAreaElement>('.js-mw-dmt-input');
    const output = panel.querySelector<HTMLTextAreaElement>('.js-mw-dmt-output');
    const separator = panel.querySelector<HTMLInputElement>('.js-mw-dmt-separator');
    const prefix = panel.querySelector<HTMLInputElement>('.js-mw-dmt-prefix');
    const suffix = panel.querySelector<HTMLInputElement>('.js-mw-dmt-suffix');
    const replaceFrom = panel.querySelector<HTMLInputElement>('.js-mw-dmt-replace-from');
    const replaceTo = panel.querySelector<HTMLInputElement>('.js-mw-dmt-replace-to');
    const status = panel.querySelector<HTMLElement>('.js-mw-dmt-status');
    const inputCount = panel.querySelector<HTMLElement>('.js-mw-dmt-input-count');
    const outputCount = panel.querySelector<HTMLElement>('.js-mw-dmt-output-count');
    const copyBtn = panel.querySelector<HTMLButtonElement>('.js-mw-dmt-copy');
    const clearBtn = panel.querySelector<HTMLButtonElement>('.js-mw-dmt-clear');

    let statusTimer: ReturnType<typeof setTimeout> | undefined;

    const close = () => {
        clearTimeout(statusTimer);
        document.removeEventListener('keydown', onKeydown);
        panel.remove();
        overlay.remove();
    };

    function onKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') close();
    }

    /**
     * One status line for everything the tool has to say.
     *
     * The timer is always cleared first. Without that, a run of quick operations
     * leaves several timers armed and the earliest one blanks the message while a
     * later operation is still the most recent thing that happened.
     */
    const showStatus = (message: string, tone: 'ok' | 'error' | 'muted' = 'muted') => {
        if (!status) return;
        clearTimeout(statusTimer);
        status.textContent = message;
        status.classList.remove('mw-dmt-footer__status--ok', 'mw-dmt-footer__status--error');
        if (tone !== 'muted') status.classList.add(`mw-dmt-footer__status--${tone}`);
        statusTimer = setTimeout(() => {
            status.textContent = '';
            status.classList.remove('mw-dmt-footer__status--ok', 'mw-dmt-footer__status--error');
        }, 2500);
    };

    const lineLabel = (text: string) => {
        const lines = countLines(text);
        return `${lines} ${lines === 1 ? 'line' : 'lines'}`;
    };

    const refresh = () => {
        const inputText = input?.value ?? '';
        const outputText = output?.value ?? '';

        if (inputCount) inputCount.textContent = lineLabel(inputText);
        if (outputCount) outputCount.textContent = lineLabel(outputText);
        if (copyBtn) copyBtn.disabled = outputText === '';
        if (clearBtn) clearBtn.disabled = inputText === '' && outputText === '';
    };

    const operations: Record<string, () => OperationResult> = {
        join: () => ({ ok: true, text: joinWithSeparator(input?.value ?? '', separator?.value ?? '') }),

        split: () => {
            const sep = separator?.value ?? '';
            if (sep === '') return { ok: false, message: 'Set a separator first.' };
            return { ok: true, text: splitBySeparator(input?.value ?? '', sep) };
        },

        wrap: () => {
            const start = prefix?.value ?? '';
            const end = suffix?.value ?? '';
            if (start === '' && end === '') return { ok: false, message: 'Fill in "start with" or "end with" first.' };
            return { ok: true, text: wrapLines(input?.value ?? '', start, end) };
        },

        dedupe: () => ({ ok: true, text: removeDuplicateLines(input?.value ?? '') }),

        replace: () => {
            const from = replaceFrom?.value ?? '';
            if (from === '') return { ok: false, message: 'Fill in what to replace first.' };
            return { ok: true, text: replaceAll(input?.value ?? '', from, replaceTo?.value ?? '') };
        },
    };

    const runOperation = async (name: string) => {
        const operation = operations[name];
        if (!operation || !output) return;

        const result = operation();
        if (!result.ok) {
            showStatus(result.message, 'error');
            return;
        }

        output.value = result.text;
        refresh();

        const copied = await copyText(result.text, output);
        showStatus(copied ? 'Copied to clipboard' : 'Result ready - copy it manually', copied ? 'ok' : 'error');
    };

    panel.querySelectorAll<HTMLButtonElement>('.js-mw-dmt-op').forEach((button) => {
        button.addEventListener('click', () => {
            const op = button.dataset.op;
            if (op) void runOperation(op);
        });
    });

    copyBtn?.addEventListener('click', async () => {
        const text = output?.value ?? '';
        const copied = await copyText(text, output ?? undefined);
        showStatus(copied ? 'Copied to clipboard' : 'Copy failed - select the result and copy it manually', copied ? 'ok' : 'error');
    });

    clearBtn?.addEventListener('click', () => {
        if (input) input.value = '';
        if (output) output.value = '';
        refresh();
        showStatus('Cleared');
        input?.focus();
    });

    input?.addEventListener('input', refresh);
    output?.addEventListener('input', refresh);

    panel.querySelector('.js-mw-dmt-close')?.addEventListener('click', close);
    document.addEventListener('keydown', onKeydown);

    document.body.appendChild(overlay);
    document.body.appendChild(panel);
    refresh();
    input?.focus();
})();
