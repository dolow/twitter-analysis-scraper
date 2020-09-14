class Login {
  constructor(page) {
    this._page = page;
  }
  async enter(account, password) {
    const accont = await this._page.$('input[name="session[username_or_email]"]');
    const pass = await this._page.$('input[name="session[password]"]');

    await accont.type(account);
    await pass.type(password);
  }

  async send() {
    const pass = await this._page.$('input[name="session[password]"]');
    await pass.press('Enter');
  }
}

module.exports = {
  Login
};
