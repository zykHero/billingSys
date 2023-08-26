<!--多选下拉框-->
<!--功能说明：1-支持查询；2-支持多选；3-全选-->
<!--接受参数：id、class-->
<template>
<div :id="id" class="selectMultiple">
  <!--输入框的label-->
  <div id="selectMultiple_label" v-if="defaultCfg.labelText != ''"
       :style="defaultCfg.labelStyle" v-text="defaultCfg.labelText"></div>
  <div>
    <!--多选输入框-->
    <input :id="inputID" :class="defaultCfg.inputClass" type="text"
           v-if="defaultCfg.isSelectMultiple"
           v-model="inputValue"
           style="border-radius: 4px 4px 0 0;"
           v-on:focus="inputFocus_control"
           unselectable=on onfocus="this.blur()"/>
    <!--单选输入框-->
    <input :id="inputID" :class="defaultCfg.inputClass" type="text"
           v-if="!defaultCfg.isSelectMultiple"
           v-model="inputValue"
           style="border-radius: 4px 4px 0 0;"
           v-on:input="searchData()"
           v-on:focus="inputFocus_control"/>
    <!--下拉框展开按钮,收缩按钮-->
    <div class="selectList_collapse" v-on:click="showListDom_control()"></div>
    <!--下拉框显示dom-->
    <div :id="listDomID" class="select_list" v-show="isShowList">
      <!--查询框,多选才需要单独出来查询框，单选只可以在输入框中进行查询-->
      <div id="input_searchSelect" v-if="defaultCfg.isSearch && defaultCfg.isSelectMultiple">
        <input :class="defaultCfg.inputClass"
               type="search"
               placeholder="请输入查询内容"
               v-model="searchValue"
               v-on:input="searchData()"/>
      </div>
      <ul>
        <li v-for="item in selectDataList" :title="item.text"
            v-on:click="selectedList(item)">
          <!--todo 图标-->
          <i></i>
          <!--内容-->
          <div class="listData_every" v-text="item[defaultCfg.view]"></div>
          <!--对勾，表示勾选-->
          <div class="listData_every_isOK" v-show="item.isSelected"
               :selectedFlag="selectedFlag">
          </div>
        </li>
      </ul>
    </div>
  </div>
</div>
</template>

<script>
    export default {
        name: "select-multiple",
        props:{
          configBasic:{
            type:Object,
            default(){
              return {};
            }
          },
          /*下拉框中的数据*/
          selectList:{
            type:Array,
            default(){
              /*
              * text:显示
              * value：编号
              * isSelected：是否被选中
              * */
              return [

              ]
            }
          },
          action:{
            type:String,
            default(){
              return "";
            }
          }
        },
        data(){
          return {
            id:"select_mulitiple",
            inputID:"select_mulitiple_input"+this.action,
            listDomID:"select_mulitiple_list"+this.action,
            defaultCfg :{
              isSelectMultiple:true,//true-表示多选；false-单选
              lableText:"",
              labelStyle:"width:150px",
              inputClass:"",//多选框的input的class
              width:'400px',//输入框的宽度
              listHeight:'200px',//下拉框展开高度
              isSearch:true,//是否支持查询
              view:"text",//下拉框数据中用来显示
              mode:"value",//下拉框数据中的索引标示
              isSelectedFlag:"isSelected",//下拉框数据中的表示已经选择的数据
              obscureSearch:true,//true：模糊查询；false：精确查询
              maxSelect:15,//最多选择的个数
              minSelect:5//最少选择的个数
            },
            config:this.configBasic,
            selectedFlag:"√",
            selectDataList:this.selectList,//存放下拉框的数据
            selectedArr:[],//下拉框选择的数据
            isShowList:false,//下拉框显隐状态
            inputValue:"",//下拉框输入框的值
            searchValue:"",//查询字符串
            type:this.action//区分同一界面的相同组件
          }
        },
        watch:{
          selectList(value){
            this.selectDataList = value;
            this.initSelectedData(value)
          },
          isShowList(val){
            let _this =this;
            if(val){
              _this.refreshListDom();
            }
          }
        },
        methods:{
          /**
           * 功能说明：初始化已经选择的数据
           * 参数：listData-下拉框中的数据
           * */
          initSelectedData(listData){
            let _this = this;
            if(listData.length == 0){
              _this.selectedArr = [];
              _this.inputValue = "";
              return;
            }
            //获取已经选择的数据
            _this.selectedArr = listData.filter(function (val,index,arr) {
              return val[_this.defaultCfg.isSelectedFlag] ===true
            });
            /*更新输入框*/
            let tempArr = [];
            tempArr = _this.selectedArr.map(function (val,index,arr) {
             return val[_this.defaultCfg.view];
            });
            //更新输入框中的值
            _this.inputValue = tempArr.join(",");
          },
          /*
           *功能说明：初始化多选择组件的基本样式
           * */
          initStyle(){
            let _this = this;
            let basicStyle = _this.defaultCfg;
            //输入框的宽度
            document.getElementById(_this.inputID).style.width = basicStyle.width;
            //下拉框的宽度、高度
            document.getElementById(_this.listDomID).style.width = basicStyle.width;
            document.getElementById(_this.listDomID).style.height = basicStyle.listHeight;
          },
          /*
          * 功能说明：点击选项时的点击事件
          * 参数：item-选择的数据
          * */
          selectedList(item){
            let _this = this;
            //校验当前选择的个数
            //缓存选择的数据
            if(_this.isSelectMultiple){
              if(item.isSelected){
                if(_this.selectedArr.length <= _this.defaultCfg.minSelect){
                  alert("至少选择"+_this.defaultCfg.minSelect+"条数据。");
                  return true;
                }
                //改变选择的数据的样式：隐藏对勾
                item.isSelected = false;
                //如果未选择当前数据，则从selectedArr中删除
                _this.selectedArr = _this.selectedArr.filter(function (val,index,arr) {
                  return val[_this.defaultCfg.view]!=item[_this.defaultCfg.view]
                });
              }
              else{
                if(_this.selectedArr.length>=_this.defaultCfg.maxSelect){
                  alert("最多只能选择"+_this.defaultCfg.maxSelect+"条数据。");
                  return true;
                }
                //改变选择的数据的样式：出现对勾
                item.isSelected = true;
                _this.selectedArr.push(item);
              }
              /*更新输入框*/
              let tempArr = [];
              tempArr = _this.selectedArr.map(function (val,index,arr) {
                return val[_this.defaultCfg.view]
              });
              _this.inputValue = tempArr.join(",");
            }
            else{
              //所有数据设置为未选
              for(let i=0;i<_this.selectDataList.length;i++){
                _this.selectDataList[i].isSelected = false;
              }
              _this.selectedArr = item;
              item.isSelected = !item.isSelected;
              _this.inputValue = _this.selectedArr[_this.defaultCfg.view];
              //隐藏下拉框
              _this.isShowList = false;
            }
            _this.$emit("getSelectedData",_this.selectedArr,this.type);
          },
          /*
          * 功能说明：下拉框显隐控制
          * */
          showListDom_control(){
            let _this=this;
            let e = event ||window.event;
            let currentDom = e.currentTarget;
            //更新listDom的位置
            if(_this.isShowList)
            {
              //如果当前是展开下拉框，则下拉框收起，图标变成向下
              _this.isShowList =false;
              currentDom.className = "selectList_collapse";
            }
            else
            {
              //如果当前是收起下拉框，则下拉框展开，图标变成向上
              _this.isShowList =true;
              currentDom.className = "selectList_expend";
              //更新下拉框数据
              _this.getListData();
            }
          },
          /*
          * 功能说明：输入框focus事件
          * */
          inputFocus_control(){
            let _this = this;
            let e=event||window.event;
            let currentDom = e.currentTarget;
            let expendDom = currentDom.nextSibling.nextSibling;
            //更新dom
            if(!_this.isShowList)
            {
              //如果当前是展开下拉框，则下拉框收起，图标变成向下
              _this.isShowList =true;
              expendDom.className = "selectList_expend";
            }
            //更新下拉框数据
            _this.getListData();
          },
          /*
          * 功能说明：实现查询功能
          * 参数：val-查询输入框的值
          * */
          searchData(val){
            let _this = this;
            //查询字段
            let searchVal =_this.defaultCfg.isSelectMultiple? _this.searchValue:_this.inputValue;
            if(searchVal ==""){
              //如果查询字段是空，则返回所有数据
              _this.selectDataList = _this.selectList;
            }else{
              if(_this.defaultCfg.obscureSearch){
                //模糊查询-大小写不敏感
                _this.selectDataList = _this.selectDataList.filter(function (val,index,arr) {
                  let viewText = val[_this.defaultCfg.view].toLowerCase();
                  let searchValToLower = searchVal.toLowerCase();
                  if(viewText.indexOf(searchValToLower)>-1){
                    return true;
                  }else{
                    return false
                  }
                });
              }else{
                //精确查询
                _this.selectDataList = _this.selectDataList.filter(function (val,index,arr) {
                    return searchVal === val[_this.defaultCfg.view]
                });
              }
            }
            //传入到父组件
            _this.$emit("getSelectedData",searchVal,_this.type);
          },
          /*
          * 更新下拉框位置
          * */
          refreshListDom(){
            let _this = this;
            //获取input的dom的位置
            let inputDom = document.getElementById(_this.inputID);
            let input_top = inputDom.offsetTop;
            let input_left = inputDom.offsetLeft;
            let selectListDom = document.getElementById(_this.listDomID);
            //34、是input的高度
            selectListDom.style.top = 34+input_top+"px";
            selectListDom.style.left = input_left+"px";
          },
          /*
          * 功能说明：获取下拉框中的值
          * */
          getListData(){
            let _this = this;
            let params = Object.assign({},_this.config.params);
            _this.$http.get(params.url).then((response)=>{
                /*置空下拉框数组*/
                _this.selectDataList = [];
                /*获取商品编号列表*/
                let shopIDListArr = response.data.data;
                let tempArr = shopIDListArr.map(function (val,index,arr) {
                  return {
                    text:val.value+'['+val.text+']',
                    value:val.value,
                    isSelected:val.isSelected
                  }
                });
                _this.selectDataList = [...tempArr];
            });
          },
          /*
          * 功能说明：清空选择输入框
          * */
          clearSelect(){
            let _this = this;
            let id = "#"+_this.inputID;
            $(id).val("");
          }
        },
        created(){
          let _this = this;
          Object.assign(_this.defaultCfg,_this.config);
          _this.selectDataList = _this.selectList
        },
        mounted(){
          let _this = this;
          /*初始化多选择组件的基本样式*/
          _this.initStyle();
          /*初始化已经选择的数据*/
          _this.initSelectedData( _this.selectDataList);
        }
    }
</script>

<style scoped>
  @import "../../assets/css/selectMultiple/selectMultiple.css";
</style>
