import { describe, expect, it } from 'vitest';
import {
    countLines,
    joinWithSeparator,
    removeDuplicateLines,
    replaceAll,
    splitBySeparator,
    toLines,
    wrapLines,
} from '../../core/transforms';

/**
 * These read as "this goes in, that comes out" on purpose. The tool is a set of text
 * transformations, so the expected result of each one can simply be written down.
 */

describe('joinWithSeparator - column to separated values', () => {
    it('joins a column with the separator', () => {
        expect(joinWithSeparator('a\nb\nc', ',')).toBe('a,b,c');
    });

    it('accepts a multi-character separator', () => {
        expect(joinWithSeparator('a\nb\nc', ' | ')).toBe('a | b | c');
    });

    it('keeps the trailing separator a trailing empty line produces', () => {
        // A column copied out of Excel almost always ends with a newline, and that
        // empty line is a real value, so the trailing comma is expected.
        expect(joinWithSeparator('a\nb\n', ',')).toBe('a,b,');
    });

    it('concatenates when the separator is empty', () => {
        expect(joinWithSeparator('a\nb\nc', '')).toBe('abc');
    });

    it('leaves a single line alone', () => {
        expect(joinWithSeparator('only', ',')).toBe('only');
    });

    it('returns an empty string for empty input', () => {
        expect(joinWithSeparator('', ',')).toBe('');
    });

    it('treats Windows line endings as line breaks', () => {
        expect(joinWithSeparator('a\r\nb\r\nc', ',')).toBe('a,b,c');
    });

    it('does not touch a separator character already inside a line', () => {
        expect(joinWithSeparator('a,1\nb,2', ';')).toBe('a,1;b,2');
    });
});

describe('splitBySeparator - separated values to column', () => {
    it('puts every piece on its own line', () => {
        expect(splitBySeparator('a,b,c', ',')).toBe('a\nb\nc');
    });

    it('accepts a multi-character separator', () => {
        expect(splitBySeparator('a | b | c', ' | ')).toBe('a\nb\nc');
    });

    it('keeps empty pieces, so two separators in a row leave a blank line', () => {
        expect(splitBySeparator('a,,b', ',')).toBe('a\n\nb');
    });

    it('treats regex metacharacters as literal text', () => {
        expect(splitBySeparator('a.b.c', '.')).toBe('a\nb\nc');
        expect(splitBySeparator('a$b$c', '$')).toBe('a\nb\nc');
        expect(splitBySeparator('a*b*c', '*')).toBe('a\nb\nc');
        expect(splitBySeparator('a(b)c', ')')).toBe('a(b\nc');
    });

    it('returns the text unchanged when the separator is empty', () => {
        expect(splitBySeparator('abc', '')).toBe('abc');
    });

    it('returns the whole text as one line when the separator is absent', () => {
        expect(splitBySeparator('abc', ',')).toBe('abc');
    });

    it('splits across existing line breaks too', () => {
        expect(splitBySeparator('a,b\nc,d', ',')).toBe('a\nb\nc\nd');
    });
});

describe('wrapLines - prefix and suffix on every row', () => {
    it('adds a prefix to every line', () => {
        expect(wrapLines('a\nb', '- ', '')).toBe('- a\n- b');
    });

    it('adds a suffix to every line', () => {
        expect(wrapLines('a\nb', '', ';')).toBe('a;\nb;');
    });

    it('wraps rows in quotes and a comma, ready for a SQL IN list', () => {
        expect(wrapLines('123\n456', '\'', '\',')).toBe('\'123\',\n\'456\',');
    });

    it('wraps empty lines as well, so the row count is preserved', () => {
        expect(wrapLines('a\n\nb', '[', ']')).toBe('[a]\n[]\n[b]');
    });

    it('returns the text unchanged when both fields are empty', () => {
        expect(wrapLines('a\nb', '', '')).toBe('a\nb');
    });

    it('wraps an empty input as a single empty row', () => {
        expect(wrapLines('', '<', '>')).toBe('<>');
    });
});

describe('removeDuplicateLines', () => {
    it('keeps the first occurrence and drops the rest', () => {
        expect(removeDuplicateLines('a\nb\na\nc\nb')).toBe('a\nb\nc');
    });

    it('preserves the original order', () => {
        expect(removeDuplicateLines('c\na\nc\nb\na')).toBe('c\na\nb');
    });

    it('compares case sensitively', () => {
        expect(removeDuplicateLines('Ala\nala\nALA')).toBe('Ala\nala\nALA');
    });

    it('treats surrounding whitespace as part of the value', () => {
        expect(removeDuplicateLines('a\na ')).toBe('a\na ');
    });

    it('compares whole rows, so a multi-column row only matches an identical row', () => {
        expect(removeDuplicateLines('a\tb\tc\na\tb\td\na\tb\tc')).toBe('a\tb\tc\na\tb\td');
    });

    it('collapses repeated empty lines into one', () => {
        expect(removeDuplicateLines('a\n\nb\n\nc')).toBe('a\n\nb\nc');
    });

    it('leaves a list with nothing repeated alone', () => {
        expect(removeDuplicateLines('a\nb\nc')).toBe('a\nb\nc');
    });

    it('returns an empty string for empty input', () => {
        expect(removeDuplicateLines('')).toBe('');
    });
});

describe('replaceAll', () => {
    it('replaces every occurrence', () => {
        expect(replaceAll('a-b-c', '-', '_')).toBe('a_b_c');
    });

    it('replaces across lines', () => {
        expect(replaceAll('a-1\nb-2', '-', ': ')).toBe('a: 1\nb: 2');
    });

    it('deletes the text when the replacement is empty', () => {
        expect(replaceAll('a-b-c', '-', '')).toBe('abc');
    });

    it('replaces a multi-character string', () => {
        expect(replaceAll('foo bar foo', 'foo', 'baz')).toBe('baz bar baz');
    });

    it('treats regex metacharacters in the search as literal text', () => {
        expect(replaceAll('a.b', '.', '-')).toBe('a-b');
        expect(replaceAll('a+b', '+', '-')).toBe('a-b');
        expect(replaceAll('a[b]c', '[', '(')).toBe('a(b]c');
        expect(replaceAll('2^10', '^', ' to the ')).toBe('2 to the 10');
    });

    it('inserts dollar patterns literally instead of interpreting them', () => {
        expect(replaceAll('ab', 'a', '$&')).toBe('$&b');
        expect(replaceAll('ab', 'a', '$1')).toBe('$1b');
        expect(replaceAll('price', 'price', '$100')).toBe('$100');
        expect(replaceAll('ab', 'a', '$$')).toBe('$$b');
    });

    it('returns the text unchanged when the search field is empty', () => {
        expect(replaceAll('abc', '', 'X')).toBe('abc');
    });

    it('leaves the text alone when there is nothing to find', () => {
        expect(replaceAll('abc', 'z', 'X')).toBe('abc');
    });

    it('handles a replacement that contains the search string', () => {
        expect(replaceAll('a', 'a', 'aa')).toBe('aa');
    });
});

describe('countLines', () => {
    it('counts an empty box as zero lines', () => {
        expect(countLines('')).toBe(0);
    });

    it('counts a single line', () => {
        expect(countLines('a')).toBe(1);
    });

    it('counts the empty line a trailing newline creates', () => {
        expect(countLines('a\nb\n')).toBe(3);
    });

    it('counts Windows line endings as one break each', () => {
        expect(countLines('a\r\nb')).toBe(2);
    });
});

describe('toLines', () => {
    it('normalises all three line ending styles', () => {
        expect(toLines('a\r\nb\rc\nd')).toEqual(['a', 'b', 'c', 'd']);
    });
});
