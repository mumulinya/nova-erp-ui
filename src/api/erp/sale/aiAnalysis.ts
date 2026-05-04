import request from '@/config/axios'

export interface SaleAiAnalysisVO {
  id: number
  analysisMonth: string
  totalSaleAmount: number
  totalOrderCount: number
  topProduct: string
  topCustomer: string
  trendType: number
  trendContent: string
  suggestContent: string
  createTime: Date
}

// 生成 AI 销售分析
export const generateSaleAiAnalysis = () =>
  request.post({ url: '/erp/sale/ai-analysis/generate', timeout: 120000 })

// 获取最新一条 AI 销售分析
export const getLatestSaleAiAnalysis = () =>
  request.get({ url: '/erp/sale/ai-analysis/latest' })

// 获取销售月度趋势数据（用于图表展示）
export const getSaleMonthlyTrend = () =>
  request.get({ url: '/erp/sale/ai-analysis/monthly-trend' })

// 获取 AI 销售分析历史记录
export const getSaleAiAnalysisHistory = (params: any) =>
  request.get({ url: '/erp/sale/ai-analysis/history', params })
