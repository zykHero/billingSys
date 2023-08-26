<template>
  <div id="recordData">
    <top></top>
    <div class="panel-group" id="addShop">
      <div class="panel panel-default">
        <div class="panel-heading" style="position: relative;height: 50px;margin-bottom: 10px;">
          <h4 class="panel-title">
            <a data-toggle="collapse" data-parent="#addShop" @click="listenCollapse"
               style="line-height: 30px;"
               href="#shopConfig" v-text="addShopTitle"></a>
          </h4>
          <button :id="addShopBtn.id" type="submit" v-if="isCollapse" class="btn btn-default"
                  v-text="addShopBtn.text" @click="addData"></button>
        </div>
        <div id="shopConfig" class="panel-collapse collapse panel-body">
            <!--商品基本信息-->
            <div class="col-lg-4 col-md-5 col-sm-12">
              <div class="shopInfoTeam" v-for="item in shopBaseItem">
                <label v-if="item.type !='select'" v-text="item.label" class="shopBaseLabel" style="float: left;"></label>
                <select-multiple v-if="item.type ==='select'"
                                 :configBasic = "item.config"
                                 :action = "constObj.add"
                                 ref="SeletctInterface"
                                 v-on:getSelectedData="getSelectShopID">
                </select-multiple>
                <datepicker class="shopBaseInput" :partentID="recordCommodityID" :moment="initTime"
                            style="float:left;"
                            v-else-if="item.type==='date_vue'"
                            v-on:picked="picked">
                </datepicker>
                <input type="text" class="form-control shopBaseInput" v-model="cmdData[item.name]"
                       :id="item.id" :placeholder="item.emptyText"
                       v-else
                       v-on:input="checkValue(item,cmdData[item.name],constObj.add)"/>
                <span class="mustFlag" v-if="!item.allowBlank" >*</span>
              </div>
            </div>
            <!--货源信息-->
            <div class="col-lg-8 col-md-7 col-sm-12">
              <!--货源地-->
              <div class="shopInfoTeam" id="sourShop">
                <label v-text="addressLabel"></label>
                <cityselect v-on:getSelectData = "selectData"></cityselect>
              </div>
              <!--货源地详细信息-->
              <div class="shopInfoTeam" style="clear: both;">
                <label class="shopBaseLabel"></label>
                <input type="text" class="form-control shopBaseInput" v-model="cmdData[address.name]"
                       :id="address.id" :placeholder="address.emptyText"
                       v-on:input="checkValue(address,cmdData[address.name],constObj.add)">
              </div>
              <!--联系信息、备注-->
              <div class="shopInfoTeam" v-for="item in shopSupplyItem">
                <label v-text="item.label" class="shopBaseLabel"></label>
                <input type="text" class="form-control shopBaseInput" v-model="cmdData[item.name]"
                       :id="item.id" :placeholder="item.emptyText"
                       v-on:input="checkValue(item,cmdData[item.name],constObj.add)">
                <span class="mustFlag" v-if="!item.allowBlank">*</span>
              </div>
            </div>
        </div>
      </div>
    </div>
    <!--商品信息列表-->
    <div id="shopInfoList">
      <table id="shopInfoList_table" class="table table-striped table-bordered table-hover"
             data-classes="table table-hover "
             data-show-columns="true">
      </table>
      <!--自定义工具栏 查询框-->
      <div class="btn-group" id="shopList_toolbar_left">
        <div id="toolbar_search" class="col-lg-5 col-sm-12">
          <form class="bs-example bs-example-form" role="form">
              <div class="input-group">
                <!--搜索类型-->
                <div class="input-group-btn">
                  <button type="button" class="btn btn-default dropdown-toggle"
                          data-toggle="dropdown">
                    <span v-text="shopList.searchInitText"></span>
                    <span class="caret"></span>
                  </button>
                  <ul class="dropdown-menu" >
                    <li v-for="item in shopList.searchType">
                      <a href="#" v-on:click="setSearchValue(item)" v-text="item.text"></a>
                    </li>
                  </ul>
                </div>
                <!--查询输入框架-->
                <input type="text" class="form-control" v-model="shopList.searchCmdObj['value']">
                <!--查询按钮-->
                <span class="input-group-btn ">
                    <button class="btn btn-default" type="button" v-on:click="searchData">
                      <span class="glyphicon glyphicon-search"></span>
                    </button>
                </span>
              </div>
          </form>
        </div>
      </div>
    </div>
    <!-- 编辑窗口 -->
    <!--modal：识别模态框 fade：渐隐渐现 -->
    <div class="modal fade" id="editWin" tabindex="-1" role="dialog"
         aria-hidden="true" data-backdrop="static">
      <div class="modal-dialog" style="width: 800px;">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
            <span class="modal-title" id=""><b>编辑</b></span>
          </div>
          <div class="modal-body">
            <div class="shopInfoTeam" v-for="item in shopBaseItem">
              <label v-if="item.type !='select'" v-text="item.label" class="shopBaseLabel" style="float: left;"></label>
              <select-multiple v-if="item.type ==='select'"
                               :configBasic = "item.config"
                               :action = "constObj.edit"
                               v-on:getSelectedData="getSelectShopID">
              </select-multiple>
              <datepicker class="shopBaseInput" :partentID="recordCommodityID+'_edit'"
                          :moment="initTime"
                          style="float:left;margin-bottom: 10px;"
                          v-else-if="item.type==='date_vue'"
                          v-on:picked="picked">
              </datepicker>
              <input type="text" class="form-control shopBaseInput" v-model="editCmdData[item.name]"
                     :id="item.id+'_edit'" :placeholder="item.emptyText"
                     v-else
                     v-on:input="checkValue(item,editCmdData[item.name],constObj.edit)"/>
              <span class="mustFlag" v-if="!item.allowBlank" >*</span>
            </div>
            <!--货源地-->
            <div class="shopInfoTeam">
              <label v-text="addressLabel" class="shopBaseLabel" style="float: left;"></label>
              <cityselect :sour="editCmdData.sour" v-on:getSelectData = "selectData"></cityselect><!--todo-->
            </div>
            <!--详细信息-->
            <div class="shopInfoTeam">
              <label class="shopBaseLabel"></label>
              <input type="text" class="form-control shopBaseInput" style="width: 74%;" v-model="editCmdData[address.name]"
                     :id="address.id+'_edit'" :placeholder="address.emptyText"
                     v-on:input="checkValue(address,editCmdData[address.name],constObj.edit)">
            </div>
            <!--货源地-->
            <!--联系信息、备注-->
            <div class="shopInfoTeam" v-for="item in shopSupplyItem">
              <label v-text="item.label" class="shopBaseLabel"></label>
              <input type="text" class="form-control shopBaseInput" v-model="editCmdData[item.name]"
                     :id="item.id+'_edit'" :placeholder="item.emptyText"
                     v-on:input="checkValue(item,editCmdData[item.name],constObj.edit)">
              <span class="mustFlag" v-if="!item.allowBlank">*</span>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" v-on:click="editData">确定</button>
            <button type="button" class="btn btn-primary" data-dismiss="modal">关闭</button>
          </div>
        </div>
      </div>
    </div>
    <!--弹框-->
    <message ref="MessageBox">
    </message>
  </div>

</template>

<script>
  import cityselect from "./city-select"
  import datepicker from "./datepicker"
  import top from "./top"
  import message from "./messageBox"
  import selectMultiple from "./selectMultiple/selectMultiple"
  export default {
    name: "recordCommodity",
    components:{
      top,cityselect,datepicker,message,selectMultiple
    },
    data(){
      return{
        addShopTitle:"添加商品",
        constObj:{
          add:"New",
          edit:"modify"
        },
        addShopBtn:{
          id:"addShopBtn_submit",
          text:"添加"
        },
        isCollapse:false,//判断是否展开
        recordCommodityID:"recordCommodityData",
        initTime : new Date().getTime(),//当前时间
        shopBaseItem: [
          {
            id:"shopID",
            label:"商品编号",
            allowBlank:false,
            config:{
              labelText:"商品编号",
              labelStyle:"width: 120px;",
              width:"200px",
              isSelectMultiple:false,
              inputClass:"form-control",//多选框的input的class
              view:"text",//下拉框数据中用来显示
              mode:"value",
              emptyText:"请输入商品编号(数字)",
              params:{
                url:"http://localhost:3000/shopIDList/list"
              }//下拉框数据请求参数
            },
            type:"select",
            name:"shop_id",
            data:""//下拉框中的数据
          },{
            id:"shopName",
            label:"名称",
            allowBlank:false,
            type:"string",
            name:"shopName",
            emptyText:"请输入商品名称"
          },{
            id:"shopNumber",
            label:"商品个数",
            allowBlank:false,
            type:"intNumber",
            name:"shopNumber",
            emptyText:"请输入商品个数"
          },{
            id:"shopPrice",
            label:"进价（元/单价）",
            allowBlank:false,
            type:"doubleNumber",
            name: "shopPrice",
            emptyText:"请输入商品进价"
          },{
            id:"recordCommodity_date",
            type:"date_vue",
            allowBlank:true,
            dateType:"time",
            name:"time",
            label:"进货日期"
          }
        ],
        shopSupplyItem:[
          {
            id:"bossName",
            name : "bossName",
            type:"string",
            allowBlank:true,
            label:"供应商",
            emptyText:"请输入联系人姓名"
          },{
            id:"bossPhone",
            name:"bossPhone",
            type:"number",
            allowBlank:true,
            label:"联系电话",
            emptyText:"请输入联系电话"
          },
          {
            id:"shopRemark",
            allowBlank:true,
            name:"info",
            label:"备注"
          }
        ],
        addressLabel:"货源地",
        address:{
          id:"detailedAdress",
          name : "address",
          type:"string",
          allowBlank:true,
          emptyText:"请输入详细地址"
        },
        shopList:{
          searchInitText:"查询类型",
          searchType:[
            {type:"shop_id",text:"商品编号"},
            {type:"shopName",text:"名称"},
            {type:"shopPrice",text:"进价（元/单价）"},
            {type:"bossName",text:"供应商"},
            {type:"bossPhone",text:"联系电话"}
          ],
          searchCmdObj:{}
        },
        cmdData:{},//创建商品数据中的数据
        editCmdData:{},//打开编辑时存放的数据
        url:{
          //需要根据服务器地址，更新
          getGrid:"http://localhost:3000/shopList/list",
          post:"http://localhost:3000/shopList/create",
          delete:"http://localhost:3000/shopList/delete",
          read:"http://localhost:3000/shopList/read",
          update:"http://localhost:3000/shopList/updated",
          session:"http://localhost:3000/shopList/session"
        }
      }
    },
    methods:{
        //创建表格
        createGrid(){
          let _this = this;
          //创建表格
          let shopInfoList_table_dom = $("#shopInfoList_table");
          shopInfoList_table_dom.bootstrapTable('destroy'); // 清除缓存表格数据
          shopInfoList_table_dom.bootstrapTable({
            showRefresh:true,//刷新按钮
            pagination:true,//是否显示分页
            pageSize:20,
            sortable: false,
            toolbar:"#shopList_toolbar_left",
            striped: true,//是否隔行颜色不同
            paginationLoop:true,//分页无限循环
            clickToSelect: true,//通过点击，选中表格中的行数据
            showToggle:true,/*显示表格和列表切换按钮*/
            escape:true,//转义特殊字符：防止SHH
            icons:{
              refresh: 'glyphicon-refresh icon-refresh',
              toggle: 'glyphicon-list-alt icon-list-alt',
              columns: 'glyphicon-th icon-th',
              delete:"glyphicon glyphicon-trash"
            },
            deleteCallback:function () {
              _this.deleteShopList();
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
                title: '名称',
                switchable:false//不参加列定制，始终显示
              },
              { field: 'shopNumber', title: '商品个数'},
              { field: 'shopPrice', title: '进价（元/单价）' },
              {
                field: 'time',
                title: '进货时间',
                formatter:function (value,realData,index) {
                  let res = "-";
                  if(value){
                    res = value.year+'-'+value.month+'-'+value.date;
                  }
                  return res
                }
              },
              {
                field: 'sour',
                title: '货源地',
                formatter:function (value,realData,index) {
                  let res = "-";
                  if(value){
                    if(value.city ==="县"){
                      res =value.provice+'-'+value.block;
                    }else{
                      res =value.provice+'-'+value.city+'-'+value.block;
                    }
                  }
                  return res
                }
              },
              { field: 'bossName', title: '供应商' },
              { field: 'bossPhone', title: '联系电话' },
              { field: 'info', title: '备注'},
              {
                title: '编辑',
                align:'center',
                switchable:false,//不参加列定制，始终显示
                formatter:function (value,realData,index) {
                  return '<span class="glyphicon glyphicon-pencil" title="编辑" style="cursor: pointer;"></span>'
                },
                events:{
                  'click .glyphicon-pencil':function (event, value, row, index) {
                    /*取数成功之后，1-打开窗口，2-赋值，3-id不允许修改*/
                    let searchObj = {
                      type:'shop_id',
                      value:row['shop_id']
                    };
                   /* /!*打开编辑窗口*!/
                    $('#editWin').modal('show');
                    /!*赋值*!/*/
                    /*_this.editCmdData = {
                      shop_id:222,/!*商品ID*!/
                      shopName: "是",/!*名称*!/
                      shopNumber:23,/!*商品个数*!/
                      shopPrice:311,/!*进价（单价）*!/
                      bossName:22,/!*联系人名称*!/
                      bossPhone:333333,/!*联系人电话*!/
                      info:"2222",/!*备注*!/
                      address:"ssxasadsad",
                      sour:{
                        "provice" : "新疆维吾尔自治区",
                        "city" : "博尔塔拉蒙古自治州",
                        "block" : "精河县"
                      }
                    };*/
                    /*id输入框置灰*/
                    $("#shopID_edit").attr("disabled", true);
                    _this.findData(searchObj,function (data) {
                      if(data.ok){
                        /*打开编辑窗口*/
                        $('#editWin').modal('show');
                        /*赋值*/
                        _this.editCmdData = data.data[0];
                        let date_time =data.data[0].time.year+"/"+data.data[0].time.month+"/"+data.data[0].time.date;
                        _this.initTime = new Date(date_time);
                        /*id输入框置灰*/
                        $("#shopID_edit").attr("disabled", true);
                      }else{
                        _this.$refs.MessageBox.showMessageBox({
                          type:"error",
                          messageText : data.message
                        });
                      }
                    });
                  }
                }
              }
            ],
           /* data:[
              {
              shop_id:111,/!*商品ID*!/
              shopName: "是",/!*名称*!/
              shopNumber:23,/!*商品个数*!/
              shopPrice:311,/!*进价（单价）*!/
              bossName:22,/!*联系人名称*!/
              bossPhone:333333,/!*联系人电话*!/
              info:"2222",/!*备注*!/
              sour:{}/!*货源地*!/
            },{
              shop_id:222,/!*商品ID*!/
              shopName: "是",/!*名称*!/
              shopNumber:23,/!*商品个数*!/
              shopPrice:311,/!*进价（单价）*!/
              bossName:22,/!*联系人名称*!/
              bossPhone:333333,/!*联系人电话*!/
              info:"2222",/!*备注*!/
              sour:{
                "provice" : "新疆维吾尔自治区",
                "city" : "博尔塔拉蒙古自治州",
                "block" : "精河县"
              }/!*货源地*!/
            }]*/
            url:_this.url.getGrid
          });
        },
        /*监听折叠框是否展开*/
        listenCollapse(){
          let _this = this;
          _this.isCollapse = !_this.isCollapse;
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
              let len = _this.shopBaseItem.length;
              for(let i=0;i<len;i++){
                if(!_this.shopBaseItem[i].allowBlank){
                  if(data[_this.shopBaseItem[i].name] == undefined
                    ||data[_this.shopBaseItem[i].name] == ""){
                    //弹框信息
                    _this.$refs.MessageBox.showMessageBox({
                      type:"error",
                      messageText : _this.shopBaseItem[i].label+"为必输项，请输入之后再添加。"
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
            let searchObj =[{
              type:"shop_id",
              value:data["shop_id"]
            }];
            if(action == 'new')
            {
              _this.findData(searchObj,function (searchRespone) {
                  if(searchRespone.data.length == 0)
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
                          messageText : "添加失败，请重新添加。"
                        });
                      }
                    });
                  }
                  else
                  {
                    _this.$refs.MessageBox.showMessageBox({
                      type:"error",
                      messageText : "已存在相同ID的商品，请重新输入ID。"
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
                    messageText : "添加失败，请重新添加。"
                  });
                }
              });
            }
          }
        },
        /*获取当前选择的省级、城市、县级*/
        selectData(data){
          let _this =this;
          let shopSour = {
            sour:data
          };
          Object.assign(_this.cmdData,shopSour);
        },
        /*初始化面板*/
        initPanel(){
          let _this = this;
          _this.cmdData ={};
          /*初始化下拉框*/
          _this.$refs.SeletctInterface[0].clearSelect();
          $("#province_select").val("");
          $("#city_select").val("");
          $("#block_select").val("");

          _this.initTime =new Date().getTime();//初始化日期
        },
        /*删除列表数据*/
        deleteShopList(){
          let _this = this;
          /*返回所有选择的行，包括搜索过滤前的，当没有选择任何行的时候返回一个空数组*/
          let selectdData = $("#shopInfoList_table").bootstrapTable("getAllSelections");
          let len = selectdData.length;
          if(len == 0){
            _this.$refs.MessageBox.showMessageBox({
              type:"error",
              messageText : "请至少选择一条数据进行删除。"
            });
          }else{
            const deleteConfirm_msg = "您确定需要删除选择的数据吗？";
            _this.$refs.MessageBox.showMessageBox({
              type:"confirm",
              messageText : deleteConfirm_msg,
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
                    $("#shopInfoList_table").bootstrapTable("refresh");
                  }else{
                    _this.$refs.MessageBox.showMessageBox({
                      type:"error",
                      messageText : "删除失败，请重新删除。"
                    });
                  }
                },(error)=>{
                  console.log(error)
                });
              }
            });
          }
        },
        /*对输入框的数据进行基本校验*/
        checkValue(item,val,action){
            let _this = this;
            if(item.type ==="intNumber"){
              /*只允许输入整数数据*/
              val=val.replace(/\D/g,'');
            }else if(item.type ==="doubleNumber"){
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
        /*查询数据是否存在
        * searchObj:{
        *   type:"查询数据的类型"，
        *   value:"查询的值"
        * callback:查询取数后的回调
        * */
        findData(searchObj,callback){
          let _this = this;
          _this.$http.post(_this.url.read,searchObj).then((response)=>{
              if(response.ok){
                if(callback){
                  callback(response.data);
                }
              }else{
                _this.$refs.MessageBox.showMessageBox({
                  type:"error",
                  messageText : response.message
                });
              }
          })
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
          let searchObj = _this.shopList.searchCmdObj;
          if(searchObj.type ==undefined){
            _this.$refs.MessageBox.showMessageBox({
              type:"error",
              messageText : "请选择查询类型后再进行查询。"
            });
          }else{
              _this.findData(searchObj,function (data) {
                /*刷新表格，向表格中赋值*/
                $("#shopInfoList_table").bootstrapTable("load",data);
              });
          }
        },
      /*添加数据*/
        addData(){
          let _this = this;
          _this.saveData('new',function () {
            /*初始化添加面板*/
            _this.initPanel();
            /*刷新表格*/
            $("#shopInfoList_table").bootstrapTable("refresh");
            _this.$refs.MessageBox.showMessageBox({
              type:"success",
              messageText : "添加成功。"
            });
          });
        },
      /*编辑数据*/
        editData(){
          let _this = this;
          _this.saveData('modify',function () {
            /*关闭窗口*/
            $('#editWin').modal('hide');
            //初始化日期
            _this.initTime  = new Date().getTime();
            /*刷新表格*/
            $("#shopInfoList_table").bootstrapTable("refresh");
            _this.$refs.MessageBox.showMessageBox({
              type:"success",
              messageText : "修改成功。"
            });
          });
        },
        /*选择的时间-新建 */
        picked(year, month, date,id) {
          let _this = this;
          switch (id){
            case _this.recordCommodityID:
            {
              _this.cmdData.time = {
                year, month, date
              };
              break;
            }
            case _this.recordCommodityID+"_edit":
            {
              _this.editCmdData.time = {
                year, month, date
              };
              break;
            }
            default :
            {
              break;
            }
          }
        },
        getSelectShopID(val,type){
         let _this = this;
         let resArr = val;
         //当下拉框没有已创建的下拉框，
         if(Object.prototype.toString.call(val) =="[object Object]")
         {
           resArr = val[_this.shopBaseItem[0].config.mode]
         }
         if(type == _this.constObj.add)
         {
           _this.cmdData[_this.shopBaseItem[0].name] = resArr;
         }else{
           _this.editCmdData[_this.shopBaseItem[0].name] = resArr;
         }
        }
    },
    mounted(){
      //生成html之后
      let _this = this;
      //创建表格
      _this.createGrid();
    }
  }
</script>

<style scoped>
  @import "../assets/css/recordCommodity.css";
</style>
