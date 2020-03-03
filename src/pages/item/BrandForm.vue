<template>
  <v-form v-model="valid" ref="brandForm">
    <v-text-field
      label="电影名称"
      v-model="movie.name"
      :rules="[v => !!v || '电影名称不能为空']"
      :counter="10"
      required
    />
    <v-select
      :items="tagnamelist"
      v-model="movie.tagId"
      label="影院名称"
      item-text="name"
      item-value="id"
    ></v-select>
    <v-text-field
      label="上映时间"
      v-model="movie.releaseDate"
      required
    />
    <v-text-field
      label="导演"
      v-model="movie.director"
      required
    />
    <v-text-field
      label="语种"
      v-model="movie.language"
      required
    />

    <v-layout class="my-4">
      <v-btn @click="submit" color="primary">提交</v-btn>
      <v-btn @click="clear" color="warning">重置</v-btn>
    </v-layout>
  </v-form>
</template>

<script>
  import config from '@/config';
  export default {
    name: "brand-form",
    props: {

      oldBrand: Object,
      isEdit: {
        type: Boolean,
        default: false
      },
      show: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        baseUrl: config.api,
        valid:false,
        movie: {
          id: 0,
          name: "",
          releaseDate: "",
          language: "",
          director: "",
          tagId: null,
        },
        tagnamelist:[],
        imageDialogVisible:false
      }
    },
    // watch: {
    //   oldBrand:{
    //     deep:true,
    //     handler(val){
    //       //this.movie =  Object.deepCopy(val)
    //       //console.log("1111"+Object.deepCopy(val))
    //       console.log(val)
    //       Object.deepCopy(val,this.movie);
    //     }
    //   }
    // },
    mounted(){

      this.$http.get("/ShowController/getOneTagSelect" ).then(resp => {
        this.tagnamelist = resp.data;
      })
      if(this.isEdit){
        this.movie.id = this.oldBrand.id
        this.movie.name = this.oldBrand.name
        this.movie.releaseDate = this.oldBrand.releaseDate
        this.movie.language = this.oldBrand.language
        this.movie.director = this.oldBrand.director
      }
      console.log(this.movie)
    },
    methods: {
      submit() {
        // 表单校验
        if (this.$refs.brandForm.validate()) {
          debugger;
          // console.log(this.brand.categories)
          // this.brand.categories = this.brand.categories.map(c => c.id).join(",");
          // console.log(this.brand.categories)
          // this.brand.letter = this.brand.letter.toUpperCase();
          // 将数据提交到后台
         // data:  this.$qs.stringify(this.goods)
          this.$http({
            method: this.isEdit ? 'put' : 'post',
            url: '/adminController/insertMovie',
            data: this.$qs.stringify(this.movie)
          }).then(() => {
            // 关闭窗口
            this.$message.success("保存成功！");
           // this.$parent.$parent.$children[0].$children[0].selectedZhxxLy(res.data);
            this.closeWindow();
            this.$emit("reload");
            //this.$parent.getDataFromApi();
          }).catch(() => {
            this.$message.error("保存失败！");
          });
        }
      },
      clear() {
        // 重置表单
        this.$refs.brandForm.reset();
        this.categories = [];
      },
      // 图片上传出成功后操作
      handleImageSuccess(res) {
        this.brand.image = res;
      },
      removeImage(){
        this.brand.image = "";
      },
      closeWindow(){
        this.$emit("close");
      }
    }
  }
</script>

<style scoped>

</style>
