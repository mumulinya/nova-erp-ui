<template>
  <el-card shadow="hover" class="chart-card">
    <template #header>
      <span class="chart-title">库存健康度</span>
    </template>
    <div ref="chartRef" class="chart-container"></div>
  </el-card>
</template>
<script lang="ts" setup>
import * as echarts from 'echarts'
import type { DashboardStockHealthVO } from '@/api/erp/statistics/dashboard'

defineOptions({ name: 'StockHealthChart' })

const props = defineProps<{ data: DashboardStockHealthVO | undefined }>()
const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

const renderChart = () => {
  if (!chartRef.value || !props.data) return
  if (!chart) {
    chart = echarts.init(chartRef.value)
  }
  chart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: '5%', left: 'center' },
    color: ['#67C23A', '#E6A23C', '#F56C6C'],
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
        label: { show: true, formatter: '{b}\n{c}个' },
        emphasis: {
          label: { show: true, fontSize: 16, fontWeight: 'bold' }
        },
        data: [
          { value: props.data.normalCount, name: '正常' },
          { value: props.data.alertCount, name: '预警' },
          { value: props.data.outOfStockCount, name: '缺货' }
        ]
      }
    ]
  })
}

watch(() => props.data, renderChart, { deep: true })
onMounted(() => {
  renderChart()
  window.addEventListener('resize', () => chart?.resize())
})
onUnmounted(() => { chart?.dispose() })
</script>
<style lang="scss" scoped>
.chart-card { height: 100%; }
.chart-title { font-weight: 600; font-size: 15px; }
.chart-container { width: 100%; height: 300px; }
</style>
