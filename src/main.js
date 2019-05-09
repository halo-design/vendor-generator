import multiWave from './MultiWave';
import { getCookie } from './cookie';
import _ from 'lodash';

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
  getCookie(str);
  return str.toUpperCase();
};
export default { format, multiWave };
