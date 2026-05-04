<template>
  <div class="report-container">
    <!-- 筛选条件 -->
    <el-card shadow="never" class="mb-16px">
      <el-form inline>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD HH:mm:ss"
            :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">
            <Icon icon="ep:search" class="mr-4px" /> 查询
          </el-button>
          <el-button @click="resetQuery">
            <Icon icon="ep:refresh" class="mr-4px" /> 重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <el-table :data="tableData" border stripe show-summary :summary-method="getSummaries">
        <el-table-column label="运输单号" prop="orderNo" min-width="150" />
        <el-table-column label="运输费(元)" prop="transportCost" min-width="120" align="right">
          <template #default="{ row }">{{ formatPrice(row.transportCost) }}</template>
        </el-table-column>
        <el-table-column label="燃油费(元)" prop="fuelCost" min-width="120" align="right">
          <template #default="{ row }">{{ formatPrice(row.fuelCost) }}</template>
        </el-table-column>
        <el-table-column label="过路费(元)" prop="tollCost" min-width="120" align="right">
          <template #default="{ row }">{{ formatPrice(row.tollCost) }}</template>
        </el-table-column>
        <el-table-column label="其他费用(元)" prop="otherCost" min-width="120" align="right">
          <template #default="{ row }">{{ formatPrice(row.otherCost) }}</template>
        </el-table-column>
        <el-table-column label="合计(元)" prop="totalCost" min-width="120" align="right">
          <template #default="{ row }">
            <span class="font-bold">{{ formatPrice(row.totalCost) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<script lang="ts" setup>
import { ReportApi, type LogisticsCostReportVO } from '@/api/erp/report'

defineOptions({ name: 'ErpLogisticsCostReport' })

const dateRange = ref<string[]>([])
const tableData = ref<LogisticsCostReportVO[]>([])

const formatPrice = (val: number) => {
  return val != null ? Number(val).toFixed(2) : '0.00'
}

const handleQuery = async () => {
  const params: any = {}
  if (dateRange.value && dateRange.value.length === 2) {
    params.beginTime = dateRange.value[0]
    params.endTime = dateRange.value[1]
  }
  tableData.value = await ReportApi.getLogisticsCostReport(params)
}

const resetQuery = () => {
  dateRange.value = []
  handleQuery()
}

/** 合计行 */
const getSummaries = (param: any) => {
  const { columns, data } = param
  const sums: string[] = []
  columns.forEach((_col: any, index: number) => {
    if (index === 0) {
      sums[index] = '合计'
      return
    }
    const prop = _col.property
    if (['transportCost', 'fuelCost', 'tollCost', 'otherCost', 'totalCost'].includes(prop)) {
      const total = data.reduce((sum: number, row: any) => sum + Number(row[prop] || 0), 0)
      sums[index] = total.toFixed(2)
    } else {
      sums[index] = ''
    }
  })
  return sums
}

onMounted(() => handleQuery())
</script>
<style lang="scss" scoped>
.report-container { padding: 8px; }
</style>
