import { afterEach, vi } from 'vitest';

/**
 * jsdom ships no clipboard and no document.execCommand, and every operation in the
 * app ends in a copy. Both are stubbed here so the suite exercises the real code
 * path rather than a mocked-out one, and tests that care can override them.
 */
if (!navigator.clipboard) {
    Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: vi.fn(async () => undefined) },
        configurable: true,
        writable: true,
    });
}

if (!document.execCommand) {
    document.execCommand = vi.fn(() => true);
}

// jsdom does not implement selection on a textarea beyond the indices, which is all
// the fallback copy path touches, so nothing else needs stubbing here.

// Closing first so the app detaches its document listener and its status timer;
// wiping innerHTML alone leaves both running.
export const unmountApp = (): void => {
    document.querySelectorAll<HTMLButtonElement>('.js-mw-dmt-close').forEach((button) => button.click());
    document.body.innerHTML = '';
};

afterEach(() => {
    unmountApp();
    vi.clearAllMocks();
});
