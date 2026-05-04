import request from '@/config/axios'

export interface CostVO {
  id: number
  logisticsOrderId: number
  transportCost: number
  fuelCost: number
  tollCost: number
  otherCost: number
  totalCost: number
  settlementStatus: number
  remark: string
  createTime: Date
  // 关联字段
  orderNo?: string
  receiverName?: string
  receiverAddress?: string
}

export const CostApi = {
  getCostPage: async (params: any) => {
    return await request.get({ url: `/erp/logistics-cost/page`, params })
  },
  getCost: async (id: number) => {
    return await request.get({ url: `/erp/logistics-cost/get?id=` + id })
  },
  createCost: async (data: CostVO) => {
    return await request.post({ url: `/erp/logistics-cost/create`, data })
  },
  updateCost: async (data: CostVO) => {
    return await request.put({ url: `/erp/logistics-cost/update`, data })
  },
  deleteCost: async (id: number) => {
    return await request.delete({ url: `/erp/logistics-cost/delete?id=` + id })
  },
  exportCost: async (params: any) => {
    return await request.download({ url: `/erp/logistics-cost/export-excel`, params })
  }
}
