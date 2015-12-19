import Hoge from './Hoge';

const hoge = new Hoge('test');

console.log(hoge.greet());

hoge.fetchGreet()
.then(message => {
  console.log(message);
});
