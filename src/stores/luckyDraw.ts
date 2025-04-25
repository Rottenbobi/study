import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

interface PrizeFonts {
  text: string;
  top: string;
  fontSize?: string;
  fontWeight?: string;
  fontColor?: string;
}

interface Prize {
  background: string;
  fonts: PrizeFonts[];
}

export const useLuckyDrawStore = defineStore('luckyDraw', () => {
  // 从本地存储获取数据
  const getStoredPrizes = () => {
    const stored = localStorage.getItem('luckyWheelPrizes')
    return stored ? JSON.parse(stored) : {}
  }

  // 保存到本地存储
  const saveToStorage = (prizes: Record<string, Prize[]>) => {
    localStorage.setItem('luckyWheelPrizes', JSON.stringify(prizes))
  }

  // 使用 reactive 创建响应式数据
  const prizeOptions = reactive<Record<string, Prize[]>>(getStoredPrizes())
  const currentOption = ref<string>('')
  const currentPrize = ref('')
  const showResult = ref(false)

  // 更新奖项数据
  const updatePrizes = (option: string, prizes: Prize[]) => {
    prizeOptions[option] = prizes
    saveToStorage(prizeOptions)
  }

  // 添加新标签
  const addNewTag = (tagName: string, prizes: Prize[]) => {
    prizeOptions[tagName] = prizes
    currentOption.value = tagName
    saveToStorage(prizeOptions)
  }

  // 选择选项
  const selectOption = (option: string) => {
    currentOption.value = option
    showResult.value = false
    currentPrize.value = ''
  }

  // 设置抽奖结果
  const setResult = (prize: string) => {
    currentPrize.value = prize
    showResult.value = true
  }

  // 删除标签
  const deleteTag = (tagName: string) => {
    delete prizeOptions[tagName]
    if (currentOption.value === tagName) {
      currentOption.value = Object.keys(prizeOptions)[0] || ''
    }
    saveToStorage(prizeOptions)
  }

  return {
    prizeOptions,
    currentOption,
    currentPrize,
    showResult,
    updatePrizes,
    addNewTag,
    selectOption,
    setResult,
    deleteTag
  }
}, {
    persist: {
        key: 'luckyWheelPrizes',
        storage: localStorage
      }
})