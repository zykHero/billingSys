<template>
  <div id="bg_login" class="centerBlock">
      <div class="container centerBlock">
        <div class="form-horizontal col-lg-4 col-md-4 col-sm-4">
            <!--用户名-->
            <div class="form-group">
              <i class="fa fa-user fa-lg"></i>
              <input :id="userObj.id" class="form-control required " type="text"
                     :placeholder="userObj.emptyText" name="username"
                     autofocus="autofocus" :maxlength="userObj.maxLength" v-model="cmdData[userObj.name]"/>
            </div>
            <!--密码-->
           <!-- <label v-text="passwordObj.labelName" class=""></label>-->
            <div class="form-group">
              <i class="fa fa-lock fa-lg"></i>
              <input :id="passwordObj.id" class="form-control required" type="password"
                     :placeholder="passwordObj.emptyText" name="password"
                     :maxlength="passwordObj.maxLength" v-model="cmdData[passwordObj.name]"
                     @keyup.enter="sendLoginData()"/>
            </div>
            <!--记住密码-->
            <div class="form-group" style="display: none;">
              <label class="checkbox">
                <input :id="remberPassword.id" type="checkbox" name="remember">{{remberPassword.text}}
              </label>
            </div>
            <!--登陆、注册按钮-->
            <div class="form-group col-md-offset-9">
                <button class="btn btn-primary pull-left" @click="sendLoginData()">登录</button>
                <button class="btn btn-primary pull-right" @click="sendSignIn()">注册</button>
              </div>
        </div>
      </div>
    <!--注册窗口 modal：识别模态框 fade：渐隐渐现 -->
    <div class="modal fade" id="signInWin" tabindex="-1" role="dialog"
         aria-hidden="true" data-backdrop="static"><!--防止模态框点周围关闭-->
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
            <span class="modal-title" id=""><b>注册用户</b></span>
          </div>
          <div class="modal-body">
            <!--用户名/密码/密码确认-->
            <div class="userInfo" v-for="item in signParams.config">
              <label v-text="item.labelName" class="userInfo_label"></label>
              <input v-if="item.type =='text'|| item.type =='password'"
                    :type="item.type" class="form-control userInfo_input"
                     v-model="signParams.cmdSignInData[item.name]"
                     :maxlength="item.maxlength"
                     :id="item.id" :placeholder="item.emptyText"
                     v-on:input="checkPassword(signParams.config,item.id)"
                    v-on:blur = "checkAgain(item.type,item.id)"/>
              <span class="mustFlag" v-if="!item.allowBlank" >*</span>
              <!--性别-->
              <div :id="item.id" v-if="item.type =='radio'" style="display:inline;">
                <input type="radio" :id="item.items[0].id" :name="item.name" checked/>
                <span v-text="item.items[0].text"></span>
                <input type="radio" :id="item.items[1].id" :name="item.name" style="margin-left: 30px;"/>
                <span v-text="item.items[1].text"></span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" v-on:click="createUser()">确定</button>
            <button type="button" class="btn btn-primary" data-dismiss="modal">关闭</button>
          </div>
        </div>
      </div>
    </div>
    <!--弹框-->
    <message ref="MessageBox"></message>
  </div>
</template>
<script>
    import message from "./messageBox"
    export default {
      name: "login",
      components:{
        message
      },
      data(){
        return{
          userObj:{
            id:"username",
            labelName:"用户名",
            emptyText:"请输入用户名",
            maxLength:"20",
            name:'username'
          },
          passwordObj :{
            id:"password",
            labelName:"密码",
            emptyText:"请输入密码",
            maxLength:"8",
            name:"password"
          },
          remberPassword:{
            id : "remberPassword",
            name:"remberPassword",
            checked:false,
            text:"记住密码"
          },
          signParams:{
            config:[
              {
              id:"userName_signIn",
              type:"text",
              name:"username",
              emptyText:"请输入用户名。",
              allowBlank:false,
              maxlength:20,
              labelName:"名称"
            },{
              id:"sex_signIn",
              name:"sex",
              type:"radio",
              labelName:"性别",
              allowBlank:true,
              items:[{
                id :"sex_signIn_man",
                name:"man",
                text:"男"
              },{
                id :"sex_signIn_woman",
                name:"woman",
                text:"女"
              }]
            },{
              id:"password_sign",
              name:"password",//用于数据存储的key值
              index:1,//代表密码输入框
              allowBlank:false,
              type:"password",
              maxlength:8,
              labelName:"密码"
            },{
              id:"passwordAgain_sign",
              name:"passwordAgain",
              allowBlank:false,
              maxlength:8,
              index:2,//代表密码确认输入框
              type:"password",
              labelName:"确认密码"
          }],
            cmdSignInData:{}//注册命令下发
          },
          cmdData:{},
          url:{}
        }
      },
      methods:{
        /*登陆*/
        sendLoginData(){
          let _this = this;
          if(document.getElementById("remberPassword")){
            _this.cmdData["remberPassword"] = document.getElementById("remberPassword").checked;
          }
          _this.$http.post(_this.url.login,_this.cmdData).then((response)=>{
            if(response.body.ok){
              /*打开记账系统*/
              _this.$router.push('/recordCommodity');
            }else{
              _this.$refs.MessageBox.showMessageBox({
                type:"error",
                messageText : "用户名或者密码不正确，请重新输入。"
              });
            }
          },(error)=>{
            console.log(error)
          });
        },
        /*注册窗口*/
        sendSignIn(){
          let _this = this;
          /*初始化注册窗口配置项数据*/
          _this.signParams.cmdSignInData = {};
          /*打开注册窗口*/
          $('#signInWin').modal('show');
        },
        /*功能说明：检验密码是否重复(当前适用于两个输入框，一个密码，一个确认密码)
        * 参数：
        *items：存放密码、确认密码的DOM的
        * id_password:当前输入框的id
        * */
        checkPassword(items,currentID){
          let _this =this;
          /*获取密码、确认密码的id|*/
          let len = items.length;
          let pw_id,pw_again_id,pw_name,pw_again_name;
          for(let  i=0;i<len;i++){
            if(items[i].type ==="password"){
              if(items[i].index ===1){
                pw_id = items[i].id;
                pw_name = items[i].name;
              }else{
                pw_again_id = items[i].id;
                pw_again_name = items[i].name;
              }
            }
          }
          if(_this.signParams.cmdSignInData[pw_name] &&
            _this.signParams.cmdSignInData[pw_again_name])
          {
            //获取密码、密码确认的class
            let another_pw_id;//获取另一个密码输入框的id
            another_pw_id = currentID ===pw_id ? pw_again_id : pw_id;
            let current_pw_class =document.getElementById(currentID).className;
            let another_pw_class =document.getElementById(another_pw_id).className;
            let clearMark_current,clearMark_another;
            if(_this.signParams.cmdSignInData[pw_name] !=
              _this.signParams.cmdSignInData[pw_again_name]){
              //如果不相等,当前的输入框变红
              if(current_pw_class.indexOf("markStyle") <0){
                document.getElementById(currentID).className =current_pw_class+" markStyle";
              }
              //另一个输入框恢复默认，清除红框
              clearMark_another = another_pw_class.replace(/markStyle/g,"");
              document.getElementById(another_pw_id).className = clearMark_another;
            }else{
              //如果想当、清除红框
              clearMark_current = current_pw_class.replace(/markStyle/g,"");
              document.getElementById(currentID).className = clearMark_current;
              clearMark_another = another_pw_class.replace(/markStyle/g,"");
              document.getElementById(another_pw_id).className = clearMark_another;
            }
          }
        },
        /*创建用户*/
        createUser(){
          let _this =this;
          //获取性别,以男为准
          let sex_man_dom = document.getElementById("sex_signIn_man");
          /*获取性别*/
          if(sex_man_dom){
            let man = sex_man_dom.checked;
            if(man){
              _this.signParams.cmdSignInData.sex = "man";
            }else{
              _this.signParams.cmdSignInData.sex = "woman";
            }
          }

          if(_this.checkAllowBlank(_this.signParams.config,_this.signParams.cmdSignInData))
          {
            /*命令下发*/
            _this.$http.post(_this.url.createUser,_this.signParams.cmdSignInData).then((response)=>
            {
              if(response.body.ok){
                $('#signInWin').modal('hide');
              }else{
                _this.$refs.MessageBox.showMessageBox({
                  type:"error",
                  messageText : response.body.message
                });
              }
            },(error)=>{
              console.log(error)
            });
          }
        },
        /*检验必输项*/
        /*校验下发数据的准确性*/
       checkAllowBlank(items,data){
          /*校验必输项是否输入*/
          let _this = this;
          let len = items.length;
          for(let i=0;i<len;i++){
            if(!items[i].allowBlank){
              if(data[items[i].name] == undefined
                ||data[items[i].name] == ""){
                _this.$refs.MessageBox.showMessageBox({
                  type:"error",
                  messageText : items[i].labelName+"为必输项，请输入之后再添加。"
                });
                return false
              }
            }
          }
          return true;
        },
        /*失去焦点时再次进行校验密码一致性*/
        checkAgain(type,id){
          let _this = this;
          if(type ==="password"){
            _this.checkPassword("password","passwordAgain",id);
          }
        }
      },
      created(){
        //let privateIP = "http://39.96.45.126";
        let privateIP = "http://localhost";
        this.url = {
          login:privateIP+":3000/login",
          createUser:privateIP+":3000/createUser",
          basicConfig:privateIP+":3000/getBasicInfo",
          logout:privateIP+":3000/logout"
        };
      }
    }
</script>
<style scoped>
@import "../assets/css/login.css";
</style>
