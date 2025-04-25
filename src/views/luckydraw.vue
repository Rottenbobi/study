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
    <prize-edit-modal
      v-model="isEditDialogVisible"
      v-model:prizes="editingPrizes"
      title="编辑奖项"
      placeholder="奖项名称"
      add-button-text="添加奖项"
      :min-items="2"
      @confirm="handleEditConfirm"
    />

    <!-- 标签编辑弹窗 -->
    <prize-edit-modal
      v-model="isTagEditDialogVisible"
      v-model:prizes="newTagPrizes"
      title="添加新标签"
      placeholder="请输入选项名称"
      add-button-text="添加选项"
      :min-items="1"
      @confirm="handleTagEditConfirm"
    >
      <template #header>
        <div class="form-group">
          <div class="form-label">标签名称</div>
          <a-input
            v-model="newTagName"
            placeholder="请输入标签名称"
            allow-clear
          />
        </div>
      </template>
    </prize-edit-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconEdit, IconDelete, IconPlus } from '@arco-design/web-vue/es/icon'
import { useLuckyDrawStore } from '@/stores/luckyDraw'
import PrizeEditModal from '@/components/PrizeEditModal.vue'

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

// 移除原有的编辑相关方法，改用组件提供的功能
const handleEditConfirm = (prizes: Prize[]) => {
  store.updatePrizes(store.currentOption, prizes)
  Message.success('保存成功')
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

// 移除原有的编辑相关方法，改用组件提供的功能
const handleTagEditConfirm = (prizes: Prize[]) => {
  if (!newTagName.value.trim()) {
    Message.error('标签名称不能为空')
    return
  }
  if (newTagName.value in store.prizeOptions) {
    Message.error('标签名称已存在')
    return
  }

  store.addNewTag(newTagName.value, prizes)
  Message.success('添加成功')
}

// 显示编辑弹窗
const showEditDialog = () => {
  editingPrizes.value = JSON.parse(JSON.stringify(currentPrizes.value))
  isEditDialogVisible.value = true
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #F5F7FF 0%, #FFF1F9 100%);
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.luck-draw-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 20px;
  box-shadow: 
    0 20px 40px rgba(43, 91, 140, 0.15),
    0 5px 15px rgba(43, 91, 140, 0.1);
  backdrop-filter: blur(10px);
}

.title-section {
  text-align: center;
  margin-bottom: 20px;
  width: 100%;
}

.title-section h1 {
  font-size: clamp(24px, 5vw, 38px);
  color: #2B5B8C;
  margin-bottom: 10px;
  font-weight: bold;
  letter-spacing: 1px;
}

.subtitle {
  font-size: clamp(14px, 3vw, 16px);
  color: #4C8DAE;
  font-weight: 500;
}

.options-section {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  width: 100%;
  padding: 0 10px;
}

.option-btn {
  height: 36px;
  padding: 0 15px;
  border-radius: 18px;
  font-size: clamp(14px, 3vw, 16px);
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}

.wheel-wrapper {
  position: relative;
  padding: 15px;
  border-radius: 50%;
  background: rgba(43, 91, 140, 0.03);
  box-shadow: 
    0 10px 30px rgba(43, 91, 140, 0.2),
    inset 0 0 40px rgba(43, 91, 140, 0.1);
  transition: transform 0.3s ease;
  width: min(90vw, 400px);
  height: min(90vw, 400px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.wheel-wrapper :deep(.lucky-wheel) {
  width: 100% !important;
  height: 100% !important;
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
  padding: 20px;
}

.modal-content {
  background: rgba(255, 255, 255, 0.98);
  padding: 25px;
  border-radius: 20px;
  width: min(90vw, 380px);
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
  font-size: clamp(24px, 6vw, 32px);
  color: #2B5B8C;
  font-weight: bold;
  margin: 15px 0;
  word-break: break-all;
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
  width: 100%;
  max-height: 60vh;
  overflow-y: auto;
  padding: 4px;
}

.edit-form::-webkit-scrollbar {
  width: 8px;
}

.edit-form::-webkit-scrollbar-track {
  background: rgba(43, 91, 140, 0.05);
  border-radius: 4px;
}

.edit-form::-webkit-scrollbar-thumb {
  background: rgba(43, 91, 140, 0.2);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.edit-form::-webkit-scrollbar-thumb:hover {
  background: rgba(43, 91, 140, 0.3);
}

.prize-item {
  margin-bottom: 16px;
  position: relative;
  transition: all 0.3s ease;
}

.prize-item:hover {
  transform: translateX(2px);
}

:deep(.arco-input-wrapper) {
  border-radius: 8px;
  border: 1px solid #E5E6EB;
  transition: all 0.2s ease;
  background: #F7F8FA;
}

:deep(.arco-input-wrapper:hover) {
  border-color: #2B5B8C;
  background: #fff;
}

:deep(.arco-input-wrapper:focus-within) {
  border-color: #2B5B8C;
  box-shadow: none;
  background: #fff;
}

.option-item {
  display: grid;
  grid-template-columns: 1fr 80px 32px;
  gap: 8px;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
  background: transparent;
}

.option-item:hover {
  background: rgba(43, 91, 140, 0.04);
}

:deep(.arco-input) {
  background: transparent;
}

:deep(.arco-input:hover),
:deep(.arco-input:focus) {
  background: transparent;
}

.color-picker {
  width: 80px;
  border: none;
}

:deep(.arco-input-group) {
  background: transparent;
  box-shadow: none;
}

:deep(.arco-input-group:hover) {
  background: transparent;
  box-shadow: none;
}

.add-prize {
  margin-top: 20px;
}

:deep(.arco-btn-text) {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: #FF4D4F;
  transition: all 0.2s ease;
}

:deep(.arco-btn-text:hover) {
  background: rgba(255, 77, 79, 0.1);
  transform: scale(1.05);
}

.add-option-btn {
  margin-top: 12px;
  height: 40px;
  border: 1px dashed #C9CDD4;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #4E5969;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-option-btn:hover {
  border-color: #2B5B8C;
  color: #2B5B8C;
  background: rgba(43, 91, 140, 0.04);
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 16px;
  border-top: 1px solid #E5E6EB;
}

:deep(.arco-btn) {
  height: 36px;
  padding: 0 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 取消按钮样式 */
.form-footer :deep(.arco-btn:not(.arco-btn-primary)) {
  background: #F7F8FA;
  border: 1px solid #E5E6EB;
  color: #4E5969;
}

.form-footer :deep(.arco-btn:not(.arco-btn-primary):hover) {
  color: #2B5B8C;
  border-color: #2B5B8C;
  background: rgba(43, 91, 140, 0.04);
}

/* 确定按钮样式 */
.form-footer :deep(.arco-btn-primary) {
  background: linear-gradient(135deg, #3A5B8C 0%, #2B5B8C 100%);
  border: none;
  box-shadow: 0 2px 6px rgba(43, 91, 140, 0.2);
}

.form-footer :deep(.arco-btn-primary:hover) {
  background: linear-gradient(135deg, #4C6B9C 0%, #3A6B9C 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(43, 91, 140, 0.3);
}

/* 添加选项按钮样式 */
.add-option-btn {
  margin-top: 12px;
  height: 40px;
  border: 1px dashed #C9CDD4;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #4E5969;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #F7F8FA;
}

.add-option-btn:hover {
  border-color: #2B5B8C;
  color: #2B5B8C;
  background: rgba(43, 91, 140, 0.04);
  transform: translateY(-1px);
}

/* 删除按钮样式 */
.delete-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #C9CDD4;
  transition: all 0.2s ease;
  border-radius: 6px;
  background: transparent;
}

.delete-btn:hover {
  color: #F53F3F;
  background: rgba(245, 63, 63, 0.08);
  transform: scale(1.05);
}

/* 移动端适配 */
@media (max-width: 480px) {
  .form-footer :deep(.arco-btn) {
    padding: 0 16px;
  }
  
  .add-option-btn {
    height: 36px;
  }
}

/* 适配横屏 */
@media (orientation: landscape) and (max-height: 600px) {
  .page-container {
    min-height: 100%;
    padding: 10px;
  }

  .luck-draw-container {
    padding: 15px;
  }

  .title-section {
    margin-bottom: 10px;
  }

  .options-section {
    margin-bottom: 10px;
  }

  .wheel-wrapper {
    width: min(70vh, 400px);
    height: min(70vh, 400px);
  }
}

.tag-edit-form {
  padding: 0;
}

.form-header {
  font-size: 18px;
  font-weight: 600;
  color: #1D2129;
  padding: 20px 24px;
  border-bottom: 1px solid #E5E6EB;
  margin: 0 -20px 20px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  font-size: 14px;
  color: #4E5969;
  margin-bottom: 8px;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.delete-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #C9CDD4;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  color: #F53F3F;
  background: rgba(245, 63, 63, 0.1);
}

/* 列表动画效果 */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-30px) scale(0.9);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(30px) scale(0.9);
}

.list-leave-active {
  position: absolute;
  width: 100%;
}

/* 添加按钮动画 */
.add-option-btn {
  position: relative;
  overflow: hidden;
}

.add-option-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(43, 91, 140, 0.1) 0%, transparent 70%);
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.add-option-btn:active::after {
  transform: translate(-50%, -50%) scale(2);
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 删除按钮动画 */
.delete-btn {
  position: relative;
  overflow: hidden;
}

.delete-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(245, 63, 63, 0.1) 0%, transparent 70%);
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.delete-btn:hover::before {
  transform: translate(-50%, -50%) scale(2);
}

.delete-btn:active::before {
  background: radial-gradient(circle, rgba(245, 63, 63, 0.2) 0%, transparent 70%);
}

/* 选项卡片动画 */
.option-item {
  animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 点击涟漪效果 */
.option-item {
  position: relative;
  overflow: hidden;
}

.option-item::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(43, 91, 140, 0.06) 0%, transparent 70%);
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.option-item:active::after {
  transform: translate(-50%, -50%) scale(2);
}

/* 输入框聚焦动画 */
:deep(.arco-input-wrapper) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.arco-input-wrapper:focus-within) {
  transform: translateY(-1px);
}

/* 颜色选择器动画 */
.color-picker {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.color-picker:hover {
  transform: translateY(-1px) scale(1.02);
}

/* 移动端优化 */
@media (max-width: 480px) {
  .list-enter-from {
    transform: translateX(-20px) scale(0.95);
  }

  .list-leave-to {
    transform: translateX(20px) scale(0.95);
  }
}
</style>