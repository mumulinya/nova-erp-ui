<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="600px">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" v-loading="formLoading">
      <el-form-item label="运输单号" prop="orderNo">
        <el-input v-model="formData.orderNo" placeholder="请输入运输单号" />
      </el-form-item>
      <el-form-item label="销售订单ID" prop="saleOrderId">
        <el-input-number v-model="formData.saleOrderId" placeholder="请输入销售订单ID" :min="1" class="!w-100%" />
      </el-form-item>
      <el-form-item label="销售订单号" prop="saleOrderNo">
        <el-input v-model="formData.saleOrderNo" readonly placeholder="系统自动生成" />
      </el-form-item>
      <el-form-item label="运输车辆" prop="vehicleId">
        <el-select v-model="formData.vehicleId" placeholder="请选择运输车辆" clearable filterable class="!w-100%">
          <el-option
            v-for="item in vehicleList"
            :key="item.id"
            :label="item.plateNo + '（' + item.vehicleType + ' / 载重' + item.maxWeight + '吨）'"
            :value="item.id"
          >
            <span style="float: left">{{ item.plateNo }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">
              {{ item.vehicleType }} / {{ item.maxWeight }}吨
            </span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="配送路线" prop="routeId">
        <el-select v-model="formData.routeId" placeholder="请选择配送路线" clearable filterable class="!w-100%">
          <el-option
            v-for="item in routeList"
            :key="item.id"
            :label="item.startAddress + ' → ' + item.endAddress"
            :value="item.id"
          >
            <span style="float: left">{{ item.startAddress }} → {{ item.endAddress }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">
              {{ item.distance }}km / 约{{ item.estimatedHours }}小时
            </span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="收货地址" prop="receiverAddress">
        <el-input v-model="formData.receiverAddress" placeholder="请输入收货地址" />
      </el-form-item>
      <el-form-item label="货物信息" prop="goodsInfo">
        <el-input type="textarea" v-model="formData.goodsInfo" placeholder="请输入货物信息" />
      </el-form-item>
      <el-form-item label="时效要求" prop="timeRequirement">
        <el-input v-model="formData.timeRequirement" placeholder="请输入时效要求" />
      </el-form-item>
      <el-form-item label="出库时间" prop="outTime">
        <el-date-picker
          v-model="formData.outTime"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm:ss"
          placeholder="选择计划出库时间"
          class="!w-100%"
        />
      </el-form-item>
      <el-form-item label="运输状态" prop="status">
        <el-select v-model="formData.status" placeholder="请选择运输状态" class="!w-100%">
          <el-option label="待发货" :value="0" />
          <el-option label="运输中" :value="1" />
          <el-option label="已签收" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input type="textarea" v-model="formData.remark" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { OrderApi, OrderVO } from '@/api/erp/logistics/order'
import { VehicleApi, VehicleVO } from '@/api/erp/logistics/vehicle'
import { RouteApi, RouteVO } from '@/api/erp/logistics/route'

defineOptions({ name: 'OrderForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中
const formType = ref('') // 表单的类型
const formData = ref({
  id: undefined,
  orderNo: undefined,
  saleOrderId: undefined,
  saleOrderNo: undefined,
  vehicleId: undefined,
  routeId: undefined,
  receiverAddress: undefined,
  goodsInfo: undefined,
  timeRequirement: undefined,
  outTime: undefined,
  status: 0,
  remark: undefined
})
const formRules = reactive({
  orderNo: [{ required: true, message: '运输单号不能为空', trigger: 'blur' }],
  saleOrderId: [{ required: true, message: '销售订单ID不能为空', trigger: 'blur' }],
  receiverAddress: [{ required: true, message: '收货地址不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '运输状态不能为空', trigger: 'change' }]
})
const formRef = ref() // 表单 Ref

// 关联数据列表
const vehicleList = ref<VehicleVO[]>([]) // 车辆列表
const routeList = ref<RouteVO[]>([]) // 路线列表

/** 加载关联数据 */
const loadRelatedData = async () => {
  try {
    const [vehicles, routes] = await Promise.all([
      VehicleApi.getSimpleList(),
      RouteApi.getSimpleList()
    ])
    vehicleList.value = vehicles
    routeList.value = routes
  } catch (e) {
    console.error('加载关联数据失败', e)
  }
}

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 加载车辆和路线下拉列表
  await loadRelatedData()
  if (id) {
    formLoading.value = true
    try {
      formData.value = await OrderApi.getOrder(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open })

/** 提交表单 */
const emit = defineEmits(['success'])
const submitForm = async () => {
  await formRef.value.validate()
  formLoading.value = true
  try {
    const data = formData.value as unknown as OrderVO
    if (formType.value === 'create') {
      await OrderApi.createOrder(data)
      message.success(t('common.createSuccess'))
    } else {
      await OrderApi.updateOrder(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    orderNo: undefined,
    saleOrderId: undefined,
    saleOrderNo: undefined,
    vehicleId: undefined,
    routeId: undefined,
    receiverAddress: undefined,
    goodsInfo: undefined,
    timeRequirement: undefined,
    status: 0,
    remark: undefined
  }
  formRef.value?.resetFields()
}
</script>
