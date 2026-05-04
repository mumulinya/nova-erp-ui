<template>
  <div class="ai-sale-analysis">
    <!-- 上半部分：数据图表区 -->
    <el-row :gutter="20" class="mb-20px">
      <!-- 左侧：销售趋势折线图 -->
      <el-col :span="14">
        <el-card shadow="hover" class="h-400px">
          <template #header>
            <div class="card-header">
              <span class="font-bold">近6个月销售趋势</span>
            </div>
          </template>
          <div ref="chartRef" class="w-full h-300px"></div>
        </el-card>
      </el-col>
      
      <!-- 右侧：热销产品与优质客户 -->
      <el-col :span="10">
        <el-card shadow="hover" class="h-400px flex flex-col">
          <template #header>
            <div class="card-header">
              <span class="font-bold">本月核心数据表现</span>
            </div>
          </template>
          <div class="flex-1 overflow-auto">
            <!-- 热销产品 TOP3 -->
            <div class="mb-4">
              <div class="text-sm text-gray-500 mb-2">🔥 热销产品 TOP3</div>
              <div v-if="topProducts.length === 0" class="text-gray-400 text-sm text-center py-2">暂无数据</div>
              <div v-for="(item, index) in topProducts" :key="index" class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div class="flex items-center">
                  <span class="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mr-3">{{ index + 1 }}</span>
                  <span class="text-gray-700 truncate w-150px" :title="item.name">{{ item.name }}</span>
                </div>
                <span class="text-red-500 font-bold">¥{{ (item.amount || 0).toLocaleString() }}</span>
              </div>
            </div>
            
            <!-- 优质客户 TOP3 -->
            <div>
              <div class="text-sm text-gray-500 mb-2">👑 优质客户 TOP3</div>
              <div v-if="topCustomers.length === 0" class="text-gray-400 text-sm text-center py-2">暂无数据</div>
              <div v-for="(item, index) in topCustomers" :key="index" class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div class="flex items-center">
                  <span class="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold mr-3">{{ index + 1 }}</span>
                  <span class="text-gray-700 truncate w-150px" :title="item.name">{{ item.name }}</span>
                </div>
                <span class="text-red-500 font-bold">¥{{ (item.amount || 0).toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 下半部分：AI分析区 -->
    <el-row :gutter="20">
      <!-- 左侧：AI分析结果 -->
      <el-col :span="14">
        <el-card shadow="hover" class="h-500px">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-bold">✨ AI 深度分析报告</span>
              <div v-if="latestAnalysis" class="flex items-center gap-3">
                <span class="text-sm text-gray-400">分析时间：{{ formatDate(latestAnalysis.createTime) }}</span>
                <el-tag v-if="latestAnalysis.trendType === 1" type="success" effect="dark">↑ 上升趋势</el-tag>
                <el-tag v-else-if="latestAnalysis.trendType === 2" type="danger" effect="dark">↓ 下降趋势</el-tag>
                <el-tag v-else-if="latestAnalysis.trendType === 3" type="info" effect="dark">→ 平稳</el-tag>
              </div>
            </div>
          </template>
          
          <div v-if="latestAnalysis" class="h-400px overflow-auto pr-2 custom-scrollbar">
            <!-- 趋势分析 -->
            <div class="mb-6">
              <div class="flex items-center mb-3">
                <Icon icon="ep:data-line" class="text-blue-500 mr-2 text-lg" />
                <span class="font-bold text-gray-800 text-base">本月趋势洞察</span>
              </div>
              <div class="text-gray-600 leading-relaxed whitespace-pre-wrap pl-6">{{ latestAnalysis.trendContent }}</div>
            </div>
            
            <!-- 销售建议 -->
            <div class="bg-[#f0f9ff] p-5 rounded-lg border border-blue-100">
              <div class="flex items-center mb-3">
                <Icon icon="ep:lightbulb" class="text-yellow-500 mr-2 text-lg" />
                <span class="font-bold text-gray-800 text-base">AI 销售建议</span>
              </div>
              <div class="text-gray-600 leading-relaxed whitespace-pre-wrap pl-6">{{ latestAnalysis.suggestContent }}</div>
            </div>
          </div>
          <div v-else class="h-400px flex items-center justify-center">
            <el-empty description="暂无分析结果，请在右侧点击「AI重新分析」" />
          </div>
        </el-card>
      </el-col>
      
      <!-- 右侧：操作与历史记录 -->
      <el-col :span="10">
        <el-card shadow="hover" class="h-500px flex flex-col">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-bold">分析历史</span>
              <el-button
                type="primary"
                :loading="analyzing"
                @click="handleAnalyze"
                v-hasPermi="['erp:sale:ai-analysis:generate']"
              >
                <Icon icon="ep:cpu" class="mr-5px" />
                {{ analyzing ? '分析中...' : 'AI重新分析' }}
              </el-button>
            </div>
          </template>
          
          <div class="flex-1 overflow-hidden">
            <el-table v-loading="historyLoading" :data="historyList" :stripe="true" height="400">
              <el-table-column label="分析月份" prop="analysisMonth" align="center" width="100" />
              <el-table-column label="趋势" prop="trendType" align="center" width="100">
                <template #default="scope">
                  <el-tag v-if="scope.row.trendType === 1" type="success" size="small">上升</el-tag>
                  <el-tag v-else-if="scope.row.trendType === 2" type="danger" size="small">下降</el-tag>
                  <el-tag v-else-if="scope.row.trendType === 3" type="info" size="small">平稳</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="分析时间" prop="createTime" :formatter="dateFormatter" min-width="150" />
              <el-table-column label="操作" align="center" width="80" fixed="right">
                <template #default="scope">
                  <el-button link type="primary" @click="handleViewHistory(scope.row)">
                    查看
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <!-- 分页 -->
            <Pagination
              v-model:limit="queryParams.pageSize"
              v-model:page="queryParams.pageNo"
              :total="total"
              @pagination="getHistory"
              class="mt-3"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 历史记录详情弹窗 -->
    <el-dialog v-model="dialogVisible" title="分析报告详情" width="800px" destroy-on-close>
      <div v-if="currentDetail" class="max-h-60vh overflow-auto custom-scrollbar">
        <div class="mb-4 flex gap-4 text-gray-500">
          <span>分析月份：{{ currentDetail.analysisMonth }}</span>
          <span>分析时间：{{ formatDate(currentDetail.createTime) }}</span>
          <span>当月总销额：¥{{ (currentDetail.totalSaleAmount || 0).toLocaleString() }}</span>
        </div>
        
        <div class="mb-6">
          <h3 class="font-bold mb-2">本月趋势洞察</h3>
          <div class="bg-gray-50 p-4 rounded text-gray-700 whitespace-pre-wrap">{{ currentDetail.trendContent }}</div>
        </div>
        
        <div>
          <h3 class="font-bold mb-2 text-blue-600">AI 销售建议</h3>
          <div class="bg-blue-50 p-4 rounded text-gray-700 whitespace-pre-wrap">{{ currentDetail.suggestContent }}</div>
        </div>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">关 闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import {
  generateSaleAiAnalysis,
  getLatestSaleAiAnalysis,
  getSaleMonthlyTrend,
  getSaleAiAnalysisHistory,
  SaleAiAnalysisVO
} from '@/api/erp/sale/aiAnalysis'
import { formatDate, dateFormatter } from '@/utils/formatTime'

defineOptions({ name: 'SaleAiAnalysis' })

const message = useMessage()
const analyzing = ref(false)

// 数据结构
interface TopData {
  name: string
  amount: number
}

// 状态
const latestAnalysis = ref<SaleAiAnalysisVO | null>(null)
const topProducts = ref<TopData[]>([])
const topCustomers = ref<TopData[]>([])

// 图表相关
const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

// 历史记录相关
const historyLoading = ref(false)
const historyList = ref<SaleAiAnalysisVO[]>([])
const total = ref(0)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10
})

// 弹窗相关
const dialogVisible = ref(false)
const currentDetail = ref<SaleAiAnalysisVO | null>(null)

/** 初始化图表 */
const initChart = (data: any[]) => {
  if (!chartRef.value) return
  
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }
  
  const xData = data.map(item => item.month || '')
  const yData = data.map(item => item.amount || 0)
  
  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: '{b}<br/>销售额: ¥{c}'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xData,
      axisLine: { lineStyle: { color: '#E5E7EB' } },
      axisLabel: { color: '#6B7280' }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { type: 'dashed', color: '#E5E7EB' } },
      axisLabel: { color: '#6B7280' }
    },
    series: [
      {
        data: yData,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#3b82f6',
          borderWidth: 2
        },
        lineStyle: {
          width: 3,
          color: '#3b82f6'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(59, 130, 246, 0.4)' },
            { offset: 1, color: 'rgba(59, 130, 246, 0.0)' }
          ])
        }
      }
    ]
  }
  
  chartInstance.setOption(option)
}

/** 窗口大小改变时重绘图表 */
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

/** 解析 JSON 字符串，防错处理 */
const parseTopData = (jsonStr?: string): TopData[] => {
  if (!jsonStr) return []
  try {
    return JSON.parse(jsonStr)
  } catch (e) {
    return []
  }
}

/** 获取最新分析数据 */
const loadLatestData = async () => {
  try {
    const data = await getLatestSaleAiAnalysis()
    latestAnalysis.value = data || null
    if (data) {
      topProducts.value = parseTopData(data.topProduct)
      topCustomers.value = parseTopData(data.topCustomer)
    }
  } catch {}
}

/** 获取历史列表 */
const getHistory = async () => {
  historyLoading.value = true
  try {
    const data = await getSaleAiAnalysisHistory(queryParams)
    historyList.value = data.list || []
    total.value = data.total || 0
  } finally {
    historyLoading.value = false
  }
}

/** 加载图表趋势数据 */
const loadTrendData = async () => {
  try {
    const data = await getSaleMonthlyTrend()
    initChart(data || [])
  } catch {}
}

/** AI 重新分析 */
const handleAnalyze = async () => {
  analyzing.value = true
  try {
    await generateSaleAiAnalysis()
    message.success('AI分析完成')
    queryParams.pageNo = 1
    await Promise.all([
      loadLatestData(),
      loadTrendData(),
      getHistory()
    ])
  } catch {
    message.error('分析失败，请重试')
  } finally {
    analyzing.value = false
  }
}

/** 查看历史记录详情 */
const handleViewHistory = (row: SaleAiAnalysisVO) => {
  currentDetail.value = row
  dialogVisible.value = true
}

/** 初始化 */
onMounted(async () => {
  await Promise.all([
    loadLatestData(),
    loadTrendData(),
    getHistory()
  ])
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<style scoped lang="scss">
.ai-sale-analysis {
  .custom-scrollbar {
    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background: #dcdfe6;
      border-radius: 4px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
  }
}
</style>
