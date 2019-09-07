export * from 'https://unpkg.com/preact@10.0.0-rc.1?module';
//export * from 'https://unpkg.com/preact@10.0.0-rc.1/hooks/dist/hooks.module.js';

import { h } from 'https://unpkg.com/preact@10.0.0-rc.1?module';
import htm from 'https://unpkg.com/htm?module';

export const html = htm.bind(h);