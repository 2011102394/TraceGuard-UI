<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="产品名称" prop="productName">
        <el-input
          v-model="queryParams.productName"
          placeholder="请输入产品名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
        >
          <el-option
            v-for="dict in common_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['feature:product:add']"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['feature:product:edit']"
          >修改</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['feature:product:remove']"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['feature:product:export']"
          >导出</el-button
        >
      </el-col>
      <right-toolbar
        v-model:showSearch="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="productList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
        label="产品编码"
        align="center"
        prop="productId"
        width="100"
      />
      <el-table-column label="产品名称" align="center" prop="productName" />
      <el-table-column label="联系方式" align="center" prop="contactUs" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="common_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="180"
      >
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
        width="250"
      >
        <template #default="scope">
          <el-button
            link
            type="primary"
            icon="Key"
            @click="handleCodeManage(scope.row)"
            v-hasPermi="['feature:product:edit']"
            >码管理</el-button
          >
          <el-button
            link
            type="success"
            icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['feature:product:edit']"
            >修改</el-button
          >
          <el-button
            link
            type="danger"
            icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['feature:product:remove']"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="productRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="产品名称" prop="productName">
          <el-input v-model="form.productName" placeholder="请输入产品名称" />
        </el-form-item>
        <el-form-item label="使用说明" prop="instruction">
          <editor v-model="form.instruction" :min-height="192" />
        </el-form-item>
        <el-form-item label="检测报告" prop="reportImg">
          <image-upload v-model="form.reportImg" :limit="1" />
        </el-form-item>
        <el-form-item label="公司介绍" prop="companyInfo">
          <editor v-model="form.companyInfo" :min-height="192" />
        </el-form-item>
        <el-form-item label="联系方式" prop="contactUs">
          <el-input v-model="form.contactUs" placeholder="请输入联系方式" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in common_status"
              :key="dict.value"
              :label="dict.value"
              >{{ dict.label }}</el-radio
            >
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            placeholder="请输入内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-drawer
      v-model="codeDrawer.open"
      :title="codeDrawer.title"
      size="600px"
      direction="rtl"
    >
      <div style="padding: 0 20px">
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              type="primary"
              icon="Plus"
              @click="handleOpenGenerate"
              v-hasPermi="['feature:product:add']"
              >新建生码批次</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button icon="Refresh" @click="getBatchList">刷新</el-button>
          </el-col>
        </el-row>

        <el-table
          v-loading="codeDrawer.loading"
          :data="codeDrawer.batchList"
          border
          style="margin-top: 10px"
        >
          <el-table-column property="batchNo" label="生产批次号" width="180" />
          <el-table-column
            property="codeCount"
            label="生码数量"
            width="100"
            align="center"
          />
          <el-table-column
            property="createTime"
            label="生成时间"
            align="center"
          >
            <template #default="scope">
              {{ parseTime(scope.row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template #default="scope">
              <el-button
                link
                type="primary"
                icon="Download"
                @click="handleExportBatch(scope.row)"
                >下载数据</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-drawer>

    <el-dialog
      title="批量生成防伪码"
      v-model="genDialog.open"
      width="450px"
      append-to-body
    >
      <el-form
        ref="genRef"
        :model="genDialog.form"
        :rules="genDialog.rules"
        label-width="100px"
      >
        <el-form-item label="批次号" prop="batchNo">
          <el-input
            v-model="genDialog.form.batchNo"
            placeholder="请输入批次号，如：20231001"
          />
        </el-form-item>
        <el-form-item label="生成数量" prop="count">
          <el-input-number
            v-model="genDialog.form.count"
            :min="1"
            :max="50000"
            :step="100"
            style="width: 100%"
          />
          <div style="font-size: 12px; color: #999">
            单次建议不超过 50,000 条
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button
            type="primary"
            @click="submitGenerate"
            :loading="genDialog.loading"
            >确 定</el-button
          >
          <el-button @click="genDialog.open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Product">
  import {
    listProduct,
    getProduct,
    delProduct,
    addProduct,
    updateProduct
  } from '@/api/feature/product'
  import { listBatch, generateCode } from '@/api/feature/code' // [新增导入]

  const { proxy } = getCurrentInstance()
  const { common_status } = proxy.useDict('common_status')

  // ----------------原有数据定义----------------
  const productList = ref([])
  const open = ref(false)
  const loading = ref(true)
  const showSearch = ref(true)
  const ids = ref([])
  const single = ref(true)
  const multiple = ref(true)
  const total = ref(0)
  const title = ref('')

  const data = reactive({
    form: {},
    queryParams: {
      pageNum: 1,
      pageSize: 10,
      productName: null,
      status: null
    },
    rules: {
      productName: [
        { required: true, message: '产品名称不能为空', trigger: 'blur' }
      ]
    }
  })

  const { queryParams, form, rules } = toRefs(data)

  // ----------------[新增] 码管理相关数据定义----------------
  const codeDrawer = reactive({
    open: false,
    title: '',
    loading: false,
    productId: null,
    productName: '',
    batchList: []
  })

  const genDialog = reactive({
    open: false,
    loading: false,
    form: {
      batchNo: '',
      count: 1000
    },
    rules: {
      batchNo: [{ required: true, message: '批次号不能为空', trigger: 'blur' }],
      count: [{ required: true, message: '数量不能为空', trigger: 'blur' }]
    }
  })

  // ----------------原有方法----------------

  /** 查询产品列表 */
  function getList() {
    loading.value = true
    listProduct(queryParams.value).then(response => {
      productList.value = response.rows
      total.value = response.total
      loading.value = false
    })
  }

  /** 取消按钮 */
  function cancel() {
    open.value = false
    reset()
  }

  /** 表单重置 */
  function reset() {
    form.value = {
      productId: null,
      productName: null,
      instruction: null,
      reportImg: null,
      companyInfo: null,
      contactUs: null,
      status: '0',
      remark: null
    }
    proxy.resetForm('productRef')
  }

  /** 搜索按钮操作 */
  function handleQuery() {
    queryParams.value.pageNum = 1
    getList()
  }

  /** 重置按钮操作 */
  function resetQuery() {
    proxy.resetForm('queryRef')
    handleQuery()
  }

  /** 多选框选中数据 */
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.productId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }

  /** 新增按钮操作 */
  function handleAdd() {
    reset()
    open.value = true
    title.value = '添加产品信息'
  }

  /** 修改按钮操作 */
  function handleUpdate(row) {
    reset()
    const _productId = row.productId || ids.value
    getProduct(_productId).then(response => {
      form.value = response.data
      open.value = true
      title.value = '修改产品信息'
    })
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs['productRef'].validate(valid => {
      if (valid) {
        if (form.value.productId != null) {
          updateProduct(form.value).then(response => {
            proxy.$modal.msgSuccess('修改成功')
            open.value = false
            getList()
          })
        } else {
          addProduct(form.value).then(response => {
            proxy.$modal.msgSuccess('新增成功')
            open.value = false
            getList()
          })
        }
      }
    })
  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    const _productIds = row.productId || ids.value
    proxy.$modal
      .confirm('是否确认删除产品编号为"' + _productIds + '"的数据项？')
      .then(function () {
        return delProduct(_productIds)
      })
      .then(() => {
        getList()
        proxy.$modal.msgSuccess('删除成功')
      })
      .catch(() => {})
  }

  /** 导出按钮操作 */
  function handleExport() {
    proxy.download(
      'feature/product/export',
      {
        ...queryParams.value
      },
      `product_${new Date().getTime()}.xlsx`
    )
  }

  // ----------------[新增] 码管理相关逻辑----------------

  /** 打开码管理抽屉 */
  function handleCodeManage(row) {
    codeDrawer.productId = row.productId
    codeDrawer.productName = row.productName
    codeDrawer.title = `防伪码管理 - ${row.productName}`
    codeDrawer.open = true
    getBatchList()
  }

  /** 获取批次列表 */
  function getBatchList() {
    codeDrawer.loading = true
    listBatch(codeDrawer.productId).then(res => {
      codeDrawer.batchList = res.rows
      codeDrawer.loading = false
    })
  }

  /** 打开生码弹窗 */
  function handleOpenGenerate() {
    genDialog.form.batchNo = formatDate(new Date()) // 默认使用当前日期作为批次号
    genDialog.form.count = 1000
    genDialog.open = true
    proxy.resetForm('genRef')
  }

  /** 生成默认批次号工具函数 */
  function formatDate(date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}${m}${d}_01`
  }

  /** 提交生码请求 */
  function submitGenerate() {
    proxy.$refs['genRef'].validate(valid => {
      if (valid) {
        genDialog.loading = true
        const req = {
          productId: codeDrawer.productId,
          batchNo: genDialog.form.batchNo,
          count: genDialog.form.count
        }
        generateCode(req)
          .then(res => {
            proxy.$modal.msgSuccess('生码任务已提交，正在生成中...')
            genDialog.open = false
            // 延迟一下再刷新，让数据库有时间处理部分数据
            setTimeout(() => {
              getBatchList()
            }, 1000)
          })
          .finally(() => {
            genDialog.loading = false
          })
      }
    })
  }

  /** 下载批次数据 */
  function handleExportBatch(row) {
    const params = {
      productId: codeDrawer.productId,
      batchNo: row.batchNo
    }
    const filename = `${codeDrawer.productName}_批次${row.batchNo}.xlsx`
    proxy.$modal
      .confirm(`确认下载批次 [${row.batchNo}] 的防伪码数据吗？`)
      .then(() => {
        proxy.download('feature/code/export', params, filename)
      })
  }

  // 初始化加载
  getList()
</script>
