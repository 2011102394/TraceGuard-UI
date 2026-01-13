import request from '@/utils/request'

// 查询防伪扫描记录列表
export function listScanlog(query) {
  return request({
    url: '/feature/scanlog/list',
    method: 'get',
    params: query
  })
}

// 删除防伪扫描记录
export function delScanlog(logId) {
  return request({
    url: '/feature/scanlog/' + logId,
    method: 'delete'
  })
}

// 导出防伪扫描记录
export function exportScanlog(query) {
  return request({
    url: '/feature/scanlog/export',
    method: 'post',
    params: query,
    responseType: 'blob'
  })
}
