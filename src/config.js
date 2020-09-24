class Config {
  constructor(twitterAccount, twitterPassword, targetYear, targetMonth) {
    this.twitter = Object.freeze({
      account:  twitterAccount,
      password: twitterPassword,
    });
    this.target = {
      begin:  new Date(targetYear, targetMonth - 1, 1),
      end:    new Date(targetYear, targetMonth, 0),
    };
    this.dom = Object.freeze({
      dateRangeButton:       page => page.$('#daterange-button'),
      dataRangeApplyButton:  page => page.$('.applyBtn.btn.btn-sm.btn-primary'),
      dataExportButton:      page => page.$('.btn.btn-default.ladda-button'),
      downloadByTweetButton: page => page.$('button[data-type="by_tweet"]'),
      downloadByDayButton:   page => page.$('button[data-type="by_day"]'),
      leftCalendar:          page => page.$('.calendar.left'),
      rightCalendar:         page => page.$('.calendar.right'),
      calendar: {
        monthHeader:     calendar => calendar.$('th.month'),
        prevMonthButton: calendar => calendar.$('.prev.available'),
        nextMonthButton: calendar => calendar.$('.next.available'),
        date:            (calendar, r, c) => calendar.$(`td[data-title="r${r}c${c}"]`),
      },
    });
    this.file = Object.freeze({
      byTweetFilePrefix: 'tweet_activity_',
      byDayFilePrefix: 'daily_tweet_',
    });

    const today = new Date();
    if (this.target.end.getYear() === today.getYear() && this.target.end.getMonth() === today.getMonth()) {
      this.target.end = today;
    }

    Object.freeze(this.target);
  }
}

module.exports = {
  Config,
};
