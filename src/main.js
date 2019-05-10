import multiWave from './MultiWave';
import _ from 'lodash';

import('./cookie').then(res => {
  console.log(res);
});

function addAutor(target) {
  target.author = 'OwlAford';
}

@addAutor
class Timestamp {
  constructor() {
    this.time = Date.now();
  }

  setTime() {
    console.log(this.time);
  }
}

const format = str => {
  const stamp = new Timestamp();
  stamp.setTime();
  _.merge({}, {});
  return str.toUpperCase();
};
export default { format, multiWave };
