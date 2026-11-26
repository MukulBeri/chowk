import {test,expect} from "@playwright/test";
import {readFileSync,existsSync} from "node:fs";
import {createHash} from "node:crypto";
import {productionOrigin,APPROVED_PRODUCTION_ORIGIN} from "../src/lib/site-metadata";
import {designSchema} from "../src/lib/design";

test('M11 release: origin validation and complete compatible README specification',()=>{
 expect(productionOrigin('')).toBe(APPROVED_PRODUCTION_ORIGIN);expect(productionOrigin(APPROVED_PRODUCTION_ORIGIN+'/')).toBe(APPROVED_PRODUCTION_ORIGIN);
 for(const invalid of ['http://localhost:3000','javascript:alert(1)','https://user:secret@example.invalid','https://example.invalid/path','https://example.invalid/?key=not-a-key','https://yarc-create.vercel.app','https://unapproved.example.invalid'])expect(()=>productionOrigin(invalid)).toThrow('approved HTTPS origin');
 const previous=process.env.CHOWK_PRODUCTION_ORIGIN;try{process.env.CHOWK_PRODUCTION_ORIGIN='https://yarc-create.vercel.app';expect(()=>productionOrigin()).toThrow('stale override');}finally{if(previous===undefined)delete process.env.CHOWK_PRODUCTION_ORIGIN;else process.env.CHOWK_PRODUCTION_ORIGIN=previous;}
 const readme=readFileSync('README.md','utf8'),block=readme.match(/```json\s*([\s\S]*?)```/);expect(block).not.toBeNull();const parsed=JSON.parse(block![1]);expect(designSchema.safeParse(parsed).success).toBe(true);expect(parsed).toEqual(JSON.parse(readFileSync('docs/example-design-spec-m5.json','utf8')));expect(readme).not.toContain('https://chowk.vercel.app');expect(readme).toContain(APPROVED_PRODUCTION_ORIGIN);expect(readme).toContain('https://github.com/MukulBeri/chowk');
});

test('M11 release: actual route metadata uses the verified origin and distinct canonicals',async({page,request})=>{
 for(const path of ['/','/create','/explore','/docs']){await page.goto(path);await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',APPROVED_PRODUCTION_ORIGIN+(path==='/'?'':path));await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content',APPROVED_PRODUCTION_ORIGIN+(path==='/'?'':path));await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content',APPROVED_PRODUCTION_ORIGIN+'/opengraph-image.png');await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content',APPROVED_PRODUCTION_ORIGIN+'/opengraph-image.png');}
 expect((await request.get('/opengraph-image.png')).status()).toBe(200);expect((await request.get('/icon.svg')).status()).toBe(200);for(const path of ['/file.svg','/globe.svg','/next.svg','/vercel.svg','/window.svg'])expect((await request.get(path)).status()).toBe(404);
});

test('M11 release: public product disclosure describes actual editing/projects without assistant repetition',async({page})=>{
 await page.goto('/docs');const main=page.locator('main.docs-page');await expect(main).toContainText('Chowk is an independently directed project by Mukul Beri');await expect(main).toContainText('Saving is manual.');await expect(main).toContainText('no project-JSON import');await expect(main).toContainText('external inference disabled');await expect(main).toContainText('planned after submission');expect(await main.innerText()).not.toMatch(/\b(?:Codex|ChatGPT|Claude)\b/);await expect(page.getByRole('link',{name:'Local Projects',exact:true})).toHaveAttribute('href','#projects');
 await expect(main).toContainText(APPROVED_PRODUCTION_ORIGIN);await expect(main).toContainText('https://yarc-create.vercel.app');await expect(page.getByRole('link',{name:'Detailed AI/API and development-assistance disclosure in the repository'})).toHaveAttribute('href','https://github.com/MukulBeri/chowk/blob/main/docs/AI_DISCLOSURE.md');
});

test('M11 release: package naming, rights and conditional native license copies stay scoped',()=>{
 const pkg=JSON.parse(readFileSync('package.json','utf8')),lock=JSON.parse(readFileSync('package-lock.json','utf8'));expect(pkg.name).toBe('chowk');expect(pkg.private).toBe(true);expect(lock.name).toBe('chowk');expect(lock.packages[''].name).toBe('chowk');expect(existsSync('LICENSE')).toBe(false);const rights=readFileSync('RIGHTS.md','utf8');expect(rights).toContain('to the extent he holds copyright');expect(rights).toContain('third-party');const qualification=JSON.parse(readFileSync('docs/licenses/native/QUALIFICATION.json','utf8'));expect(qualification.finalClearance).toBe(false);for(const item of qualification.licenseCopies)expect(createHash('sha256').update(readFileSync(item.file)).digest('hex')).toBe(item.sha256);
});
