<template>
  <div class="ai-stock-suggest">
    <!-- 顶部统计区 -->
    <el-row :gutter="15" class="mb-15px">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-title text-gray-500 mb-2">紧急补货数</div>
          <div class="stat-value text-red-500 text-2xl font-bold">{{ emergencyCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-title text-gray-500 mb-2">需要补货数</div>
          <div class="stat-value text-orange-500 text-2xl font-bold">{{ restockCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-title text-gray-500 mb-2">需要清仓数</div>
          <div class="stat-value text-blue-500 text-2xl font-bold">{{ clearanceCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-title text-gray-500 mb-2">待处理总数</div>
          <div class="stat-value text-gray-700 text-2xl font-bold">{{ pendingCount }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索工作栏 -->
    <ContentWrap>
      <el-form
        class="-mb-15px"
        :model="queryParams"
        ref="queryFormRef"
        :inline="true"
        label-width="80px"
      >
        <el-form-item label="建议类型" prop="suggestType">
          <el-select v-model="queryParams.suggestType" placeholder="全部" clearable class="!w-240px">
            <el-option label="补货" :value="1" />
            <el-option label="清仓" :value="2" />
            <el-option label="调拨" :value="3" />
            <el-option label="正常" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="queryParams.priority" placeholder="全部" clearable class="!w-240px">
            <el-option label="紧急" :value="1" />
            <el-option label="普通" :value="2" />
            <el-option label="低" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
          <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
          <el-button
            type="primary"
            :loading="analyzing"
            @click="handleAnalyze"
            v-hasPermi="['erp:stock:ai-suggest:generate']"
          >
            <Icon icon="ep:cpu" class="mr-5px" />
            {{ analyzing ? '分析中...' : 'AI一键分析' }}
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
        :row-class-name="tableRowClassName"
      >
        <template #empty>
          <el-empty description="暂无库存优化建议，点击「AI一键分析」开始分析" />
        </template>

        <el-table-column label="优先级" prop="priority" align="center" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.priority === 1" type="danger" class="breath-animation">紧急</el-tag>
            <el-tag v-else-if="scope.row.priority === 2" type="warning">普通</el-tag>
            <el-tag v-else-if="scope.row.priority === 3" type="info">低</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="产品名称" prop="productName" min-width="150" />
        <el-table-column label="仓库名称" prop="warehouseName" min-width="150" />
        <el-table-column label="当前库存" prop="currentStock" align="center" min-width="100" />
        <el-table-column label="安全库存" prop="safetyStock" align="center" min-width="100" />
        <el-table-column label="最大库存" prop="maxStock" align="center" min-width="100" />
        <el-table-column label="库存占用" align="center" min-width="120">
          <template #default="scope">
            <el-progress
              v-if="scope.row.maxStock > 0"
              :percentage="Math.min(Math.round((scope.row.currentStock / scope.row.maxStock) * 100), 100)"
              :color="getUsageColor(scope.row.currentStock / scope.row.maxStock)"
              :stroke-width="14"
              :text-inside="true"
            />
            <span v-else class="text-gray-400">N/A</span>
          </template>
        </el-table-column>
        <el-table-column label="日均销量" prop="avgDailySale" align="center" min-width="100" />
        
        <el-table-column label="建议类型" prop="suggestType" align="center" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.suggestType === 1" type="danger">补货</el-tag>
            <el-tag v-else-if="scope.row.suggestType === 2" type="warning">清仓</el-tag>
            <el-tag v-else-if="scope.row.suggestType === 3" type="primary">调拨</el-tag>
            <el-tag v-else-if="scope.row.suggestType === 4" type="success">正常</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="AI优化建议" prop="suggestContent" min-width="250">
          <template #default="scope">
            <el-tooltip
              :content="scope.row.suggestContent"
              placement="top"
              :disabled="!scope.row.suggestContent || scope.row.suggestContent.length <= 25"
            >
              <span>{{ scope.row.suggestContent && scope.row.suggestContent.length > 25
                ? scope.row.suggestContent.substring(0, 25) + '...'
                : scope.row.suggestContent }}</span>
            </el-tooltip>
          </template>
        </el-table-column>

        <el-table-column label="状态" prop="status" align="center" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 0" type="primary">待处理</el-tag>
            <el-tag v-else-if="scope.row.status === 1" type="success">已处理</el-tag>
            <el-tag v-else-if="scope.row.status === 2" type="info">已忽略</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" align="center" width="180" fixed="right">
          <template #default="scope">
            <template v-if="scope.row.status === 0 && scope.row.suggestType !== 4">
              <el-button
                link
                type="success"
                @click="handleProcess(scope.row.id)"
                v-hasPermi="['erp:stock:ai-suggest:handle']"
              >
                标记已处理
              </el-button>
              <el-button
                link
                type="danger"
                plain
                @click="handleIgnore(scope.row.id)"
                v-hasPermi="['erp:stock:ai-suggest:ignore']"
              >
                忽略
              </el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </ContentWrap>
  </div>
</template>

<script setup lang="ts">
import {
  generateStockAiSuggest,
  getLatestStockAiSuggest,
  handleStockAiSuggest,
  ignoreStockAiSuggest,
  StockAiSuggestVO
} from '@/api/erp/stock/aiSuggest'
import { formatDate } from '@/utils/formatTime'

defineOptions({ name: 'StockAiSuggest' })

const message = useMessage() // 消息弹窗
const loading = ref(true) // 列表加载状态
const analyzing = ref(false) // 分析状态
const list = ref<StockAiSuggestVO[]>([]) // 列表数据
const lastAnalyzeTime = ref('') // 最后分析时间
const queryFormRef = ref() // 搜索表单

/** 搜索参数 */
const queryParams = reactive({
  suggestType: undefined as number | undefined,
  priority: undefined as number | undefined
})

/** 统计数据 */
const emergencyCount = computed(() => list.value.filter(i => i.suggestType === 1 && i.priority === 1).length)
const restockCount = computed(() => list.value.filter(i => i.suggestType === 1).length)
const clearanceCount = computed(() => list.value.filter(i => i.suggestType === 2).length)
const pendingCount = computed(() => list.value.filter(i => i.status === 0).length)

/** 库存占用率颜色：>90%红色，>70%橙色，>50%黄色，其他绿色 */
const getUsageColor = (ratio: number) => {
  if (ratio >= 0.9) return '#F56C6C'
  if (ratio >= 0.7) return '#E6A23C'
  if (ratio >= 0.5) return '#F7BA2A'
  return '#67C23A'
}

/** 前端过滤后的列表 */
const filteredList = computed(() => {
  let result = list.value
  if (queryParams.suggestType !== undefined && queryParams.suggestType !== null) {
    result = result.filter((item) => item.suggestType === queryParams.suggestType)
  }
  if (queryParams.priority !== undefined && queryParams.priority !== null) {
    result = result.filter((item) => item.priority === queryParams.priority)
  }
  return result
})

/** 行样式 */
const tableRowClassName = ({ row }: { row: StockAiSuggestVO }) => {
  if (row.priority === 1) {
    return 'emergency-row'
  }
  return ''
}

/** 获取列表数据 */
const getList = async () => {
  loading.value = true
  try {
    const data = await getLatestStockAiSuggest()
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
  // 触发 computed 进行前端过滤
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields()
  queryParams.suggestType = undefined
  queryParams.priority = undefined
}

/** 一键分析 */
const handleAnalyze = async () => {
  analyzing.value = true
  try {
    await generateStockAiSuggest()
    message.success('AI分析完成')
    lastAnalyzeTime.value = formatDate(new Date())
    await getList()
  } catch {
    message.error('分析失败，请重试')
  } finally {
    analyzing.value = false
  }
}

/** 标记已处理 */
const handleProcess = async (id: number) => {
  try {
    await message.confirm('确认已根据此建议处理库存吗？')
    await handleStockAiSuggest(id)
    message.success('已标记为已处理')
    await getList()
  } catch {}
}

/** 忽略建议 */
const handleIgnore = async (id: number) => {
  try {
    await message.confirm('确定忽略此建议吗？')
    await ignoreStockAiSuggest(id)
    message.success('已忽略此建议')
    await getList()
  } catch {}
}

/** 初始化 */
onMounted(async () => {
  await getList()
})
</script>

<style scoped lang="scss">
.ai-stock-suggest {
  .stat-card {
    text-align: center;
    border-radius: 8px;
    .stat-title {
      font-size: 14px;
    }
  }

  :deep(.emergency-row) {
    --el-table-tr-bg-color: #fff5f5;
  }

  .breath-animation {
    animation: breath 2s infinite ease-in-out;
  }

  @keyframes breath {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.6;
      transform: scale(1.05);
      box-shadow: 0 0 5px rgba(245, 108, 108, 0.5);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
}
</style>
