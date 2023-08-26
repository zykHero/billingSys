<template>
    <div class="cityselect">
        <select :id="selectItems_province.id" class="form-control"
                :name="selectItems_province.name" v-model="selectedProvince" v-on:change="complete">
          <option :value="i.name" v-for="i in selectItems_province.data" v-text="i.name"></option>
        </select>
        <select :id="selectItems_city.id" class="form-control"
                :name="selectItems_city.name" v-model="selectedCity" v-on:change="complete">
          <option :value="i.name" v-for="i in selectItems_city.data" v-text="i.name"></option>
        </select>
        <select :id="selectItems_block.id" class="form-control"
                :name="selectItems_block.name" v-model="selectedBlock" v-on:change="complete">
          <option :value="i.name" v-for="i in selectItems_block.data" v-text="i.name"></option>
        </select>
    </div>
</template>

<script>
    import provinces from "../assets/city/china/provinces"
    export default {
        name: "city-select",
        data(){
          return {
              selectItems_province:
              {
                  id:"province_select",
                  name:"province",
                  data :[]
              },
              selectItems_city:
              {
                  id:"city_select",
                  name:"city",
                  data:[]
              },
              selectItems_block:
              {
                  id:"block_select",
                  name:"block",
                  data :[]
              },
              selectedProvince:"",//下拉框当前选择的数据
              selectedCity:"",
              selectedBlock:"",
              allProvince:[],//存放当前下拉框的数据
              allCity:[],
              allBlock:[],
              isSelect:true//判断是给select赋值还是选择。true-选择；false-赋值
          }
        },
        /*父组件向子组件传值*/
        props:{
          partentObj:{
            type:Object,
            default(){
              return {};
            }
          },
          /*商品地址*/
          sour:{
            type:Object,
            default(){
              return {};
            }
          }
        },
        methods:{
          /*把省份、城市、县级区分开*/
          getSelectItems(){
            let _this = this;
            let len = provinces.length;
            for(let i=0;i<len;i++){
              switch (provinces[i].level){
                case 1:
                {
                  _this.allProvince.push(provinces[i]);
                  break;
                }
                case 2:
                {
                  _this.allCity.push(provinces[i]);
                  break;
                }
                case 3:
                {
                  _this.allBlock.push(provinces[i]);
                  break;
                }
                default:{
                  break;
                }
              }
            }
            //向下拉框存入省份
            _this.selectItems_province.data = [].concat(_this.allProvince);
          },
          /*获取组件选择的省份、市级、县级的值*/
          complete(){
            let _this = this;
            _this.isSelect = true;
            let dataObj = {
              provice: _this.selectedProvince,
              city:_this.selectedCity,
              block : _this.selectedBlock
            };
            this.$emit("getSelectData",dataObj);
          },
          /*获取父级传递的数据（省、市、县）*/
          getParentData(){
            let _this = this;
            _this.isSelect = false;
            _this.selectedProvince = this.sour.provice;
            _this.selectedCity = this.sour.city;
            _this.selectedBlock = this.sour.block;
          }
        },
        watch:{
          /*监听省份的数据变化*/
          selectedProvince(newData,oldData){
              let _this = this;
              let len_allProvince = _this.allProvince.length;
              let len_allCity = _this.allCity.length;
              let provinceObj = {};
              /*制空市级、县级*/
              _this.selectItems_city.data = [];
              _this.selectItems_block.data = [];
              if(_this.isSelect){
                /*选择时需要置空市级、县级选择框*/
                _this.selectedCity = "";
                _this.selectedBlock = "";
              }
              //通过当前选择的省份，在所有省份里找到对应省份数据对象
              for(let i =0;i<len_allProvince;i++){
                  if(newData == _this.allProvince[i].name){
                    provinceObj = _this.allProvince[i];
                    break;
                  }
              }
              //通过省份的对象，在所有城市里找到对应省份下的城市
              for(let j=0;j<len_allCity;j++){
                  if(_this.allCity[j].sheng == provinceObj.sheng){
                      _this.selectItems_city.data.push(_this.allCity[j]);
                  }
              }
          },
          /*监听市级的数据变化*/
          selectedCity(newData,oldData){
            let _this = this;
            let len_allCity = _this.allCity.length;
            let len_allBlock = _this.allBlock.length;
            let cityObj = {};
            /*制空县级*/
            _this.selectItems_block.data = [];
            if(_this.isSelect){
              /*选择时需要置空县级选择框*/
              _this.selectedBlock = "";
            }
            /*在全部城市的数组中，获取当前选择的城市数据对象*/
            for(let i =0;i<len_allCity;i++){
                if(newData == _this.allCity[i].name){
                  cityObj = _this.allCity[i];
                }
            }
            /*通过当前市级数据，查询其下的县级*/
            for(let j=0;j<len_allBlock;j++){
                if(_this.allBlock[j].sheng ==cityObj.sheng
                  && _this.allBlock[j].di == cityObj.di){
                   _this.selectItems_block.data.push(_this.allBlock[j]);
                }
            }
          },
          /*监听父级传递过来的数据*/
          sour(){
            this.getParentData();
          }
        },
       /*创建html的dom之后，数据初始化*/
        mounted(){
          let _this = this;
          /*获取省级、市级、县级数据*/
          _this.getSelectItems();
        }
    }
</script>

<style scoped>
  @import "../assets/css/city-select.css";
</style>
