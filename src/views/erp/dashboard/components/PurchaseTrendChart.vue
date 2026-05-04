<template>
  <el-card shadow="hover" class="chart-card">
    <template #header>
      <span class="chart-title">近期采购金额趋势</span>
    </template>
    <div ref="chartRef" class="chart-container"></div>
  </el-card>
</template>
<script lang="ts" setup>
import * as echarts from 'echarts'
import type { DashboardTrendVO } from '@/api/erp/statistics/dashboard'

defineOptions({ name: 'PurchaseTrendChart' })

const props = defineProps<{ data: DashboardTrendVO[] }>()
const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

const renderChart = () => {
  if (!chartRef.value) return
  if (!chart) {
    chart = echarts.init(chartRef.value)
  }
  const dates = props.data.map((item) => item.date)
  const values = props.data.map((item) => Number(item.value))
  chart.setOption({
    tooltip: { trigger: 'axis', formatter: '{b}<br/>采购额：￥{c}' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: { rotate: 30, fontSize: 11 },
      boundaryGap: false
    },
    yAxis: { type: 'value', axisLabel: { formatter: '￥{value}' } },
    series: [
      {
        name: '采购额',
        type: 'line',
        data: values,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 3, color: '#E6A23C' },
        itemStyle: { color: '#E6A23C' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(230,162,60,0.3)' },
            { offset: 1, color: 'rgba(230,162,60,0.02)' }
          ])
        }
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
