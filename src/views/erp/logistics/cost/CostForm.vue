<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="600px">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px" v-loading="formLoading">
      <el-form-item label="关联运输订单" prop="logisticsOrderId">
        <el-select v-model="formData.logisticsOrderId" placeholder="请选择运输订单" clearable filterable class="!w-full" :disabled="!!formData.logisticsOrderId && formType !== 'create'">
          <el-option
            v-for="item in orderList"
            :key="item.id"
            :label="item.orderNo"
            :value="item.id"
          >
            <span style="float: left">{{ item.orderNo }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">
              {{ item.receiverAddress }}
            </span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="运输费用(元)" prop="transportCost">
        <el-input-number v-model="formData.transportCost" placeholder="请输入运输费用" :min="0" :precision="2" class="!w-full" @change="calculateTotal" />
      </el-form-item>
      <el-form-item label="燃油费(元)" prop="fuelCost">
        <el-input-number v-model="formData.fuelCost" placeholder="请输入燃油费" :min="0" :precision="2" class="!w-full" @change="calculateTotal" />
      </el-form-item>
      <el-form-item label="过路费(元)" prop="tollCost">
        <el-input-number v-model="formData.tollCost" placeholder="请输入过路费" :min="0" :precision="2" class="!w-full" @change="calculateTotal" />
      </el-form-item>
      <el-form-item label="其他费用(元)" prop="otherCost">
        <el-input-number v-model="formData.otherCost" placeholder="请输入其他费用" :min="0" :precision="2" class="!w-full" @change="calculateTotal" />
      </el-form-item>
      <el-form-item label="合计费用(元)" prop="totalCost">
        <el-input-number v-model="formData.totalCost" disabled class="!w-full" />
      </el-form-item>
      <el-form-item label="结算状态" prop="settlementStatus">
        <el-select v-model="formData.settlementStatus" placeholder="请选择结算状态" class="!w-full">
          <el-option label="未结算" :value="0" />
          <el-option label="部分结算" :value="1" />
          <el-option label="已结算" :value="2" />
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
import { CostApi, CostVO } from '@/api/erp/logistics/cost'
import { OrderApi } from '@/api/erp/logistics/order'

defineOptions({ name: 'CostForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
const formData = ref({
  id: undefined,
  logisticsOrderId: undefined,
  transportCost: 0,
  fuelCost: 0,
  tollCost: 0,
  otherCost: 0,
  totalCost: 0,
  settlementStatus: 0,
  remark: undefined
})
const formRules = reactive({
  logisticsOrderId: [{ required: true, message: '运输订单不能为空', trigger: 'change' }],
  transportCost: [{ required: true, message: '运输费用不能为空', trigger: 'blur' }],
  settlementStatus: [{ required: true, message: '结算状态不能为空', trigger: 'change' }]
})
const formRef = ref()

// 运输订单列表（下拉选择）
const orderList = ref<any[]>([])

/** 加载运输订单列表 */
const loadOrderList = async () => {
  try {
    orderList.value = await OrderApi.getSimpleList()
  } catch (e) {
    console.error('加载运输订单列表失败', e)
  }
}

const calculateTotal = () => {
  formData.value.totalCost = 
    (formData.value.transportCost || 0) + 
    (formData.value.fuelCost || 0) + 
    (formData.value.tollCost || 0) + 
    (formData.value.otherCost || 0)
}

const open = async (type: string, id?: number, defaultOrderId?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  if (defaultOrderId) {
    formData.value.logisticsOrderId = defaultOrderId
  }
  // 加载关联的运输订单列表
  await loadOrderList()
  if (id) {
    formLoading.value = true
    try {
      formData.value = await CostApi.getCost(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open })

const emit = defineEmits(['success'])
const submitForm = async () => {
  await formRef.value.validate()
  formLoading.value = true
  try {
    const data = formData.value as unknown as CostVO
    if (formType.value === 'create') {
      await CostApi.createCost(data)
      message.success(t('common.createSuccess'))
    } else {
      await CostApi.updateCost(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    id: undefined,
    logisticsOrderId: undefined,
    transportCost: 0,
    fuelCost: 0,
    tollCost: 0,
    otherCost: 0,
    totalCost: 0,
    settlementStatus: 0,
    remark: undefined
  }
  formRef.value?.resetFields()
}
</script>
