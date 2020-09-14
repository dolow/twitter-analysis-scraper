#!/usr/bin/env node

const process   = require('process');
const fs        = require('fs');
const path      = require('path');
const puppeteer = require('puppeteer');
const Config    = require('../src/config').Config;
const login     = require('../src/component/login');
const calendars = require('../src/component/calendar');

const baseDir = path.normalize(path.join(__dirname, '..'));

const Constants = Object.freeze({
  BaseDir: baseDir,
  CaptureDir: path.join(baseDir, 'ss'),
  DownloadDir: path.join(baseDir, 'download')
});

let ssId = 1;

function ss(page) {
  console.log(`capture\n  ${path.join(Constants.CaptureDir, `${ssId}`)}.png`);
  return page.screenshot({path: `${path.join(Constants.CaptureDir, `${ssId++}`)}.png`});
}

function watchDownload(dir, fileNameHinting) {
  const entities = fs.readdirSync(dir);
  for (let i = 0; i < entities.length; i ++) {
    const entity = entities[i];
    if (fileNameHinting(entity)) {
      return entity;
    }
  }

  return new Promise(resolve => setTimeout(resolve, 1000))
    .then(() => watchDownload(dir, fileNameHinting));
}

async function main() {
  const config = new Config(
    process.env['TWITTER_ACCOUNT'],
    process.env['TWITTER_PASSWORD'],
    process.env['TARGET_YEAR'],
    process.env['TARGET_MONTH'],
  );

  if (!config.twitter.account || !config.twitter.password) {
    console.log('Environment variables TWITTER_ACCOUNT and TWITTER_PASSWORD are required.');
    process.exit(1);
    return;
  }

  let page;
  const dom = config.dom;

  const browser = await puppeteer.launch();

  console.log('create directories');
  {
    if (!fs.existsSync(Constants.DownloadDir)) {
      fs.mkdirSync(Constants.DownloadDir)
    }
    if (!fs.existsSync(Constants.CaptureDir)) {
      fs.mkdirSync(Constants.CaptureDir)
    }
  }

  console.log('clean up download');
  {
    const entities = fs.readdirSync(Constants.DownloadDir);
    for (let i = 0; i < entities.length; i ++) {
      if (entities[i] !== '.gitkeep') {
        fs.unlinkSync(path.join(Constants.DownloadDir, entities[i]))
      }
    }
  }

  console.log('clean up capture');
  {
    const entities = fs.readdirSync(Constants.CaptureDir);
    for (let i = 0; i < entities.length; i ++) {
      if (entities[i] !== '.gitkeep') {
        fs.unlinkSync(path.join(Constants.CaptureDir, entities[i]))
      }
    }
  }

  console.log('init page');
  {
    page = await browser.newPage();
    await page._client.send('Page.setDownloadBehavior', {
      behavior : 'allow',
      downloadPath: Constants.DownloadDir
    });
  }

  console.log('go to');
  {
    const url = 'https://twitter.com/login?redirect_after_login=https%3A%2F%2Fanalytics.twitter.com%2Fabout&hide_message=1';
    console.log(`  ${url}`);
    await page.goto(url);
  }

  await page.waitFor(1000);
  await ss(page);

  console.log("login");
  {
    const form = new login.Login(page);
    await form.enter(config.twitter.account, config.twitter.password);
    await form.send();

    await page.waitForNavigation({timeout: 60000, waitUntil: "domcontentloaded"});
  }

  await ss(page);

  console.log('go to');
  {
    const url = `https://analytics.twitter.com/user/${config.twitter.account}/tweets`;
    console.log(`  ${url}`);
    await page.goto(url, {waitUntil: "domcontentloaded"})
  }

  await page.waitFor(1000);
  await ss(page);

  console.log("press data range button");
  {
    const button = await dom.dateRangeButton(page);
    await button.click();
  }

  await page.waitFor(500);
  await ss(page);

  console.log("adjust calendar");
  {
    const leftCalendar  = new calendars.RangeCalendarLeft(page, dom);
    const rightCalendar = new calendars.RangeCalendarRight(page, dom);
    await leftCalendar.refreshDate();
    await rightCalendar.refreshDate();

    console.log("left");
    {
      let asjusted = true;
      while (asjusted) {
        asjusted = await leftCalendar.adjustStep(config.target.begin);
      }
    }

    await ss(page);

    console.log("right");
    {
      let asjusted = true;
      while (asjusted) {
        asjusted = await rightCalendar.adjustStep(config.target.end);
      }
    }

    await ss(page);

    console.log("pick date range");
    {
      await rightCalendar.pickDate(config.target.end);
      await page.waitFor(200);
      await leftCalendar.pickDate(config.target.begin);
      await page.waitFor(200);
    }

    await ss(page);

    console.log("apply date range");
    {
      const button = await dom.dataRangeApplyButton(page);
      await button.click();
      await page.waitFor(1000);
    }
  }

  await ss(page);

  console.log("press data export button");
  {
    const button = await dom.dataExportButton(page);
    await button.click();
  }

  await page.waitFor(200);

  await ss(page);

  console.log("download by tweet");
  {
    const option = await dom.downloadByTweetButton(page);
    await option.click();

    const filename = await watchDownload(Constants.DownloadDir, name => name.startsWith(config.file.byTweetFilePrefix));
    console.log(`  ${path.join(Constants.DownloadDir, filename)}`);
  }

  console.log("press data export button");
  {
    const button = await dom.dataExportButton(page);
    await button.click();
  }

  await page.waitFor(200);

  await ss(page);

  console.log("download by day");
  {
    const option = await dom.downloadByDayButton(page);
    await option.click();

    const filename = await watchDownload(Constants.DownloadDir, name => name.startsWith(config.file.byDayFilePrefix));
    console.log(`  ${path.join(Constants.DownloadDir, filename)}`);
  }

  await browser.close();
}

main();
