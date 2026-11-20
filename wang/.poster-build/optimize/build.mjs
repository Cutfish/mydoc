import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import {PresentationFile,FileBlob} from '@oai/artifact-tool';
import {finalizePresentation} from '/Users/hanxuegang/.codex/plugins/cache/openai-primary-runtime/presentations/26.1011.11113/skills/presentations/container_tools/artifact_tool_utils.mjs';
const root=process.cwd(),build=path.join(root,'.poster-build/optimize');
const media=path.join(root,'.poster-build/具有温度可视化功能的层状异质热致变色复合膜及其自适应热管理/media');
const source=path.join(root,'output/温度可视化自适应热管理_海报.pptx');
const p=await PresentationFile.importPptx(await FileBlob.load(source)); const s=p.slides.items[0];
const prior=new Map(s.shapes.items.map(a=>[a.name,a]));const keep=new Set();
for(const im of [...s.images.items])s.images.deleteById(im.id);
const W=30240288/9525,H=42479913/9525,L=48,R=1635,C=1490;
const red='#921639',accent='#B51C15',peach='#F7E5D8',font='Times New Roman';
function shape(name,x,y,w,h,fill='none'){let a=prior.get(name); if(!a)a=s.shapes.add({name,geometry:'rect'});keep.add(a.id);a.position={left:x,top:y,width:w,height:h};a.fill=fill;a.line={fill:'none',width:0};return a;}
function rect(name,x,y,w,h,color){return shape(name,x,y,w,h,color);}
function txt(name,text,x,y,w,h,size=48,opt={}){let a=shape(name,x,y,w,h);a.text=text;a.text.style={fontSize:size,typeface:font,color:'#111111',alignment:'left',verticalAlignment:'top',wrap:'square',autoFit:'none',insets:0,...opt};return a;}
function bar(name,text,x,y){rect(name+' band',x,y,C,110,peach);txt(name,text,x+12,y+17,C-24,82,72,{bold:true,alignment:'center'});}
function sub(name,text,x,y,color='#111111'){txt(name,text,x,y,C-24,80,54,{bold:true,italic:color==='#111111',color});}
function bullet(name,text,x,y,w,h,size=48,opt={}){txt(name+' marker','-',x,y,35,h,size,{bold:true,...opt});return txt(name,text,x+45,y,w-45,h,size,{bold:true,...opt});}
async function img(name,file,x,y,w,h,crop){let sh=sharp(path.join(media,file));if(crop)sh=sh.extract(crop);const b=await sh.flatten({background:'#ffffff'}).png().toBuffer();return s.images.add({name,blob:b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),contentType:'image/png',alt:name,fit:'contain',position:{left:x,top:y,width:w,height:h}});}
rect('Top burgundy band',0,0,W,102,red);rect('Header rule',0,616,W,24,red);rect('Bottom burgundy band',0,H-28,W,28,red);rect('Column divider',1583,691,6,H-750,red);
txt('Research title','Layered Heterostructural Thermochromic Composite Films\nwith Temperature Visualization for Adaptive Thermal Management',90,150,W-180,256,97,{bold:true,color:accent,alignment:'center'});
txt('Editable author line','[Authors]',150,446,W-300,64,52,{bold:true,alignment:'center'});
txt('Editable affiliation and contact','[Affiliation]     [Corresponding author e-mail]',150,532,W-300,62,44,{alignment:'center',italic:true,bold:true});
bar('Introduction','INTRODUCTION',L,700);
bullet('Introduction aim','Temperature visualization and adaptive thermal regulation in one flexible composite.',L+18,851,C-36,120,50);
bullet('Introduction architecture','Layer separation preserves the thermochromic signal above the dark phase-change storage layer.',L+18,1005,C-36,120,50);
bar('Materials and methods','MATERIALS & METHODS',L,1170);
sub('FPCM formulation','I.  Flexible phase-change storage layer',L+18,1320,accent);
txt('FPCM preparation copy','PEG1000/PVA reinforced with CNF-COOH and MWCNTs-COOH. Solution casting and chemical crosslinking stabilize the storage network.',L+18,1410,C-36,180,48,{bold:true});
sub('Thermochromic formulation','II.  Thermochromic PVDF nanofiber layer',L+18,1620,accent);
txt('Thermochromic preparation copy','20 wt% TCMs with transition temperatures of 22, 28 and 33 °C (mass ratio 5:7:5). Electrospinning: 11.5 kV, 15 cm and 0.3 mL/h.',L+18,1710,C-36,180,48,{bold:true});
await img('Original Figure 3: bilayer preparation','image3.png',L+22,1920,C-44,785);
txt('Assembly caption','TPU-assisted electrospraying joins the layers. Lamination at 40 °C and 0.05 MPa for 20 min yields TC-RGY20@FPCM.',L+18,2730,C-36,132,46,{bold:true});
bar('FPCM results','RESULTS',L,2890);
sub('FPCM performance','I.  Flexible storage and bilayer integration',L+18,3040);
await img('Original Figure 4c: FPCM tensile response','image4.png',L+5,3145,730,535,{left:890,top:0,width:408,height:340});
await img('Original Figure 4d: FPCM DSC response','image4.png',L+755,3145,730,535,{left:0,top:345,width:423,height:329});
txt('FPCM metrics','Melting enthalpy: 59.14 J/g     Tensile strength: 7.18 MPa\nElongation at break: 167.79%\nAverage leakage: 2.06% (80 °C, 2 h, n = 5)',L+18,3700,C-36,185,48,{bold:true});
await img('Original Figure 12c1: bilayer cross section','image15.png',L+110,3930,590,410,{left:876,top:0,width:421,height:292});
await img('Original Figure 12c2: bilayer interface','image15.png',L+790,3930,590,410,{left:876,top:309,width:421,height:293});
txt('Interface caption','Cross-sectional SEM: distinct, closely bonded dense/porous layers.',L+18,4360,C-36,55,38,{bold:true});
sub('Temperature visualization','II.  Reversible temperature visualization',R+18,710);
await img('Original Figure 9a: reversible temperature-dependent colors','image12.png',R+5,820,755,565,{left:0,top:0,width:440,height:340});
await img('Original Figure 9e: TC-RGY50 200-cycle color stability','image12.png',R+785,820,700,565,{left:452,top:346,width:467,height:326});
txt('Color headline','Gray, green, yellow and near-white states over 20–35 °C.',R+18,1410,C-36,70,50,{bold:true,color:accent});
txt('Durability findings','TC-RGY50 retains colorimetric stability after 200 cycles (ΔE < 0.25).',R+18,1502,C-36,110,46,{bold:true});
sub('Optical switch','III.  Reversible absorption / reflection switching',R+18,1670);
txt('Low temperature graph label','20 °C: colored, absorbing state',R+22,1760,720,65,46,{bold:true,color:accent});
txt('High temperature graph label','35 °C: bleached, reflecting state',R+782,1760,720,65,46,{bold:true,color:accent});
await img('Original Figure 10a: relative reflectance at 20 degrees','image13.png',R+5,1835,730,540,{left:0,top:0,width:446,height:329});
await img('Original Figure 10d: relative reflectance at 35 degrees','image13.png',R+765,1835,730,540,{left:0,top:329,width:446,height:324});
txt('Reflectance findings','TC-RGY20: visible relative-reflectance modulation of 30.32 percentage points between 20 and 35 °C.',R+18,2405,C-36,140,48,{bold:true});
sub('Outdoor thermal regulation','IV.  Outdoor bidirectional thermal regulation',R+18,2580);
await img('Original Figure 13c–f: outdoor temperature profiles and differences','image16.png',R+10,2680,C-20,1068,{left:0,top:292,width:911,height:662});
txt('Temperature difference definition','ΔT = TCu − Tsample. Positive ΔT indicates cooling relative to bare copper.',R+18,3764,C-36,55,38,{bold:true});
bar('Conclusions','CONCLUSIONS',R,3850);
bullet('Conclusion architecture','The dense/porous bilayer combines flexible latent heat storage with reversible optical regulation.',R+18,4000,C-36,110,48);
bullet('Conclusion optical function','TC-RGY20 enables temperature indication over 20–35 °C and 30.32-point visible reflectance modulation.',R+18,4135,C-36,110,48);
bullet('Conclusion outdoor performance','Outdoor tests show 12–17 °C cooling in strong sunlight and 2–4 °C warming under weak sunlight, versus bare copper.',R+18,4270,C-36,145,48,{color:accent});
for(const a of [...s.shapes.items])if(!keep.has(a.id))s.shapes.deleteById(a.id);
s.speakerNotes.text='Source manuscript: 具有温度可视化功能的层状异质热致变色复合膜及其自适应热管理.docx, Abstract; Materials and Methods; Figures 3, 4(c,d), 9(a,e,f), 10(a,d), 12(c1,c2), 13(c-f); Conclusions. Style references: ITMC-fmt.pptx and 参考海报.png. One portrait page only, original size 30240288 × 42479913 EMU. Native text and layout remain editable. Experimental figures retain source measurements and axes; selected panels are cropped from originals and flattened onto white. The 200-cycle stability result refers to TC-RGY50. FPCM metrics refer to the storage layer. Outdoor cooling/warming values refer to bare copper under the reported strong-/weak-irradiance conditions, not ambient-temperature cooling. Authors, affiliation and contact were not supplied and remain editable placeholders.';
await (await PresentationFile.exportPptx(p)).save(path.join(build,'candidate.pptx'));
await fs.writeFile(path.join(build,'preview.png'),new Uint8Array(await (await p.export({slide:s,format:'png',scale:0.5})).arrayBuffer()));
await fs.writeFile(path.join(build,'layout.json'),await (await s.export({format:'layout'})).text());
const skill='/Users/hanxuegang/.codex/plugins/cache/openai-primary-runtime/presentations/26.1011.11113/skills/presentations';
const finalPath=path.join(root,'output/温度可视化自适应热管理_单页优化版.pptx');
const result=await finalizePresentation({workspaceDir:root,candidatePath:path.join(build,'candidate.pptx'),finalPath,pythonExecutable:'/Users/hanxuegang/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python',integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','30240288,42479913','--validate-heading-fit'],explicitTotalSlideCount:1,fontPolicy:{basis:'reference',families:[font],referencePath:path.join(root,'ITMC-fmt.pptx'),referenceSha256:crypto.createHash('sha256').update(await fs.readFile('ITMC-fmt.pptx')).digest('hex')},verifyArtifactToolImport:true,receiptPath:path.join(build,'validation-final.json')});
console.log(JSON.stringify({finalPath:result.finalPath,bytes:result.byteCount,layout:result.presentationLayout}));
