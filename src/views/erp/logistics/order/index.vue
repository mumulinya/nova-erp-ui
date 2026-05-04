<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form class="-mb-15px" :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
      <el-form-item label="运输单号" prop="orderNo">
        <el-input v-model="queryParams.orderNo" placeholder="请输入运输单号" clearable @keyup.enter="handleQuery" class="!w-240px" />
      </el-form-item>
      <el-form-item label="运输车辆" prop="vehicleId">
        <el-select v-model="queryParams.vehicleId" placeholder="请选择车辆" clearable filterable class="!w-240px">
          <el-option v-for="item in vehicleList" :key="item.id" :label="item.plateNo" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="运输状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择运输状态" clearable class="!w-240px">
          <el-option label="待发货" :value="0" />
          <el-option label="运输中" :value="1" />
          <el-option label="已签收" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button type="primary" plain @click="openForm('create')" v-hasPermi="['erp:logistics-order:create']">
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button type="success" plain @click="handleExport" :loading="exportLoading" v-hasPermi="['erp:logistics-order:export']">
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="运输单号" align="center" prop="orderNo" min-width="120" />
      <el-table-column label="销售订单号" align="center" prop="saleOrderNo" min-width="120" />
      <el-table-column label="运输车辆" align="center" min-width="120">
        <template #default="scope">
          <span v-if="scope.row.plateNo">{{ scope.row.plateNo }}</span>
          <span v-else-if="scope.row.vehicleId" style="color: #909399">未知车辆</span>
          <span v-else style="color: #909399">未分配</span>
        </template>
      </el-table-column>
      <el-table-column label="配送路线" align="center" min-width="160">
        <template #default="scope">
          <span v-if="scope.row.routeName">{{ scope.row.routeName }}</span>
          <span v-else-if="scope.row.routeId" style="color: #909399">未知路线</span>
          <span v-else style="color: #909399">未分配</span>
        </template>
      </el-table-column>
      <el-table-column label="收货地址" align="center" prop="receiverAddress" min-width="140" />
      <el-table-column label="货物信息" align="center" prop="goodsInfo" min-width="120" />
      <el-table-column label="出库时间" align="center" prop="outTime" :formatter="dateFormatter" width="180px" />
      <el-table-column label="运输状态" align="center" prop="status" width="90">
        <template #default="scope">
          <el-tag v-if="scope.row.status === 0" type="warning">待发货</el-tag>
          <el-tag v-else-if="scope.row.status === 1" type="primary">运输中</el-tag>
          <el-tag v-else-if="scope.row.status === 2" type="success">已签收</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" :formatter="dateFormatter" width="180px" />
      <el-table-column label="操作" align="center" width="220" fixed="right">
        <template #default="scope">
          <el-button
            link
            type="warning"
            @click="handleAiDispatch(scope.row.id)"
            v-if="scope.row.status === 0 && !scope.row.vehicleId"
            v-hasPermi="['erp:logistics-order:update']"
          >
            <Icon icon="ep:magic-stick" class="mr-1" />AI智能调度
          </el-button>
          <el-button
            link
            type="warning"
            @click="openAiRouteForm(scope.row.id)"
            v-if="scope.row.status === 0 && scope.row.vehicleId && !scope.row.routeId"
            v-hasPermi="['erp:logistics-route:create']"
            title="分配车辆后可AI规划路线"
          >
            <Icon icon="ep:magic-stick" class="mr-1" />AI规划路线
          </el-button>
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['erp:logistics-order:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="info"
            @click="openDetail(scope.row.id)"
            v-hasPermi="['erp:logistics-order:query']"
          >
            详情
          </el-button>
          <el-button
            link
            type="success"
            @click="handleDeliver(scope.row)"
            v-if="scope.row.status === 0"
            v-hasPermi="['erp:logistics-order:update']"
            :disabled="!scope.row.canDispatch"
            :title="!scope.row.canDispatch ? '未到出库时间，暂不能发货' : ''"
          >
            发货
          </el-button>
          <el-button
            link
            type="success"
            @click="handleReceive(scope.row)"
            v-if="scope.row.status === 1"
            v-hasPermi="['erp:logistics-order:update']"
          >
            签收
          </el-button>
          <el-button
            link
            type="primary"
            @click="openCostForm(scope.row.id)"
            v-if="scope.row.status === 2 && !scope.row.hasCost"
            v-hasPermi="['erp:logistics-cost:create']"
          >
            录入费用
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['erp:logistics-order:delete']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination :total="total" v-model:page="queryParams.pageNo" v-model:limit="queryParams.pageSize" @pagination="getList" />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <OrderForm ref="formRef" @success="getList" />
  <CostForm ref="costFormRef" />
  <AiRoutePlanDialog ref="aiRouteFormRef" @success="getList" />
  <OrderDetail ref="detailRef" />
</template>

<script setup lang="ts">
import { ElLoading } from 'element-plus'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { OrderApi, OrderVO } from '@/api/erp/logistics/order'
import { VehicleApi, VehicleVO } from '@/api/erp/logistics/vehicle'
import { RouteApi, RouteVO } from '@/api/erp/logistics/route'
import OrderForm from './OrderForm.vue'
import CostForm from '../cost/CostForm.vue'
import AiRoutePlanDialog from './AiRoutePlanDialog.vue'
import OrderDetail from './OrderDetail.vue'

defineOptions({ name: 'LogisticsOrder' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<OrderVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  orderNo: undefined,
  vehicleId: undefined,
  status: undefined
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

// 关联数据（用于列表展示和搜索下拉）
const vehicleList = ref<VehicleVO[]>([])
const routeList = ref<RouteVO[]>([])

/** 获取车辆名称 */
const getVehicleLabel = (vehicleId: number) => {
  const vehicle = vehicleList.value.find(v => v.id === vehicleId)
  return vehicle ? vehicle.plateNo + '（' + vehicle.vehicleType + '）' : '未知车辆'
}

/** 获取路线名称 */
const getRouteLabel = (routeId: number) => {
  const route = routeList.value.find(r => r.id === routeId)
  return route ? route.startAddress + ' → ' + route.endAddress : '未知路线'
}

/** 加载关联数据 */
const loadRelatedData = async () => {
  try {
    const [vehicles, routes] = await Promise.all([
      VehicleApi.getSimpleList(),
      RouteApi.getSimpleList()
    ])
    vehicleList.value = vehicles
    routeList.value = routes
  } catch (e) {
    console.error('加载关联数据失败', e)
  }
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await OrderApi.getOrderPage(queryParams)
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

/** 详情操作 */
const detailRef = ref()
const openDetail = (id: number) => {
  detailRef.value.open(id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await OrderApi.deleteOrder(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 录入费用弹窗 */
const costFormRef = ref()
const openCostForm = (orderId: number) => {
  costFormRef.value.open('create', undefined, orderId)
}

/** AI 路线规划弹窗 */
const aiRouteFormRef = ref()
const openAiRouteForm = (orderId: number) => {
  aiRouteFormRef.value.open(orderId)
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await OrderApi.exportOrder(queryParams)
    download.excel(data, '运输订单.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** AI 智能调度操作 */
const handleAiDispatch = async (id: number) => {
  try {
    await message.confirm('确认要启动 AI 智能调度吗？系统将自动分配车辆并规划路线。')
    const loading = ElLoading.service({
      lock: true,
      text: 'AI正在规划路线中，请稍候...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    try {
      await OrderApi.aiDispatch(id)
      message.success('AI 调度成功，已分配车辆并规划路线')
      await getList()
    } catch (error) {
      console.error('AI 调度失败', error)
    } finally {
      loading.close()
    }
  } catch {}
}

/** 发货按钮操作 */
const handleDeliver = async (row: OrderVO) => {
  try {
    // 二次确认
    await message.confirm('确认要对该订单进行发货吗？')
    // 发起发货请求（将状态改为 1：运输中）
    await OrderApi.updateOrder({ ...row, status: 1 })
    message.success('发货成功')
    // 刷新列表
    await getList()
  } catch {}
}

/** 签收按钮操作 */
const handleReceive = async (row: OrderVO) => {
  try {
    // 二次确认
    await message.confirm('确认要对该订单进行签收吗？')
    // 发起签收请求（将状态改为 2：已签收）
    await OrderApi.updateOrder({ ...row, status: 2 })
    message.success('签收成功')
    // 刷新列表
    await getList()
  } catch {}
}

/** 初始化 **/
onMounted(async () => {
  await loadRelatedData()
  await getList()
})
</script>
