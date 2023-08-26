<template>
  <nav class="navbar navbar-default">
    <div class="container-fluid">
      <!-- Brand and toggle get grouped for better mobile display -->
      <div class="navbar-header">
        <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
          <span class="sr-only">Toggle navigation</span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
        <a class="navbar-brand" href="#" v-text="title" style="display: block;width: 200px"></a>
      </div>
      <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
        <ul class="nav navbar-nav" v-for="item in items">
          <li :class="{active:item.isActive}" @click="changeActive(item)">
            <router-link :to="item.path">
              {{item.name}}
            </router-link>
          </li>
        </ul>
        <!--导航-右边-->
        <ul class="nav navbar-nav navbar-right">
          <li>
            <a>
              <span class="glyphicon glyphicon-user" style="float: left"></span>
              <span v-text="userName" style="width:45px; overflow:hidden;
               text-overflow: ellipsis; white-space: nowrap; font-weight: bold;
               margin-left: 5px;float: left;"></span>
            </a>
          </li>
          <li>
            <a href="#">
              <span class="glyphicon glyphicon-off" v-bind:title="logout" v-on:click="logoutUser"></span>
            </a>
          </li>
        </ul>
      </div>
    </div>
    <!--弹框-->
    <message ref="MessageBox"></message>
  </nav>
</template>
<script>
    import message from "./messageBox"
    export default {
        name: "top",
        components:{
          message
        },
        data(){
          return {
            title:"记账系统",
            login:"登陆",
            logout:"注销",
            userName:"",
            items:[
              {
              name:"商品录入",
              isActive:true,
              path:'/recordCommodity'
            },{
              name:"实施记账",
              isActive:false,
              path:'/bookkeeping'
            },{
              name:"报表",
              isActive:false,
              path:'/report'
            }],
            url:{
              logout:"http://localhost:3000/logout",
              session:"http://localhost:3000/session"
            }
          }
        },
        methods:{
          /*改变tab页状态*/
          changeActive(item){
            let _this = this;
            if(!item.isActive){
              /*初始化tab页,使之前高亮的tab页的isActive都为false*/
              for(let i of _this.items){
                if(i.isActive){
                    i.isActive = false;
                    break;
                }
              }
              /*使被点击的tab页签的isActive为true*/
              item.isActive = true;
            }
            /*把点击的tab页信息存入sessionStorage中，刷新界面时使用*/
            let data = {
                key:"currentPage",
                value:item.name
            };
            _this.setSessionStorage(data);
          },
          /*退出方法*/
          logoutUser(){
            let _this = this;
            _this.$refs.MessageBox.showMessageBox({
                type:"confirm",
                messageText : "确认退出系统?",
                callback:function () {
                  let sendData = {
                    userName:_this.userName
                  };
                  _this.$http.post(_this.url.logout,sendData).then((response)=>{
                    if(response.ok){
                      sessionStorage.removeItem("currentPage");
                      _this.$router.push('/login');
                    }else{
                      _this.$refs.MessageBox.showMessageBox({
                        type:"error",
                        messageText : response.message
                      });
                    }
                  });
                }
            });
          },
          /*把数据存入sessionStorage*/
          setSessionStorage(data){
            if(data.key){
              sessionStorage.setItem(data.key,data.value)
            }
          },
          refershPage(){
            /*刷新页面时，保持数据不变*/
            /*1-页面tab页高亮不变*/

          }
        },
        created(){
            let _this = this;
            /*组件实例创建完毕后*/
            /*获取sessionStorage数据-*/
            let isActiveTab = sessionStorage.getItem("currentPage");
            if(isActiveTab){
              for(let i=0;i<_this.items.length;i++){
                _this.items[i].isActive = false;
                if(_this.items[i].name == isActiveTab){
                  _this.items[i].isActive = true;
                }
              }
            }
            /*获取基本信息*/
            _this.$http.get(_this.url.session).then((response)=>{
                let userName = response.body.userName;
                _this.userName = userName;
            });
        }
    }
</script>

<style scoped>

</style>
