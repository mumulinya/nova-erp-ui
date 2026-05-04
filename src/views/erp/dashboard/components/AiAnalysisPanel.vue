<template>
  <el-card shadow="hover" class="ai-card">
    <template #header>
      <div class="ai-header">
        <span class="chart-title">
          <Icon icon="ep:magic-stick" class="ai-icon" /> AI 智能分析
        </span>
        <el-button type="primary" :loading="analyzing" @click="startAnalysis" :disabled="analyzing">
          <Icon icon="ep:cpu" class="mr-4px" />
          {{ analyzing ? '分析中...' : 'AI 分析' }}
        </el-button>
      </div>
    </template>
    <div class="ai-content" ref="contentRef">
      <div v-if="!analysisText && !analyzing" class="ai-placeholder">
        <Icon icon="ep:data-analysis" :size="48" color="#C0C4CC" />
        <p>点击"AI 分析"按钮，AI 将基于当前大屏数据生成供应链健康度分析报告</p>
      </div>
      <div v-else class="ai-result" v-html="renderedHtml"></div>
    </div>
  </el-card>
</template>
<script lang="ts" setup>
import { getAccessToken } from '@/utils/auth'

defineOptions({ name: 'AiAnalysisPanel' })

const analyzing = ref(false)
const analysisText = ref('')
const contentRef = ref<HTMLDivElement>()

/** 将简单 Markdown 转为 HTML（轻量处理） */
const renderedHtml = computed(() => {
  let text = analysisText.value
  // 处理标题
  text = text.replace(/^### (.+)$/gm, '<h4>$1</h4>')
  text = text.replace(/^## (.+)$/gm, '<h3>$1</h3>')
  text = text.replace(/^# (.+)$/gm, '<h2>$1</h2>')
  // 加粗
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  // 列表
  text = text.replace(/^- (.+)$/gm, '<li>$1</li>')
  text = text.replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
  // 换行
  text = text.replace(/\n/g, '<br/>')
  return text
})

const startAnalysis = () => {
  analyzing.value = true
  analysisText.value = ''

  const token = getAccessToken()
  const baseUrl = import.meta.env.VITE_BASE_URL || ''
  const url = `${baseUrl}/admin-api/erp/ai-analysis/stream`

  const eventSource = new EventSource(`${url}?token=Bearer ${token}`)

  eventSource.onmessage = (event) => {
    const data = event.data
    if (data === '[DONE]') {
      eventSource.close()
      analyzing.value = false
      return
    }
    if (data.startsWith('[ERROR]')) {
      analysisText.value += '\n\n❌ ' + data
      eventSource.close()
      analyzing.value = false
      return
    }
    analysisText.value += data
    // 自动滚动到底部
    nextTick(() => {
      if (contentRef.value) {
        contentRef.value.scrollTop = contentRef.value.scrollHeight
      }
    })
  }

  eventSource.onerror = () => {
    eventSource.close()
    analyzing.value = false
    if (!analysisText.value) {
      analysisText.value = '❌ 连接异常，请稍后重试'
    }
  }
}
</script>
<style lang="scss" scoped>
.ai-card {
  height: 100%;
}

.ai-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ai-icon {
  color: #409eff;
  margin-right: 4px;
}

.chart-title {
  font-weight: 600;
  font-size: 15px;
  display: flex;
  align-items: center;
}

.ai-content {
  max-height: 400px;
  overflow-y: auto;
  padding: 4px;
}

.ai-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #c0c4cc;
  text-align: center;

  p {
    margin-top: 12px;
    font-size: 14px;
    max-width: 300px;
  }
}

.ai-result {
  font-size: 14px;
  line-height: 1.8;
  color: var(--el-text-color-primary);

  :deep(h2) {
    font-size: 18px;
    margin: 16px 0 8px;
    color: #303133;
    border-bottom: 1px solid #ebeef5;
    padding-bottom: 6px;
  }

  :deep(h3) {
    font-size: 16px;
    margin: 12px 0 6px;
    color: #409eff;
  }

  :deep(h4) {
    font-size: 14px;
    margin: 8px 0 4px;
    color: #606266;
  }

  :deep(strong) {
    color: #303133;
  }

  :deep(li) {
    margin-left: 16px;
    list-style: disc;
  }
}
</style>
