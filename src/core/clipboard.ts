export const copyText = async (text: string, source?: HTMLTextAreaElement): Promise<boolean> => {
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch {
        // Falls through to execCommand: a rejection here usually means an insecure
        // context or a denied permission, both of which the legacy path may survive.
    }

    return copyViaExecCommand(text, source);
};

const copyViaExecCommand = (text: string, source?: HTMLTextAreaElement): boolean => {
    const target = source ?? createOffscreenTextarea(text);

    try {
        target.focus();
        target.select();
        return document.execCommand('copy');
    } catch {
        return false;
    } finally {
        if (target !== source) target.remove();
    }
};

const createOffscreenTextarea = (text: string): HTMLTextAreaElement => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-1000px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    return textarea;
};
