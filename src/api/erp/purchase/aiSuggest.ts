import request from '@/config/axios'

export interface AiSuggestVO {
  id: number
  productId: number
  productName: string
  currentStock: number
  safetyStock: number
  suggestCount: number
  supplierName: string
  suggestTime: Date
  reason: string
  status: number
  createTime: Date
}

// 生成AI采购建议
export const generateAiSuggest = () =>
  request.post({ url: '/erp/purchase/ai-suggest/generate', timeout: 120000 })

// 获取最新一批AI建议
export const getLatestAiSuggest = () =>
  request.get({ url: '/erp/purchase/ai-suggest/latest' })

// 获取单条详情
export const getAiSuggest = (id: number) =>
  request.get({ url: '/erp/purchase/ai-suggest/get', params: { id } })

// 确认转为采购订单
export const confirmAiSuggest = (id: number) =>
  request.put({ url: `/erp/purchase/ai-suggest/confirm/${id}` })

// 忽略某条建议
export const ignoreAiSuggest = (id: number) =>
  request.put({ url: `/erp/purchase/ai-suggest/ignore/${id}` })

// 删除某条建议
export const deleteAiSuggest = (id: number) =>
  request.delete({ url: `/erp/purchase/ai-suggest/delete/${id}` })

// 导出 Excel
export const exportAiSuggestExcel = () =>
  request.download({ url: '/erp/purchase/ai-suggest/export-excel' })
