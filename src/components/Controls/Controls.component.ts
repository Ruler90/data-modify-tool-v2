export const controls = `
    <div class="mw-dmt-ops">
        <div class="mw-dmt-op">
            <label class="mw-dmt-op__label" for="mw-dmt-separator">Separator</label>
            <div class="mw-dmt-op__body">
                <input type="text" id="mw-dmt-separator" class="mw-dmt-field mw-dmt-field--narrow js-mw-dmt-separator"
                    value="," autocomplete="off" spellcheck="false" />
                <button type="button" class="mw-dmt-btn js-mw-dmt-op" data-op="join">Column &rarr; Separator</button>
                <button type="button" class="mw-dmt-btn js-mw-dmt-op" data-op="split">Separator &rarr; Column</button>
            </div>
        </div>

        <div class="mw-dmt-op">
            <span class="mw-dmt-op__label">Rows</span>
            <div class="mw-dmt-op__body">
                <input type="text" class="mw-dmt-field mw-dmt-field--wide js-mw-dmt-prefix"
                    placeholder="start with" aria-label="Text added at the start of every row" autocomplete="off" spellcheck="false" />
                <span class="mw-dmt-op__hint">&hellip;</span>
                <input type="text" class="mw-dmt-field mw-dmt-field--wide js-mw-dmt-suffix"
                    placeholder="end with" aria-label="Text added at the end of every row" autocomplete="off" spellcheck="false" />
                <button type="button" class="mw-dmt-btn js-mw-dmt-op" data-op="wrap">Modify rows</button>
            </div>
        </div>

        <div class="mw-dmt-op">
            <span class="mw-dmt-op__label">Replace</span>
            <div class="mw-dmt-op__body">
                <input type="text" class="mw-dmt-field mw-dmt-field--wide js-mw-dmt-replace-from"
                    placeholder="from" aria-label="Text to replace" autocomplete="off" spellcheck="false" />
                <span class="mw-dmt-op__hint">&rarr;</span>
                <input type="text" class="mw-dmt-field mw-dmt-field--wide js-mw-dmt-replace-to"
                    placeholder="to" aria-label="Replacement text" autocomplete="off" spellcheck="false" />
                <button type="button" class="mw-dmt-btn js-mw-dmt-op" data-op="replace">Replace all</button>
            </div>
        </div>

        <div class="mw-dmt-op">
            <span class="mw-dmt-op__label">List</span>
            <div class="mw-dmt-op__body">
                <button type="button" class="mw-dmt-btn js-mw-dmt-op" data-op="dedupe">Remove duplicates</button>

                <!-- Copy and Clear are not transformations, so they sit apart: pushed to
                     the far end of the row and in the quiet button style, leaving the
                     indigo buttons to mean "change the data". -->
                <span class="mw-dmt-op__spacer"></span>
                <button type="button" class="mw-dmt-btn mw-dmt-btn--quiet js-mw-dmt-copy"
                    title="Copy the result again" disabled>Copy</button>
                <button type="button" class="mw-dmt-btn mw-dmt-btn--danger js-mw-dmt-clear"
                    title="Empty both boxes" disabled>Clear</button>
            </div>
        </div>
    </div>
`;
