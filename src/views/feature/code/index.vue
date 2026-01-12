<template>
  <div class="app-container">
    <div v-if="showBatchView" class="batch-view">
      <el-row :gutter="20" class="mb-4">
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <template #header>
              <div class="card-header">
                <span>总发行量</span>
                <el-tag type="info">总量</el-tag>
              </div>
            </template>
            <div class="card-num">{{ statsData.totalCount }}</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <template #header>
              <div class="card-header">
                <span>已被扫码</span>
                <el-tag type="success">活跃</el-tag>
              </div>
            </template>
            <div class="card-num">{{ statsData.scannedCount }}</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <template #header>
              <div class="card-header">
                <span>已作废</span>
                <el-tag type="danger">作废</el-tag>
              </div>
            </template>
            <div class="card-num">{{ statsData.voidCount }}</div>
          </el-card>
        </el-col>
      </el-row>

      <el-card shadow="never" class="mb-4">
        <el-form :model="batchQueryParams" :inline="true">
          <el-form-item label="产品名称">
            <el-input
              v-model="batchQueryParams.productName"
              placeholder="输入产品名搜索"
              clearable
              @keyup.enter="handleBatchQuery"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleBatchQuery"
              >搜索</el-button
            >
            <el-button icon="Refresh" @click="resetBatchQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card shadow="never">
        <template #header>
          <div class="flex justify-between items-center">
            <span class="font-bold">生产批次列表</span>
            <el-button
              type="primary"
              plain
              icon="Search"
              @click="handleGlobalSearch"
              >全局码查询</el-button
            >
          </div>
        </template>

        <el-table :data="batchList" v-loading="batchLoading" stripe>
          <el-table-column label="批次号" prop="batchNo" width="180">
            <template #default="scope">
              <el-tag effect="dark">{{ scope.row.batchNo }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="所属产品" prop="productName" />
          <el-table-column
            label="码数量"
            prop="codeCount"
            align="center"
            width="120"
          />
          <el-table-column
            label="生成时间"
            prop="createTime"
            align="center"
            width="180"
          >
            <template #default="scope">{{
              parseTime(scope.row.createTime)
            }}</template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="250">
            <template #default="scope">
              <el-button
                link
                type="primary"
                icon="View"
                @click="enterBatchDetail(scope.row)"
                >管理明细</el-button
              >
              <el-button
                link
                type="warning"
                icon="Download"
                @click="handleExportBatch(scope.row)"
                >下载数据</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <div v-else class="code-view">
      <el-page-header @back="goBackToBatch" class="mb-4">
        <template #content>
          <span class="text-large font-600 mr-3">
            批次详情: {{ currentBatch.batchNo }}
          </span>
          <el-tag type="info" class="mr-2">{{
            currentBatch.productName
          }}</el-tag>
        </template>
        <template #extra>
          <el-button
            type="danger"
            plain
            icon="CircleClose"
            @click="handleBatchAction('void')"
            >整批作废</el-button
          >
          <el-button
            type="success"
            plain
            icon="CircleCheck"
            @click="handleBatchAction('active')"
            >整批激活</el-button
          >
          <el-button
            type="danger"
            icon="Delete"
            @click="handleBatchAction('delete')"
            >整批删除</el-button
          >
        </template>
      </el-page-header>

      <el-card shadow="never">
        <el-form :model="codeQueryParams" :inline="true" class="mb-2">
          <el-form-item label="状态">
            <el-select
              v-model="codeQueryParams.status"
              placeholder="全部"
              clearable
              style="width: 120px"
              @change="getCodeList"
            >
              <el-option label="正常" value="0" />
              <el-option label="作废" value="1" />
            </el-select>
          </el-form-item>
          <el-form-item label="扫码状态">
            <el-select
              v-model="codeQueryParams.scanState"
              placeholder="全部"
              clearable
              style="width: 120px"
              @change="getCodeList"
            >
              <el-option label="未扫码" value="0" />
              <el-option label="已扫码" value="1" />
            </el-select>
          </el-form-item>
          <el-form-item label="码值搜索">
            <el-input
              v-model="codeQueryParams.codeValue"
              placeholder="输入UUID"
              clearable
              @keyup.enter="getCodeList"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getCodeList">查询</el-button>
          </el-form-item>
        </el-form>

        <el-table :data="codeList" v-loading="codeLoading" border>
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column
            label="防伪码ID"
            prop="codeValue"
            width="320"
            show-overflow-tooltip
          >
            <template #default="scope">
              <span class="font-mono">{{ scope.row.codeValue }}</span>
              <el-icon
                class="ml-2 cursor-pointer text-blue-500"
                @click="handleCopy(scope.row.codeValue)"
                ><CopyDocument
              /></el-icon>
            </template>
          </el-table-column>
          <el-table-column label="状态" align="center" width="100">
            <template #default="scope">
              <el-tag v-if="scope.row.status === '0'" type="success"
                >正常</el-tag
              >
              <el-tag v-else type="danger">已作废</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="扫码次数"
            prop="scanCount"
            align="center"
            width="100"
          />
          <el-table-column
            label="首次扫码时间"
            prop="firstScanTime"
            align="center"
            width="180"
          >
            <template #default="scope">{{
              parseTime(scope.row.firstScanTime) || '-'
            }}</template>
          </el-table-column>
          <el-table-column
            label="首次IP"
            prop="firstScanIp"
            show-overflow-tooltip
          />
          <el-table-column
            label="操作"
            align="center"
            fixed="right"
            width="150"
          >
            <template #default="scope">
              <el-button
                v-if="scope.row.status === '0'"
                link
                type="danger"
                @click="handleSingleStatus(scope.row, '1')"
                >作废</el-button
              >
              <el-button
                v-else
                link
                type="success"
                @click="handleSingleStatus(scope.row, '0')"
                >激活</el-button
              >
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="codeTotal > 0"
          :total="codeTotal"
          v-model:page="codeQueryParams.pageNum"
          v-model:limit="codeQueryParams.pageSize"
          @pagination="getCodeList"
        />
      </el-card>
    </div>

    <el-dialog title="全局防伪码查询" v-model="globalSearchOpen" width="600px">
      <el-input
        v-model="globalSearchCode"
        placeholder="请输入完整的防伪码UUID"
        clearable
        @keyup.enter="doGlobalSearch"
      >
        <template #append
          ><el-button icon="Search" @click="doGlobalSearch"
        /></template>
      </el-input>
      <div v-if="globalSearchResult" class="mt-4">
        <el-descriptions border :column="1">
          <el-descriptions-item label="所属批次">{{
            globalSearchResult.batchNo
          }}</el-descriptions-item>
          <el-descriptions-item label="所属产品">{{
            globalSearchResult.productName
          }}</el-descriptions-item>
          <el-descriptions-item label="当前状态">
            <el-tag
              :type="globalSearchResult.status === '0' ? 'success' : 'danger'"
              >{{ globalSearchResult.status === '0' ? '正常' : '作废' }}</el-tag
            >
          </el-descriptions-item>
        </el-descriptions>
        <div class="mt-2 text-center">
          <el-button type="primary" link @click="jumpToBatchFromGlobal"
            >跳转到该批次详情</el-button
          >
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="TraceCode">
  import {
    listCode,
    getCodeStats,
    updateCode,
    delCode,
    listBatch
  } from '@/api/feature/code'
  import useClipboard from 'vue-clipboard3'

  const { proxy } = getCurrentInstance()
  const { toClipboard } = useClipboard()

  // ================== 状态控制 ==================
  const showBatchView = ref(true) // 控制显示批次列表还是码列表
  const batchLoading = ref(false)
  const codeLoading = ref(false)

  // ================== 数据对象 ==================
  const statsData = ref({ totalCount: 0, scannedCount: 0, voidCount: 0 })
  const batchList = ref([]) // 批次列表数据
  const codeList = ref([]) // 码列表数据
  const codeTotal = ref(0)
  const currentBatch = ref({}) // 当前选中的批次信息

  // ================== 查询参数 ==================
  const batchQueryParams = ref({
    productName: '' // 仅作为筛选，后端 listBatch 若需支持需改造
  })

  const codeQueryParams = ref({
    pageNum: 1,
    pageSize: 10,
    batchNo: null, // 核心关联字段
    codeValue: null,
    status: null,
    scanState: null
  })

  // 全局搜索相关
  const globalSearchOpen = ref(false)
  const globalSearchCode = ref('')
  const globalSearchResult = ref(null)

  // ================== 方法实现 ==================

  /** 1. 初始化加载 */
  function init() {
    getStats()
    getBatchList()
  }

  /** 获取顶部统计 */
  function getStats() {
    getCodeStats().then(res => {
      if (res.data) statsData.value = res.data
    })
  }

  /** 获取批次列表 */
  function getBatchList() {
    batchLoading.value = true
    // 注意：这里可能需要后端调整 listBatch 接口使其支持 不传productId时查所有
    // 假设 listBatch({ productName: ... }) 能工作
    listBatch(null).then(res => {
      // 如果后端 listBatch 必须传 productId，这里需要调整后端逻辑
      // 现假设返回的是 rows
      batchList.value = res.rows || res.data || []
      batchLoading.value = false
    })
  }

  /** 进入批次详情 (Drill-down) */
  function enterBatchDetail(row) {
    currentBatch.value = row
    codeQueryParams.value.batchNo = row.batchNo
    codeQueryParams.value.pageNum = 1
    // 重置其他筛选
    codeQueryParams.value.status = null
    codeQueryParams.value.scanState = null
    codeQueryParams.value.codeValue = null

    showBatchView.value = false // 切换视图
    getCodeList()
  }

  /** 返回批次列表 */
  function goBackToBatch() {
    showBatchView.value = true
    currentBatch.value = {}
    getBatchList() // 刷新批次数据(码数量可能变化)
    getStats() // 刷新统计
  }

  /** 获取具体的码列表 */
  function getCodeList() {
    codeLoading.value = true
    listCode(codeQueryParams.value).then(res => {
      codeList.value = res.rows
      codeTotal.value = res.total
      codeLoading.value = false
    })
  }

  /** 批次操作：整批处理 */
  function handleBatchAction(type) {
    const batchNo = currentBatch.value.batchNo
    let confirmText = ''
    let statusVal = ''

    if (type === 'void') {
      confirmText = `危险操作！确定要将批次 [${batchNo}] 下的所有防伪码设为【作废】吗？`
      statusVal = '1'
    } else if (type === 'active') {
      confirmText = `确定要将批次 [${batchNo}] 下的所有防伪码设为【正常激活】吗？`
      statusVal = '0'
    } else if (type === 'delete') {
      confirmText = `严重警告！确定要【永久删除】批次 [${batchNo}] 的所有数据吗？不可恢复！`
    }

    proxy.$modal
      .confirm(confirmText)
      .then(() => {
        // 这里需要后端新增一个接口：按批次更新状态
        // 暂时用 updateCode 模拟或需要你新增 updateBatchStatus 接口
        // 建议：updateCode 增加 batchNo 参数
        if (type === 'delete') {
          // 调用后端按批次删除接口 (需新增)
          return proxy.$modal.msgError('请先在后端实现按批次删除接口')
        } else {
          // 调用后端按批次更新接口 (需新增)
          // 伪代码: updateCodeByBatch({ batchNo: batchNo, status: statusVal })
          return proxy.$modal.msgWarning('请在后端实现按批次更新状态接口')
        }
      })
      .then(() => {
        getCodeList()
        proxy.$modal.msgSuccess('操作成功')
      })
  }

  /** 单个码状态切换 */
  function handleSingleStatus(row, newStatus) {
    const action = newStatus === '1' ? '作废' : '激活'
    proxy.$modal
      .confirm(`确认${action}该防伪码吗？`)
      .then(() => {
        return updateCode({ codeId: row.codeId, status: newStatus })
      })
      .then(() => {
        getCodeList()
        proxy.$modal.msgSuccess(`${action}成功`)
      })
  }

  /** 导出批次 */
  function handleExportBatch(row) {
    proxy.download(
      'feature/code/export',
      {
        productId: row.productId, // 假设row里有productId
        batchNo: row.batchNo
      },
      `Batch_${row.batchNo}.xlsx`
    )
  }

  /** 全局搜索弹窗 */
  function handleGlobalSearch() {
    globalSearchOpen.value = true
    globalSearchResult.value = null
    globalSearchCode.value = ''
  }

  function doGlobalSearch() {
    if (!globalSearchCode.value) return
    // 使用 listCode 查单个
    listCode({
      codeValue: globalSearchCode.value,
      pageNum: 1,
      pageSize: 1
    }).then(res => {
      if (res.rows && res.rows.length > 0) {
        globalSearchResult.value = res.rows[0]
      } else {
        proxy.$modal.msgError('未找到该防伪码')
        globalSearchResult.value = null
      }
    })
  }

  function jumpToBatchFromGlobal() {
    const target = globalSearchResult.value
    globalSearchOpen.value = false
    // 构造一个模拟的 batch row 对象
    const batchRow = {
      batchNo: target.batchNo,
      productName: target.productName,
      productId: target.productId
    }
    enterBatchDetail(batchRow)
  }

  /** 复制 */
  async function handleCopy(text) {
    await toClipboard(text)
    proxy.$modal.msgSuccess('复制成功')
  }

  // 辅助函数
  function parseTime(time) {
    if (!time) return '-'
    return proxy.parseTime(time, '{y}-{m}-{d} {h}:{i}')
  }

  // 启动
  init()
</script>

<style scoped>
  .app-container {
    padding: 20px;
  }
  .stat-card {
    background: linear-gradient(135deg, #fff 0%, #f7f9fa 100%);
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .card-num {
    font-size: 24px;
    font-weight: bold;
    margin-top: 10px;
    color: #303133;
  }
  .font-mono {
    font-family: monospace;
  }
</style>
