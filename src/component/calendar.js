class RangeCalendar {
  async getNode() {
    // abstract
  }
  async pickDate(target) {
    // abstract
  }

  constructor(page, dom) {
    this._page = page;
    this._dom  = dom;
    this._date = new Date();
  }

  async refreshDate() {
    const node   = await this.getNode();
    const header = await this._dom.calendar.monthHeader(node);
    const text   = await header.evaluate(node => node.innerText);
    this._date.setTime(Date.parse(text));
  }

  async adjustStep(target) {
    const node = await this.getNode();
    const calendarDom = this._dom.calendar;

    let button = null;
    if (target.getYear() < this._date.getYear())        button = await calendarDom.prevMonthButton(node);
    else if (target.getYear() > this._date.getYear())   button = await calendarDom.nextMonthButton(node);
    else if (target.getMonth() < this._date.getMonth()) button = await calendarDom.prevMonthButton(node);
    else if (target.getMonth() > this._date.getMonth()) button = await calendarDom.nextMonthButton(node);

    if (button === null) return false;

    await button.click();
    await this._page.waitFor(200);
    await this.refreshDate();

    return true;
  }
}

class RangeCalendarLeft extends RangeCalendar {
  async getNode() {
    return await this._dom.leftCalendar(this._page);
  }

  async pickDate(target) {
    const node = await this.getNode();

    for (let c = 0; c <= 6; c++) {
      const date = await this._dom.calendar.date(node, 0, c);
      const dateText = await date.evaluate(node => node.innerText);
      if (parseInt(dateText) === target.getDate()) {
        await date.click();
        break;
      }
    }
  }
}
class RangeCalendarRight extends RangeCalendar {
  async getNode() {
    return await this._dom.rightCalendar(this._page);
  }

  async pickDate(target) {
    const node = await this.getNode();

    for (let r = 5; r >= 4; r--) {
      for (let c = 0; c <= 6; c++) {
        const date = await this._dom.calendar.date(node, r, c);
        const dateText = await date.evaluate(node => node.innerText);
        if (parseInt(dateText) === target.getDate()) {
          await date.click();
          break;
        }
      }
    }
  }
}
 module.exports = {
   RangeCalendar,
   RangeCalendarLeft,
   RangeCalendarRight,
 };
