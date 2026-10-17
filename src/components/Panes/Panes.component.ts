export const panes = `
    <div class="mw-dmt-panes">
        <div class="mw-dmt-pane">
            <div class="mw-dmt-pane__head">
                <label class="mw-dmt-pane__title" for="mw-dmt-input">Input</label>
                <span class="mw-dmt-pane__count js-mw-dmt-input-count">0 lines</span>
            </div>
            <textarea id="mw-dmt-input" class="mw-dmt-pane__box js-mw-dmt-input"
                placeholder="Paste your data here" spellcheck="false" autocomplete="off"></textarea>
        </div>

        <div class="mw-dmt-pane">
            <div class="mw-dmt-pane__head">
                <label class="mw-dmt-pane__title" for="mw-dmt-output">Result</label>
                <span class="mw-dmt-pane__count js-mw-dmt-output-count">0 lines</span>
            </div>
            <textarea id="mw-dmt-output" class="mw-dmt-pane__box js-mw-dmt-output"
                placeholder="The result appears here and is copied to your clipboard" spellcheck="false" autocomplete="off"></textarea>
        </div>
    </div>
`;
