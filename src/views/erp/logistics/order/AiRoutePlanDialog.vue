<template>
  <Dialog v-model="dialogVisible" title="AI规划路线" width="70%">
    <div class="flex flex-col gap-4">
      <div class="bg-gray-50 p-4 rounded-md">
        <h3 class="text-base font-bold mb-2">订单信息</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="发货地">{{ orderData?.startAddress || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="收货地">{{ orderData?.endAddress || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="货物信息">{{ orderData?.goodsInfo || '无' }}</el-descriptions-item>
          <el-descriptions-item label="车辆信息">{{ orderData?.vehicleInfo || '未分配' }}</el-descriptions-item>
          <el-descriptions-item label="时效要求">{{ orderData?.timeRequirement || '无限制' }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="flex-1 min-h-[300px] border border-gray-200 rounded-md p-4 relative bg-white">
        <h3 class="text-base font-bold mb-2 text-primary flex items-center">
          <Icon icon="ep:magic-stick" class="mr-2" /> AI 建议规划路线
        </h3>
        
        <div v-if="loading && !aiSuggestion" class="flex flex-col items-center justify-center h-[200px] text-gray-400">
          <Icon icon="ep:loading" class="animate-spin text-4xl mb-2" />
          <span>正在连线 AI 大脑思考中...</span>
        </div>

        <!-- Markdown 展示内容 -->
        <div class="prose max-w-none text-sm whitespace-pre-wrap leading-relaxed" v-else>
          {{ aiSuggestion }}
          <span v-if="loading" class="inline-block w-2 h-4 bg-primary animate-pulse ml-1"></span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-between items-center">
        <span class="text-sm text-gray-500">
          * AI 生成内容仅供参考，确认后将创建真实的配送路线记录
        </span>
        <div>
          <el-button @click="dialogVisible = false" :disabled="saving">取 消</el-button>
          <el-button type="primary" @click="handleSaveRoute" :loading="saving" :disabled="loading || !aiSuggestion">
            确认保存为路线
          </el-button>
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { AiRouteApi } from '@/api/ai/logisticsRoute'
import { RouteApi } from '@/api/erp/logistics/route'
import { OrderApi } from '@/api/erp/logistics/order'
import { ElMessage } from 'element-plus'

const dialogVisible = ref(false)
const loading = ref(false)
const saving = ref(false)
const aiSuggestion = ref('')
const orderData = ref<any>(null)

const emit = defineEmits(['success'])

// 打开弹窗并开始请求AI
const open = async (orderId: number) => {
  dialogVisible.value = true
  aiSuggestion.value = ''
  orderData.value = null
  loading.value = true
  
  try {
    // 1. 获取订单详细信息
    const order = await OrderApi.getOrder(orderId)
    orderData.value = {
      id: order.id,
      startAddress: '仓库地址', // 实际项目中可能有关联的仓库，这里先用个默认值或从订单里取
      endAddress: order.receiverAddress,
      vehicleInfo: order.vehiclePlateNo ? `${order.vehiclePlateNo}` : undefined,
      goodsInfo: order.goodsInfo,
      timeRequirement: order.timeRequirement
    }
    
    // 2. 调用流式接口
    startAiStream()
  } catch (error) {
    loading.value = false
    ElMessage.error('获取订单信息失败')
  }
}

const startAiStream = () => {
  AiRouteApi.streamPlan(
    orderData.value,
    (text) => {
      aiSuggestion.value += text
    },
    (err) => {
      loading.value = false
      ElMessage.error('AI 请求发生错误：' + err)
    },
    () => {
      loading.value = false
    }
  )
}

const handleSaveRoute = async () => {
  try {
    saving.value = true
    // 解析AI的内容自动填入表单，这里简化为直接将整个文本存入AI建议字段，其余手填或默认
    // 实际项目中可以提示AI返回JSON并解析出距离、时长等，这里演示仅将 AI 建议保留
    await RouteApi.createRoute({
      name: `${orderData.value.endAddress} 专线`,
      startAddress: orderData.value.startAddress,
      endAddress: orderData.value.endAddress,
      distance: 0,
      estimatedHours: 0,
      remark: '由 AI 辅助生成',
      aiSuggestion: aiSuggestion.value
    } as any).then(async (routeId) => {
      // 成功后，更新订单绑定该路线
      await OrderApi.updateOrder({
        id: orderData.value.id,
        routeId: routeId
      } as any)
      ElMessage.success('路线保存成功并已绑定订单')
      dialogVisible.value = false
      emit('success')
    })
  } catch (e) {
    ElMessage.error('保存路线失败')
  } finally {
    saving.value = false
  }
}

defineExpose({ open })
</script>
