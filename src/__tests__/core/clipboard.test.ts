import { beforeEach, describe, expect, it, vi } from 'vitest';
import { copyText } from '../../core/clipboard';

/**
 * The point of these is the return value. The original told the user "Copied to
 * clipboard" whether or not anything had been copied, so the one piece of feedback
 * the tool gives was not trustworthy on any page where the copy was refused.
 */

const setClipboard = (value: unknown) => {
    Object.defineProperty(navigator, 'clipboard', { value, configurable: true, writable: true });
};

beforeEach(() => {
    setClipboard({ writeText: vi.fn(async () => undefined) });
    document.execCommand = vi.fn(() => true);
});

describe('copyText', () => {
    it('writes the text through the Clipboard API and reports success', async () => {
        const writeText = vi.fn(async () => undefined);
        setClipboard({ writeText });

        await expect(copyText('hello')).resolves.toBe(true);
        expect(writeText).toHaveBeenCalledWith('hello');
    });

    it('copies an empty string without complaint', async () => {
        await expect(copyText('')).resolves.toBe(true);
    });

    it('falls back to execCommand when the Clipboard API is missing', async () => {
        setClipboard(undefined);

        await expect(copyText('hello')).resolves.toBe(true);
        expect(document.execCommand).toHaveBeenCalledWith('copy');
    });

    it('falls back to execCommand when the Clipboard API rejects', async () => {
        // What an insecure context or a denied permission looks like in practice.
        setClipboard({
            writeText: vi.fn(async () => {
                throw new Error('NotAllowedError');
            }),
        });

        await expect(copyText('hello')).resolves.toBe(true);
        expect(document.execCommand).toHaveBeenCalledWith('copy');
    });

    it('reports failure when both routes fail', async () => {
        setClipboard(undefined);
        document.execCommand = vi.fn(() => false);

        await expect(copyText('hello')).resolves.toBe(false);
    });

    it('reports failure when execCommand throws', async () => {
        setClipboard(undefined);
        document.execCommand = vi.fn(() => {
            throw new Error('blocked');
        });

        await expect(copyText('hello')).resolves.toBe(false);
    });

    it('selects the visible result box on the fallback path', async () => {
        setClipboard(undefined);
        const box = document.createElement('textarea');
        box.value = 'hello';
        document.body.appendChild(box);

        await copyText('hello', box);

        expect(box.selectionStart).toBe(0);
        expect(box.selectionEnd).toBe('hello'.length);
        // The visible box belongs to the panel and must survive the copy.
        expect(box.isConnected).toBe(true);
    });

    it('leaves no offscreen textarea behind when there is no result box', async () => {
        setClipboard(undefined);

        await copyText('hello');

        expect(document.querySelectorAll('textarea')).toHaveLength(0);
    });
});
