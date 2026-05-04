import request from '@/config/axios'

export interface OrderVO {
  id: number
  orderNo: string
  saleOrderId: number
  saleOrderNo: string
  receiverName: string
  receiverMobile: string
  vehicleId: number
  routeId: number
  receiverAddress: string
  goodsInfo: string
  timeRequirement: string
  status: number
  outTime: Date
  canDispatch: boolean
  remark: string
  createTime: Date
  // 关联展示字段（后端返回）
  vehiclePlateNo?: string
  routeName?: string
  hasCost?: boolean
}

export const OrderApi = {
  getOrderPage: async (params: any) => {
    return await request.get({ url: `/erp/logistics-order/page`, params })
  },
  getOrder: async (id: number) => {
    return await request.get({ url: `/erp/logistics-order/get?id=` + id })
  },
  createOrder: async (data: OrderVO) => {
    return await request.post({ url: `/erp/logistics-order/create`, data })
  },
  updateOrder: async (data: OrderVO) => {
    return await request.put({ url: `/erp/logistics-order/update`, data })
  },
  deleteOrder: async (id: number) => {
    return await request.delete({ url: `/erp/logistics-order/delete?id=` + id })
  },
  exportOrder: async (params: any) => {
    return await request.download({ url: `/erp/logistics-order/export-excel`, params })
  },
  aiDispatch: async (id: number) => {
    return await request.post({ url: `/erp/logistics-order/ai-dispatch?id=` + id, timeout: 120000 })
  },
  // 简单列表（用于其他模块下拉选择）
  getSimpleList: async () => {
    return await request.get({ url: `/erp/logistics-order/simple-list` })
  }
}
