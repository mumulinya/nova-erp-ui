<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px" v-loading="formLoading">
      <el-form-item label="起点" prop="startAddress">
        <el-input v-model="formData.startAddress" placeholder="请输入起点" />
      </el-form-item>
      <el-form-item label="终点" prop="endAddress">
        <el-input v-model="formData.endAddress" placeholder="请输入终点" />
      </el-form-item>
      <el-form-item label="距离(km)" prop="distance">
        <el-input-number v-model="formData.distance" placeholder="请输入距离" :min="0" :precision="2" />
      </el-form-item>
      <el-form-item label="预计时长(小时)" prop="estimatedHours">
        <el-input-number v-model="formData.estimatedHours" placeholder="请输入预计时长" :min="0" :precision="2" />
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
import { RouteApi, RouteVO } from '@/api/erp/logistics/route'

defineOptions({ name: 'RouteForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
const formData = ref({
  id: undefined,
  startAddress: undefined,
  endAddress: undefined,
  distance: undefined,
  estimatedHours: undefined,
  remark: undefined
})
const formRules = reactive({
  startAddress: [{ required: true, message: '起点不能为空', trigger: 'blur' }],
  endAddress: [{ required: true, message: '终点不能为空', trigger: 'blur' }],
  distance: [{ required: true, message: '距离不能为空', trigger: 'blur' }]
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
      formData.value = await RouteApi.getRoute(id)
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
    const data = formData.value as unknown as RouteVO
    if (formType.value === 'create') {
      await RouteApi.createRoute(data)
      message.success(t('common.createSuccess'))
    } else {
      await RouteApi.updateRoute(data)
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
    startAddress: undefined,
    endAddress: undefined,
    distance: undefined,
    estimatedHours: undefined,
    remark: undefined
  }
  formRef.value?.resetFields()
}
</script>
