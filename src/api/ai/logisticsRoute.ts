import { fetchEventSource } from '@microsoft/fetch-event-source'
import { getAccessToken, getTenantId } from '@/utils/auth'

export const AiRouteApi = {
  /**
   * 流式生成 AI 路线规划建议
   * 注意：因为是 SSE 请求，不能使用封装的 axios，需要直接使用 fetchEventSource
   */
  streamPlan: (data: any, onMessage: (text: string) => void, onError: (err: any) => void, onDone: () => void) => {
    const token = getAccessToken()
    const tenantId = getTenantId()
    
    // 因为项目配置了跨域或代理，通常前缀是 VITE_BASE_URL (如 /admin-api)
    const baseUrl = import.meta.env.VITE_BASE_URL || '/admin-api'

    fetchEventSource(`${baseUrl}/ai/logistics-route/stream-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
        'tenant-id': tenantId ? tenantId.toString() : ''
      },
      body: JSON.stringify(data),
      onmessage(msg) {
        if (msg.event === 'error') {
          onError(msg.data)
          return
        }
        if (msg.data) {
          onMessage(msg.data)
        }
      },
      onclose() {
        onDone()
      },
      onerror(err) {
        onError(err)
        throw err // Throwing error stops retry
      }
    })
  }
}
