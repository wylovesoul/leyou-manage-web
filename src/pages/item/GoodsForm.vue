<template>
  <v-stepper :value="step">
    <v-stepper-header>
      <v-stepper-step step="1" :complete="step > 1">基本信息</v-stepper-step>
      <v-divider/>
<!--      <v-stepper-step step="2" :complete="step > 2">商品描述</v-stepper-step>
      <v-divider/>
      <v-stepper-step step="3" :complete="step > 3">规格参数</v-stepper-step>
      <v-divider/>
      <v-stepper-step step="4">SKU属性</v-stepper-step>-->
    </v-stepper-header>
    <v-stepper-items>
      <!--基本信息的表单-->
      <v-stepper-content step="1">
        <v-layout justify-center>
          <v-flex xs10>
            <v-form v-model="valid" ref="basic">
              <v-layout row>
                <v-flex xs5>
                  <v-select
                    :items="movielist"
                    v-model="goods.movieId"
                    label="电影名称"
                    item-text="name"
                    item-value="id"
                  ></v-select>
                  <!--<el-select v-model="value" placeholder="请选择">
                    <el-option
                      v-for="item in movielist"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id">
                    </el-option>
                  </el-select>-->
              <!--  <v-cascader url="/adminController/selectMovie" v-model="goods.movieId"
                              required show-all-levels label="电影名称"/>-->

                </v-flex>
                  <v-flex offset-xs2 xs5>
                    <!--<v-select
                      :items="tagnamelist"
                      v-model="goods.tagname"
                      label="影院名称"
                      item-text="name"
                      item-value="id"
                    ></v-select>-->
                   <!-- <v-cascader url="/ShowController/getOneTagSelect" v-model="goods.tagname"
                                required show-all-levels label="电影主题"/>-->
                </v-flex>
              </v-layout>

              <v-text-field label="开始时间" v-model="goods.time" :counter="200" required
                            :rules="[v => !!v || '商品标题不能为空']"/>
              <v-text-field label="价格" v-model="goods.price" :counter="200"/>
              <v-layout row>
                <v-flex xs3>
                </v-flex>
                <v-layout class="my-4">
                  <v-btn @click="submit" color="primary">提交</v-btn>
                  <v-btn @click="clear" color="warning">重置</v-btn>
                </v-layout>
                <v-flex>
                </v-flex>
              </v-layout>

            </v-form>
          </v-flex>
        </v-layout>
      </v-stepper-content>
    </v-stepper-items>
  </v-stepper>
</template>

<script>
  import 'quill/dist/quill.core.css'
  import 'quill/dist/quill.snow.css'
  import 'quill/dist/quill.bubble.css'

  import {quillEditor} from 'vue-quill-editor'

  export default {
    name: "goods-form",
    components: {
      quillEditor
    },
    props: {
      step: {
        type: Number,
        default: 1,
      },
      isEdit: {
        type: Boolean,
        default: false
      },
      oldGoods: Object
    },
    data() {
      return {
        valid: false,
        editorOption: {// 富文本编辑器配置
          placeholder: '编写商品描述信息，让客户了解你的商品'
        },
        brandOptions: [],// 品牌的待选项
        specifications: [],// 规格参数模板
        template: [],// 特有规格属性模板
        skuTemplate: [],// sku特有属性模板
        skus: [],
        headers: [],// 表头
        goods: {
          movieId: null,// 选中的商品分类id数组
          tagname: null,
          time: '',
          price: '',
        },
        movielist:[],
        tagnamelist:[],
        value: ''
      }
    },
    mounted(){
      this.$http.get("/adminController/selectMovie" ).then(resp => {
        this.movielist = resp.data;
      }),
        this.$http.get("/ShowController/getOneTagSelect" ).then(resp => {
          this.tagnamelist = resp.data;
        })
    }
    ,
    methods: {
      deleteOption(i, j) {
        this.skuTemplate[i].options.splice(j, 1);
      },
      loadSku(src, dest, i, o) {
        const t = src[i];
        for (let x = 0; x < t.options.length; x++) {
          const obj = {};
          obj[t.k] = t.options[x];
          Object.assign(obj, o);
          if (i === src.length - 1) {
            obj.indexes += x;
            dest.push(obj);
          } else {
            obj.indexes += x + '_';
            this.loadSku(src, dest, i + 1, obj);
          }
        }
      },

      submit() {
        // 发起请求
        this.$http({

          url: "/adminController/insert",
          method: this.isEdit ? "put" : "post",
          data:  this.$qs.stringify(this.goods)
        })
          .then(() => {
            this.$message.success("提交商品成功！");
            this.$emit("closeForm")
          })
          .catch((e) => {
            console.log(e)
            this.$message.error("提交商品失败！");
            this.$emit("closeForm")
          })
      }
    },
    watch: {
      oldGoods: {
        deep: true,
        handler(val) {
          if (val == null || !this.isEdit) {
            return;
          }
          // 实现数据回显
          Object.deepCopy(val, this.goods)
        }
      },
      'goods.categories': {
        deep: true,
        handler(val) {
          // 根据分类加载品牌信息
          this.$http.get("/item/brand/cid/" + val[2].id)
            .then(resp => {
              this.brandOptions = resp.data;
            })
          // 根据分类加载规格参数
          this.$http.get("/item/spec/" + val[2].id)
            .then(resp => {
              this.specifications = resp.data;
              this.template = [];
              this.skuTemplate = [];
              // 过滤出SKU属性
              for (let i = 0; i < this.specifications.length; i++) {
                const params = this.specifications[i].params;
                let x = params.length;
                for (let j = 0; j < params.length; j++) {
                  const p = params[j];
                  if (!p.global) {
                    this.template.push({
                      k:p.k,
                      options:p.options
                    })
                    this.skuTemplate.push({
                      k:p.k,
                      options:[]
                    });
                    x--;
                  }
                  if (this.isEdit) {
                    p.v = this.goods.spuDetail.specifications[i].params[j].v;
                  }
                }
                if (x === 0) {
                  // 标记当前分组下的全局属性为空
                  this.specifications[i]['empty'] = true;
                }
              }
              // 判断是否修改，需要回显数据
              if (this.isEdit) {
                this.skuTemplate.forEach(t => {
                  t.options = this.goods.spuDetail.specTemplate[t.k]
                });
              }
            })
        }
      },
      skuTemplate: {
        deep: true,
        handler(val) {
          const src = val.filter(v => v.options.length > 0);
          if (src.length <= 0) {
            return;
          }
          this.headers = [];
          this.skus = [];
          this.loadSku(src, this.skus, 0, {
            price: null,
            stock: null,
            indexes: '',
            enable: false
          });
          // 处理回显
          if (this.isEdit) {
            // 查询sku
            this.$http.get("/item/goods/sku/list", {
              params: {
                id: this.goods.id
              }
            }).then(resp => {
              // 处理SKU
              this.skus.forEach(sku => {
                resp.data.forEach(s => {
                  if (sku.indexes === s.indexes) {
                    sku.id = s.id;
                    sku.price = this.$format(s.price);
                    sku.stock = s.stock.stock;
                    sku.images = s.images.split(",");
                    sku.enable = s.enable;
                  }
                })
              })
            })
          }
          // 生成表内容
          this.headers = [
            {text: 'price', align: 'center', sortable: false, value: 'name'},
          ]
          // 生成表头
          this.headers = [];
          if (this.skus.length > 0) {
            Object.keys(this.skus[0]).forEach(text => {
              let width = "80";
              if (text == "indexes") {
                return
              }
              if (text == "price") {
                text = "价格";
                width = "50";
              } else if (text == "stock") {
                text = "库存";
                width = "50";
              } else if (text == "enable") {
                text = "是否启用";
                width = "30";
              }
              this.headers.push({
                text,
                align: 'center',
                sortable: false,
                value: text,
                width
              })
            })
          }
        }
      }
    }
  }
</script>

<style scoped>

</style>
