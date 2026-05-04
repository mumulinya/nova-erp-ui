<template>
  <div class="report-container">
    <!-- 筛选条件 -->
    <el-card shadow="never" class="mb-16px">
      <el-form :model="queryParams" inline>
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
        <el-form-item label="供应商">
          <el-select v-model="queryParams.supplierId" placeholder="全部" clearable style="width: 200px">
            <el-option
              v-for="item in supplierList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
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
      <el-table :data="tableData" border stripe>
        <el-table-column label="供应商" prop="supplierName" min-width="150" />
        <el-table-column label="采购入库金额(元)" prop="inPrice" min-width="140" align="right">
          <template #default="{ row }">{{ formatPrice(row.inPrice) }}</template>
        </el-table-column>
        <el-table-column label="采购退货金额(元)" prop="returnPrice" min-width="140" align="right">
          <template #default="{ row }">{{ formatPrice(row.returnPrice) }}</template>
        </el-table-column>
        <el-table-column label="净采购金额(元)" prop="netPrice" min-width="140" align="right">
          <template #default="{ row }">
            <span :class="{ 'text-red': row.netPrice < 0 }">{{ formatPrice(row.netPrice) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<script lang="ts" setup>
import { ReportApi, type PurchaseReportVO } from '@/api/erp/report'
import request from '@/config/axios'

defineOptions({ name: 'ErpPurchaseReport' })

const dateRange = ref<string[]>([])
const queryParams = reactive({ supplierId: undefined as number | undefined })
const tableData = ref<PurchaseReportVO[]>([])
const supplierList = ref<any[]>([])

const formatPrice = (val: number) => {
  return val != null ? Number(val).toFixed(2) : '0.00'
}

const handleQuery = async () => {
  const params: any = {}
  if (dateRange.value && dateRange.value.length === 2) {
    params.beginTime = dateRange.value[0]
    params.endTime = dateRange.value[1]
  }
  if (queryParams.supplierId) params.supplierId = queryParams.supplierId
  tableData.value = await ReportApi.getPurchaseReport(params)
}

const resetQuery = () => {
  dateRange.value = []
  queryParams.supplierId = undefined
  handleQuery()
}

/** 加载供应商列表 */
const loadSuppliers = async () => {
  try {
    supplierList.value = await request.get({ url: '/erp/supplier/simple-list' })
  } catch (e) {
    supplierList.value = []
  }
}

onMounted(() => {
  loadSuppliers()
  handleQuery()
})
</script>
<style lang="scss" scoped>
.report-container { padding: 8px; }
.text-red { color: #f56c6c; }
</style>
