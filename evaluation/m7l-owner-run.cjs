/* eslint-disable @typescript-eslint/no-require-imports -- Native CommonJS bootstrap for the installed TypeScript loader; no app runtime wiring. */
// Native installed Node launcher: does not execute/bypass PowerShell scripts or
// change policy. Default is inspection; no key files or environment secrets read.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),readline=require('node:readline'),{Writable}=require('node:stream'),{execFileSync}=require('node:child_process');
const ACCEPTED_RELEASE_HEAD='42ea860bc8770714a0a79e1a641e4c6a588f821d';
const APPROVAL_DIRECTORY='test-results/m7l-approved-release-20261126-01';
const RECOVERY_APPROVAL_DIRECTORY='test-results/m7l-approved-recovery-20261126-01';
const RECOVERY_PRIOR_FINGERPRINT='f1474b95fd69a18ebad20122612836dc5f1ac4bf50c973c8bd8ed1dc382e6c28';
const RECOVERY_BINDING=Object.freeze({lockSha256:'252ed086fc38b82bbcb9b38d4b8a18b59150ca65cb288dee87c8df9c5a5dacfd',journalSha256:'9653b577279739a954f81fa963afb3a4adad352b9399aff9361cd5a71d7ec521',evidenceSha256:'2a2fb506f21a2c923f8f86aada15ff360827867980fc339e62b3c1a310978bea'});
const FINAL_APPROVAL_DIRECTORY='test-results/m7l-approved-final-20261126-01';
const FINAL_PRIOR_FINGERPRINT='ab571597c110bc5508197c45dc75988678b55c8a75399c536e546eadfa98f833';
const FINAL_BINDING=Object.freeze({'execution.lock':'252ed086fc38b82bbcb9b38d4b8a18b59150ca65cb288dee87c8df9c5a5dacfd','continuation.lock':'bee21e0c4d19283070cbcca28cdb40b47d65c438f3a3e14c4ed7e1a0a020c870','dispatch.jsonl':'779a1dc279d92403d93a70e5c60bd7306862f2e958298298b98b02389b398db4','A-text-1.json':'2a2fb506f21a2c923f8f86aada15ff360827867980fc339e62b3c1a310978bea','recovery-failure.json':'6898cd251b33198951eee6ee4372dcfd566fbc43b5e1c5b970d8d755fd51a3a5'});
const sourcePaths=['src','tests','evaluation','public','package.json','package-lock.json','next.config.ts','tsconfig.json','playwright.config.ts','eslint.config.mjs','.env.example'];
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
function inspectRepository(root){
 const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']});
 return {head:git('rev-parse','HEAD').trim(),files:[...new Set(git('ls-files','--cached','--others','--exclude-standard','-z','--',...sourcePaths).split('\0').filter(Boolean))].sort()};
}
function verifyReviewedSource(prerequisites,source,options={}){
 const root=options.root??process.cwd(),repository=(options.inspect??inspectRepository)(root);
 if(repository.head!==ACCEPTED_RELEASE_HEAD||source?.head!==ACCEPTED_RELEASE_HEAD||prerequisites?.expectedHead!==ACCEPTED_RELEASE_HEAD)throw Error('Expected release HEAD mismatch');
 if(!Array.isArray(source.records)||!source.records.length||!/^[a-f0-9]{64}$/.test(source.fingerprint)||digest(JSON.stringify(source.records))!==source.fingerprint||prerequisites.reviewedFingerprint!==source.fingerprint)throw Error('Source inventory digest mismatch');
 const names=source.records.map(r=>r.file);
 if(new Set(names).size!==names.length||JSON.stringify([...names].sort())!==JSON.stringify([...repository.files].sort()))throw Error('Source inventory coverage mismatch');
 for(const r of source.records){
  if(typeof r.file!=='string'||path.isAbsolute(r.file)||r.file.includes('\\')||r.file.split('/').includes('..')||!/^[a-f0-9]{64}$/.test(r.sha256))throw Error('Invalid source inventory record');
  let bytes;try{bytes=fs.readFileSync(path.join(root,r.file));}catch{throw Error('Reviewed source unavailable');}
  if(digest(bytes)!==r.sha256)throw Error('Source integrity changed');
 }
 return source.fingerprint;
}
/** @param {string} [prompt] @param {import('node:stream').Readable & {isTTY?:boolean}} [input] @param {import('node:stream').Writable & {isTTY?:boolean}} [output] */
function hiddenCredential(prompt='Enter the existing fellowship Meta key locally (hidden; never logged): ',input=process.stdin,output=process.stdout){
 if(!input.isTTY||!output.isTTY)return Promise.reject(Error('Owner-local interactive terminal required; no piped credential'));
 output.write(prompt);
 return new Promise((resolve,reject)=>{
  const sink=new Writable({write(_chunk,_encoding,done){done();}}),rl=readline.createInterface({input,output:sink,terminal:true});let answered=false;
  rl.on('SIGINT',()=>{rl.close();});rl.on('close',()=>{if(!answered)reject(Error('Credential entry cancelled'));});
  rl.question('',answer=>{answered=true;rl.close();output.write('\n');if(!answer.trim())reject(Error('No credential supplied'));else resolve(answer.trim());});
 });
}
function qualificationRunner(){
 const ts=require('typescript');
 require.extensions['.ts']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
 return require('../src/server/qualification-runner.ts');
}
async function main(){
 const flag=process.argv[2];
 if(flag===undefined){console.log('No inference. Use --verify-final for reviewed qualification checks; --final requires separate authorization and an owner-local hidden prompt.');return;}
 if(process.argv.length!==3||!['--verify','--execute','--verify-recovery','--continue','--verify-final','--final'].includes(flag))throw Error('Unsupported launcher arguments');
 if(['--verify-final','--final'].includes(flag)){
  const prerequisites=JSON.parse(fs.readFileSync(path.resolve(FINAL_APPROVAL_DIRECTORY,'prerequisites.json'),'utf8'));
  if(flag==='--final'&&prerequisites.finalExecutionAuthorized!==true)throw Error('Separate final qualification authorization required');
  const source=JSON.parse(fs.readFileSync(path.resolve(FINAL_APPROVAL_DIRECTORY,'source-review.json'),'utf8')),fingerprint=verifyReviewedSource(prerequisites,source);
  if(prerequisites.priorReviewedFingerprint!==FINAL_PRIOR_FINGERPRINT||JSON.stringify(prerequisites.historicalBinding)!==JSON.stringify(FINAL_BINDING))throw Error('Historical experiment binding mismatch');
  qualificationRunner();const {inspectFinalBaseline}=require('../src/server/qualification-final-ledger.ts'),{verifyFinalPrerequisites,runFinalQualification}=require('../src/server/qualification-final.ts');
  const originalDirectory=path.resolve('test-results/m7l-live-20261126-01'),directory=path.resolve('test-results/m7l-final-live-20261126-01');
  inspectFinalBaseline(originalDirectory,FINAL_BINDING);if(fs.existsSync(directory))throw Error('Related qualification already claimed');
  if(flag==='--verify-final'){console.log(`Reviewed final source: ${fingerprint}. Two historical requests retained; maximum four additional, six cumulative. Independent image first. No credential access or inference; final authorization: ${prerequisites.finalExecutionAuthorized===true}.`);return;}
  verifyFinalPrerequisites(prerequisites);if(!process.stdin.isTTY||!process.stdout.isTTY)throw Error('Owner-local interactive terminal required; no piped credential');
  const result=await runFinalQualification({directory,originalDirectory,prerequisites,origin:'fresh-meta',getKey:()=>hiddenCredential(),transportFactory:()=>fetch,retainOriginalImage:bytes=>{if(bytes.length>8_000_000)throw Error('Original image size limit');fs.writeFileSync(path.join(directory,'image-original.png'),bytes,{flag:'wx',mode:0o600});},record:(name,value)=>{const data=JSON.stringify(value);if(Buffer.byteLength(data)>2_200_000)throw Error('Private record size limit');fs.writeFileSync(path.join(directory,name+'.json'),data,{flag:'wx',mode:0o600});}});
  fs.writeFileSync(path.join(directory,'result.json'),JSON.stringify(result),{flag:'wx',mode:0o600});console.log('Bounded qualification complete. Separate text/image results and cumulative accounting retained; no production activation.');return;
 }
 const recovery=['--verify-recovery','--continue'].includes(flag),approvalDirectory=recovery?RECOVERY_APPROVAL_DIRECTORY:APPROVAL_DIRECTORY;
 const prerequisites=JSON.parse(fs.readFileSync(path.resolve(approvalDirectory,'prerequisites.json'),'utf8'));
 if(flag==='--continue'&&prerequisites.continuationExecutionAuthorized!==true)throw Error('Separate continuation authorization required');
 if(flag==='--execute'&&prerequisites.liveExecutionAuthorized!==true)throw Error('Separate live execution authorization required');
 const source=JSON.parse(fs.readFileSync(path.resolve(approvalDirectory,'source-review.json'),'utf8'));
 const fingerprint=verifyReviewedSource(prerequisites,source); // Before loading mutable runtime code or touching a credential.
 if(recovery){
  if(prerequisites.priorReviewedFingerprint!==RECOVERY_PRIOR_FINGERPRINT||JSON.stringify(prerequisites.accountingBinding)!==JSON.stringify(RECOVERY_BINDING))throw Error('Recovery baseline binding mismatch');
  qualificationRunner(); // Installs the existing TS loader only after the source checks.
  const {inspectAuthenticationRecovery}=require('../src/server/qualification-ledger.ts');
  const {verifyRecoveryPrerequisites,runAuthenticationRecovery}=require('../src/server/qualification-recovery.ts');
  const directory=path.resolve('test-results/m7l-live-20261126-01');
  inspectAuthenticationRecovery(directory,RECOVERY_BINDING);
  if(flag==='--verify-recovery'){console.log(`Reviewed recovery source: ${fingerprint}. Original settled auth rejection retained; one request consumed, three remaining. No credential access or inference; continuation authorization: ${prerequisites.continuationExecutionAuthorized===true}.`);return;}
  verifyRecoveryPrerequisites(prerequisites);
  if(!process.stdin.isTTY||!process.stdout.isTTY)throw Error('Owner-local interactive terminal required; no piped credential');
  const result=await runAuthenticationRecovery({directory,prerequisites,origin:'fresh-meta',getKey:()=>hiddenCredential(),transportFactory:()=>fetch,record:(name,data)=>fs.writeFileSync(path.join(directory,name+'.json'),JSON.stringify(data,null,2),{flag:'wx',mode:0o600})});
  fs.writeFileSync(path.join(directory,'recovery-result.json'),JSON.stringify(result,null,2),{flag:'wx',mode:0o600});
  console.log('Single-use continuation complete. Original and cumulative accounting retained; no application provider activated.');return;
 }
 if(flag==='--verify'){console.log(`Reviewed source verified: ${fingerprint}. No credential access or inference; live authorization: ${prerequisites.liveExecutionAuthorized===true}.`);return;}
 const {runQualification,verifyQualificationPrerequisites}=qualificationRunner();
 verifyQualificationPrerequisites(prerequisites);
 if(!process.stdin.isTTY||!process.stdout.isTTY)throw Error('Owner-local interactive terminal required; no piped credential');
 const directory=path.resolve('test-results/m7l-live-20261126-01');
 const result=await runQualification({prerequisites,directory,origin:'fresh-meta',getKey:()=>hiddenCredential(),transportFactory:()=>fetch,record:(name,data)=>fs.writeFileSync(path.join(directory,name+'.json'),JSON.stringify(data,null,2),{flag:'wx',mode:0o600})});
 fs.writeFileSync(path.join(directory,'result.json'),JSON.stringify(result,null,2),{flag:'wx',mode:0o600});console.log('Bounded execution finished. Private evidence retained. No application provider was activated.');
}
function reportSafeFailure(error){
 const d=error?.diagnostic;
 const stages=['authorization','accounting','credential-entry','text-planning','image-generation','image-processing','evidence'];
 const codes=['http-401-authentication','http-403-access','auth','quota','timeout','transport','provider','structure','semantic','asset','refusal','incomplete','budget','disabled','accounting-refusal','credential-entry-failure','local-runtime-or-evidence-failure','unresolved-accounting','evidence-write-failure'];
 if(d&&stages.includes(d.stage)&&codes.includes(d.classification))console.error(JSON.stringify({stage:d.stage,classification:d.classification,httpStatus:Number.isInteger(d.httpStatus)&&d.httpStatus>=100&&d.httpStatus<=599?d.httpStatus:null}));
 console.error('Qualification stopped safely. Preserve original and continuation accounting; do not restart. No raw credential/provider error is printed.');
}
module.exports={ACCEPTED_RELEASE_HEAD,APPROVAL_DIRECTORY,RECOVERY_APPROVAL_DIRECTORY,RECOVERY_PRIOR_FINGERPRINT,RECOVERY_BINDING,FINAL_APPROVAL_DIRECTORY,FINAL_PRIOR_FINGERPRINT,FINAL_BINDING,inspectRepository,verifyReviewedSource,hiddenCredential,reportSafeFailure};
if(require.main===module)main().catch(error=>{reportSafeFailure(error);process.exitCode=1;});
