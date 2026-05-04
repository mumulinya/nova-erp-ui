import request from '@/config/axios'

// ==================== 大屏统计 API ====================

/** 核心指标 VO */
export interface DashboardKpiVO {
  todayOrderCount: number
  todayOutCount: number
  transportingCount: number
  stockAlertCount: number
}

/** 趋势数据 VO */
export interface DashboardTrendVO {
  date: string
  value: number
}

/** 库存健康度 VO */
export interface DashboardStockHealthVO {
  normalCount: number
  alertCount: number
  outOfStockCount: number
}

/** 物流状态分布 VO */
export interface DashboardLogisticsStatusVO {
  statusName: string
  count: number
}

export const DashboardApi = {
  /** 核心指标 */
  getKpi: async (): Promise<DashboardKpiVO> => {
    return await request.get({ url: '/erp/dashboard/kpi' })
  },
  /** 近30天销售趋势 */
  getSaleTrend: async (): Promise<DashboardTrendVO[]> => {
    return await request.get({ url: '/erp/dashboard/sale-trend' })
  },
  /** 库存健康度 */
  getStockHealth: async (): Promise<DashboardStockHealthVO> => {
    return await request.get({ url: '/erp/dashboard/stock-health' })
  },
  /** 物流状态分布 */
  getLogisticsStatus: async (): Promise<DashboardLogisticsStatusVO[]> => {
    return await request.get({ url: '/erp/dashboard/logistics-status' })
  },
  /** 近30天采购趋势 */
  getPurchaseTrend: async (): Promise<DashboardTrendVO[]> => {
    return await request.get({ url: '/erp/dashboard/purchase-trend' })
  },
  /** 物流费用趋势 */
  getLogisticsCostTrend: async (): Promise<DashboardTrendVO[]> => {
    return await request.get({ url: '/erp/dashboard/logistics-cost-trend' })
  }
}
