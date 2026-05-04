<template>
  <div class="dashboard-container">
    <!-- 顶部指标卡 -->
    <KpiCards :kpi="kpiData" />

    <!-- 中部三列 -->
    <el-row :gutter="16" class="dashboard-row">
      <el-col :span="8">
        <SaleTrendChart :data="saleTrendData" />
      </el-col>
      <el-col :span="8">
        <StockHealthChart :data="stockHealthData" />
      </el-col>
      <el-col :span="8">
        <LogisticsStatusChart :data="logisticsStatusData" />
      </el-col>
    </el-row>

    <!-- 底部两列 -->
    <el-row :gutter="16" class="dashboard-row">
      <el-col :span="12">
        <PurchaseTrendChart :data="purchaseTrendData" />
      </el-col>
      <el-col :span="12">
        <AiAnalysisPanel />
      </el-col>
    </el-row>
  </div>
</template>
<script lang="ts" setup>
import KpiCards from './components/KpiCards.vue'
import SaleTrendChart from './components/SaleTrendChart.vue'
import StockHealthChart from './components/StockHealthChart.vue'
import LogisticsStatusChart from './components/LogisticsStatusChart.vue'
import PurchaseTrendChart from './components/PurchaseTrendChart.vue'
import AiAnalysisPanel from './components/AiAnalysisPanel.vue'
import {
  DashboardApi,
  type DashboardKpiVO,
  type DashboardTrendVO,
  type DashboardStockHealthVO,
  type DashboardLogisticsStatusVO
} from '@/api/erp/statistics/dashboard'

defineOptions({ name: 'ErpDashboard' })

const kpiData = ref<DashboardKpiVO>()
const saleTrendData = ref<DashboardTrendVO[]>([])
const stockHealthData = ref<DashboardStockHealthVO>()
const logisticsStatusData = ref<DashboardLogisticsStatusVO[]>([])
const purchaseTrendData = ref<DashboardTrendVO[]>([])

const loadData = async () => {
  const [kpi, saleTrend, stockHealth, logisticsStatus, purchaseTrend] = await Promise.all([
    DashboardApi.getKpi(),
    DashboardApi.getSaleTrend(),
    DashboardApi.getStockHealth(),
    DashboardApi.getLogisticsStatus(),
    DashboardApi.getPurchaseTrend()
  ])
  kpiData.value = kpi
  saleTrendData.value = saleTrend || []
  stockHealthData.value = stockHealth
  logisticsStatusData.value = logisticsStatus || []
  purchaseTrendData.value = purchaseTrend || []
}

onMounted(() => loadData())
</script>
<style lang="scss" scoped>
.dashboard-container {
  padding: 8px;
}

.dashboard-row {
  margin-top: 16px;

  .el-col {
    margin-bottom: 0;
  }
}
</style>
