# What is this ?

twitter-analysis-scraper downloads exported analytics data from [Twitter Analytics](https://analytics.twitter.com/) .

Download is proceeded with Chromium using puppeteer so it can be run as scheduled job.

# Instruction

TBD

# Usage

Following is linux example.

```
$ TWITTER_ACCOUNT=my_account TWITTER_PASSWORD=my_password TARGET_YEAR=2020 TARGET_MONTH=8 npm start
```

twitter-analysis-scraper downloads csv files to `download` directory.

Also some screen shots are saved to `ss` directory for debugging purpose.

## Parameters

| name | description |
| --- | --- |
| TWITTER_ACCOUNT | Twitter account |
| TWITTER_PASSWORD | Twitter password |
| TARGET_YEAR | The year of downloading analytics data, it is combined with TARGET_MONTH |
| TARGET_MONTH | The month of downloading analytics data, it is combined with TARGET_YEAR |


# Instruction for developer

## Setup

1. Install node.js

https://nodejs.org/en/download/

2. Clone repository

```
git clone git@github.com:dolow/twitter-analysis-scraper.git
```

3. Install dependency

In twitter-analysis-scraper.git directory, run

```
npm i
```

## Modules

| path | description |
| --- | --- |
| bin/twitter-analysis-scraper.js | main executable |
| src/config.js | contains constants and user settings |
| src/component | directory for modules that handle particular part of page |
