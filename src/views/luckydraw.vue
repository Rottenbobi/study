<template>
  <div class="page-container">
    <div class="luck-draw-container">
      <div class="title-section">
        <h1>包摸鱼的</h1>
        <p class="subtitle">摸鱼来的工资才是自己的~</p>
      </div>

      <div class="options-section">
        <template v-for="(prizes, tagName) in store.prizeOptions" :key="tagName">
          <a-button 
            class="option-btn" 
            :type="store.currentOption === tagName ? 'primary' : 'outline'"
            @click="store.selectOption(tagName)"
          >
            {{ tagName }}
            <template #icon v-if="store.prizeOptions[tagName]?.length">
              <icon-delete @click.stop="handleDeleteTag(tagName)" />
            </template>
          </a-button>
        </template>
        <a-button 
          class="option-btn" 
          type="primary"
          status="success"
          @click="showEditDialog"
          v-if="store.currentOption"
        >
          <template #icon><icon-edit /></template>
          编辑奖项
        </a-button>
        <a-button 
          class="option-btn" 
          type="primary"
          @click="showTagEditDialog"
        >
          <template #icon><icon-plus /></template>
          新增标签
        </a-button>
      </div>

      <div class="wheel-wrapper" v-if="store.currentOption">
        <lucky-wheel
          ref="myLucky"
          width="400px"
          height="400px"
          :prizes="currentPrizes"
          :blocks="blocks"
          :buttons="buttons"
          :default-config="defaultConfig"
          @start="startHandler"
          @end="endHandler"
        />
      </div>
      <div v-else class="empty-state">
        <p>请先添加一个标签和奖项</p>
      </div>
    </div>
    
    <div v-if="store.showResult" class="result-modal">
      <div class="modal-content">
        <div class="modal-header">
          <div class="confetti-icon">🎉</div>
          <h3>抽奖结果</h3>
        </div>
        <div class="result-content">
          <p class="result-text">恭喜您抽中了</p>
          <p class="prize-text">{{ store.currentPrize }}</p>
        </div>
        <div class="modal-footer">
          <a-button type="primary" size="large" @click="store.showResult = false">太棒了！</a-button>
        </div>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <a-modal
      v-model:visible="isEditDialogVisible"
      title="编辑奖项"
      @ok="handleEditConfirm"
      @cancel="handleEditCancel"
      :mask-closable="false"
    >
      <div class="edit-form">
        <div v-for="(prize, index) in editingPrizes" :key="index" class="prize-item">
          <a-input-group compact>
            <a-input
              v-model="prize.fonts[0].text"
              placeholder="奖项名称"
              style="width: 60%"
            />
            <a-input-color
              v-model="prize.background"
              allow-clear
              style="width: 30%"
            />
            <a-button
              type="text"
              status="danger"
              @click="removePrize(index)"
              v-if="editingPrizes.length > 2"
            >
              <template #icon><icon-delete /></template>
            </a-button>
          </a-input-group>
        </div>

        <!-- 添加奖项按钮 -->
        <div class="add-prize">
          <a-button type="dashed" long @click="addPrize">
            <template #icon><icon-plus /></template>
            添加奖项
          </a-button>
        </div>
      </div>
    </a-modal>

    <!-- 标签编辑弹窗 -->
    <a-modal
      v-model:visible="isTagEditDialogVisible"
      title="添加新标签"
      @ok="handleTagEditConfirm"
      @cancel="handleTagEditCancel"
      :mask-closable="false"
    >
      <div class="edit-form">
        <div class="prize-item">
          <a-input
            v-model="newTagName"
            placeholder="标签名称"
            style="width: 100%"
          />
        </div>
        <div v-for="(prize, index) in newTagPrizes" :key="index" class="prize-item">
          <a-input-group compact>
            <a-input
              v-model="prize.fonts[0].text"
              placeholder="选项名称"
              style="width: 60%"
            />
            <a-input-color
              v-model="prize.background"
              allow-clear
              style="width: 30%"
            />
            <a-button
              type="text"
              status="danger"
              @click="removePrizeFromNewTag(index)"
              v-if="newTagPrizes.length > 1"
            >
              <template #icon><icon-delete /></template>
            </a-button>
          </a-input-group>
        </div>

        <!-- 添加选项按钮 -->
        <div class="add-prize">
          <a-button type="dashed" long @click="addPrizeToNewTag">
            <template #icon><icon-plus /></template>
            添加选项
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconEdit, IconDelete, IconPlus } from '@arco-design/web-vue/es/icon'
import { useLuckyDrawStore } from '@/stores/luckyDraw'

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

interface LuckyWheel {
  play: () => void;
  stop: (index: number) => void;
}

const myLucky = ref<LuckyWheel | null>(null)
const store = useLuckyDrawStore()

// 计算当前选中的奖品列表
const currentPrizes = computed(() => store.prizeOptions[store.currentOption] || [])

const blocks = [
  { 
    padding: '15px', 
    background: '#2B5B8C',
    fonts: [{ text: '摸鱼转盘', top: '10%', fontSize: '16px', fontWeight: 'bold', fontColor: '#ffffff' }]
  }
]

const buttons = [
  { 
    radius: '45%', 
    background: '#2B5B8C'
  },
  { 
    radius: '40%',
    background: '#ffffff'
  },
  {
    radius: '35%',
    background: '#2B5B8C',
    pointer: true,
    fonts: [{ text: '开始', top: '-10px', fontSize: '20px', fontWeight: 'bold', fontColor: '#ffffff' }]
  }
]

const defaultConfig = {
  gutter: 8,
  speed: 20,
  accelerationTime: 2500,
  decelerationTime: 2500,
  fontColor: '#ffffff',
  fontSize: '18px',
  fontWeight: 'bold'
}

const startHandler = () => {
  if (!myLucky.value) return
  
  // 先关闭上一次的结果
  store.showResult = false
  // 使用随机数确定停止位置
  const index = Math.floor(Math.random() * currentPrizes.value.length)
  // 开始旋转
  myLucky.value.play()
  // 2.5秒后停止
  setTimeout(() => {
    myLucky.value?.stop(index)
  }, 2500)
}

const endHandler = (prize: any) => {
  store.setResult(prize.fonts[0].text)
}

// 删除标签
const handleDeleteTag = (tagName: string) => {
  store.deleteTag(tagName)
  Message.success('删除成功')
}

// 编辑弹窗状态
const isEditDialogVisible = ref(false)
// 编辑时的临时数据
const editingPrizes = ref<Prize[]>([])

// 显示编辑弹窗
const showEditDialog = () => {
  // 深拷贝当前奖项数据
  editingPrizes.value = JSON.parse(JSON.stringify(currentPrizes.value))
  isEditDialogVisible.value = true
}

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

// 添加新奖项
const addPrize = () => {
  const newPrize: Prize = {
    fonts: [{ 
      text: '新奖项', 
      top: '40%',
      fontSize: '18px',
      fontWeight: '600',
      fontColor: '#ffffff'
    }],
    background: predefinedColors[Math.floor(Math.random() * predefinedColors.length)]
  }
  editingPrizes.value.push(newPrize)
}

// 删除奖项
const removePrize = (index: number) => {
  if (editingPrizes.value.length <= 2) {
    Message.warning('至少需要保留2个奖项')
    return
  }
  editingPrizes.value.splice(index, 1)
}

// 确认编辑
const handleEditConfirm = () => {
  // 验证数据
  if (editingPrizes.value.some((prize: Prize) => !prize.fonts[0].text.trim())) {
    Message.error('奖项名称不能为空')
    return
  }
  
  // 更新奖项数据
  const updatedPrizes: Prize[] = editingPrizes.value.map((prize: Prize) => ({
    background: prize.background,
    fonts: prize.fonts.map((font: PrizeFonts) => ({
      text: font.text,
      top: font.top,
      fontSize: font.fontSize || '18px',
      fontWeight: font.fontWeight || '600',
      fontColor: font.fontColor || '#ffffff'
    }))
  }))

  // 使用 store 更新数据
  store.updatePrizes(store.currentOption, updatedPrizes)
  
  isEditDialogVisible.value = false
  Message.success('保存成功')
}

// 取消编辑
const handleEditCancel = () => {
  isEditDialogVisible.value = false
}

// 标签编辑弹窗状态
const isTagEditDialogVisible = ref(false)
const newTagName = ref('')
const newTagPrizes = ref<Prize[]>([])

// 显示标签编辑弹窗
const showTagEditDialog = () => {
  newTagName.value = ''
  newTagPrizes.value = [{
    fonts: [{ 
      text: '新选项', 
      top: '40%',
      fontSize: '18px',
      fontWeight: '600',
      fontColor: '#ffffff'
    }],
    background: predefinedColors[0]
  }]
  isTagEditDialogVisible.value = true
}

// 添加新选项到新标签
const addPrizeToNewTag = () => {
  const newPrize: Prize = {
    fonts: [{ 
      text: '新选项', 
      top: '40%',
      fontSize: '18px',
      fontWeight: '600',
      fontColor: '#ffffff'
    }],
    background: predefinedColors[Math.floor(Math.random() * predefinedColors.length)]
  }
  newTagPrizes.value.push(newPrize)
}

// 删除新标签中的选项
const removePrizeFromNewTag = (index: number) => {
  if (newTagPrizes.value.length <= 1) {
    Message.warning('至少需要保留1个选项')
    return
  }
  newTagPrizes.value.splice(index, 1)
}

// 确认添加新标签
const handleTagEditConfirm = () => {
  // 验证数据
  if (!newTagName.value.trim()) {
    Message.error('标签名称不能为空')
    return
  }
  if (newTagName.value in store.prizeOptions) {
    Message.error('标签名称已存在')
    return
  }
  if (newTagPrizes.value.some((prize: Prize) => !prize.fonts[0].text.trim())) {
    Message.error('选项名称不能为空')
    return
  }

  // 使用 store 添加新标签
  store.addNewTag(newTagName.value, newTagPrizes.value)
  
  isTagEditDialogVisible.value = false
  Message.success('添加成功')
}

// 取消添加新标签
const handleTagEditCancel = () => {
  isTagEditDialogVisible.value = false
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #F5F7FF 0%, #FFF1F9 100%);
  padding: 40px 20px;
}

.luck-draw-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 30px;
  box-shadow: 
    0 20px 40px rgba(43, 91, 140, 0.15),
    0 5px 15px rgba(43, 91, 140, 0.1);
  backdrop-filter: blur(10px);
}

.title-section {
  text-align: center;
  margin-bottom: 40px;
}

.title-section h1 {
  font-size: 38px;
  color: #2B5B8C;
  margin-bottom: 15px;
  font-weight: bold;
  letter-spacing: 1px;
}

.subtitle {
  font-size: 16px;
  color: #4C8DAE;
  font-weight: 500;
}

.options-section {
  margin-bottom: 40px;
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.option-btn {
  height: 40px;
  padding: 0 20px;
  border-radius: 20px;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.option-btn :deep(.icon) {
  font-size: 16px;
}

.wheel-wrapper {
  position: relative;
  padding: 25px;
  border-radius: 50%;
  background: rgba(43, 91, 140, 0.03);
  box-shadow: 
    0 10px 30px rgba(43, 91, 140, 0.2),
    inset 0 0 40px rgba(43, 91, 140, 0.1);
  transition: transform 0.3s ease;
}

.wheel-wrapper:hover {
  transform: translateY(-5px);
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #4C8DAE;
  font-size: 18px;
}

.result-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(43, 91, 140, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
}

.modal-content {
  background: rgba(255, 255, 255, 0.98);
  padding: 35px;
  border-radius: 20px;
  width: 380px;
  text-align: center;
  box-shadow: 
    0 20px 40px rgba(43, 91, 140, 0.2),
    0 5px 15px rgba(43, 91, 140, 0.1);
  transform: scale(0.9);
  animation: modalPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes modalPop {
  0% {
    transform: scale(0.9);
    opacity: 0;
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-header {
  margin-bottom: 20px;
}

.confetti-icon {
  font-size: 40px;
  margin-bottom: 10px;
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.modal-content h3 {
  margin: 0;
  color: #2B5B8C;
  font-size: 24px;
}

.result-content {
  margin: 30px 0;
}

.result-text {
  font-size: 18px;
  color: #4C8DAE;
  margin: 0 0 10px;
}

.prize-text {
  font-size: 32px;
  color: #2B5B8C;
  font-weight: bold;
  margin: 15px 0;
}

.modal-footer {
  margin-top: 30px;
}

.modal-footer :deep(.ant-btn-primary) {
  height: 46px;
  font-size: 16px;
  padding: 0 35px;
  border-radius: 23px;
  background: #2B5B8C;
  border: none;
  box-shadow: 0 5px 15px rgba(43, 91, 140, 0.3);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-footer :deep(.ant-btn-primary:hover) {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 20px rgba(43, 91, 140, 0.4);
  background: #3A5B8C;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.prize-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.add-prize {
  margin-top: 1rem;
}

:deep(.arco-modal-content) {
  max-height: 60vh;
  overflow-y: auto;
}

:deep(.arco-input-group) {
  display: flex;
  align-items: center;
}

:deep(.arco-btn-dashed) {
  border-style: dashed;
}
</style>