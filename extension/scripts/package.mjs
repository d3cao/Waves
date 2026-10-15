import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {mkdir} from 'node:fs/promises';
const cwd = fileURLToPath(new URL('../dist/',import.meta.url));
await mkdir(fileURLToPath(new URL('../test-results/',import.meta.url)),{recursive:true});
execFileSync('zip',['-q','-r','../test-results/waves-extension.zip','.'],{cwd,stdio:'inherit'});
