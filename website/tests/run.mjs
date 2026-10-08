import {execFileSync} from 'node:child_process';
import {readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
process.chdir(fileURLToPath(new URL('..',import.meta.url)));
// Compile pure domain tests with the existing TypeScript dependency; also works on Node 20.
execFileSync(process.execPath,['node_modules/typescript/bin/tsc','src/lib/progress-core.ts','src/lib/rag-workbench.ts','src/lib/course-core.ts','src/lib/project-core.ts','--outDir','.test-dist','--module','commonjs','--target','es2020','--skipLibCheck'],{stdio:'inherit'});
execFileSync(process.execPath,['--test',...readdirSync('tests').filter(f=>f.endsWith('.test.mjs')).map(f=>'tests/'+f)],{stdio:'inherit'});
