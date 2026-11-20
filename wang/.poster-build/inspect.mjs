import fs from 'node:fs/promises';
import {PresentationFile,FileBlob} from '@oai/artifact-tool';
const p=await PresentationFile.importPptx(await FileBlob.load('ITMC-fmt.pptx'));
console.log((await p.inspect({kind:'layout',maxChars:6000})).ndjson);
console.log('masters',p.masters.items.length,'slides',p.slides.items.length);
await fs.writeFile('.poster-build/template-layout.json',(await p.slides.items[0].export({format:'layout'})).text ? await (await p.slides.items[0].export({format:'layout'})).text() : '');
