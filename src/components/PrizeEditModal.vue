<template>
  <a-modal
    :visible="modelValue"
    :title="null"
    @cancel="handleCancel"
    @ok="handleConfirm"
    :mask-closable="false"
    :footer="false"
    :width="480"
  >
    <div class="tag-edit-form">
      <div class="form-header">{{ title }}</div>
      <slot name="header"></slot>
      
      <div class="form-group">
        <div class="options-container">
          <TransitionGroup name="list">
            <div v-for="(prize, index) in localPrizes" :key="index" class="option-item">
              <a-input
                :model-value="prize.fonts[0].text"
                @update:model-value="updatePrizeText(index, $event)"
                :placeholder="placeholder"
                allow-clear
              />
              <a-input-color
                :model-value="prize.background"
                @update:model-value="updatePrizeBackground(index, $event)"
                allow-clear
                class="color-picker"
              />
              <a-button
                type="text"
                class="delete-btn"
                @click="handleDelete(index)"
                v-if="canDelete(index)"
              >
                <template #icon><icon-delete /></template>
              </a-button>
            </div>
          </TransitionGroup>
        </div>

        <!-- 添加按钮 -->
        <div class="add-option-btn" @click="handleAdd">
          <icon-plus />
          <span>{{ addButtonText }}</span>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="form-footer">
        <a-button @click="handleCancel">取消</a-button>
        <a-button type="primary" @click="handleConfirm">确定</a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconDelete, IconPlus } from '@arco-design/web-vue/es/icon'

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

const props = defineProps<{
  modelValue: boolean;
  title: string;
  prizes: Prize[];
  placeholder?: string;
  addButtonText?: string;
  minItems?: number;
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'update:prizes', prizes: Prize[]): void;
  (e: 'confirm', prizes: Prize[]): void;
}>()

// 本地数据
const localPrizes = ref<Prize[]>([])

// 监听 props.prizes 的变化
watch(() => props.prizes, (newPrizes) => {
  localPrizes.value = JSON.parse(JSON.stringify(newPrizes))
}, { deep: true, immediate: true })

const handleCancel = () => {
  emit('update:modelValue', false)
}

const handleConfirm = () => {
  // 验证数据
  if (localPrizes.value.some(prize => !prize.fonts[0].text.trim())) {
    Message.error('选项名称不能为空')
    return
  }
  
  emit('confirm', localPrizes.value)
  emit('update:prizes', localPrizes.value)
  emit('update:modelValue', false)
}

const handleDelete = (index: number) => {
  localPrizes.value.splice(index, 1)
  emit('update:prizes', localPrizes.value)
}

const handleAdd = () => {
  localPrizes.value.push({
    background: predefinedColors[Math.floor(Math.random() * predefinedColors.length)],
    fonts: [{
      text: '',
      top: '40%',
      fontSize: '18px',
      fontColor: '#ffffff'
    }]
  })
  emit('update:prizes', localPrizes.value)
}

const updatePrizeText = (index: number, value: string) => {
  localPrizes.value[index].fonts[0].text = value
  emit('update:prizes', localPrizes.value)
}

const updatePrizeBackground = (index: number, value: string) => {
  localPrizes.value[index].background = value
  emit('update:prizes', localPrizes.value)
}

const canDelete = (index: number) => {
  return localPrizes.value.length > (props.minItems || 2)
}
</script>

<style scoped>
/* 弹窗基础样式 */
:deep(.arco-modal) {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
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

.options-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
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
  position: relative;
  overflow: hidden;
}

.option-item:hover {
  background: rgba(43, 91, 140, 0.04);
}

.color-picker {
  width: 80px;
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.color-picker:hover {
  transform: translateY(-1px) scale(1.02);
}

/* 添加按钮样式 */
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
  position: relative;
  overflow: hidden;
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
  position: relative;
  overflow: hidden;
}

.delete-btn:hover {
  color: #F53F3F;
  background: rgba(245, 63, 63, 0.08);
  transform: scale(1.05);
}

/* 底部按钮 */
.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 16px;
  border-top: 1px solid #E5E6EB;
}

/* 输入框样式 */
:deep(.arco-input-wrapper) {
  border-radius: 8px;
  border: 1px solid #E5E6EB;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
  transform: translateY(-1px);
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

/* 列表动画 */
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

/* 点击涟漪效果 */
.option-item::after,
.add-option-btn::after,
.delete-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(43, 91, 140, 0.1) 0%, transparent 70%);
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.option-item:active::after,
.add-option-btn:active::after {
  transform: translate(-50%, -50%) scale(2);
}

.delete-btn:hover::before {
  transform: translate(-50%, -50%) scale(2);
  background: radial-gradient(circle, rgba(245, 63, 63, 0.1) 0%, transparent 70%);
}

/* 移动端适配 */
@media (max-width: 480px) {
  .form-header {
    padding: 16px 20px;
    font-size: 16px;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .option-item {
    padding: 10px;
    grid-template-columns: 1fr 60px 32px;
    gap: 6px;
  }

  .color-picker {
    width: 60px;
  }

  .add-option-btn {
    height: 36px;
  }

  .form-footer {
    margin-top: 24px;
    padding-top: 12px;
  }

  .list-enter-from {
    transform: translateX(-20px) scale(0.95);
  }

  .list-leave-to {
    transform: translateX(20px) scale(0.95);
  }
}
</style> 