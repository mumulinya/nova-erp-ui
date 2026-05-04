import request from '@/config/axios'

// ==================== 报表 API ====================

/** 采购汇总 */
export interface PurchaseReportVO {
  supplierId: number
  supplierName: string
  inPrice: number
  returnPrice: number
  netPrice: number
}

/** 销售汇总 */
export interface SaleReportVO {
  customerId: number
  customerName: string
  outPrice: number
  returnPrice: number
  netPrice: number
}

/** 库存预警 */
export interface StockAlertVO {
  productId: number
  productName: string
  warehouseName: string
  currentStock: number
  safeStock: number
  gapCount: number
}

/** 物流费用汇总 */
export interface LogisticsCostReportVO {
  orderNo: string
  transportCost: number
  fuelCost: number
  tollCost: number
  otherCost: number
  totalCost: number
}

export const ReportApi = {
  /** 采购汇总 */
  getPurchaseReport: async (params: any): Promise<PurchaseReportVO[]> => {
    return await request.get({ url: '/erp/report/purchase-summary', params })
  },
  /** 销售汇总 */
  getSaleReport: async (params: any): Promise<SaleReportVO[]> => {
    return await request.get({ url: '/erp/report/sale-summary', params })
  },
  /** 库存预警 */
  getStockAlertReport: async (): Promise<StockAlertVO[]> => {
    return await request.get({ url: '/erp/report/stock-alert' })
  },
  /** 物流费用汇总 */
  getLogisticsCostReport: async (params: any): Promise<LogisticsCostReportVO[]> => {
    return await request.get({ url: '/erp/report/logistics-cost-summary', params })
  }
}
