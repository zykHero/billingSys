/*vue项目，js文件入口。*/
import Vue from 'vue';
import App from './App';
/*插件库引入*/
/*x向后台传输数据*/
import vueResource from 'vue-resource';
Vue.config.productionTip = false;
/*路由*/
import router from './router/index'
/* eslint-disable no-new */
Vue.use(vueResource);
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>',
  router
});




