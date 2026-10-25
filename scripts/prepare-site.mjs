import {cpSync,copyFileSync,mkdirSync,rmSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {join} from 'node:path';
// Serve and deploy the same bundle under the GitHub Pages subpath.
const base=join('site','AutoLab-Academy');
rmSync('site',{recursive:true,force:true});
mkdirSync(base,{recursive:true});
for(const file of ['index.html','manifest.webmanifest','sw.js'])
 copyFileSync(file,join(base,file));
for(const dir of ['src','icons'])cpSync(dir,join(base,dir),{recursive:true});
mkdirSync(join(base,'samples'),{recursive:true});
copyFileSync(join('samples','autolab-synthetic.dbc'),join(base,'samples','autolab-synthetic.dbc'));
mkdirSync(join(base,'third-party'),{recursive:true});
for(const [pkg,name] of [['candied','CANDIED-LICENSE.txt'],['ts-fsrs','TS-FSRS-LICENSE.txt']])
 copyFileSync(join('node_modules',pkg,'LICENSE'),join(base,'third-party',name));
execFileSync(join('node_modules','.bin','esbuild'),[
 'src/app.js','--bundle','--format=esm','--target=es2020','--minify',
 '--outfile='+join(base,'src','app.js')
],{stdio:'inherit'});
console.log('Built static site for /AutoLab-Academy/');
