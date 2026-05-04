<template>
  <Dialog title="运输订单详情" v-model="dialogVisible" width="800px">
    <el-descriptions border :column="2" class="mb-20px" v-loading="formLoading">
      <el-descriptions-item label="运输单号">{{ formData.orderNo }}</el-descriptions-item>
      <el-descriptions-item label="销售订单号">{{ formData.saleOrderNo }}</el-descriptions-item>
      <el-descriptions-item label="运输车辆">{{ vehicleName }}</el-descriptions-item>
      <el-descriptions-item label="配送路线">{{ routeName }}</el-descriptions-item>
      <el-descriptions-item label="收货地址" :span="2">{{ formData.receiverAddress }}</el-descriptions-item>
      <el-descriptions-item label="货物信息" :span="2">{{ formData.goodsInfo }}</el-descriptions-item>
      <el-descriptions-item label="时效要求">{{ formData.timeRequirement }}</el-descriptions-item>
      <el-descriptions-item label="出库时间">{{ formatDate(formData.outTime) }}</el-descriptions-item>
      <el-descriptions-item label="运输状态">
        <el-tag v-if="formData.status === 0" type="warning">待发货</el-tag>
        <el-tag v-else-if="formData.status === 1" type="primary">运输中</el-tag>
        <el-tag v-else-if="formData.status === 2" type="success">已签收</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ formatDate(formData.createTime) }}</el-descriptions-item>
      <el-descriptions-item label="备注" :span="2">{{ formData.remark }}</el-descriptions-item>
    </el-descriptions>

    <div v-if="routeData?.aiSuggestion" class="mt-4">
      <el-divider content-position="left">AI 路线建议</el-divider>
      <div class="bg-gray-50 p-4 rounded">
        <MarkdownView :content="routeData.aiSuggestion" />
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { OrderApi, OrderVO } from '@/api/erp/logistics/order'
import { RouteApi, RouteVO } from '@/api/erp/logistics/route'
import { VehicleApi, VehicleVO } from '@/api/erp/logistics/vehicle'
import { dateFormatter } from '@/utils/formatTime'
import MarkdownView from '@/components/MarkdownView/index.vue'

defineOptions({ name: 'OrderDetail' })

const dialogVisible = ref(false)
const formLoading = ref(false)
const formData = ref<OrderVO>({} as OrderVO)
const routeData = ref<RouteVO>()
const vehicleData = ref<VehicleVO>()

const vehicleName = computed(() => {
  if (vehicleData.value) {
    return `${vehicleData.value.plateNo}（${vehicleData.value.vehicleType}）`
  }
  return '未分配'
})

const routeName = computed(() => {
  if (routeData.value) {
    return `${routeData.value.startAddress} → ${routeData.value.endAddress}`
  }
  return '未分配'
})

const formatDate = (date: any) => {
  if (!date) return ''
  return dateFormatter(null, null, date)
}

const open = async (id: number) => {
  dialogVisible.value = true
  formLoading.value = true
  routeData.value = undefined
  vehicleData.value = undefined
  try {
    formData.value = await OrderApi.getOrder(id)
    if (formData.value.routeId) {
      routeData.value = await RouteApi.getRoute(formData.value.routeId)
    }
    if (formData.value.vehicleId) {
      vehicleData.value = await VehicleApi.getVehicle(formData.value.vehicleId)
    }
  } finally {
    formLoading.value = false
  }
}
defineExpose({ open })
</script>
