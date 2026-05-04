<template>
  <div class="report-container">
    <el-card shadow="never">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-bold">库存预警报表</span>
          <el-button type="primary" @click="handleQuery">
            <Icon icon="ep:refresh" class="mr-4px" /> 刷新
          </el-button>
        </div>
      </template>
      <el-table :data="tableData" border stripe>
        <el-table-column label="产品名称" prop="productName" min-width="150" />
        <el-table-column label="仓库" prop="warehouseName" min-width="120" />
        <el-table-column label="当前库存" prop="currentStock" min-width="100" align="right">
          <template #default="{ row }">
            <span :class="{ 'text-red': Number(row.currentStock) <= 0 }">
              {{ Number(row.currentStock).toFixed(2) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="安全库存" prop="safeStock" min-width="100" align="right">
          <template #default="{ row }">{{ Number(row.safeStock).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="缺口数量" prop="gapCount" min-width="100" align="right">
          <template #default="{ row }">
            <el-tag type="danger" effect="plain">{{ Number(row.gapCount).toFixed(2) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="Number(row.currentStock) <= 0" type="danger">缺货</el-tag>
            <el-tag v-else type="warning">预警</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<script lang="ts" setup>
import { ReportApi, type StockAlertVO } from '@/api/erp/report'

defineOptions({ name: 'ErpStockAlertReport' })

const tableData = ref<StockAlertVO[]>([])

const handleQuery = async () => {
  tableData.value = await ReportApi.getStockAlertReport()
}

onMounted(() => handleQuery())
</script>
<style lang="scss" scoped>
.report-container { padding: 8px; }
.text-red { color: #f56c6c; font-weight: bold; }
</style>
