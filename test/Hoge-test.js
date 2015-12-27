import Hoge from '../app/scripts/Hoge';
import assert from 'power-assert';
import fetchMock from 'fetch-mock';

describe('Hoge', () => {

  const name = 'Test';
  let hoge;
  beforeEach(() => {
    hoge = new Hoge(name);
  });
  afterEach(() => {
    fetchMock.restore();
  });

  describe('#greet', () => {
    it('returns greet message', () => {
      assert(hoge.greet() === `Hello! ${name}`);
    });
  });

  describe('#fetchGreet', () => {
    beforeEach(() => {
      fetchMock.mock('/api/greeting', 'GET', {
        status: 200,
        body: '{"message":"Hello Hello Hello..."}'
      });
    });
    it('returns greet message promise', () => {
      return hoge.fetchGreet()
      .then(message => {
        assert(message === `Hello Hello Hello... ${name}`);
      });
    });
  });

});
