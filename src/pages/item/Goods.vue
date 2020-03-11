<template>
  <v-card>
    <v-toolbar class="elevation-0">
      <v-btn @click="addItem" color="primary">新增商品</v-btn>
      <v-spacer/>
      <!--<v-flex xs3>
        状态：
        <v-btn-toggle mandatory v-model="search.saleable">
          <v-btn flat>
            全部
          </v-btn>
          <v-btn flat :value="true">
            上架
          </v-btn>
          <v-btn flat :value="false">
            下架
          </v-btn>
        </v-btn-toggle>
      </v-flex>-->
      <v-flex xs3>
        <v-text-field
          append-icon="search"
          label="搜索"
          single-line
          hide-details
          v-model="search"
        />
      </v-flex>
    </v-toolbar>
    <v-divider/>
    <v-data-table
      :headers="headers"
      :items="items"
      :pagination.sync="pagination"
      :total-items="totalItems"
      :loading="loading"
      class="elevation-1"
    >
      <template slot="items" slot-scope="props">
        <td class="text-xs-center">{{ props.item.id }}</td>
        <td class="text-xs-center">{{ props.item.name }}</td>
        <td class="text-xs-center">{{ props.item.time }}</td>
        <td class="text-xs-center">{{ props.item.price}}</td>
        <td class="text-xs-center">{{ props.item.shouchu }}</td>
        <td class="text-xs-center">{{ props.item.sum }}</td>
        <td class="justify-center layout px-0">
          <v-btn icon small @click="editItem(props.item)">
            <i class="el-icon-edit"/>
          </v-btn>
          <v-btn icon small @click="deleteItem(props.item.id)">
            <i class="el-icon-delete"/>
          </v-btn>
        <!--  <v-btn icon small v-if="props.item.saleable">下架</v-btn>
          <v-btn icon v-else>上架</v-btn>-->
        </td>
      </template>
      <template slot="no-data">
        <v-alert :value="true" color="error" icon="warning">
          对不起，没有查询到任何数据 :(
        </v-alert>
      </template>
      <template slot="pageText" slot-scope="props">
        共{{props.itemsLength}}条,当前:{{ props.pageStart }} - {{ props.pageStop }}
      </template>
    </v-data-table>

    <v-dialog v-if="show" v-model="show" max-width="900" scrollable persistent>
      <v-card>
        <v-toolbar dense dark color="primary">
          <v-toolbar-title>{{isEdit ? '修改商品' : '新增商品'}}</v-toolbar-title>
          <v-spacer/>
          <v-btn icon @click="closeForm">
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text style="height: 600px;">
          <!-- 表单 -->
          <goods-form :oldGoods="selectedGoods" :isEdit="isEdit" :step="step" ref="goodsForm" @closeForm="closeForm"/>
        </v-card-text>
      <!--  <v-card-actions>
          <v-layout row justify-center>
            <v-flex xs2>
              <v-btn :disabled="step === 1" @click="lastStep">上一步</v-btn>
            </v-flex>
            <v-flex xs2>
              <v-btn :disabled="step === 4" color="primary" @click="nextStep">下一步</v-btn>
            </v-flex>
          </v-layout>
        </v-card-actions>-->
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
  import GoodsForm from './GoodsForm'
  import {goodsData} from "../../mockDB";

  export default {
    name: "item",
    components: {
      GoodsForm
    },
    data() {
      return {
        search: '',// 过滤字段
        totalItems: 0,// 总条数
        items: [],// 表格数据
        loading: true,
        pagination: {},// 分页信息
        headers: [// 表头
          {text: 'id', align: 'center', value: 'id'},
          {text: '电影名称', align: 'center', sortable: false, value: 'name'},
          {text: '开始时间', align: 'center', sortable: false, value: 'time'},
          {text: '价格', align: 'center', value: 'price', sortable: true,},
          {text: '售出', align: 'center', value: 'shouchu', sortable: false},
          {text: '总座位', align: 'center', value: 'sum', sortable: false}
        ],
        show: false,// 是否弹出窗口
        selectedGoods: null, // 选中的商品信息
        isEdit: false, // 判断是编辑还是新增
        step: 1// 表单中的导航条
      }
    },
    watch: {
      pagination: {
        handler() {
          this.getDataFromApi();
        },
        deep: true
      },
      search: {
        handler() {
          this.getDataFromApi();
        },
        deep: true
      }
    },
    mounted() {
      this.getDataFromApi();
    },
    methods: {
      closeForm() {
        this.isEdit = false;
        this.show = false;
        this.step = 1;
        this.selectedGoods = null;
        this.getDataFromApi();
      },
      lastStep() {
        if (this.step === 1) {
          return;
        }
        this.step--;
      },
      nextStep() {
        if (this.step === 4) {
          return;
        }
        if (this.$refs.goodsForm.$refs.basic.validate()) {
          this.step++;
        }
      },
      addItem() {
        this.selectedGoods = null;
        this.isEdit = false;
        this.show = true;
      },
      editItem(item) {
        this.selectedGoods = item;
        // this.selectedGoods = item;
        // const names = item.categoryName.split("/");
        // this.selectedGoods.categories = [
        //   {id: item.cid1, name: names[0]},
        //   {id: item.cid2, name: names[1]},
        //   {id: item.cid3, name: names[2]}
        // ];
        // // 查询商品详情
        // this.$http.get("/item/goods/spu/detail/" + item.id)
        //   .then(resp => {
        //     this.selectedGoods.spuDetail = resp.data;
        //     this.selectedGoods.spuDetail.specTemplate = JSON.parse(resp.data.specTemplate);
        //     this.selectedGoods.spuDetail.specifications = JSON.parse(resp.data.specifications);
        //   })
        this.isEdit = true;
        this.show = true;
      },
      deleteItem(id) {
        this.$message.confirm('此操作将永久删除该商品, 是否继续?')
          .then(() => {
            // 发起删除请求
            this.$http.delete("/item/goods?id=" + id)
              .then(() => {
                // 删除成功，重新加载数据
                this.getDataFromApi();
                this.$message.info('删除成功!');
              })
          })
          .catch(() => {
            this.$message.info('已取消删除');
          });

      },
      getDataFromApi() {
        this.loading = true;
        // 200ms后返回假数据
        this.$http.get("/ShowController/getShow",{
          params:{
            page:this.pagination.page,
            theaterName : this.search,
          }
        }).then(resp => { // 这里使用箭头函数
          // 将得到的数据赋值给本地属性
          this.items = resp.data;
          //this.totalItems = resp.data.total;
          // 完成赋值后，把加载状态赋值为false
          this.loading = false;
        })

      }
    }
  }
</script>

<style scoped>
  label {
    font-size: 14px;
  }
</style>
