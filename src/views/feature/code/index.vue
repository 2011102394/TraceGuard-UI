<template>
  <div class="app-container">
    <transition name="el-fade-in-linear">
      <div v-if="showBatchView" class="batch-view">
        <el-form
          :model="batchQueryParams"
          ref="batchQueryRef"
          :inline="true"
          v-show="showSearch"
          class="search-form"
        >
          <el-form-item label="产品名称" prop="productName">
            <el-input
              v-model="batchQueryParams.productName"
              placeholder="输入产品名搜索"
              clearable
              @keyup.enter="handleBatchQuery"
            />
          </el-form-item>
          <el-form-item label="批次号" prop="batchNo">
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
              type="success"
              plain
              icon="Plus"
              @click="handleOpenGenerate"
              >生成防伪码</el-button
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
          <el-table-column
            type="index"
            label="序号"
            width="60"
            align="center"
          />

          <el-table-column
            label="所属产品"
            prop="productName"
            min-width="200"
            :show-overflow-tooltip="true"
          />

          <el-table-column label="生产批次号" prop="batchNo" min-width="180">
            <template #default="scope">
              <span class="link-type" @click="enterBatchDetail(scope.row)">{{
                scope.row.batchNo
              }}</span>
            </template>
          </el-table-column>

          <el-table-column
            label="防伪码数量"
            prop="codeCount"
            align="center"
            width="110"
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
            width="170"
          >
            <template #default="scope">{{
              parseTime(scope.row.createTime)
            }}</template>
          </el-table-column>

          <el-table-column
            label="操作"
            align="center"
            width="180"
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
                placeholder="输入完整防伪码查询"
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
              type="index"
              :index="getCodeRowIndex"
              label="序号"
              width="60"
              align="center"
            />

            <el-table-column
              label="防伪码"
              prop="codeValue"
              width="260"
              show-overflow-tooltip
            >
              <template #default="scope">
                <span class="code-font">{{ scope.row.codeValue }}</span>
                <el-tooltip content="复制" placement="top">
                  <el-icon
                    class="action-icon"
                    @click="handleCopy(scope.row.codeValue)"
                    ><CopyDocument
                  /></el-icon>
                </el-tooltip>
              </template>
            </el-table-column>

            <el-table-column label="状态" align="center" width="80">
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
              width="90"
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
              width="170"
            >
              <template #default="scope">{{
                parseTime(scope.row.firstScanTime) || '-'
              }}</template>
            </el-table-column>

            <el-table-column
              label="首次扫码IP"
              prop="firstScanIp"
              align="center"
              width="140"
              show-overflow-tooltip
            />

            <el-table-column
              label="首次扫码地址"
              prop="firstScanLoc"
              align="center"
              min-width="150"
              show-overflow-tooltip
            />

            <el-table-column
              label="操作"
              align="center"
              fixed="right"
              width="160"
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
      title="批量生成防伪码"
      v-model="openGenerate"
      width="550px"
      append-to-body
    >
      <el-form
        ref="genFormRef"
        :model="genForm"
        :rules="genRules"
        label-width="100px"
      >
        <el-form-item label="选择产品" prop="productId">
          <el-select
            v-model="genForm.productId"
            placeholder="请选择所属产品"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="item in productOptions"
              :key="item.productId"
              :label="item.productName"
              :value="item.productId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="批次号" prop="batchNo">
          <el-input
            v-model="genForm.batchNo"
            placeholder="请输入生产批次号"
            maxlength="15"
            show-word-limit
          />
          <div class="text-warning text-sm mt-1" style="line-height: 1.4">
            <el-icon style="vertical-align: middle; margin-right: 4px"
              ><InfoFilled
            /></el-icon>
            防伪码总长固定为 24 位 (格式: 批次号_补零流水号)<br />
            <span style="padding-left: 20px; color: #999"
              >示例: 批次号为 "A01" -> A01_00000000000000000001</span
            >
          </div>
        </el-form-item>
        <el-form-item label="生成数量" prop="count">
          <el-input-number
            v-model="genForm.count"
            :min="1"
            :max="200000"
            :step="100"
            step-strictly
            style="width: 100%"
          />
          <div class="text-gray-400 text-sm mt-1">单次建议不超过20万条</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button
            type="primary"
            @click="submitGenerate"
            :loading="genLoading"
            >确 定</el-button
          >
          <el-button @click="openGenerate = false">取 消</el-button>
        </div>
      </template>
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
    updateCode,
    delCode,
    listBatch,
    generateCode,
    getQrCodeContent
  } from '@/api/feature/code'
  import { listProduct } from '@/api/feature/product'
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
  const batchList = ref([])
  const codeList = ref([])
  const codeTotal = ref(0)
  const currentBatch = ref({})

  // ================== 生码相关 ==================
  const openGenerate = ref(false)
  const genLoading = ref(false)
  const productOptions = ref([])
  const genForm = ref({
    productId: null,
    batchNo: '',
    count: 1000
  })
  const genRules = ref({
    productId: [{ required: true, message: '请选择产品', trigger: 'change' }],
    batchNo: [{ required: true, message: '请输入批次号', trigger: 'blur' }],
    count: [{ required: true, message: '请输入数量', trigger: 'blur' }]
  })

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

  function init() {
    getBatchList()
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

  // [新增] 计算防伪码列表的全局连续序号
  function getCodeRowIndex(index) {
    return (
      (codeQueryParams.value.pageNum - 1) * codeQueryParams.value.pageSize +
      index +
      1
    )
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

  // ================= 生码功能逻辑 =================
  function handleOpenGenerate() {
    openGenerate.value = true
    // 重置表单
    genForm.value = {
      productId: null,
      batchNo: '',
      count: 1000
    }
    // 获取产品列表
    listProduct().then(res => {
      productOptions.value = res.rows
    })
  }

  function submitGenerate() {
    proxy.$refs['genFormRef'].validate(valid => {
      if (valid) {
        genLoading.value = true
        generateCode(genForm.value)
          .then(res => {
            proxy.$modal.msgSuccess(res.msg || '生码任务提交成功')
            openGenerate.value = false
            genLoading.value = false
            // 刷新列表
            getBatchList()
          })
          .catch(() => {
            genLoading.value = false
          })
      }
    })
  }

  // ================= 复制与预览逻辑 =================
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
  .text-warning {
    color: #e6a23c;
  }
  .text-sm {
    font-size: 12px;
  }
  .font-600 {
    font-weight: 600;
  }
</style>
