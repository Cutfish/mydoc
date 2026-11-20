import sharp from 'sharp';
const base='.poster-build/具有温度可视化功能的层状异质热致变色复合膜及其自适应热管理/media/';
await sharp(base+'image12.png').flatten({background:'#ffffff'}).png().toFile('.poster-build/optimize/figure9-white.png');
await sharp(base+'image4.png').extract({left:890,top:0,width:408,height:340}).flatten({background:'#ffffff'}).png().toFile('.poster-build/optimize/tensile-crop.png');
