import Hoge from '../app/scripts/Hoge';
import assert from 'power-assert';

describe('Hoge', () => {

  const name = 'Test';
  let hoge;
  beforeEach(() => {
    hoge = new Hoge(name);
  });

  describe('#greet', () => {
    it('returns greet message', () => {
      assert(hoge.greet() === `Hello! ${name}`);
    });
  });

});
