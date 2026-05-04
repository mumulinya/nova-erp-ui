<template>
  <el-card shadow="hover" class="chart-card">
    <template #header>
      <span class="chart-title">物流状态分布</span>
    </template>
    <div ref="chartRef" class="chart-container"></div>
  </el-card>
</template>
<script lang="ts" setup>
import * as echarts from 'echarts'
import type { DashboardLogisticsStatusVO } from '@/api/erp/statistics/dashboard'

defineOptions({ name: 'LogisticsStatusChart' })

const props = defineProps<{ data: DashboardLogisticsStatusVO[] }>()
const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

const colorMap: Record<string, string> = {
  '待调度': '#909399',
  '运输中': '#E6A23C',
  '已送达': '#67C23A',
  '异常': '#F56C6C'
}

const renderChart = () => {
  if (!chartRef.value || !props.data.length) return
  if (!chart) {
    chart = echarts.init(chartRef.value)
  }
  const names = props.data.map((d) => d.statusName)
  const values = props.data.map((d) => d.count)
  const colors = props.data.map((d) => colorMap[d.statusName] || '#409EFF')

  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: names },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      {
        type: 'bar',
        data: values.map((v, i) => ({
          value: v,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: colors[i] },
              { offset: 1, color: colors[i] + '66' }
            ]),
            borderRadius: [6, 6, 0, 0]
          }
        })),
        barWidth: '40%',
        label: { show: true, position: 'top', fontWeight: 'bold' }
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
