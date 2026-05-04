import request from '@/config/axios'

export interface RouteVO {
  id: number
  startAddress: string
  endAddress: string
  distance: number
  estimatedHours: number
  remark: string
  aiSuggestion?: string
  createTime: Date
}

export const RouteApi = {
  getRoutePage: async (params: any) => {
    return await request.get({ url: `/erp/logistics-route/page`, params })
  },
  getRoute: async (id: number) => {
    return await request.get({ url: `/erp/logistics-route/get?id=` + id })
  },
  createRoute: async (data: RouteVO) => {
    return await request.post({ url: `/erp/logistics-route/create`, data })
  },
  updateRoute: async (data: RouteVO) => {
    return await request.put({ url: `/erp/logistics-route/update`, data })
  },
  deleteRoute: async (id: number) => {
    return await request.delete({ url: `/erp/logistics-route/delete?id=` + id })
  },
  exportRoute: async (params: any) => {
    return await request.download({ url: `/erp/logistics-route/export-excel`, params })
  },
  // 简单列表（用于运输订单下拉选择路线）
  getSimpleList: async () => {
    return await request.get({ url: `/erp/logistics-route/simple-list` })
  }
}
