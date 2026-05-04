<template>
  <Dialog v-model="dialogVisible" title="AI采购建议详情" width="700px">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="编号">{{ detailData.id }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag v-if="detailData.status === 0" type="primary">待确认</el-tag>
        <el-tag v-else-if="detailData.status === 1" type="success">已转订单</el-tag>
        <el-tag v-else-if="detailData.status === 2" type="info">已忽略</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="产品名称">{{ detailData.productName }}</el-descriptions-item>
      <el-descriptions-item label="产品ID">{{ detailData.productId }}</el-descriptions-item>
      <el-descriptions-item label="当前库存">
        <span class="text-orange-500 font-bold">{{ detailData.currentStock }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="安全库存">{{ detailData.safetyStock }}</el-descriptions-item>
      <el-descriptions-item label="建议采购数量">
        <span class="text-red-500 font-bold text-lg">{{ detailData.suggestCount }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="推荐供应商">{{ detailData.supplierName }}</el-descriptions-item>
      <el-descriptions-item label="建议采购时间">{{ formatDate(detailData.suggestTime, 'YYYY-MM-DD') }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ formatDate(detailData.createTime) }}</el-descriptions-item>
      <el-descriptions-item label="AI分析原因" :span="2">
        <div style="white-space: pre-wrap">{{ detailData.reason }}</div>
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button @click="dialogVisible = false">关 闭</el-button>
      <el-button
        v-if="detailData.status === 0"
        type="primary"
        @click="handleConfirm"
      >
        转为采购订单
      </el-button>
      <el-button
        v-if="detailData.status === 0"
        type="danger"
        plain
        @click="handleIgnore"
      >
        忽略
      </el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { getAiSuggest, confirmAiSuggest, ignoreAiSuggest, AiSuggestVO } from '@/api/erp/purchase/aiSuggest'
import { formatDate } from '@/utils/formatTime'

defineOptions({ name: 'AiSuggestDetail' })

const emit = defineEmits(['success'])
const message = useMessage()
const dialogVisible = ref(false)
const detailData = ref<Partial<AiSuggestVO>>({})

/** 打开弹窗 */
const open = async (id: number) => {
  dialogVisible.value = true
  const data = await getAiSuggest(id)
  detailData.value = data
}
defineExpose({ open })

/** 确认转订单 */
const handleConfirm = async () => {
  try {
    await message.confirm('确认将此建议转为采购订单吗？')
    await confirmAiSuggest(detailData.value.id!)
    message.success('已转为采购订单')
    dialogVisible.value = false
    emit('success')
  } catch {}
}

/** 忽略 */
const handleIgnore = async () => {
  await ignoreAiSuggest(detailData.value.id!)
  message.success('已忽略此建议')
  dialogVisible.value = false
  emit('success')
}
</script>
