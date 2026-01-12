<template>
  <div class="app-container">
    <transition name="el-fade-in-linear">
      <div v-if="showBatchView" class="batch-view">
        <el-row :gutter="20" class="mb20">
          <el-col :sm="24" :lg="8">
            <div class="stat-card-item card-blue">
              <div class="stat-icon">
                <el-icon><DataLine /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-text">总发行量</div>
                <div class="stat-num">{{ statsData.totalCount }}</div>
              </div>
            </div>
          </el-col>
          <el-col :sm="24" :lg="8">
            <div class="stat-card-item card-green">
              <div class="stat-icon">
                <el-icon><CircleCheckFilled /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-text">已被扫码 (活跃)</div>
                <div class="stat-num">{{ statsData.scannedCount }}</div>
              </div>
            </div>
          </el-col>
          <el-col :sm="24" :lg="8">
            <div class="stat-card-item card-red">
              <div class="stat-icon">
                <el-icon><CircleCloseFilled /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-text">已作废</div>
                <div class="stat-num">{{ statsData.voidCount }}</div>
              </div>
            </div>
          </el-col>
        </el-row>

        <el-form
          :model="batchQueryParams"
          ref="batchQueryRef"
          :inline="true"
          v-show="showSearch"
          class="search-form"
        >
          <el-form-item label="产品名称">
            <el-input
              v-model="batchQueryParams.productName"
              placeholder="输入产品名搜索"
              clearable
              @keyup.enter="handleBatchQuery"
            />
          </el-form-item>
          <el-form-item label="批次号">
            <el-input
              v-model="batchQueryParams.batchNo"
              placeholder="输入批次号搜索"
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

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              type="primary"
              plain
              icon="Search"
              @click="handleGlobalSearch"
              >全局码查询</el-button
            >
          </el-col>
          <right-toolbar
            v-model:showSearch="showSearch"
            @queryTable="getBatchList"
          ></right-toolbar>
        </el-row>

        <el-table
          :data="batchList"
          v-loading="batchLoading"
          border
          stripe
          highlight-current-row
        >
          <el-table-column label="生产批次号" prop="batchNo" min-width="160">
            <template #default="scope">
              <span class="link-type" @click="enterBatchDetail(scope.row)">{{
                scope.row.batchNo
              }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="所属产品"
            prop="productName"
            min-width="150"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="防伪码数量"
            prop="codeCount"
            align="center"
            width="120"
          >
            <template #default="scope"
              ><el-tag effect="plain">{{
                scope.row.codeCount
              }}</el-tag></template
            >
          </el-table-column>
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
          <el-table-column
            label="操作"
            align="center"
            width="200"
            class-name="small-padding fixed-width"
          >
            <template #default="scope">
              <el-button
                link
                type="primary"
                @click="enterBatchDetail(scope.row)"
                >管理明细</el-button
              >
              <el-button
                link
                type="warning"
                @click="handleExportBatch(scope.row)"
                >导出数据</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
    </transition>

    <transition name="el-zoom-in-center">
      <div v-if="!showBatchView" class="code-view">
        <el-card shadow="never" class="detail-header mb20">
          <el-page-header @back="goBackToBatch">
            <template #content>
              <div class="flex items-center">
                <span class="text-large font-600 mr-3">批次详情</span>
                <el-tag type="info" size="large" effect="dark" class="mr-2">{{
                  currentBatch.batchNo
                }}</el-tag>
                <span class="text-gray-500 text-sm"
                  >关联产品：{{ currentBatch.productName }}</span
                >
              </div>
            </template>
            <template #extra>
              <div class="flex items-center">
                <el-button
                  type="primary"
                  plain
                  @click="handleBatchAction('active')"
                  >整批激活</el-button
                >
                <el-button
                  type="danger"
                  plain
                  @click="handleBatchAction('void')"
                  >整批作废</el-button
                >
              </div>
            </template>
          </el-page-header>
        </el-card>

        <el-card shadow="never">
          <el-form :model="codeQueryParams" :inline="true" class="search-form">
            <el-form-item label="状态">
              <el-select
                v-model="codeQueryParams.status"
                placeholder="全部"
                clearable
                style="width: 120px"
                @change="getCodeList"
              >
                <el-option label="待激活" value="2" />
                <el-option label="已激活" value="0" />
                <el-option label="已作废" value="1" />
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
                placeholder="输入UUID精准查询"
                clearable
                @keyup.enter="getCodeList"
                style="width: 240px"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="getCodeList"
                >查询</el-button
              >
              <el-button icon="Refresh" @click="resetCodeQuery">重置</el-button>
            </el-form-item>
          </el-form>

          <el-table :data="codeList" v-loading="codeLoading" border stripe>
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column
              label="防伪码ID (UUID)"
              prop="codeValue"
              width="320"
              show-overflow-tooltip
            >
              <template #default="scope">
                <span class="code-font">{{ scope.row.codeValue }}</span>
                <el-tooltip content="复制UUID" placement="top">
                  <el-icon
                    class="action-icon"
                    @click="handleCopy(scope.row.codeValue)"
                    ><CopyDocument
                  /></el-icon>
                </el-tooltip>
              </template>
            </el-table-column>

            <el-table-column label="当前状态" align="center" width="100">
              <template #default="scope">
                <el-tag v-if="scope.row.status === '2'" type="info"
                  >待激活</el-tag
                >
                <el-tag v-else-if="scope.row.status === '0'" type="success"
                  >已激活</el-tag
                >
                <el-tag v-else type="danger">已作废</el-tag>
              </template>
            </el-table-column>

            <el-table-column
              label="扫码次数"
              prop="scanCount"
              align="center"
              width="100"
            >
              <template #default="scope">
                <span
                  v-if="scope.row.scanCount > 0"
                  class="text-orange-500 font-bold"
                  >{{ scope.row.scanCount }}</span
                >
                <span v-else class="text-gray-400">0</span>
              </template>
            </el-table-column>
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
              label="首次扫码IP"
              prop="firstScanIp"
              align="center"
              show-overflow-tooltip
            />

            <el-table-column
              label="操作"
              align="center"
              fixed="right"
              width="180"
            >
              <template #default="scope">
                <el-button
                  link
                  type="primary"
                  @click="handlePreviewQr(scope.row)"
                  >预览</el-button
                >

                <el-button
                  v-if="scope.row.status === '2'"
                  link
                  type="success"
                  @click="handleSingleStatus(scope.row, '0')"
                  >激活</el-button
                >

                <el-button
                  v-if="scope.row.status === '0'"
                  link
                  type="danger"
                  @click="handleSingleStatus(scope.row, '1')"
                  >作废</el-button
                >

                <el-button
                  v-if="scope.row.status === '1'"
                  link
                  type="info"
                  disabled
                  >已作废</el-button
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
    </transition>

    <el-dialog
      title="全局防伪码查询"
      v-model="globalSearchOpen"
      width="500px"
      append-to-body
    >
      <div class="global-search-box">
        <el-input
          v-model="globalSearchCode"
          placeholder="请输入完整的防伪码UUID"
          clearable
          @keyup.enter="doGlobalSearch"
          size="large"
        >
          <template #prefix
            ><el-icon><Search /></el-icon
          ></template>
          <template #append
            ><el-button @click="doGlobalSearch">查询</el-button></template
          >
        </el-input>
      </div>
      <div v-if="globalSearchResult" class="result-card mt20">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="所属批次">{{
            globalSearchResult.batchNo
          }}</el-descriptions-item>
          <el-descriptions-item label="所属产品">{{
            globalSearchResult.productName
          }}</el-descriptions-item>
          <el-descriptions-item label="当前状态">
            <el-tag v-if="globalSearchResult.status === '2'" type="info"
              >待激活</el-tag
            >
            <el-tag v-else-if="globalSearchResult.status === '0'" type="success"
              >已激活</el-tag
            >
            <el-tag v-else type="danger">已作废</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="扫码次数">{{
            globalSearchResult.scanCount
          }}</el-descriptions-item>
        </el-descriptions>
        <div class="mt20 text-center">
          <el-button type="primary" plain @click="jumpToBatchFromGlobal"
            >跳转至该批次详情</el-button
          >
        </div>
      </div>
    </el-dialog>

    <el-dialog
      :title="qrTitle"
      v-model="qrOpen"
      width="350px"
      append-to-body
      center
    >
      <div class="qr-container" v-loading="!qrCodeUrl">
        <qrcode-vue
          v-if="qrCodeUrl"
          id="qrCodeCanvas"
          :value="qrCodeUrl"
          :size="qrSize"
          level="H"
        />
        <div v-if="qrCodeUrl" class="qr-tips">使用微信扫一扫进行真伪验证</div>
      </div>
      <template #footer>
        <el-button
          type="primary"
          @click="downloadQrImage"
          :disabled="!qrCodeUrl"
          >下载图片</el-button
        >
        <el-button @click="qrOpen = false">关 闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="TraceCode">
  import {
    listCode,
    getCodeStats,
    updateCode,
    delCode,
    listBatch,
    getQrCodeContent
  } from '@/api/feature/code'
  import useClipboard from 'vue-clipboard3'
  import QrcodeVue from 'qrcode.vue'

  const { proxy } = getCurrentInstance()
  const { toClipboard } = useClipboard()

  // ================== 状态控制 ==================
  const showBatchView = ref(true)
  const showSearch = ref(true)
  const batchLoading = ref(false)
  const codeLoading = ref(false)

  // ================== 数据对象 ==================
  const statsData = ref({ totalCount: 0, scannedCount: 0, voidCount: 0 })
  const batchList = ref([])
  const codeList = ref([])
  const codeTotal = ref(0)
  const currentBatch = ref({})

  // ================== 二维码相关 ==================
  const qrOpen = ref(false)
  const qrCodeUrl = ref('')
  const qrTitle = ref('')
  const qrSize = ref(200)

  // ================== 查询参数 ==================
  const batchQueryParams = ref({ productName: '', batchNo: '' })
  const codeQueryParams = ref({
    pageNum: 1,
    pageSize: 10,
    batchNo: null,
    codeValue: null,
    status: null,
    scanState: null
  })

  const globalSearchOpen = ref(false)
  const globalSearchCode = ref('')
  const globalSearchResult = ref(null)

  function init() {
    getStats()
    getBatchList()
  }

  function getStats() {
    getCodeStats().then(res => {
      if (res.data) statsData.value = res.data
    })
  }
  function getBatchList() {
    batchLoading.value = true
    listBatch(batchQueryParams.value)
      .then(res => {
        batchList.value = res.rows || res.data || []
        batchLoading.value = false
      })
      .catch(() => {
        batchLoading.value = false
      })
  }
  function handleBatchQuery() {
    getBatchList()
  }
  function resetBatchQuery() {
    proxy.resetForm('batchQueryRef')
    batchQueryParams.value = { productName: '', batchNo: '' }
    handleBatchQuery()
  }

  function enterBatchDetail(row) {
    currentBatch.value = row
    codeQueryParams.value.batchNo = row.batchNo
    codeQueryParams.value.pageNum = 1
    codeQueryParams.value.status = null
    codeQueryParams.value.scanState = null
    codeQueryParams.value.codeValue = null
    showBatchView.value = false
    getCodeList()
  }
  function goBackToBatch() {
    showBatchView.value = true
    currentBatch.value = {}
    getBatchList()
    getStats()
  }

  function getCodeList() {
    codeLoading.value = true
    listCode(codeQueryParams.value).then(res => {
      codeList.value = res.rows
      codeTotal.value = res.total
      codeLoading.value = false
    })
  }
  function resetCodeQuery() {
    codeQueryParams.value.codeValue = null
    codeQueryParams.value.status = null
    codeQueryParams.value.scanState = null
    getCodeList()
  }

  function handleBatchAction(type) {
    const batchNo = currentBatch.value.batchNo
    let confirmText = ''
    if (type === 'void') confirmText = `确认将批次 [${batchNo}] 所有码作废吗？`
    else if (type === 'active')
      confirmText = `确认将批次 [${batchNo}] 所有码激活吗？`

    proxy.$modal.confirm(confirmText).then(() => {
      proxy.$modal.msgWarning('请确保后端已实现 updateBatchStatus 接口')
    })
  }

  /** * 单个码状态变更
   * 2 -> 0 (激活)
   * 0 -> 1 (作废)
   */
  function handleSingleStatus(row, targetStatus) {
    let actionText = ''
    if (targetStatus === '0') actionText = '激活'
    else if (targetStatus === '1') actionText = '作废'

    proxy.$modal
      .confirm(`确认要【${actionText}】该防伪码吗？`)
      .then(() => {
        return updateCode({ codeId: row.codeId, status: targetStatus })
      })
      .then(() => {
        getCodeList()
        proxy.$modal.msgSuccess(`${actionText}成功`)
      })
  }

  function handleExportBatch(row) {
    proxy.download(
      'feature/code/export',
      { productId: row.productId, batchNo: row.batchNo },
      `Batch_${row.batchNo}.xlsx`
    )
  }

  function handleGlobalSearch() {
    globalSearchOpen.value = true
    globalSearchResult.value = null
    globalSearchCode.value = ''
  }
  function doGlobalSearch() {
    if (!globalSearchCode.value) return
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
    enterBatchDetail({
      batchNo: target.batchNo,
      productName: target.productName,
      productId: target.productId
    })
  }

  async function handleCopy(text) {
    await toClipboard(text)
    proxy.$modal.msgSuccess('已复制')
  }

  function handlePreviewQr(row) {
    qrTitle.value = `防伪码预览`
    qrCodeUrl.value = ''
    qrOpen.value = true
    getQrCodeContent(row.codeId).then(res => {
      if (res.code === 200) {
        qrCodeUrl.value = res.data || res.msg
      }
    })
  }

  function downloadQrImage() {
    const canvas = document.getElementById('qrCodeCanvas')
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.download = `QR_${currentBatch.value.batchNo}.png`
    a.href = url
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  function parseTime(time) {
    if (!time) return '-'
    return proxy.parseTime(time, '{y}-{m}-{d} {h}:{i}')
  }

  init()
</script>

<style scoped lang="scss">
  .stat-card-item {
    display: flex;
    align-items: center;
    padding: 20px;
    border-radius: 8px;
    color: #fff;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.2);
    }
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      margin-right: 15px;
    }
    .stat-info {
      flex: 1;
      .stat-text {
        font-size: 14px;
        opacity: 0.9;
        margin-bottom: 4px;
      }
      .stat-num {
        font-size: 24px;
        font-weight: bold;
      }
    }
  }
  .card-blue {
    background: linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%);
  }
  .card-green {
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  }
  .card-red {
    background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
  }

  .link-type {
    color: #409eff;
    cursor: pointer;
    font-weight: 500;
    &:hover {
      text-decoration: underline;
    }
  }
  .detail-header {
    background-color: #fff;
    border-left: 5px solid #409eff;
  }
  .mb20 {
    margin-bottom: 20px;
  }
  .mb8 {
    margin-bottom: 8px;
  }
  .mt20 {
    margin-top: 20px;
  }
  .mr-2 {
    margin-right: 8px;
  }
  .mr-3 {
    margin-right: 12px;
  }
  .code-font {
    font-family: 'Consolas', 'Monaco', monospace;
    color: #333;
  }

  .action-icon {
    margin-left: 10px;
    color: #909399;
    cursor: pointer;
    font-size: 16px;
    vertical-align: middle;
    &:hover {
      color: #409eff;
      transform: scale(1.1);
    }
  }

  .qr-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px;
  }
  .qr-tips {
    margin-top: 15px;
    font-size: 12px;
    color: #999;
  }

  .text-orange-500 {
    color: #e6a23c;
  }
  .text-gray-400 {
    color: #c0c4cc;
  }
  .text-gray-500 {
    color: #909399;
  }
  .text-sm {
    font-size: 12px;
  }
  .font-600 {
    font-weight: 600;
  }
</style>
