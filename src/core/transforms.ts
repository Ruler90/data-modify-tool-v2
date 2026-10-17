const LINE_BREAK = /\r\n|\r|\n/g;

export const toLines = (text: string): string[] => text.replace(LINE_BREAK, '\n').split('\n');

export const joinWithSeparator = (text: string, separator: string): string => toLines(text).join(separator);

export const splitBySeparator = (text: string, separator: string): string => {
    if (separator === '') return text.replace(LINE_BREAK, '\n');
    return text.replace(LINE_BREAK, '\n').split(separator).join('\n');
};

export const wrapLines = (text: string, prefix: string, suffix: string): string =>
    toLines(text)
        .map((line) => `${prefix}${line}${suffix}`)
        .join('\n');

export const removeDuplicateLines = (text: string): string => [...new Set(toLines(text))].join('\n');

export const replaceAll = (text: string, from: string, to: string): string => {
    const normalised = text.replace(LINE_BREAK, '\n');
    if (from === '') return normalised;
    return normalised.split(from).join(to);
};

export const countLines = (text: string): number => (text === '' ? 0 : toLines(text).length);
