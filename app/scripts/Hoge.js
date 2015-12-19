export default class Hoge {

  constructor(name) {
    this._name = name;
  }

  greet() {
    return `Hello! ${this._name}`;
  }

  fetchGreet() {
    return fetch('/api/greeting')
    .then(res => res.json())
    .then(json => {
      return `${json.message} ${this._name}`;
    });
  }
}
