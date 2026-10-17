import { beforeEach, describe, expect, it, vi } from 'vitest';
import { unmountApp } from './setup';

/**
 * Integration cover: the panel is mounted for real, fields are filled in, buttons are
 * clicked, and the result box is read back. Each test still states a plain input and
 * a plain expected output - the wiring is what is under test, not the maths, which
 * transforms.test.ts already pins down.
 */

const loadApp = async () => {
    vi.resetModules();
    await import('../app');
};

const panel = () => document.querySelector<HTMLElement>('.mw-dmt');
const input = () => document.querySelector<HTMLTextAreaElement>('.js-mw-dmt-input');
const output = () => document.querySelector<HTMLTextAreaElement>('.js-mw-dmt-output');
const status = () => document.querySelector<HTMLElement>('.js-mw-dmt-status');
const field = (name: string) => document.querySelector<HTMLInputElement>(`.js-mw-dmt-${name}`);
const button = (op: string) => document.querySelector<HTMLButtonElement>(`.js-mw-dmt-op[data-op="${op}"]`);
const copyBtn = () => document.querySelector<HTMLButtonElement>('.js-mw-dmt-copy');
const clearBtn = () => document.querySelector<HTMLButtonElement>('.js-mw-dmt-clear');

/** Sets the input box the way a paste would, counts included. */
const paste = (text: string) => {
    const box = input();
    if (!box) throw new Error('input box missing');
    box.value = text;
    box.dispatchEvent(new Event('input', { bubbles: true }));
};

const fill = (name: string, value: string) => {
    const el = field(name);
    if (!el) throw new Error(`field ${name} missing`);
    el.value = value;
};

/** Clicks an operation and waits for its async copy to settle. */
const run = async (op: string) => {
    button(op)?.click();
    await vi.waitFor(() => expect(status()?.textContent).not.toBe(''));
};

beforeEach(() => {
    // Belt and braces: afterEach already unmounts, but a test that throws part way
    // through must not leave a live panel listening for the next one's key presses.
    unmountApp();
    Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: vi.fn(async () => undefined) },
        configurable: true,
        writable: true,
    });
    document.execCommand = vi.fn(() => true);
});

describe('mounting', () => {
    it('renders the panel and the overlay', async () => {
        await loadApp();
        expect(panel()).not.toBeNull();
        expect(document.querySelector('.mw-dmt-overlay')).not.toBeNull();
    });

    it('starts with both boxes empty and the separator defaulted to a comma', async () => {
        await loadApp();
        expect(input()?.value).toBe('');
        expect(output()?.value).toBe('');
        expect(field('separator')?.value).toBe(',');
    });

    it('flashes instead of mounting a second panel', async () => {
        await loadApp();
        await loadApp();
        expect(document.querySelectorAll('.mw-dmt')).toHaveLength(1);
        expect(panel()?.classList.contains('mw-dmt--flash')).toBe(true);
    });
});

describe('column to separator', () => {
    it('joins the pasted column with the separator', async () => {
        await loadApp();
        paste('a\nb\nc');
        await run('join');
        expect(output()?.value).toBe('a,b,c');
    });

    it('uses whatever is in the separator field', async () => {
        await loadApp();
        paste('a\nb\nc');
        fill('separator', ' | ');
        await run('join');
        expect(output()?.value).toBe('a | b | c');
    });
});

describe('separator to column', () => {
    it('splits the pasted values onto separate lines', async () => {
        await loadApp();
        paste('a,b,c');
        await run('split');
        expect(output()?.value).toBe('a\nb\nc');
    });

    it('refuses and explains itself when the separator field is empty', async () => {
        await loadApp();
        paste('abc');
        fill('separator', '');
        await run('split');
        expect(output()?.value).toBe('');
        expect(status()?.textContent).toBe('Set a separator first.');
    });
});

describe('wrap rows', () => {
    it('applies the prefix and the suffix to every row', async () => {
        await loadApp();
        paste('123\n456');
        fill('prefix', '\'');
        fill('suffix', '\',');
        await run('wrap');
        expect(output()?.value).toBe('\'123\',\n\'456\',');
    });

    it('works with only a prefix', async () => {
        await loadApp();
        paste('a\nb');
        fill('prefix', '- ');
        await run('wrap');
        expect(output()?.value).toBe('- a\n- b');
    });

    it('does not touch the separator field', async () => {
        await loadApp();
        paste('a\nb');
        fill('separator', ';');
        fill('prefix', '> ');
        await run('wrap');
        expect(output()?.value).toBe('> a\n> b');
        expect(field('separator')?.value).toBe(';');
    });

    it('refuses when both fields are empty', async () => {
        await loadApp();
        paste('a\nb');
        await run('wrap');
        expect(output()?.value).toBe('');
        expect(status()?.textContent).toBe('Fill in "start with" or "end with" first.');
    });
});

describe('remove duplicates', () => {
    it('drops repeated rows and keeps the order', async () => {
        await loadApp();
        paste('a\nb\na\nc\nb');
        await run('dedupe');
        expect(output()?.value).toBe('a\nb\nc');
    });
});

describe('replace all', () => {
    it('replaces every occurrence', async () => {
        await loadApp();
        paste('a-b-c');
        fill('replace-from', '-');
        fill('replace-to', '_');
        await run('replace');
        expect(output()?.value).toBe('a_b_c');
    });

    it('deletes the text when the replacement field is left empty', async () => {
        await loadApp();
        paste('a-b-c');
        fill('replace-from', '-');
        await run('replace');
        expect(output()?.value).toBe('abc');
    });

    it('inserts a dollar pattern literally', async () => {
        await loadApp();
        paste('ab');
        fill('replace-from', 'a');
        fill('replace-to', '$&');
        await run('replace');
        expect(output()?.value).toBe('$&b');
    });

    it('refuses when the search field is empty', async () => {
        await loadApp();
        paste('abc');
        fill('replace-to', 'X');
        await run('replace');
        expect(output()?.value).toBe('');
        expect(status()?.textContent).toBe('Fill in what to replace first.');
    });
});

describe('copying', () => {
    it('copies the result and says so', async () => {
        await loadApp();
        paste('a\nb');
        await run('join');
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('a,b');
        expect(status()?.textContent).toBe('Copied to clipboard');
        expect(status()?.classList.contains('mw-dmt-footer__status--ok')).toBe(true);
    });

    it('says the copy failed instead of claiming success', async () => {
        Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true, writable: true });
        document.execCommand = vi.fn(() => false);

        await loadApp();
        paste('a\nb');
        await run('join');

        // The result is still produced - only the clipboard step failed.
        expect(output()?.value).toBe('a,b');
        expect(status()?.textContent).toBe('Result ready - copy it manually');
        expect(status()?.classList.contains('mw-dmt-footer__status--error')).toBe(true);
    });
});

describe('line counts', () => {
    it('counts the pasted lines', async () => {
        await loadApp();
        paste('a\nb\nc');
        expect(document.querySelector('.js-mw-dmt-input-count')?.textContent).toBe('3 lines');
    });

    it('uses the singular for one line', async () => {
        await loadApp();
        paste('a');
        expect(document.querySelector('.js-mw-dmt-input-count')?.textContent).toBe('1 line');
    });

    it('counts the result after an operation', async () => {
        await loadApp();
        paste('a,b,c');
        await run('split');
        expect(document.querySelector('.js-mw-dmt-output-count')?.textContent).toBe('3 lines');
    });
});

describe('the Copy button', () => {
    it('starts disabled while the result box is empty', async () => {
        await loadApp();
        expect(copyBtn()?.disabled).toBe(true);
    });

    it('becomes available once an operation has produced a result', async () => {
        await loadApp();
        paste('a\nb');
        await run('join');
        expect(copyBtn()?.disabled).toBe(false);
    });

    it('copies the result again on demand', async () => {
        await loadApp();
        paste('a\nb');
        await run('join');
        vi.mocked(navigator.clipboard.writeText).mockClear();

        copyBtn()?.click();
        await vi.waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith('a,b'));
        expect(status()?.textContent).toBe('Copied to clipboard');
    });

    it('copies a result the user edited by hand', async () => {
        await loadApp();
        paste('a\nb');
        await run('join');

        const box = output();
        if (!box) throw new Error('result box missing');
        box.value = 'edited by hand';
        box.dispatchEvent(new Event('input', { bubbles: true }));

        copyBtn()?.click();
        await vi.waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith('edited by hand'));
    });

    it('goes back to disabled when the result box is emptied', async () => {
        await loadApp();
        paste('a\nb');
        await run('join');
        clearBtn()?.click();
        expect(copyBtn()?.disabled).toBe(true);
    });
});

describe('the Clear button', () => {
    it('starts disabled while both boxes are empty', async () => {
        await loadApp();
        expect(clearBtn()?.disabled).toBe(true);
    });

    it('becomes available as soon as something is pasted', async () => {
        await loadApp();
        paste('a');
        expect(clearBtn()?.disabled).toBe(false);
    });

    it('empties both boxes, not just the input', async () => {
        await loadApp();
        paste('a\nb');
        await run('join');
        expect(output()?.value).toBe('a,b');

        clearBtn()?.click();

        expect(input()?.value).toBe('');
        expect(output()?.value).toBe('');
        expect(document.querySelector('.js-mw-dmt-output-count')?.textContent).toBe('0 lines');
        expect(clearBtn()?.disabled).toBe(true);
    });
});

describe('closing', () => {
    it('removes the panel and the overlay on the close button', async () => {
        await loadApp();
        document.querySelector<HTMLButtonElement>('.js-mw-dmt-close')?.click();
        expect(panel()).toBeNull();
        expect(document.querySelector('.mw-dmt-overlay')).toBeNull();
    });

    it('closes on Escape', async () => {
        await loadApp();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        expect(panel()).toBeNull();
    });

    it('ignores other keys', async () => {
        await loadApp();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
        expect(panel()).not.toBeNull();
    });

    /**
     * The panel's own listeners die with its subtree, but the Escape handler sits on
     * `document` and outlives it. If closing did not detach it, every panel ever
     * opened would keep answering key presses - in a long-lived page that is a leak,
     * and in this suite it was thirty orphans racing the live panel for one Escape.
     */
    it('detaches its document listener when it closes', async () => {
        const add = document.addEventListener;
        const remove = document.removeEventListener;
        let keydownListeners = 0;

        document.addEventListener = ((type: string, ...rest: unknown[]) => {
            if (type === 'keydown') keydownListeners += 1;
            return (add as never as (...a: unknown[]) => void).call(document, type, ...rest);
        }) as typeof document.addEventListener;

        document.removeEventListener = ((type: string, ...rest: unknown[]) => {
            if (type === 'keydown') keydownListeners -= 1;
            return (remove as never as (...a: unknown[]) => void).call(document, type, ...rest);
        }) as typeof document.removeEventListener;

        try {
            await loadApp();
            expect(keydownListeners).toBe(1);

            document.querySelector<HTMLButtonElement>('.js-mw-dmt-close')?.click();
            expect(keydownListeners).toBe(0);

            await loadApp();
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            expect(keydownListeners).toBe(0);
        } finally {
            document.addEventListener = add;
            document.removeEventListener = remove;
        }
    });
});

describe('host page isolation', () => {
    it('never puts pasted data through innerHTML', async () => {
        // Data only ever reaches a textarea's value, so markup pasted in stays text.
        await loadApp();
        paste('<img src=x onerror="window.__pwned=1">');
        await run('dedupe');

        expect(document.querySelector('img')).toBeNull();
        expect(output()?.value).toBe('<img src=x onerror="window.__pwned=1">');
    });
});
