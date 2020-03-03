<template>
  <v-card>
    <v-card-title>
      <v-btn @click="addBrand" color="primary">新增电影</v-btn>
      <v-spacer/>
      <v-text-field
        append-icon="search"
        label="搜索"
        single-line
        hide-details
        v-model="search"
      />
    </v-card-title>
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
        <td class="text-xs-center">{{ props.item.releaseDate }}</td>
        <td class="text-xs-center">{{ props.item.language }}</td>
        <td class="text-xs-center">{{ props.item.genre }}</td>
        <td class="justify-center layout px-0">
          <v-btn icon @click="editBrand(props.item)">
            <i class="el-icon-edit"/>
          </v-btn>
          <v-btn icon @click="deleteBrand(props.item)">
            <i class="el-icon-delete"/>
          </v-btn>
        </td>
      </template>
      <template slot="expand" slot-scope="props">
        <v-card flat>
          <v-card-text>Peek-a-boo!</v-card-text>
        </v-card>
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

    <v-dialog v-model="show" max-width="600" scrollable v-if="show">
      <v-card>
        <v-toolbar dark dense color="primary">
          <v-toolbar-title>{{isEdit ? '修改电影' : '新增电影'}}</v-toolbar-title>
          <v-spacer/>
          <v-btn icon @click="show = false">
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text class="px-5 py-2">
          <!-- 表单 -->
          <brand-form :oldBrand="movies" :isEdit="isEdit" @close="show = false" :reload="getDataFromApi"/>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-card>

</template>

<script>
  import BrandForm from './BrandForm'
  import {brandData} from '../../mockDB'

  export default {
    name: "brand",
    components: {
      BrandForm
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
          {text: '放映时间', align: 'center', sortable: false, value: 'releaseDate'},
          {text: '语言', align: 'center', sortable: false, value: 'language'},
          {text: '电影类型', align: 'center', sortable: false, value: 'genre'},
        ],
        show: false,// 是否弹出窗口
        movies: {}, // 品牌信息,
        brand:{},
        isEdit: false // 判断是编辑还是新增
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
        }
      },
      show(val, oldVal) {
        // 表单关闭后重新加载数据
        if (oldVal) {
          this.getDataFromApi();
        }
      }
    },
    mounted() {
      this.getDataFromApi();
    },
    methods: {
      addBrand() {
        this.brand = {};
        this.isEdit = false;
        this.show = true;
      },
      editBrand(item) {
        this.movies = item;
        this.isEdit = true;
        this.show = true;
        //console.log(this.movies)
        // 查询商品分类信息，进行回显
        // this.$http.get("/adminController/findByIdMovie/id/" + item.id)
        //   .then(resp => {
        //
        //   })

      },
      deleteBrand(item) {
        this.$message.confirm('此操作将永久删除该电影, 是否继续?').then(() => {
          // 发起删除请求
          this.$http.delete("/adminController/page?id=" + item.id,)
            .then(() => {
              // 删除成功，重新加载数据
              this.$message.success("删除成功！");
              this.getDataFromApi();
            })
        }).catch(() => {
          this.$message.info("删除已取消！");
        });

      },
      getDataFromApi() {
        this.loading = true;
        // 200ms后返回假数据
        this.$http.get("/adminController/page",{
          params:{
            page:this.pagination.page,
            name : this.search,
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

</style>
