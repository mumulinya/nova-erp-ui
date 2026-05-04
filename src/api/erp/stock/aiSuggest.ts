import request from '@/config/axios'

export interface StockAiSuggestVO {
  id: number
  productId: number
  productName: string
  warehouseId: number
  warehouseName: string
  currentStock: number
  safetyStock: number
  maxStock: number
  avgDailySale: number
  suggestType: number
  suggestContent: string
  priority: number
  status: number
  createTime: Date
}

// 生成AI库存优化建议
export const generateStockAiSuggest = () =>
  request.post({ url: '/erp/stock/ai-suggest/generate', timeout: 120000 })

// 获取最新一批AI建议
export const getLatestStockAiSuggest = () =>
  request.get({ url: '/erp/stock/ai-suggest/latest' })

// 标记建议已处理
export const handleStockAiSuggest = (id: number) =>
  request.put({ url: `/erp/stock/ai-suggest/handle/${id}` })

// 忽略某条建议
export const ignoreStockAiSuggest = (id: number) =>
  request.put({ url: `/erp/stock/ai-suggest/ignore/${id}` })
