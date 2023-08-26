import Vue from 'vue'
import Router from 'vue-router'
import login from '../components/login'
import recordshop from '../components/recordCommodity'
import bookkeeping from '../components/bookkeeping'
import report from '../components/report'
Vue.use(Router);
//配置路由表
const routes = [
  // 重定向
  { path: '/', redirect: '/login'},
  { path: '/login',name:"login", component: login},
  {
    path: '/recordCommodity',
    name:"recordCommodity",
    component: recordshop,
    meta: {allowBack: false}//首页禁止后退
  },
  {
    path: '/bookkeeping',
    name:"bookkeeping",
    component: bookkeeping
  },
  {
      path:'/report',
      name:"report",
      component:report,
  }
];
const router = new Router({
  routes:routes
});
/*增加路由跳转前的校验
* to：目的路由
* form：跳转前的路由
* next:
* */
//todo 用于本地调试
/*router.beforeEach((to,from,next)=>{
  let routeArr = ["recordCommodity","bookkeeping","report"];
  let toName = to.name;
  let fromName = from.name;
  let fromPath = from.path;
  /!*获取当前当前用户是否*!/
  let session_url = "http://localhost:3000/session";
  let logout_url = "http://localhost:3000/logout";
  Vue.http.get(session_url).then((response)=>{
    let isLogin = response.body.isLogin;
    if(routeArr.indexOf(toName) >=0 &&routeArr.indexOf(fromName)<0 &&!isLogin)
    {
      /!*防止直接输入模块url，越过登录页面*!/
      next({
        path: '/login'
      });
    }
    else
    {
      next();
    }
    if(routeArr.indexOf(fromName) >=0 && toName ==="login"&&isLogin){
      let userName = response.body.userName;
      /!*从模块到登陆页面的二次确认*!/
      let outSystem = confirm("确认退出系统？");
      if(outSystem == true){
        let sendData = {
          userName:userName
        };
        Vue.http.post(logout_url,sendData).then((response)=>{
          if(response.ok){
            sessionStorage.removeItem("currentPage");
            /!*退出到登陆页面*!/
            next({
              path: '/login'
            });
          }else{
            alert(response.message);
          }
        });
      }else{
        /!* 取消时在当页*!/
        next({
          path: fromPath
        });
      }
    }
  });
});*/
export default router
