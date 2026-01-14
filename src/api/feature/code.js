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
    url: '/feature/code',
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
// [修复] 参数名改为 query，直接作为 params 传递，不再包装在 { productId } 中
export function listBatch(query) {
  return request({
    url: '/feature/code/batch/list',
    method: 'get',
    params: query
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

// 导出指定批次的防伪码
export function exportBatch(data) {
  return request({
    url: '/feature/code/export',
    method: 'post',
    data: data,
    responseType: 'blob'
  })
}
// 批量修改防伪码状态 (新增)
export function updateBatchStatus(data) {
  return request({
    url: '/feature/code/batch/status',
    method: 'put',
    data: data
  })
}

// 删除指定批次
export function delBatch(batchNo) {
  return request({
    url: '/feature/code/batch/' + batchNo,
    method: 'delete'
  })
}
