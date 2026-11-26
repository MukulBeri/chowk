/* eslint-disable @typescript-eslint/no-require-imports -- Native CommonJS bootstrap for the installed TypeScript loader; no app runtime wiring. */
// Native installed Node launcher: does not execute/bypass PowerShell scripts or
// change policy. Default is inspection; no key files or environment secrets read.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),readline=require('node:readline'),{Writable}=require('node:stream'),ts=require('typescript');
require.extensions['.ts']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const {runQualification,verifyQualificationPrerequisites}=require('../src/server/qualification-runner.ts');
const directory=path.resolve('test-results/m7l-live-20261126-01');
async function main(){
 if(process.argv[2]!=='--execute'){console.log('No inference. Live execution requires separate owner authorization, current account prerequisites and exact reviewed source. See docs/M7L_OFFLINE_CLOSURE.md.');return;}
 const prerequisites=JSON.parse(fs.readFileSync(path.resolve('test-results/m8-20261126-01/live-prerequisites-template.json'),'utf8'));
 verifyQualificationPrerequisites(prerequisites); // BEFORE source, key or fetch.
 const source=JSON.parse(fs.readFileSync('test-results/m8-20261126-01/source-owner-review.json','utf8'));
 if(crypto.createHash('sha256').update(JSON.stringify(source.records)).digest('hex')!==source.fingerprint)throw Error('Source inventory digest mismatch');
 if(prerequisites.reviewedFingerprint!==source.fingerprint)throw Error('Reviewed source mismatch');
 for(const r of source.records)if(crypto.createHash('sha256').update(fs.readFileSync(r.file)).digest('hex')!==r.sha256)throw Error('Source integrity changed');
 if(!process.stdin.isTTY||!process.stdout.isTTY)throw Error('Owner-local interactive terminal required; no piped credential');
 const result=await runQualification({prerequisites,directory,origin:'fresh-meta',getKey:()=>new Promise(resolve=>{
  process.stdout.write('Enter the existing Meta key locally (hidden; never logged): ');
  const sink=new Writable({write(_chunk,_encoding,done){done();}}),rl=readline.createInterface({input:process.stdin,output:sink,terminal:true});
  rl.question('',answer=>{rl.close();process.stdout.write('\n');resolve(answer.trim());});
 }),transportFactory:()=>fetch,record:(name,data)=>fs.writeFileSync(path.join(directory,name+'.json'),JSON.stringify(data,null,2),{flag:'wx',mode:0o600})});
 fs.writeFileSync(path.join(directory,'result.json'),JSON.stringify(result,null,2),{flag:'wx',mode:0o600});console.log('Bounded execution finished. Private evidence retained. No application provider was activated.');
}
main().catch(()=>{console.error('Qualification stopped safely. Inspect the private reservation journal and prerequisite record; do not restart to spend another allowance. No raw credential/provider error is printed.');process.exitCode=1;});
