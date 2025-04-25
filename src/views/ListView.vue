<script setup lang="ts">
import { ref } from 'vue'

interface TableData {
  key: string
  name: string
  age: number
  address: string
}

const columns = [
  {
    title: '姓名',
    dataIndex: 'name',
  },
  {
    title: '年龄',
    dataIndex: 'age',
  },
  {
    title: '地址',
    dataIndex: 'address',
  },
]

const data = ref<TableData[]>([
  {
    key: '1',
    name: '张三',
    age: 32,
    address: '北京市朝阳区',
  },
  {
    key: '2',
    name: '李四',
    age: 28,
    address: '上海市浦东新区',
  },
  {
    key: '3',
    name: '王五',
    age: 25,
    address: '广州市天河区',
  },
])

const pagination = ref({
  total: 100,
  current: 1,
  pageSize: 10,
})
</script>

<template>
  <div class="container">
    <a-card class="table-card">
      <a-space direction="vertical" size="medium" fill>
        <a-row justify="space-between">
          <a-col>
            <a-space>
              <a-input placeholder="请输入搜索关键词" allow-clear />
              <a-button type="primary">
                搜索
              </a-button>
            </a-space>
          </a-col>
          <a-col>
            <a-button type="primary">
              新增
            </a-button>
          </a-col>
        </a-row>

        <a-table 
          :columns="columns" 
          :data="data"
          :pagination="pagination"
        />
      </a-space>
    </a-card>
  </div>
</template>

<style scoped>
.container {
  padding: 20px;
}

.table-card {
  margin-top: 20px;
}

:deep(.arco-table-th) {
  background-color: var(--color-fill-2);
}
</style>