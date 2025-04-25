import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

// 预设的颜色列表
const predefinedColors = [
  '#2B7BB9',
  '#4C8DAE',
  '#3A5B8C',
  '#5B7FA6',
  '#6E99B4',
  '#4B6E8C',
  '#5D8BA3'
]

interface PrizeFonts {
  text: string;
  top: string;
  fontSize: string;
  fontColor: string;
}

interface Prize {
  background: string;
  fonts: PrizeFonts[];
}

export const useLuckyDrawStore = defineStore('luckyDraw', () => {
  // 从本地存储获取数据
  const getStoredPrizes = () => {
    try {
      const stored = localStorage.getItem('luckyWheelPrizes')
      if (!stored) return {}
      
      const parsed = JSON.parse(stored)
      // 清理数据，只保留必要的属性
      const cleanedData: Record<string, Prize[]> = {}
      
      for (const key in parsed) {
        if (Array.isArray(parsed[key])) {
          cleanedData[key] = parsed[key].map((prize: any) => ({
            background: prize.background || predefinedColors[Math.floor(Math.random() * predefinedColors.length)],
            fonts: Array.isArray(prize.fonts) ? prize.fonts.map((font: any) => ({
              text: String(font.text || ''),
              top: String(font.top || '40%'),
              fontSize: String(font.fontSize || '18px'),
              fontColor: '#ffffff'
            })) : [{
              text: '',
              top: '40%',
              fontSize: '18px',
              fontColor: '#ffffff'
            }]
          }))
        }
      }
      return cleanedData
    } catch (error) {
      console.error('Error parsing stored prizes:', error)
      return {}
    }
  }

  // 保存到本地存储
  const saveToStorage = (prizes: Record<string, Prize[]>) => {
    try {
      localStorage.setItem('luckyWheelPrizes', JSON.stringify(prizes))
    } catch (error) {
      console.error('Error saving prizes:', error)
    }
  }

  // 使用 reactive 创建响应式数据
  const prizeOptions = reactive<Record<string, Prize[]>>(getStoredPrizes())
  const currentOption = ref<string>('')
  const currentPrize = ref('')
  const showResult = ref(false)

  // 更新奖项数据
  const updatePrizes = (option: string, prizes: Prize[]) => {
    if (!prizes || !Array.isArray(prizes)) return
    prizeOptions[option] = prizes.map(prize => ({
      background: prize.background || predefinedColors[Math.floor(Math.random() * predefinedColors.length)],
      fonts: [{
        text: String(prize.fonts[0]?.text || ''),
        top: '40%',
        fontSize: '18px',
        fontColor: '#ffffff'
      }]
    }))
    saveToStorage(prizeOptions)
  }

  // 添加新标签
  const addNewTag = (tagName: string, prizes: Prize[]) => {
    if (!prizes || !Array.isArray(prizes)) return
    prizeOptions[tagName] = prizes.map(prize => ({
      background: prize.background || predefinedColors[Math.floor(Math.random() * predefinedColors.length)],
      fonts: [{
        text: String(prize.fonts[0]?.text || ''),
        top: '40%',
        fontSize: '18px',
        fontColor: '#ffffff'
      }]
    }))
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
  persist: true
})