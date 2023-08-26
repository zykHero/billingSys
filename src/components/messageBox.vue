<template>
  <div class="modal fade" :id="id" tabindex="-1" role="dialog"
       aria-hidden="true" data-backdrop="static">
    <div class="modal-dialog" style="width: 500px;">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
          <span class="modal-title"><b v-text="title"></b></span>
        </div>
        <div class="modal-body">
          <div id="message_box_img"></div>
          <div id="message_box_text" v-text="messageText"></div>
        </div>
        <div class="modal-footer">
          <button :id="btnID_isOK" type="button" class="btn btn-primary">确定</button>
          <button type="button" class="btn btn-primary" v-if="type ==='confirm'" v-on:click="hideMessageBox">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
    export default {
        name: "message-box",
        data(){
          return {
            id:"message_box",
            btnID_isOK :"message_box_isOK",
            /*弹框级别*/
            alertClass:{
              success:"success",//成功
              error:"error",//错误
              info:"info",//提示
              confirm:"confirm"//二次确认
            },
            title:"提示",
            type:"",//弹框的类型:success,info,error,confirm
            messageText:"",//弹框的内容
            callback:function () {
              console.log("未传入确定按钮的回调函数，请补充！");
            }//确定时的回调函数
          }
        },
        watch:{
          type(newValue){
            let _this = this;
            if(!_this.alertClass[newValue]){
              console.log("请使用正确的弹框级别：success,info,error,confirm");
              return;
            }
            if(newValue ==_this.alertClass.confirm){
              //如果是二次确认框，需要给确定按钮增加事件
              let btnOK = _this.btnID_isOK;
              document.getElementById(btnOK).addEventListener("click",function () {
                //关闭二次确认框
                _this.hideMessageBox();
                //调用确定的回调
                _this.callback();
              });
            }else {
              let btnOK_id = _this.btnID_isOK;
              document.getElementById(btnOK_id).addEventListener("click",function () {
                //关闭弹框
                _this.hideMessageBox();
              });
            }
           /* switch (newValue){
              case _this.alertClass.success:
                {

                  break;
                }
                case _this.alertClass.error:
                {

                  break;
                }
                case _this.alertClass.info:
                {
                  break;
                }
                case _this.alertClass.confirm:
                {
                  break;
                }
              default:{
                break;
              }
            }*/
          }
        },
        methods:{
          /*
          * 功能说明：显示弹框
          * */
          showMessageBox(basicObj){
            let _this =this;
            let messageID = "#"+_this.id;
            _this.type = basicObj.type;
            //todo 为什么不能改变
            document.getElementById("message_box_text").innerHTML = basicObj.messageText;
            if(basicObj.callback){
              _this.callback = basicObj.callback;
            }
            $(messageID).modal('show');
          },
          /*
          * 功能说明：隐藏弹框
          * */
          hideMessageBox(){
            let _this =this;
            let messageID = "#"+_this.id;
            $(messageID).modal('hide');
          }
        }
    }
</script>

<style scoped>

</style>
