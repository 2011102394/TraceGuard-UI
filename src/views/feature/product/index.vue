<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
    >
      <el-form-item label="产品名称" prop="productName">
        <el-input
          v-model="queryParams.productName"
          placeholder="请输入产品名称"
          clearable
          @keyup.enter="handleQuery"
        />
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
      <right-toolbar
        v-model:showSearch="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="productList" border>
      <el-table-column
        label="产品ID"
        prop="productId"
        width="80"
        align="center"
      />
      <el-table-column label="产品名称" prop="productName" align="center" />
      <el-table-column
        label="产品图片"
        prop="productImage"
        width="120"
        align="center"
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
        label="厂商"
        prop="companyInfo"
        show-overflow-tooltip
        align="center"
      />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template #default="scope">
          <el-button
            link
            type="primary"
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

    <el-dialog :title="title" v-model="open" width="900px" append-to-body>
      <el-form
        ref="productRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-divider content-position="left">基础信息</el-divider>
        <el-row>
          <el-col :span="12">
            <el-form-item label="产品名称" prop="productName">
              <el-input
                v-model="form.productName"
                placeholder="请输入产品名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品规格" prop="spec">
              <el-input v-model="form.spec" placeholder="如：10g/瓶" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="产品图片" prop="productImage">
          <image-upload v-model="form.productImage" :limit="1" />
        </el-form-item>

        <el-divider content-position="left">质检与报告</el-divider>
        <el-form-item label="质检参数">
          <div
            v-for="(item, index) in qualityList"
            :key="index"
            class="quality-item mb10"
          >
            <el-input
              v-model="item.label"
              placeholder="指标名 (如:萌发率)"
              style="width: 150px; margin-right: 10px"
            />
            <el-input
              v-model="item.value"
              placeholder="指标值 (如:≥75%)"
              style="width: 150px; margin-right: 10px"
            />
            <el-button
              type="danger"
              icon="Delete"
              circle
              @click="removeQualityItem(index)"
            />
          </div>
          <el-button
            type="primary"
            plain
            icon="Plus"
            size="small"
            @click="addQualityItem"
            >添加参数行</el-button
          >
        </el-form-item>

        <el-row>
          <el-col :span="12">
            <el-form-item label="报告预览图" prop="reportImage">
              <image-upload
                v-model="form.reportImage"
                :limit="1"
                :fileSize="5"
              />
              <div class="form-tip">建议上传PDF首页截图，用于H5展示</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="完整PDF" prop="reportFile">
              <file-upload
                v-model="form.reportFile"
                :limit="1"
                :fileType="['pdf']"
              />
              <div class="form-tip">上传完整的检测报告PDF文件</div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">厂商信息配置</el-divider>

        <el-form-item label="品牌Logo" prop="companyLogo">
          <image-upload
            v-model="form.companyLogo"
            :limit="1"
            :isShowTip="false"
          />
          <div class="form-tip">建议上传透明背景的 PNG 图片，显示在H5顶部</div>
        </el-form-item>

        <el-row>
          <el-col :span="24">
            <el-form-item label="公司名称" prop="companyInfo">
              <el-input
                v-model="form.companyInfo"
                placeholder="例如：陕西齐峰美农农业科技有限公司"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="公司地址" prop="address">
              <el-input
                v-model="form.address"
                placeholder="例如：陕西眉县国家级猕猴桃产业园区"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="contactUs">
              <el-input
                v-model="form.contactUs"
                placeholder="例如：0917-5665658"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">详细内容</el-divider>
        <el-tabs type="border-card" class="mt20">
          <el-tab-pane label="使用攻略 (富文本)">
            <editor v-model="form.usageContent" :min-height="300" />
          </el-tab-pane>
          <el-tab-pane label="公司简介 (富文本)">
            <editor v-model="form.companyContent" :min-height="300" />
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
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
  const title = ref('')
  const qualityList = ref([])

  const data = reactive({
    form: {},
    queryParams: {
      pageNum: 1,
      pageSize: 10,
      productName: null
    },
    rules: {
      productName: [
        { required: true, message: '产品名称不能为空', trigger: 'blur' }
      ]
    }
  })

  const { queryParams, form, rules } = toRefs(data)

  function getList() {
    loading.value = true
    listProduct(queryParams.value).then(response => {
      productList.value = response.rows
      loading.value = false
    })
  }

  function cancel() {
    open.value = false
    reset()
  }

  function reset() {
    form.value = {
      productId: null,
      productName: null,
      productImage: null,
      spec: null,
      qualityJson: null,
      reportFile: null,
      reportImage: null,
      usageContent: null,
      companyContent: null,
      companyInfo: null,
      companyLogo: null, // 新增
      address: null,
      contactUs: null
    }
    qualityList.value = [
      { label: '萌发率', value: '' },
      { label: '净度', value: '' }
    ]
    proxy.resetForm('productRef')
  }

  function handleQuery() {
    queryParams.value.pageNum = 1
    getList()
  }

  function resetQuery() {
    proxy.resetForm('queryRef')
    handleQuery()
  }

  function handleAdd() {
    reset()
    open.value = true
    title.value = '添加产品'
  }

  function handleUpdate(row) {
    reset()
    const _productId = row.productId
    getProduct(_productId).then(response => {
      form.value = response.data
      if (form.value.qualityJson) {
        try {
          qualityList.value = JSON.parse(form.value.qualityJson)
        } catch (e) {
          qualityList.value = []
        }
      }
      open.value = true
      title.value = '修改产品'
    })
  }

  function submitForm() {
    proxy.$refs['productRef'].validate(valid => {
      if (valid) {
        form.value.qualityJson = JSON.stringify(qualityList.value)
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

  function handleDelete(row) {
    proxy.$modal
      .confirm('是否确认删除产品？')
      .then(function () {
        return delProduct(row.productId)
      })
      .then(() => {
        getList()
        proxy.$modal.msgSuccess('删除成功')
      })
      .catch(() => {})
  }

  function addQualityItem() {
    qualityList.value.push({ label: '', value: '' })
  }
  function removeQualityItem(index) {
    qualityList.value.splice(index, 1)
  }

  getList()
</script>

<style scoped>
  .quality-item {
    display: flex;
    align-items: center;
  }
  .mb10 {
    margin-bottom: 10px;
  }
  .mt20 {
    margin-top: 20px;
  }
  .form-tip {
    font-size: 12px;
    color: #999;
    line-height: 20px;
    margin-top: 5px;
  }
</style>
