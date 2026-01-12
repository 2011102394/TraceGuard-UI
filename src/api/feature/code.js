import request from '@/utils/request'

// 获取二维码内容链接
export function getQrCodeContent(codeId) {
  return request({
    url: '/feature/code/qr/' + codeId,
    method: 'get'
  })
}

// 获取防伪码统计数据
export function getCodeStats(query) {
  return request({
    url: '/feature/code/stats',
    method: 'get',
    params: query
  })
}

// 查询防伪码列表 (全量/分页)
export function listCode(query) {
  return request({
    url: '/feature/code/list',
    method: 'get',
    params: query
  })
}

// 查询防伪码详细
export function getCode(codeId) {
  return request({
    url: '/feature/code/' + codeId,
    method: 'get'
  })
}

// 修改防伪码 (用于作废、激活)
export function updateCode(data) {
  return request({
    url: '/feature/code', // 这里的后端接口是 TgTraceCodeController.edit -> PUT /feature/code
    method: 'put',
    data: data
  })
}

// 删除防伪码
export function delCode(codeId) {
  return request({
    url: '/feature/code/' + codeId,
    method: 'delete'
  })
}

// 查询某产品的生码批次列表 (聚合统计)
export function listBatch(productId) {
  return request({
    url: '/feature/code/batch/list',
    method: 'get',
    params: { productId }
  })
}

// 批量生成防伪码
export function generateCode(data) {
  return request({
    url: '/feature/code/generate',
    method: 'post',
    data: data
  })
}

// 导出指定批次的防伪码 (通常用于下载)
// 注意：通用下载方法 proxy.download 会自动处理，这里仅做记录，实际调用见组件内
export function exportBatch(data) {
  return request({
    url: '/feature/code/export',
    method: 'post',
    data: data,
    responseType: 'blob'
  })
}
