import request from '@/config/axios'

export interface VehicleVO {
  id: number
  plateNo: string
  vehicleType: string
  maxWeight: number
  maxVolume: number
  pricePerDay: number
  fuelCostPerKm: number
  status: number
  remark: string
  createTime: Date
}

export const VehicleApi = {
  getVehiclePage: async (params: any) => {
    return await request.get({ url: `/erp/logistics-vehicle/page`, params })
  },
  getVehicle: async (id: number) => {
    return await request.get({ url: `/erp/logistics-vehicle/get?id=` + id })
  },
  createVehicle: async (data: VehicleVO) => {
    return await request.post({ url: `/erp/logistics-vehicle/create`, data })
  },
  updateVehicle: async (data: VehicleVO) => {
    return await request.put({ url: `/erp/logistics-vehicle/update`, data })
  },
  deleteVehicle: async (id: number) => {
    return await request.delete({ url: `/erp/logistics-vehicle/delete?id=` + id })
  },
  exportVehicle: async (params: any) => {
    return await request.download({ url: `/erp/logistics-vehicle/export-excel`, params })
  },
  // 简单列表（用于运输订单下拉选择车辆）
  getSimpleList: async () => {
    return await request.get({ url: `/erp/logistics-vehicle/simple-list` })
  }
}
