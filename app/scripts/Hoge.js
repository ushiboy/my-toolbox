export default class Hoge {

  constructor(name) {
    this._name = name;
  }

  greet() {
    return `Hello! ${this._name}`;
  }
}
