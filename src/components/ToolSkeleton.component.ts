import { header } from './Header/Header.component';
import { controls } from './Controls/Controls.component';
import { panes } from './Panes/Panes.component';
import * as pkg from '../../package.json';

const version = pkg.version;

export const toolSkeleton = `
    ${header}
    ${controls}
    ${panes}
    <footer class="mw-dmt-footer">
        <span class="mw-dmt-footer__status js-mw-dmt-status" role="status" aria-live="polite"></span>
        <span class="mw-dmt-footer__version">v${version}</span>
    </footer>
`;
