import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface TodoItem {
  id: number
  content: string
  completed: boolean
  createdAt: number
}

export const useTodoStore = defineStore('todo', () => {
  // 从本地存储获取数据
  const getStoredTodos = () => {
    const stored = localStorage.getItem('todos')
    return stored ? JSON.parse(stored) : []
  }

  // 保存到本地存储
  const saveToStorage = (todos: TodoItem[]) => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }

  // 使用 ref 创建响应式数据
  const todos = ref<TodoItem[]>(getStoredTodos())
  
  // 添加待办事项
  const addTodo = (content: string) => {
    const newTodo: TodoItem = {
      id: Date.now(),
      content,
      completed: false,
      createdAt: Date.now()
    }
    // 使用 push 方法添加新项，这样会触发响应式更新
    todos.value.push(newTodo)
    saveToStorage(todos.value)
  }

  // 删除待办事项
  const deleteTodo = (id: number) => {
    // 使用 splice 方法删除项，这样会触发响应式更新
    const index = todos.value.findIndex(todo => todo.id === id)
    if (index !== -1) {
      todos.value.splice(index, 1)
      saveToStorage(todos.value)
    }
  }

  // 切换完成状态
  const toggleTodo = (id: number) => {
    // 直接修改对象的属性，Vue 会追踪到变化
    const todo = todos.value.find(todo => todo.id === id)
    if (todo) {
      todo.completed = !todo.completed
      saveToStorage(todos.value)
    }
  }

  // 编辑待办事项
  const editTodo = (id: number, content: string) => {
    // 直接修改对象的属性，Vue 会追踪到变化
    const todo = todos.value.find(todo => todo.id === id)
    if (todo) {
      todo.content = content
      saveToStorage(todos.value)
    }
  }

  // 计算属性：未完成的数量
  const activeCount = computed(() => {
    return todos.value.filter(todo => !todo.completed).length
  })

  // 计算属性：已完成的数量
  const completedCount = computed(() => {
    return todos.value.filter(todo => todo.completed).length
  })

  return {
    todos,
    addTodo,
    deleteTodo,
    toggleTodo,
    editTodo,
    activeCount,
    completedCount
  }
}, {
  persist: {
    key: 'todos',
    storage: localStorage
  }
}) 