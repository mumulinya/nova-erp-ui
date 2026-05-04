<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="100px"
    >
      <el-form-item label="产品名称" prop="productName">
        <el-input
          v-model="queryParams.productName"
          placeholder="请输入产品名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="全部状态" clearable class="!w-240px">
          <el-option label="待确认" :value="0" />
          <el-option label="已转订单" :value="1" />
          <el-option label="已忽略" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          :loading="analyzing"
          @click="handleAnalyze"
          v-hasPermi="['erp:purchase:ai-suggest:query']"
        >
          <Icon icon="ep:cpu" class="mr-5px" />
          {{ analyzing ? '分析中...' : 'AI一键分析' }}
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['erp:purchase:ai-suggest:query']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <div class="flex justify-between items-center mb-10px">
      <div class="text-gray-400 text-sm">
        最后分析时间：{{ lastAnalyzeTime || '暂无分析记录' }}
      </div>
    </div>

    <el-table
      v-loading="loading"
      :data="filteredList"
      :stripe="true"
      :show-overflow-tooltip="true"
    >
      <template #empty>
        <el-empty description="暂无建议，点击「AI一键分析」开始分析" />
      </template>

      <el-table-column label="编号" prop="id" align="center" width="80" />
      <el-table-column label="产品名称" prop="productName" min-width="150" />
      <el-table-column label="当前库存" prop="currentStock" align="center" min-width="100">
        <template #default="scope">
          <span :class="scope.row.currentStock < scope.row.safetyStock ? 'text-red-500 font-bold' : ''">
            {{ scope.row.currentStock }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="安全库存" prop="safetyStock" align="center" min-width="100" />
      <el-table-column label="建议采购量" prop="suggestCount" align="center" min-width="120">
        <template #default="scope">
          <span class="text-red-500 font-bold">{{ scope.row.suggestCount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="推荐供应商" prop="supplierName" min-width="150" />
      <el-table-column label="建议采购时间" prop="suggestTime" :formatter="dateFormatter2" min-width="120" />
      <el-table-column label="AI分析原因" prop="reason" min-width="200">
        <template #default="scope">
          <el-tooltip
            :content="scope.row.reason"
            placement="top"
            :disabled="!scope.row.reason || scope.row.reason.length <= 20"
          >
            <span>{{ scope.row.reason && scope.row.reason.length > 20
              ? scope.row.reason.substring(0, 20) + '...'
              : scope.row.reason }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status" align="center" min-width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.status === 0" type="primary">待确认</el-tag>
          <el-tag v-else-if="scope.row.status === 1" type="success">已转订单</el-tag>
          <el-tag v-else-if="scope.row.status === 2" type="info">已忽略</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="250" fixed="right">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="handleDetail(scope.row.id)"
            v-hasPermi="['erp:purchase:ai-suggest:query']"
          >
            详情
          </el-button>
          <template v-if="scope.row.status === 0">
            <el-button
              link
              type="success"
              @click="handleConfirm(scope.row.id)"
              v-hasPermi="['erp:purchase:ai-suggest:query']"
            >
              转为订单
            </el-button>
            <el-button
              link
              type="warning"
              @click="handleIgnore(scope.row.id)"
              v-hasPermi="['erp:purchase:ai-suggest:query']"
            >
              忽略
            </el-button>
          </template>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['erp:purchase:ai-suggest:query']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </ContentWrap>

  <!-- 详情弹窗 -->
  <AiSuggestDetail ref="detailRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter2 } from '@/utils/formatTime'
import download from '@/utils/download'
import {
  generateAiSuggest,
  getLatestAiSuggest,
  confirmAiSuggest,
  ignoreAiSuggest,
  deleteAiSuggest,
  exportAiSuggestExcel,
  AiSuggestVO
} from '@/api/erp/purchase/aiSuggest'
import { formatDate } from '@/utils/formatTime'
import AiSuggestDetail from './AiSuggestDetail.vue'

defineOptions({ name: 'PurchaseAiSuggest' })

const message = useMessage() // 消息弹窗
const loading = ref(true) // 列表加载状态
const analyzing = ref(false) // 分析状态
const exportLoading = ref(false) // 导出加载状态
const list = ref<AiSuggestVO[]>([]) // 列表数据
const lastAnalyzeTime = ref('') // 最后分析时间
const queryFormRef = ref() // 搜索表单

/** 搜索参数 */
const queryParams = reactive({
  productName: undefined as string | undefined,
  status: undefined as number | undefined
})

/** 前端过滤后的列表 */
const filteredList = computed(() => {
  let result = list.value
  if (queryParams.productName) {
    result = result.filter((item) =>
      item.productName.includes(queryParams.productName!)
    )
  }
  if (queryParams.status !== undefined && queryParams.status !== null) {
    result = result.filter((item) => item.status === queryParams.status)
  }
  return result
})

/** 获取列表数据 */
const getList = async () => {
  loading.value = true
  try {
    const data = await getLatestAiSuggest()
    list.value = data || []

    // 从数据中提取最后分析时间
    if (list.value.length > 0 && list.value[0].createTime) {
      lastAnalyzeTime.value = formatDate(list.value[0].createTime)
    }
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  // 前端筛选，触发 computed 即可
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields()
  queryParams.productName = undefined
  queryParams.status = undefined
}

/** 一键分析 */
const handleAnalyze = async () => {
  analyzing.value = true
  try {
    await generateAiSuggest()
    message.success('AI分析完成')
    lastAnalyzeTime.value = formatDate(new Date())
    await getList()
  } catch {
    message.error('分析失败，请重试')
  } finally {
    analyzing.value = false
  }
}

/** 查看详情 */
const detailRef = ref()
const handleDetail = (id: number) => {
  detailRef.value.open(id)
}

/** 确认转为采购订单 */
const handleConfirm = async (id: number) => {
  try {
    await message.confirm('确认将此建议转为采购订单吗？')
    await confirmAiSuggest(id)
    message.success('已转为采购订单')
    await getList()
  } catch {}
}

/** 忽略建议 */
const handleIgnore = async (id: number) => {
  try {
    await message.confirm('确定忽略此建议吗？')
    await ignoreAiSuggest(id)
    message.success('已忽略此建议')
    await getList()
  } catch {}
}

/** 删除建议 */
const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await deleteAiSuggest(id)
    message.success('删除成功')
    await getList()
  } catch {}
}

/** 导出 */
const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await exportAiSuggestExcel()
    download.excel(data, 'AI采购建议.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 */
onMounted(async () => {
  await getList()
})
</script>
