<template>
  <div class="todo-container">
    <div class="todo-header">
      <h1>我的待办</h1>
      <div class="todo-stats">
        <div class="stat-item">
          <span class="stat-label">待完成</span>
          <span class="stat-value">{{ activeCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">已完成</span>
          <span class="stat-value">{{ completedCount }}</span>
        </div>
      </div>
    </div>

    <div class="todo-input">
      <a-input
        v-model="newTodo"
        placeholder="添加新的待办事项..."
        @keyup.enter="handleAddTodo"
      >
        <template #append>
          <a-button type="primary" @click="handleAddTodo">
            <template #icon><icon-plus /></template>
            添加
          </a-button>
        </template>
      </a-input>
    </div>

    <div class="todo-list">
      <a-list :data="todos" :loading="false">
        <template #item="{ item, index }">
          <!-- 
            拖拽相关属性说明：
            draggable="true" - 使元素可拖动
            @dragstart - 开始拖动时触发
            @dragend - 拖动结束时触发
            @dragover.prevent - 阻止默认行为，允许放置
            @dragenter.prevent - 进入目标区域时触发
          -->
          <div 
            class="todo-item" 
            :class="{ 
              'is-completed': item.completed, 
              'is-dragging': draggedItem === item  // 拖动时添加样式
            }" 
            draggable="true"
            @dragstart="handleDragStart($event, item, index)"
            @dragend="handleDragEnd"
            @dragover.prevent
            @dragenter.prevent="handleDragEnter($event, index)"
          >
            <!-- 拖动手柄 -->
            <div class="todo-drag-handle">
              <icon-drag-dot-vertical />
            </div>
            <div class="todo-checkbox">
              <a-checkbox
                :model-value="item.completed"
                @change="() => handleToggle(item.id)"
              />
            </div>
            <div class="todo-content" :class="{ completed: item.completed }">
              <template v-if="!editingItem || editingItem.id !== item.id">
                <span class="todo-text">{{ item.content }}</span>
                <span class="todo-date">{{ new Date(item.createdAt).toLocaleDateString() }}</span>
              </template>
              <a-input
                v-else
                v-model="editingContent"
                @blur="handleEditBlur(item)"
                @keyup.enter="handleEditBlur(item)"
                ref="editInput"
              />
            </div>
            <div class="todo-actions">
              <a-button
                type="text"
                size="small"
                @click="startEdit(item)"
                v-if="!editingItem || editingItem.id !== item.id"
              >
                <template #icon><icon-edit /></template>
              </a-button>
              <a-button
                type="text"
                status="danger"
                size="small"
                @click="() => handleDelete(item.id)"
              >
                <template #icon><icon-delete /></template>
              </a-button>
            </div>
          </div>
        </template>
      </a-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, toRefs } from 'vue'
import { useTodoStore } from '@/stores/todo'
import { IconEdit, IconDelete, IconPlus, IconDragDotVertical } from '@arco-design/web-vue/es/icon'

const todoStore = useTodoStore()
const { todos, activeCount, completedCount } = toRefs(todoStore)
const { addTodo, deleteTodo, toggleTodo, editTodo } = todoStore

const newTodo = ref('')
const editInput = ref<HTMLInputElement | null>(null)
const editingItem = ref<any>(null)
const editingContent = ref('')

/**
 * 拖拽相关的状态管理
 * draggedItem: 当前被拖动的项目
 * dragOverIndex: 当前拖动到的位置索引
 */
const draggedItem = ref<any>(null)
const dragOverIndex = ref<number>(-1)

// 添加待办事项
const handleAddTodo = () => {
  if (newTodo.value.trim()) {
    addTodo(newTodo.value.trim())
    newTodo.value = ''
  }
}

// 删除待办事项
const handleDelete = (id: number) => {
  deleteTodo(id)
}

// 切换完成状态
const handleToggle = (id: number) => {
  toggleTodo(id)
}

// 开始编辑
const startEdit = (item: any) => {
  editingItem.value = { ...item }
  editingContent.value = item.content
  nextTick(() => {
    editInput.value?.focus()
  })
}

// 完成编辑
const handleEditBlur = (item: any) => {
  if (editingContent.value.trim()) {
    editTodo(item.id, editingContent.value.trim())
  }
  editingItem.value = null
  editingContent.value = ''
}

/**
 * 处理拖动开始事件
 * @param event DragEvent 拖动事件对象
 * @param item 被拖动的待办项
 * @param index 被拖动项的索引
 */
const handleDragStart = (event: DragEvent, item: any, index: number) => {
  // 记录被拖动的项目
  draggedItem.value = item
  
  // 设置拖动效果
  if (event.dataTransfer) {
    // 设置允许的效果为"移动"
    event.dataTransfer.effectAllowed = 'move'
    // 存储拖动项的索引，用于确定位置
    event.dataTransfer.setData('text/plain', index.toString())
  }
}

/**
 * 处理拖动结束事件
 * 清除拖动状态
 */
const handleDragEnd = () => {
  draggedItem.value = null
  dragOverIndex.value = -1
}

/**
 * 处理拖动进入新位置事件
 * 实现项目重新排序
 * @param event DragEvent 拖动事件对象
 * @param index 目标位置的索引
 */
const handleDragEnter = (event: DragEvent, index: number) => {
  // 如果没有拖动项或者位置没有变化，直接返回
  if (!draggedItem.value || dragOverIndex.value === index) return
  
  // 更新当前拖动到的位置
  dragOverIndex.value = index
  
  // 获取被拖动项在数组中的当前位置
  const currentIndex = todos.value.indexOf(draggedItem.value)
  
  // 如果位置发生变化，进行重新排序
  if (currentIndex !== index) {
    // 创建新数组以保持响应性
    const updatedTodos = [...todos.value]
    // 从原位置删除项目
    updatedTodos.splice(currentIndex, 1)
    // 在新位置插入项目
    updatedTodos.splice(index, 0, draggedItem.value)
    // 更新待办事项数组
    todos.value = updatedTodos
    
    // 保存到本地存储以持久化
    localStorage.setItem('todos', JSON.stringify(updatedTodos))
  }
}
</script>

<style scoped>
.todo-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 3rem 2rem;
  min-height: 100vh;
}

.todo-header {
  text-align: center;
  margin-bottom: 3rem;
}

.todo-header h1 {
  color: #1d2129;
  margin-bottom: 1.5rem;
  font-size: 2.5rem;
  font-weight: 600;
  background: linear-gradient(135deg, #1d2129 0%, #4080ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
}

.todo-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.stat-label {
  color: #86909c;
  font-size: 0.9rem;
}

.stat-value {
  color: #1d2129;
  font-size: 1.5rem;
  font-weight: 600;
}

.todo-input {
  margin-bottom: 2rem;
}

:deep(.arco-input-group) {
  border: 2px solid #e5e6eb;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  transition: all 0.3s ease;
}

:deep(.arco-input-group:hover),
:deep(.arco-input-group:focus-within) {
  border-color: #4080ff;
  box-shadow: 0 0 0 3px rgba(64, 128, 255, 0.1);
}

:deep(.arco-input) {
  height: 48px;
  font-size: 1rem;
  padding: 0 1.2rem;
  border: none !important;
  background: transparent !important;
}

:deep(.arco-input::placeholder) {
  color: #c9cdd4;
}

:deep(.arco-input-group-append) {
  padding: 0;
  border: none;
  background: transparent;
}

:deep(.arco-input-group-append .arco-btn) {
  height: 48px;
  padding: 0 1.5rem;
  font-size: 1rem;
  border-radius: 0;
  background: #4080ff;
  border: none;
  color: white;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

:deep(.arco-input-group-append .arco-btn:hover) {
  background: #165dff;
}

.todo-list {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.todo-item {
  display: flex;
  align-items: center;
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid #e5e6eb;
  transition: all 0.3s ease;
  cursor: move;
  background: #fff;
}

.todo-item.is-dragging {
  opacity: 0.5;
  background: #f2f3f5;
}

.todo-drag-handle {
  display: flex;
  align-items: center;
  margin-right: 1rem;
  color: #c9cdd4;
  cursor: move;
}

.todo-drag-handle:hover {
  color: #86909c;
}

.todo-item.is-completed {
  background: #f7f8fa;
}

.todo-checkbox {
  margin-right: 1rem;
}

:deep(.arco-checkbox) {
  border-radius: 6px;
}

.todo-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.todo-text {
  font-size: 1rem;
  color: #1d2129;
  transition: all 0.3s ease;
}

.todo-date {
  font-size: 0.85rem;
  color: #c9cdd4;
}

.todo-content.completed .todo-text {
  text-decoration: line-through;
  color: #c9cdd4;
}

.todo-actions {
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: all 0.3s ease;
}

.todo-item:hover .todo-actions {
  opacity: 1;
}

:deep(.arco-btn-text) {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: #4e5969;
}

:deep(.arco-btn-text:hover) {
  color: #4080ff;
  background: rgba(64, 128, 255, 0.1);
}

:deep(.arco-btn-status-danger) {
  color: #f53f3f;
}

:deep(.arco-btn-status-danger:hover) {
  color: #f53f3f;
  background: rgba(245, 63, 63, 0.1);
}

:deep(.arco-list-item:last-child .todo-item) {
  border-bottom: none;
}
</style> 