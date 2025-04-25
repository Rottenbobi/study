<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goToList = (data:string) => {
  router.push(data)
}
</script>

<template>
  <div class="home">
    <h1>欢迎来到首页</h1>
    <a-button type="primary" @click="goToList('/list')">进入列表页</a-button>
    <a-button type="primary" @click="goToList('/threeJs')">进入threeJs</a-button>
    <a-button type="primary" @click="goToList('/luckydraw')">进入抽奖页面</a-button>
    <a-button type="primary" @click="goToList('/todolist')">进入todolist</a-button>
  </div>
</template>

<style scoped>
.home {
  padding: 20px;
  text-align: center;
}
</style>