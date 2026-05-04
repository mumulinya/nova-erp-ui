<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" v-loading="formLoading">
      <el-form-item label="车牌号" prop="plateNo">
        <el-input v-model="formData.plateNo" placeholder="请输入车牌号" />
      </el-form-item>
      <el-form-item label="车辆类型" prop="vehicleType">
        <el-input v-model="formData.vehicleType" placeholder="请输入车辆类型" />
      </el-form-item>
      <el-form-item label="载重(吨)" prop="maxWeight">
        <el-input-number v-model="formData.maxWeight" placeholder="请输入载重" :min="0" :precision="2" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="formData.status" placeholder="请选择状态">
          <el-option label="空闲" :value="0" />
          <el-option label="运输中" :value="1" />
          <el-option label="维修中" :value="2" />
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
import { VehicleApi, VehicleVO } from '@/api/erp/logistics/vehicle'

defineOptions({ name: 'VehicleForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
const formData = ref({
  id: undefined,
  plateNo: undefined,
  vehicleType: undefined,
  maxWeight: undefined,
  status: 0,
  remark: undefined
})
const formRules = reactive({
  plateNo: [{ required: true, message: '车牌号不能为空', trigger: 'blur' }],
  vehicleType: [{ required: true, message: '车辆类型不能为空', trigger: 'blur' }],
  maxWeight: [{ required: true, message: '载重不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
})
const formRef = ref()

const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  if (id) {
    formLoading.value = true
    try {
      formData.value = await VehicleApi.getVehicle(id)
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
    const data = formData.value as unknown as VehicleVO
    if (formType.value === 'create') {
      await VehicleApi.createVehicle(data)
      message.success(t('common.createSuccess'))
    } else {
      await VehicleApi.updateVehicle(data)
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
    plateNo: undefined,
    vehicleType: undefined,
    maxWeight: undefined,
    status: 0,
    remark: undefined
  }
  formRef.value?.resetFields()
}
</script>
