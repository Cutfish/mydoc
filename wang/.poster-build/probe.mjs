import {PresentationFile,FileBlob} from '@oai/artifact-tool';
const p=await PresentationFile.importPptx(await FileBlob.load('ITMC-fmt.pptx')); const s=p.slides.items[0];
for(const [n,x] of Object.entries({slides:p.slides,shapes:s.shapes,images:s.images,slide:s}))console.log(n,Object.getOwnPropertyNames(Object.getPrototypeOf(x)));
