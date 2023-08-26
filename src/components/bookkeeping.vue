<template>
  <div id="bookkeepingData">
    <top></top>
    <div class="panel-group" id="keepAccountsPanel">
      <div class="panel panel-default">
        <div class="panel-heading" style="position: relative;height: 50px;margin-bottom: 10px;">
          <h4 class="panel-title">
            <a data-toggle="collapse" data-parent="#keepAccountsPanel" style="line-height: 30px;"
               href="#keepAccounts" @click="listenCollapse" v-text="panelTitle"></a>
          </h4>
          <button :id="submitBtn.id" type="submit" v-if="isCollapse" class="btn btn-default"
                  v-text="submitBtn.text" @click="addData"></button>
        </div>
        <div id="keepAccounts" class="panel-collapse collapse">
            <div class="form-group" style="clear: both" v-for="item in recordItems">
                <label v-if="item.type !='select'" v-text="item.label" class="labelStyle"></label>
                <select-multiple v-if="item.type ==='select'"
                                 :configBasic = "item.config"
                                 :selectList="item.data"
                                 :action = "constObj.add"
                                 v-on:getSelectedData="getSelectShopID"
                                >
                </select-multiple>
                <input type="text" v-model="cmdData[item.name]" v-if="item.type ==='textArea'"
                       class="form-control inputStyle" :id="item.id" :placeholder="item.emptyText" :disabled="item.disable"
                       v-on:input="checkValue(item,cmdData[item.name],constObj.add)">
                <datepicker :partentID="bookingID" :moment="initTime" style="float:left"
                            v-if="item.type==='date_vue'"
                            v-on:picked="picked"></datepicker>
                <span :class="{mustFlag:item.type!='select',selectMustFlag:item.type=='select'}"
                      v-if="!item.allowBlank">*</span>
            </div>
        </div>
      </div>
    </div>
    <!--商品信息列表-->
    <div id="bookkeepingGrid">
      <table id="bookkeepingGrid_table" class="table table-striped table-bordered table-hover"
             data-classes="table table-hover"
             data-show-columns="true">
      </table>
      <!--自定义工具栏-->
      <div class="btn-group" id="bookkeepingGrid_toolbar_left">
        <!--自定义工具栏-查询框(输入框、日期)-->
        <div id="bookkeepingGrid_search">
          <form class="bs-example bs-example-form" role="form">
            <!--日期-->
            <div id="bookkeeping_searchDate" class="col-lg-5 col-md-7 col-sm-12">
              <div id="bookkeeping_searchDate_start">
                <span>开始日期</span>
                <!--日期开始-->
                <datepicker style="float: right;margin-left: 5px;"
                            :partentID="shopList.startDateID" v-on:picked="picked"></datepicker>
              </div>
              <div id="bookkeeping_searchDate_end" >
                <span>结束日期</span>
                <!--日期结束-->
                <datepicker style="float: right;margin-left: 5px;"
                            :partentID="shopList.endDateID" v-on:picked="picked"></datepicker>
              </div>
            </div>
            <!--搜索类型-->
            <div class="col-lg-4 col-md-4 col-sm-12" id="bookkeeping_searchType">
              <div class="input-group">
                <!--搜索类型-->
                <div class="input-group-btn">
                  <button type="button" class="btn btn-default dropdown-toggle"
                          data-toggle="dropdown">
                    <span v-text="shopList.searchInitText"></span>
                    <span class="caret"></span>
                  </button>
                  <ul class="dropdown-menu">
                    <li v-for="item in shopList.searchType">
                      <a href="#" v-on:click="setSearchValue(item)" :name="item.type" v-text="item.text"></a>
                    </li>
                  </ul>
                </div>
                <!--查询输入框架-->
                <input type="text" class="form-control"  v-model="shopList.searchCmdObj['value']">
                <span class="input-group-btn ">
                    <button class="btn btn-default" type="button" v-on:click="searchData">
                      <span class="glyphicon glyphicon-search"></span>
                    </button>
                </span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
    <!-- 编辑窗口 -->
    <!--modal：识别模态框 fade：渐隐渐现 -->
    <div class="modal fade" id="bookkeeping_editWin" tabindex="-1" role="dialog"
         aria-hidden="true" data-backdrop="static">
      <div class="modal-dialog" style="width: 800px;">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
            <span class="modal-title" id=""><b>编辑</b></span>
          </div>
          <div class="modal-body">
            <div class="form-group" style="clear: both" v-for="item in recordItems">
              <label v-if="item.type !='select'" v-text="item.label" class="labelStyle"></label>
              <select-multiple v-if="item.type ==='select'"
                               :configBasic = "item.config"
                               :selectList="item.data"
                               :action = "constObj.edit"
                               v-on:getSelectedData="getSelectShopID">
              </select-multiple>
              <input type="text" v-if="item.type==='textArea'" v-model="editCmdData[item.name]"
                     class="form-control inputStyle" :id="item.id" :placeholder="item.emptyText" :disabled="item.disable"
                     v-on:input="checkValue(item,editCmdData[item.name],constObj.edit)">
              <datepicker v-if="item.type==='date_vue'" :partentID="bookingID+'_edit'" :moment="initTime"
                          style="float:left;margin-bottom: 10px;width: 50%;" v-on:picked="picked"></datepicker>
              <span :class="{mustFlag:item.type!='select',selectMustFlag:item.type=='select'}"
                    v-if="!item.allowBlank">*</span>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" v-on:click="editData">确定</button>
            <button type="button" class="btn btn-primary" data-dismiss="modal">关闭</button>
          </div>
        </div>
      </div>
    </div>
    </div>
    <!--弹框-->
    <message ref="MessageBox"></message>
  </div>
</template>

<script>
    import Vue from 'vue';
    import datepicker from './datepicker';
    import top from "./top";
    import message from "./messageBox";
    import selectMultiple from "./selectMultiple/selectMultiple"
    export default {
        name: "bookkeeping",
        data(){
          return{
            panelTitle:"记账",
            constObj:{
              add:"New",
              edit:"modify"
            },
            submitBtn:{
              text:"添加",
              id:"bookkeeping_button"
            },
            addbookingShopBtn:"添加",
            isCollapse:false,//判断是否展开
            cmdData:{},//存储新建时数据
            editCmdData:{},//存储编辑数据
            initTime : new Date().getTime(),
            recordItems:[
              {
              id:"shopID",
              label:"商品编号",
              type:"select",
              dateType:"intNumber",
              config:{
                labelText:"商品编号",
                labelStyle:"margin-left: 50px; width: 20%",
                width:"50%",
                isSelectMultiple:false,
                inputClass:"form-control",//多选框的input的class
                view:"text",//下拉框数据中用来显示
                mode:"value",
                params:{
                  url:"http://localhost:3000/shopIDList/list"
                }//下拉框数据请求参数
              },
              name:"shop_id",
              allowBlank:false,
              data:[]
              /*data:[
                {
                  value:'0',//option的value值
                  text:'旺旺',//option显示值
                  isSelected:true
              },{
                  value:'1',
                  text:'卫龙',
                  isSelected:false
              },{
                  value:'2',
                  text:'哇哈哈',
                  isSelected:false
              }]*/
            },{
                id:"shopName",
                label:"商品名称",
                type:"textArea",
                dateType:"string",
                name: "shopName",
                disable:'disabled',
                allowBlank:true
            },{
                id:"purchasePrice",
                label:"进价（单价）",
                type:"textArea",
                dateType:"doubleNumber",
                name: "purchasePrice",
                disable:'disabled',
                allowBlank:true
            },{
              id:"sellingPrice",
              label:"售价（单价）",
              type:"textArea",
              dateType:"doubleNumber",
              name: "sellingPrice",
              allowBlank:false,
              emptyText:"请输入出售商品的单价"
            },{
              id:"shopNum",
              label:"数量",
              allowBlank:false,
              type:"textArea",
              dateType:"intNumber",
              name:"shopNumber",
              emptyText:"请输入出售商品的数量"
            },{
              id:"booking_date",
              type:"date_vue",
              allowBlank:true,
              dateType:"time",
              name:"time",
              label:"日期"
            },{
              id:"booking_comments",
              type:"textArea",
              allowBlank:true,
              dateType:"string",
              name:"info",
              label:"备注"
            }],
            bookingID:"bookingDate",
            shopList:{
              searchInitText:"查询类型",
              startDateID:"shopList_startDate",
              endDateID:"shopList_endDate",
              searchType:[
                {type:"shop_id",text:"商品编号"}
              ],
              searchCmdObj:{},//查询请求参数
              startTime:{},
              endTime:{}//查询时间区间
            },
            url:{
              getGrid:"http://localhost:3000/billList/list",
              post:"http://localhost:3000/billList/create",
              read:"http://localhost:3000/billList/read",
              delete:"http://localhost:3000/billList/delete",
              readRecordCommodityList:"http://localhost:3000/shopList/read",
              getSelectData:"http://localhost:3000/shopIDList/list",//商品编号下拉框数据
              update:"http://localhost:3000/billList/updated"
            }
          }
        },
        methods:{
          createGrid(){
            let _this = this;
            //创建表格
            let bookkeepingGrid_table_table_dom = $("#bookkeepingGrid_table");
            bookkeepingGrid_table_table_dom.bootstrapTable('destroy'); // 清除缓存表格数据
            bookkeepingGrid_table_table_dom.bootstrapTable({
              showRefresh:true,//刷新按钮
              pagination:true,//分页
              pageSize:20,
              sortable: false,
              toolbar:"#bookkeepingGrid_toolbar_left",
              clickToSelect: true,//通过点击，选中表格中的行数据
              striped: true,//是否隔行颜色不同
              paginationLoop:true,//分页无限循环
              showToggle:true,/*显示表格和列表切换按钮*/
              escape:true,//转义特殊字符：防止SHH
              icons:{
                refresh: 'glyphicon-refresh icon-refresh',
                toggle: 'glyphicon-list-alt icon-list-alt',
                columns: 'glyphicon-th icon-th',
                delete:"glyphicon glyphicon-trash"
              },
              deleteCallback:function () {
                _this.deleteList();
              },
              columns: [
                {checkbox:true},
                {
                  field: 'shop_id',
                  title: '商品编号',
                  switchable:false//不参加列定制，始终显示
                },
                {
                  field: 'shopName',
                  title: '商品名称',
                  switchable:false//不参加列定制，始终显示
                },
                { field: 'purchasePrice', title: '进价（元）' },
                { field: 'sellingPrice', title: '售价（元）' },
                { field: 'shopNumber', title: '个数' },
                {
                  field: 'time',
                  title: '交易时间',
                  formatter:function (value,realData,index) {
                    let res = "-";
                    if(value){
                      res = value.year+'-'+value.month+'-'+value.date;
                    }
                    return res
                  }
                },
                { field: 'info', title: '备注' },
                {
                  title: '编辑',
                  align:'center',
                  switchable:false,//不参加列定制，始终显示
                  formatter:function (value,realData,index) {
                    return '<span class="glyphicon glyphicon-pencil" title="编辑"'
                      + ' style="cursor: pointer;"></span>'
                  },
                  events:{
                    'click .glyphicon-pencil':function (event, value, row, index) {
                      /*取数成功之后，1-打开窗口，2-赋值，3-id不允许修改*/
                      /*打开编辑窗口*/
                      $('#bookkeeping_editWin').modal('show');
                      /*赋值*/
                      _this.editCmdData = row;
                      let date_time =row.time.year+"/"+row.time.month+"/"+row.time.date;
                      _this.initTime = new Date(date_time);
                      _this.$http.get(_this.url.getSelectData).then((response)=>{
                        /*置空下拉框数组*/
                        _this.recordItems[0].data = [];
                        //获取商品编号
                        let shopID = row.shop_id;
                        /*获取商品编号列表*/
                        let shopIDListArr = response.data.data;
                        _this.recordItems[0].data = shopIDListArr.map(function (val,index,arr) {
                          return{
                            text:val.value+'['+val.text+']',
                            value:val.value,
                            isSelected:val.value ===shopID ? true:false
                          }
                        });
                      });
                    }
                  }
                }
              ],
              /*data:[
                {
                  "shop_id" : "卫龙",
                  "purchasePrice":3,
                  "sellingPrice" : 5,
                  "shopNumber" : 65,
                  "time" : {
                    "year" : 2018,
                    "month" : 9,
                    "date" : 24
                  }
              }]*/
              url:this.url.getGrid
            });
          },
          picked(year, month, date,id) {
            let _this = this;
            switch (id){
              case _this.shopList.startDateID:
                {
                  _this.shopList.startTime ={
                      year, month, date
                  };
                  break;
                }
              case _this.shopList.endDateID:
              {
                _this.shopList.endTime ={
                  year, month, date
                };
                break;
              }
              case _this.bookingID+"_edit":
              {
                _this.editCmdData.time = {
                  year, month, date
                };
                break;
              }
              default :
              {
                _this.cmdData.time = {
                  year, month, date
                };
                break;
              }
            }
          },
          /*
          *功能说明：下发记账信息
          * 参数：action：new-新建场景；modify-编辑场景
          * */
          saveData(action,callback){
              let _this = this;
              let data = action =='new'? _this.cmdData:_this.editCmdData;
              let currentDate = new Date();
              if(!_this.cmdData.time){
                _this.cmdData.time = {
                  year:currentDate.getFullYear(),
                  month:currentDate.getMonth()+1,
                  date : currentDate.getDate()
                };
              }
              if(!_this.editCmdData.time){
                _this.editCmdData.time = {
                  year:currentDate.getFullYear(),
                  month:currentDate.getMonth()+1,
                  date : currentDate.getDate()
                };
              }
              /*校验下发数据的准确性*/
              let checkData = function(){
                /*校验必输项是否输入*/
                let len = _this.recordItems.length;
                for(let i=0;i<len;i++){
                  if(!_this.recordItems[i].allowBlank){
                    if(data[_this.recordItems[i].name] == undefined
                      ||data[_this.recordItems[i].name] == ""){
                      _this.$refs.MessageBox.showMessageBox({
                        type:"error",
                        messageText :_this.recordItems[i].label+"为必输项，请输入之后再添加。"
                      });
                      return false
                    }
                  }
                }
                return true;
              };
              /*校验必输项是否输入*/
              let checkSuccess = checkData();
              if(checkSuccess){
                  if(action == 'new')
                  {
                    //如果数据库中没有相同id的数据，则正常新建
                    _this.$http.post(_this.url.post,data).then((response)=>{
                      if(response.ok){
                        /*请求成功后回调*/
                        if(callback && Object.prototype.toString.call(callback) =="[object Function]")
                        {
                          callback();
                        }
                      }else {
                        _this.$refs.MessageBox.showMessageBox({
                          type:"error",
                          messageText :"添加失败，请重新添加。"
                        });
                      }
                    });
                  }
                  else
                  {
                    /*编辑时，更新数据*/
                    _this.$http.post(_this.url.update,data).then((response)=>{
                      if(response.ok){
                        /*请求成功后回调*/
                        if(callback && Object.prototype.toString.call(callback) =="[object Function]")
                        {
                          callback();
                        }
                      }else {
                        _this.$refs.MessageBox.showMessageBox({
                          type:"error",
                          messageText :"添加失败，请重新添加。"
                        });
                      }
                    });
                  }
              }
          },
          /*添加数据*/
          addData(){
            let _this = this;
            _this.saveData('new',function () {
                /*初始化添加面板*/
                _this.initPanel();
                /*刷新表格*/
                $("#bookkeepingGrid_table").bootstrapTable("refresh");
                _this.$refs.MessageBox.showMessageBox({
                  type:"error",
                  messageText :"添加成功。"
                });
            });
          },
          /*编辑数据*/
          editData(){
            let _this = this;
            _this.saveData('modify',function () {
                /*关闭窗口*/
                $('#bookkeeping_editWin').modal('hide');
                /*刷新表格*/
                $("#bookkeepingGrid_table").bootstrapTable("refresh");
                //初始化日期
                _this.initTime  = new Date().getTime();
                _this.$refs.MessageBox.showMessageBox({
                  type:"error",
                  messageText :"修改成功。"
                });
            });
          },
          listenCollapse(){
            let _this = this;
            _this.isCollapse = !_this.isCollapse;
          },
          /*初始化面板*/
          initPanel(){
            let _this = this;
            _this.cmdData ={};
            /*初始化下拉框*/
            _this.getShopIDData();
            $("#shopPrice").val("");//价格
            $("#shopNum").val("");//数量
            $("#booking_comments").val("");//备注
            _this.initTime =new Date().getTime();//初始化日期
          },
          /*
          * 方法说明：选择查询类型，ui显示
          * */
          setSearchValue(searchObj){
            let _this = this;
            /*刷新按钮的文字*/
            _this.shopList.searchInitText = searchObj.text;
            _this.shopList.searchCmdObj["type"] = searchObj.type;
          },
          /*
           * 功能说明：搜索功能
           * */
          searchData(){
            let _this = this;
            /*查询商品ID*/
            let searchObj = _this.shopList.searchCmdObj;
            let search_time ={
              start: _this.shopList.startTime,
              end: _this.shopList.endTime
            };
            let findObj = {};
            if(searchObj.value ==""){
              Object.assign(findObj,search_time);
            }else{
              Object.assign(findObj,search_time,searchObj);
            }
            _this.findData(_this.url.read,findObj,function (data) {
                  /*刷新表格，向表格中赋值*/
                  $("#bookkeepingGrid_table").bootstrapTable("load",data);
                });

          },
          /*查询数据是否存在
          * searchObj:{
          *   type:"查询数据的类型"，
          *   value:"查询的值"
          * callback:查询取数后的回调
          * */
          findData(url,searchObj,callback){
              let _this = this;
              _this.$http.post(url,searchObj).then((response)=>{
                if(response.ok){
                  if(callback){
                    callback(response.body.data);
                  }
                }else{
                  _this.$refs.MessageBox.showMessageBox({
                    type:"error",
                    messageText :response.message
                  });
                }
              });
          },
          /*对输入框的数据进行基本校验*/
          checkValue(item,val,action){
            let _this = this;
            if(item.dateType ==="intNumber")
            {
              /*只允许输入整数数据*/
              val=val.replace(/\D/g,'');
            }
            else if(item.dateType ==="doubleNumber")
            {
              /*允许输入小数*/
              /*匹配0-9的数字、小数点之外的数*/
              val=val.replace(/[^\d.]/g,'');
              /*保证输入的是开头不是点*/
              val = val.replace(/^\./g, "");
              /*保证不能输入连续点*/
              val = val.replace(/\.{2,}/g, ".");
              //保证.只出现一次，而不能出现两次以上
              /*把第一个.用其他字符替换，再出现.时候替换成空的，最后把第一个.换回来*/
              val = val.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
            }
            /*更新值，区分新建、编辑时*/
            if(action == _this.constObj.add){
              _this.cmdData[item.name] = val;
            }else{
              _this.editCmdData[item.name] = val;
            }
          },
          /*监听商品编号下拉框选择的数值*/
          getShopIDData(){
              let _this = this;
              /*发送请求，查询下拉框的值*/
              _this.$http.get(_this.url.getSelectData).then((response)=>{
                  /*置空下拉框数组*/
                  _this.recordItems[0].data = [];
                  /*获取商品编号列表*/
                  let tempArr = [];
                  let shopIDListArr = response.data.data;
                  tempArr = shopIDListArr.map(function (val,index,arr) {
                    return {
                      text:val.value+'['+val.text+']',
                      value:val.value,
                      isSelected:val.isSelected
                    }
                  });
                  _this.recordItems[0].data = [...tempArr];

              });
          },
          /*
          * 功能说明：根据商品编号，更新对应进价
          * */
          setPrice(action,items){
            let _this =this;
            /*从商品列表中查询对应商品编号的进价*/
            let searchObj = {
              type:"shop_id",
              value:items[_this.recordItems[0].config.mode]
            };
            _this.findData(_this.url.readRecordCommodityList,searchObj,function (data) {
                if(action =="New"){
                  Vue.set(_this.cmdData, 'shopName', data[0].shopName);
                  Vue.set(_this.cmdData, 'purchasePrice', data[0].shopPrice);
                }else{
                  Vue.set(_this.editCmdData, 'shopName', data[0].shopName);
                  Vue.set(_this.editCmdData, 'purchasePrice', data[0].shopPrice);
                }

            });
          },
          /*
          * 功能说明：删除数据
          * */
          deleteList(){
            let _this = this;
            /*返回所有选择的行，包括搜索过滤前的，当没有选择任何行的时候返回一个空数组*/
            let selectdData = $("#bookkeepingGrid_table").bootstrapTable("getAllSelections");
            let len = selectdData.length;
            if(len == 0){
              _this.$refs.MessageBox.showMessageBox({
                type:"error",
                messageText :"请至少选择一条数据进行删除。"
              });
            }else{
              const deleteConfirm_msg = "您确定需要删除选择的数据吗？";
              _this.$refs.MessageBox.showMessageBox({
                type:"confirm",
                messageText :deleteConfirm_msg,
                callback:function () {
                  let cmdArr = [];
                  for(let i=0;i<len;i++){
                    /*通过ID删除*/
                    cmdArr.push({shop_id:selectdData[i].shop_id});
                  }
                  let cmdJSONstr = JSON.stringify(cmdArr);
                  _this.$http.post(_this.url.delete,cmdJSONstr).then((response)=>{
                    /*刷新列表*/
                    if(response.ok){
                      $("#bookkeepingGrid_table").bootstrapTable("refresh");
                    }else{
                      _this.$refs.MessageBox.showMessageBox({
                        type:"error",
                        messageText :"删除失败，请重新删除。"
                      });
                    }
                  },(error)=>{
                    console.log(error)
                  });
                }
              });
            }
          },
          /*
          * 接受单选选择的值
          * */
          getSelectShopID(val,type){
            let _this = this;
            //把shop_id存入命令下发的数组中
            let data = type ==_this.constObj.add ? _this.cmdData:_this.editCmdData;
            data[_this.recordItems[0].name] = val[_this.recordItems[0].config.mode];
            //反显商品名称、进价
            _this.setPrice(type,val);
          }
        },
        //生成dom之后
        mounted(){
          let _this = this;
          //创建表格
          _this.createGrid();
          _this.getShopIDData();
        },
        components:{
          top,datepicker,message,selectMultiple
        }
    }
</script>

<style scoped>
  @import '../assets/css/bookkeeping.css';

</style>
