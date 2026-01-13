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
      <el-form-item label="公司名称" prop="companyInfo">
        <el-input
          v-model="queryParams.companyInfo"
          placeholder="请输入公司名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="Refresh" @click="handleResetQuery">重置</el-button>
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
        @queryTable="handleGetList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="productList"
      @selection-change="handleSelectionChange"
      border
    >
      <el-table-column type="selection" width="55" align="center" />

      <el-table-column label="序号" type="index" width="60" align="center" />

      <el-table-column
        label="产品名称"
        align="center"
        prop="productName"
        :show-overflow-tooltip="true"
      />

      <el-table-column
        label="公司名称"
        align="center"
        prop="companyInfo"
        :show-overflow-tooltip="true"
      />

      <el-table-column
        label="联系电话"
        align="center"
        prop="contactUs"
        width="140"
      />

      <el-table-column
        label="产品图片"
        align="center"
        prop="productImage"
        width="140"
      >
        <template #default="scope">
          <image-preview
            :src="scope.row.productImage"
            :width="50"
            :height="50"
          />
        </template>
      </el-table-column>

      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="160"
      >
        <template #default="scope">
          <span>{{
            parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}')
          }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        align="center"
        width="150"
        class-name="small-padding fixed-width"
      >
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['feature:product:edit']"
            >修改</el-button
          >
          <el-button
            link
            type="primary"
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
      @pagination="handleGetList"
    />

    <el-dialog
      :title="title"
      v-model="open"
      width="850px"
      append-to-body
      top="5vh"
    >
      <el-form
        ref="productRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="custom-form"
      >
        <div class="section-title">基础信息</div>
        <el-row :gutter="30">
          <el-col :span="12">
            <el-form-item label="产品名称" prop="productName">
              <el-input
                v-model="form.productName"
                placeholder="请输入产品名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公司名称" prop="companyInfo">
              <el-input
                v-model="form.companyInfo"
                placeholder="请输入公司名称"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="30">
          <el-col :span="12">
            <el-form-item label="联系电话" prop="contactUs">
              <el-input v-model="form.contactUs" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生产地址" prop="address">
              <el-input v-model="form.address" placeholder="请输入生产地址" />
            </el-form-item>
          </el-col>
        </el-row>

        <div class="section-title" style="margin-top: 25px">详细介绍</div>

        <el-form-item label="使用攻略" prop="usageContent">
          <editor v-model="form.usageContent" :min-height="192" />
        </el-form-item>

        <el-form-item
          label="企业简介"
          prop="companyContent"
          style="margin-top: 20px"
        >
          <editor v-model="form.companyContent" :min-height="192" />
        </el-form-item>

        <div class="section-title" style="margin-top: 25px">附件资料</div>
        <div class="upload-section-bg">
          <el-form-item
            label="产品主图"
            prop="productImage"
            class="row-upload-item"
          >
            <div class="upload-wrapper">
              <image-upload
                v-model="form.productImage"
                :limit="1"
                :isShowTip="false"
              />
              <div class="upload-tip">
                <p>展示在H5溯源页面的顶部</p>
                <p>建议尺寸：800x800 或 1:1 正方形图片</p>
              </div>
            </div>
          </el-form-item>

          <el-divider border-style="dashed" class="upload-divider" />

          <el-form-item
            label="企业Logo"
            prop="companyLogo"
            class="row-upload-item"
          >
            <div class="upload-wrapper">
              <image-upload
                v-model="form.companyLogo"
                :limit="1"
                :isShowTip="false"
              />
              <div class="upload-tip">
                <p>展示在H5页面右上角及页脚</p>
                <p>建议使用背景透明的 PNG 格式</p>
              </div>
            </div>
          </el-form-item>

          <el-divider border-style="dashed" class="upload-divider" />

          <el-form-item
            label="报告预览图"
            prop="reportImage"
            class="row-upload-item"
          >
            <div class="upload-wrapper">
              <image-upload
                v-model="form.reportImage"
                :limit="1"
                :isShowTip="false"
              />
              <div class="upload-tip">
                <p>质检报告的照片或扫描件</p>
                <p>用户点击可放大查看细节</p>
              </div>
            </div>
          </el-form-item>

          <el-divider border-style="dashed" class="upload-divider" />

          <el-form-item
            label="完整报告"
            prop="reportFile"
            class="row-upload-item"
          >
            <div class="upload-wrapper">
              <file-upload
                v-model="form.reportFile"
                :limit="1"
                :fileType="['pdf']"
                :isShowTip="false"
              />
              <div class="upload-tip" style="margin-left: 20px">
                <p>上传完整的 PDF 检测文件</p>
                <p>供用户下载查阅更详细的数据</p>
              </div>
            </div>
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button
            type="primary"
            @click="handleSubmit"
            style="padding: 0 30px"
            >确 定</el-button
          >
          <el-button @click="handleCancel" style="padding: 0 30px"
            >取 消</el-button
          >
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

  const { proxy } = getCurrentInstance()

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
      companyInfo: null
    },
    rules: {
      productName: [
        { required: true, message: '产品名称不能为空', trigger: 'blur' }
      ],
      companyInfo: [
        { required: true, message: '公司名称不能为空', trigger: 'blur' }
      ]
    }
  })

  const { queryParams, form, rules } = toRefs(data)

  /** 查询产品列表 */
  function handleGetList() {
    loading.value = true
    listProduct(queryParams.value).then(response => {
      productList.value = response.rows
      total.value = response.total
      loading.value = false
    })
  }

  /** 取消按钮 */
  function handleCancel() {
    open.value = false
    handleReset()
  }

  /** 表单重置 */
  function handleReset() {
    form.value = {
      productId: null,
      productName: null,
      productImage: null,
      companyInfo: null,
      companyLogo: null,
      address: null,
      contactUs: null,
      reportImage: null,
      reportFile: null,
      usageContent: null,
      companyContent: null,
      qualityJson: null
    }
    proxy.resetForm('productRef')
  }

  /** 搜索按钮操作 */
  function handleQuery() {
    queryParams.value.pageNum = 1
    handleGetList()
  }

  /** 重置按钮操作 */
  function handleResetQuery() {
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
    handleReset()
    open.value = true
    title.value = '添加产品'
  }

  /** 修改按钮操作 */
  function handleUpdate(row) {
    handleReset()
    const _productId = row.productId || ids.value
    getProduct(_productId).then(response => {
      form.value = response.data
      open.value = true
      title.value = '修改产品'
    })
  }

  /** 提交按钮 */
  function handleSubmit() {
    proxy.$refs['productRef'].validate(valid => {
      if (valid) {
        if (form.value.productId != null) {
          updateProduct(form.value).then(response => {
            proxy.$modal.msgSuccess('修改成功')
            open.value = false
            handleGetList()
          })
        } else {
          addProduct(form.value).then(response => {
            proxy.$modal.msgSuccess('新增成功')
            open.value = false
            handleGetList()
          })
        }
      }
    })
  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    const _productIds = row.productId || ids.value
    proxy.$modal
      .confirm('是否确认删除所选数据？')
      .then(function () {
        return delProduct(_productIds)
      })
      .then(() => {
        handleGetList()
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

  // 初始化加载
  handleGetList()
</script>

<style scoped lang="scss">
  /* 标题样式：带蓝色竖线 */
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 20px;
    padding-left: 12px;
    border-left: 4px solid #409eff;
    line-height: 1.4;
  }

  /* 影像资料区域背景优化 */
  .upload-section-bg {
    background-color: #f8f9fb;
    border-radius: 6px;
    padding: 20px 20px;
    border: 1px dashed #e4e7ed;
  }

  /* 上传行样式 */
  .row-upload-item {
    margin-bottom: 0 !important; /* 让内部间距由divider控制 */
  }

  /* 上传组件容器 + 提示文字 */
  .upload-wrapper {
    display: flex;
    align-items: center;
  }

  .upload-tip {
    margin-left: 20px;
    color: #909399;
    font-size: 13px;
    line-height: 1.6;
    p {
      margin: 0;
    }
  }

  /* 分割线微调 */
  .upload-divider {
    margin: 15px 0;
    border-color: #ebeef5;
  }

  /* 对话框底部按钮美化 */
  .dialog-footer {
    padding-top: 10px;
    text-align: center;
  }
</style>
