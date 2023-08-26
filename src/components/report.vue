<template>
  <div id="report">
    <top></top>
    <div class="panel-group" id="report_storeShop">
      <div class="panel panel-default">
        <div class="panel-heading">
          <h4 class="panel-title">
            <a data-toggle="collapse" data-parent="report_storeShop" style="line-height: 30px;"
               href="#report_storeShop_panel" v-on:click="openStore" v-text="storeReport.title"></a>
          </h4>
        </div>
        <div id="report_storeShop_panel" class="panel-collapse collapse panel-body">
            <select-multiple :configBasic = "storeReport.config"
                             :selectList="storeReport.listData"
              v-on:getSelectedData="getStoreShop_selectList">
            </select-multiple>
            <div :id="storeReport.id"></div>
          <!--鼠标在柱形图上显示详情的面板-->
            <div :id="storeReport.info" class="tip_report">
              <label>库存：</label>
              <span v-text="storeReport.qtipText"></span>
            </div>
          <!--鼠标在x轴名称时的显示-->
            <div :id="storeReport.qtipID" class="tip_report" v-text="storeReport.qtipText"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
    import top from "./top";
    import selectMultiple from "./selectMultiple/selectMultiple"
    export default {
      name: "report",
      components:{
        top,selectMultiple
      },
      data(){
        return {
          url:{
            getStoreShop : "http://localhost:3000/report/store"
          },
          xMaxLength:5,//x轴刻度显示最大长度
          storeReport : {
            id:"storeShop_view",
            info:"storeShop_info",
            infoText:"",//对应商品的库存
            qtipID:"storeShop_qtip",
            qtipText:"",//商品名称
            title:"商品库存统计表",
            currentViewData:[],//当前显示的数值
            listData:[],
            config:{
              inputClass:"form-control",//多选框的input的class
              view:"shopName",//下拉框数据中用来显示
              mode:"shopNumber",
              params:{
                url:"http://localhost:3000/shopIDList/list"
              }//下拉框数据请求参数
            },
            /*默认显示15条数据*/
            data:{
              x:[],
              value:[]
            }
          }
        }
      },
      methods:{
        /*创建库存视图*/
        createView_shopStore(){
          let _this = this;
          //获取存放库存视图的dom
          let shopStoreDom = document.getElementById(_this.storeReport.id);
          //初始化报表显示dom
          let shopStorReport = echarts.init(shopStoreDom);
          let options = {
            color:"rgba(105,247,255,0.5)",
            /*图例*/
            legend: {
              data:['商品库存']
            },
            xAxis: {
              type: 'category',
              triggerEvent:true,//是否激活监听x轴的鼠标事件
              data:_this.storeReport.data.x,
              axisLabel:{
                rotate:45,//刻度倾斜
                interval: 0,//刻度间隔多少显示一个，
                /*自定义x轴的刻度名称
                * 参数1：每一个刻度的值
                * 参数2：刻度对应索引
                * */
                formatter:function (value,index) {
                  let res = value;
                  if(value.length >_this.xMaxLength){
                    //如果显示的值大于规定长度，则返回6个字符串+“...”
                    res = value.substring(0,_this.xMaxLength)+"...";
                  }
                  return res;
                }
              }
            },
            yAxis: {},
            /*防止倾斜，下面被遮挡*/
            grid: {
              left: '10%',
              bottom:'25%'
            },
            series: [{
              name:"商品库存",
              data: _this.storeReport.data.value,
              type: 'bar'
            }]
          };
          shopStorReport.setOption(options);
          shopStorReport.on('mouseover', function (params) {
            //鼠标经过图表时候判断参数
            switch (params.componentType){
              case 'xAxis':
              {
                let qtipName = document.getElementById(_this.storeReport.qtipID);
                //赋值
                _this.storeReport.qtipText =params.value;
                //调整显示位置
                qtipName.style.left = params.event.event.pageX+15+'px';
                qtipName.style.top =params.event.event.pageY+5 +'px';
                qtipName.style.display = "block";
                break;
              }
              case "series":
              {
                let qtipInfo = document.getElementById(_this.storeReport.info);
                //赋值
                _this.storeReport.qtipText =params.data;
                //调整显示位置
                qtipInfo.style.left = params.event.event.pageX+15+'px';
                qtipInfo.style.top =params.event.event.pageY+5 +'px';
                qtipInfo.style.display = "block";
                break;
              }
              default:
                break;
            }
          });
          shopStorReport.on('mouseout', function (params) {
            //鼠标经过图表时候判断参数
            switch (params.componentType){
              case 'xAxis':
              {
                let qtip = document.getElementById(_this.storeReport.qtipID);
                qtip.style.display = "none";
                break;
              }
              case "series":{
                let qtipInfo = document.getElementById(_this.storeReport.info);
                qtipInfo.style.display = "none";
                break;
              }
              default:
                break;
            }
          });
        },
        /*获取已经选择的库存数据*/
        getStoreShop_selectList(val){
          let _this=this;
          //更新显示的值
          _this.changeToReportData(val);
          //绘制表格
          _this.createView_shopStore();
        },
        /*
        * 功能说明：把currentViewData（当前需要显示的值），格式化为图标需要的数据
        * */
        changeToReportData (val){
          let _this=this;
          _this.storeReport.currentViewData = val;
          _this.storeReport.data.x = _this.storeReport.currentViewData.map(function (val,index,arr) {
            return val[_this.storeReport.config.view];
          });
          _this.storeReport.data.value = _this.storeReport.currentViewData.map(function (val,index,arr) {
            return val[_this.storeReport.config.mode];
          });
        },
        /*获取库存数据*/
        getStoreDate(callback){
          let _this = this;
          let searchObj = {
            type:'default',
            number:15,
            selectedStore:[]
          };
          _this.$http.post(_this.url.getStoreShop,searchObj).then((respone)=>{
            let data = respone.body;
            let currentSelectData = [];
            //初始化需要显示的数据
            for(let i=0;i <data.length;i++){
              if(data[i].isSelected){
                currentSelectData.push(data[i]);
              }
            }
            //填充下拉框的所有数据
            _this.storeReport.listData =data;
            //获取当前数据且转换成坐标需要的值
            _this.changeToReportData(currentSelectData);
            if(callback){
              callback();
            }
          });
        },
        /*打开库存展开panel时触发*/
        openStore(){
          let _this = this;
          let temp = _this.storeReport.listData;
          _this.storeReport.listData =temp;
        }
      },
      mounted(){
        let _this = this;
        /*获取商品数据并且画坐标*/
        let getStoreData_callback = function () {
          //创建坐标系
          _this.createView_shopStore();
        };
        _this.getStoreDate(getStoreData_callback);

      }
    }
</script>

<style scoped>
  @import "../assets/css/report.css";
</style>
