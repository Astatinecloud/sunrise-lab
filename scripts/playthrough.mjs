import { createRequire } from 'node:module';
import { writeFileSync,mkdirSync } from 'node:fs';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.SUNRISE_PLAYWRIGHT_MODULE || 'playwright-core');
mkdirSync('docs/playthrough',{recursive:true});
const browser=await chromium.launch({executablePath:process.env.SUNRISE_CHROMIUM,headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1050}});
const errors=[],requests=[],observations=[];
let completed=false;
page.on('pageerror',e=>errors.push(e.message));
page.on('request',r=>requests.push(r.url()));
const observe=async(name)=>{
    const text=await page.locator('.stage').innerText();
    observations.push({name,text});
    await page.screenshot({path:`docs/playthrough/${name}.png`,fullPage:true});
    console.log(name+'\n'+text.slice(0,3000));
    writeFileSync('docs/playthrough/observations.json',JSON.stringify({completed,observations,errors,requests},null,2));
};
try{
    // A new browser context has empty cache and no prior navigation or reload.
    await page.goto(process.env.SUNRISE_URL || 'http://127.0.0.1:4174/');
    await page.getByRole('heading',{name:'どうして薬が効かないの？',exact:true}).waitFor({timeout:10000});
    if((await page.locator('main').innerText()).includes('読み込み中'))throw Error('Cold load retained placeholder');
    await observe('stage1-before');
    await page.getByRole('button',{name:'抗生物質を投与する',exact:true}).click();
    await page.waitForTimeout(2200);
    await observe('stage1-dosed');
    const quizNode=await page.locator('[data-quiz="0"]').elementHandle();
    await page.waitForTimeout(350);
    if(!await quizNode.evaluate(el=>el.isConnected && el===document.querySelector('[data-quiz="0"]')))throw Error('Quiz remounted during playback');
    if(!await page.locator('[data-stage="2"]').isDisabled())throw Error('Unanswered quiz permits next');
    await page.locator('[data-quiz="0"]').click();
    if(await page.locator('[data-stage="2"]').isDisabled())throw Error('Answered quiz blocks next');
    await page.locator('[data-quiz="1"]').click();
    await page.locator('[data-stage="2"]').click();
    await observe('stage2-empty');
    if(await page.locator('.slot-card .warning').count())throw Error('Untouched slot reveals failure');
    if(await page.locator('.neutral').count()!==7)throw Error('Missing neutral prompts');
    // Every slot is filled by click-to-select then click-to-place. Keep wrong RBP first.
    const parts={rbp:'wrong-rbp',injector:'pvc-core',cargo:'tpd-adapter',loadingSignal:'pdp1-ntd',binder:'kanr-binder',linker:'ggs',anchor:'xb'};
    for(const [slot,value] of Object.entries(parts)){
        await page.locator(`[data-select="${slot}:${value}"]`).click();
        await page.locator(`[data-place="${slot}"]`).click();
    }
    await observe('stage2-wrong-rbp');
    await page.locator('[data-action="try-build"]').click();
    await page.locator('[data-action="confirm-build"]').click();
    await page.waitForFunction(()=>!document.querySelector('.stage').previousElementSibling?.classList.contains('progress'));
    await page.getByRole('button',{name:'SUNRISEを起動',exact:true}).click();
    await page.waitForTimeout(4500);
    await observe('stage3-failure');
    if(!await page.locator('.failure').isVisible())throw Error('Wrong build did not stall');
    await page.getByRole('button',{name:'組み立てに戻る',exact:true}).click();
    await page.locator('[data-select="rbp:gp17"]').click();
    await page.locator('[data-place="rbp"]').click();
    await page.locator('[data-action="try-build"]').click();
    await page.waitForTimeout(500);
    // Mouse clicks on the slider check both ends without keyboard input.
    const slider=page.locator('#moi');
    const box=await slider.boundingBox();
    await page.mouse.click(box.x+5,box.y+box.height/2);
    await page.waitForTimeout(600);
    await observe('stage3-low-moi');
    if(await page.locator('.coverage .unreached').count()!==7)throw Error('MOI1 icon rounding');
    const box2=await page.locator('#moi').boundingBox();
    await page.mouse.click(box2.x+box2.width-5,box2.y+box2.height/2);
    await page.waitForTimeout(600);
    if(await page.locator('.coverage .unreached').count()!==0)throw Error('MOI30 exaggerated tail');
    await page.getByRole('button',{name:'SUNRISEを起動',exact:true}).click();
    await page.waitForTimeout(23000);
    await observe('stage3-complete');
    await page.locator('[data-action="compare"]').click();
    await page.waitForTimeout(800);
    await page.locator('[data-action="pause"]').click();
    await observe('stage4-early');
    // Select exact dose time via mouse, then inspect delay around blockade end.
    let box3=await page.locator('#comparison-time').boundingBox();
    await page.mouse.click(box3.x+5,box3.y+box3.height/2);
    await observe('stage4-dose');
    box3=await page.locator('#comparison-time').boundingBox();
    await page.mouse.click(box3.x+8+(box3.width-16)*(120/1080),box3.y+box3.height/2);
    await observe('stage4-blockade');
    await page.locator('[data-action="speed"]').click();
    await page.locator('[data-action="pause"]').click();
    await page.waitForTimeout(10000);
    await observe('stage4-final');
    const arms=page.locator('.arm');
    if(!await arms.first().locator('.artifact').isVisible())throw Error('B>B0 has no artifact explanation in rendered DOM');
    if(!(await arms.first().innerText()).includes('（同上の外挿による）'))throw Error('MIC extrapolation unlabelled');
    await page.locator('[data-stage="5"]').click();
    await observe('stage5');
    await page.locator('.stage [data-action="science"]').click();
    await page.screenshot({path:'docs/playthrough/science.png',fullPage:true});
    console.log('Science dialog visible:',await page.locator('#science-dialog').isVisible());
    await page.locator('#science-dialog [data-action="close-dialog"]').click();
    await page.locator('[data-action="reset"]').click();
    await observe('reset-stage1');
    if(await page.locator('[data-quiz]').count())throw Error('Reset retained quiz');
    if(errors.length)throw Error('Page errors: '+errors.join('; '));
    // Check the other six failure branches by mouse scrubbing to their stop.
    await page.locator('[data-action="dose"]').click();
    await page.waitForTimeout(600);
    await page.locator('[data-quiz="1"]').click();
    await page.locator('[data-stage="2"]').click();
    parts.rbp='gp17';
    for(const [slot,value] of Object.entries(parts)){
        await page.locator(`[data-select="${slot}:${value}"]`).click();
        await page.locator(`[data-place="${slot}"]`).click();
    }
    for(const [slot,wrong] of Object.entries({injector:'none',loadingSignal:'none',cargo:'inert-protein',binder:'wrong-binder',linker:'none',anchor:'none'})){
        await page.locator(`[data-select="${slot}:${wrong}"]`).click();
        await page.locator(`[data-place="${slot}"]`).click();
        await page.locator('[data-action="try-build"]').click();
        await page.locator('[data-action="confirm-build"]').click();
        await page.waitForTimeout(500);
        await page.locator('#timeline').scrollIntoViewIfNeeded();
        const b=await page.locator('#timeline').boundingBox();
        await page.mouse.click(b.x+b.width-8,b.y+b.height/2);
        await observe('failure-'+slot);
        if(!await page.locator('.failure').isVisible())throw Error('No stop for '+slot);
        await page.locator('.failure [data-stage="2"]').click();
        await page.locator(`[data-select="${slot}:${parts[slot]}"]`).click();
        await page.locator(`[data-place="${slot}"]`).click();
    }
    if(errors.length)throw Error('Page errors: '+errors.join('; '));
    if(requests.some(url=>new URL(url).hostname!=='127.0.0.1'))throw Error('External runtime request');
    completed=true;
    console.log('PLAYTHROUGH PASS');
}finally{
    writeFileSync('docs/playthrough/observations.json',JSON.stringify({completed,observations,errors,requests},null,2));
    await browser.close();
}
