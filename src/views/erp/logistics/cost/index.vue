<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form class="-mb-15px" :model="queryParams" ref="queryFormRef" :inline="true" label-width="90px">
      <el-form-item label="运输订单" prop="logisticsOrderId">
        <el-select v-model="queryParams.logisticsOrderId" placeholder="请选择运输订单" clearable filterable class="!w-240px">
          <el-option v-for="item in orderList" :key="item.id" :label="item.orderNo" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="结算状态" prop="settlementStatus">
        <el-select v-model="queryParams.settlementStatus" placeholder="请选择结算状态" clearable class="!w-240px">
          <el-option label="未结算" :value="0" />
          <el-option label="部分结算" :value="1" />
          <el-option label="已结算" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button type="primary" plain @click="openForm('create')" v-hasPermi="['erp:logistics-cost:create']">
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button type="success" plain @click="handleExport" :loading="exportLoading" v-hasPermi="['erp:logistics-cost:export']">
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="费用单ID" align="center" prop="id" width="90" />
      <el-table-column label="运输单号" align="center" min-width="150" prop="orderNo">
        <template #default="scope">
          <router-link :to="'/logistics/order-detail?id=' + scope.row.logisticsOrderId" class="text-primary hover:underline">
            {{ scope.row.orderNo || getOrderNo(scope.row.logisticsOrderId) }}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="客户名称" align="center" prop="receiverName" min-width="120" />
      <el-table-column label="配送地址" align="center" prop="receiverAddress" min-width="180" />
      <el-table-column label="运输费用" align="center" prop="transportCost" width="100" />
      <el-table-column label="合计费用" align="center" prop="totalCost" width="100" />
      <el-table-column label="结算状态" align="center" prop="settlementStatus" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.settlementStatus === 0" type="danger">未结算</el-tag>
          <el-tag v-else-if="scope.row.settlementStatus === 1" type="warning">部分结算</el-tag>
          <el-tag v-else-if="scope.row.settlementStatus === 2" type="success">已结算</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="创建时间" align="center" prop="createTime" :formatter="dateFormatter" width="180px" />
      <el-table-column label="操作" align="center" width="160" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="openForm('update', scope.row.id)" v-hasPermi="['erp:logistics-cost:update']">
            编辑
          </el-button>
          <el-button link type="success" @click="handleSettle(scope.row)" v-if="scope.row.settlementStatus !== 2" v-hasPermi="['erp:logistics-cost:update']">
            结算
          </el-button>
          <el-button link type="danger" @click="handleDelete(scope.row.id)" v-hasPermi="['erp:logistics-cost:delete']">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination :total="total" v-model:page="queryParams.pageNo" v-model:limit="queryParams.pageSize" @pagination="getList" />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <CostForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { CostApi, CostVO } from '@/api/erp/logistics/cost'
import { OrderApi } from '@/api/erp/logistics/order'
import CostForm from './CostForm.vue'

defineOptions({ name: 'LogisticsCost' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<CostVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  logisticsOrderId: undefined,
  settlementStatus: undefined
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

// 运输订单列表（用于列表展示和搜索下拉）
const orderList = ref<any[]>([])

/** 获取运输单号 */
const getOrderNo = (orderId: number) => {
  const order = orderList.value.find(o => o.id === orderId)
  return order ? order.orderNo : '未知订单'
}

/** 加载运输订单列表 */
const loadOrderList = async () => {
  try {
    orderList.value = await OrderApi.getSimpleList()
  } catch (e) {
    console.error('加载运输订单列表失败', e)
  }
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await CostApi.getCostPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await CostApi.deleteCost(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await CostApi.exportCost(queryParams)
    download.excel(data, '运输费用.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 结算按钮操作 */
const handleSettle = async (row: CostVO) => {
  try {
    await message.confirm('确认将该费用单标记为已结算吗？')
    await CostApi.updateCost({ ...row, settlementStatus: 2 })
    message.success('结算成功')
    await getList()
  } catch {}
}

/** 初始化 **/
onMounted(async () => {
  await loadOrderList()
  await getList()
})
</script>
