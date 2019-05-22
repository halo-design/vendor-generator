import Vue from 'vue';
import App from './App.vue';
import 'normalize.css';
import './app.scss';

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
}).$mount('#MOUNT_NODE');
