<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="防伪码" prop="codeValue">
        <el-input
          v-model="queryParams.codeValue"
          placeholder="请输入防伪码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="扫描IP" prop="scanIp">
        <el-input
          v-model="queryParams.scanIp"
          placeholder="请输入扫描IP"
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
          <el-option label="正常" value="0" />
          <el-option label="异常" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="扫描时间" style="width: 308px">
        <el-date-picker
          v-model="dateRange"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[
            new Date(2000, 1, 1, 0, 0, 0),
            new Date(2000, 1, 1, 23, 59, 59)
          ]"
        ></el-date-picker>
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
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
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
      :data="scanlogList"
      @selection-change="handleSelectionChange"
      border
      stripe
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="日志ID" align="center" prop="logId" width="80" />
      <el-table-column
        label="防伪码"
        align="center"
        prop="codeValue"
        min-width="260"
        :show-overflow-tooltip="true"
      >
        <template #default="scope">
          <span class="code-font">{{ scope.row.codeValue }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="扫描IP"
        align="center"
        prop="scanIp"
        width="130"
      />
      <el-table-column
        label="地理位置"
        align="center"
        prop="scanLocation"
        width="150"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="浏览器信息"
        align="center"
        prop="browserInfo"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.status === '0'" type="success">正常</el-tag>
          <el-tag v-else type="danger">异常</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="备注"
        align="center"
        prop="remark"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="扫描时间"
        align="center"
        prop="createTime"
        width="180"
      >
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
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
  </div>
</template>

<script setup name="Scanlog">
  import { listScanlog, delScanlog } from '@/api/feature/scanlog'

  const { proxy } = getCurrentInstance()

  const scanlogList = ref([])
  const open = ref(false)
  const loading = ref(true)
  const showSearch = ref(true)
  const ids = ref([])
  const single = ref(true)
  const multiple = ref(true)
  const total = ref(0)
  const dateRange = ref([])

  const data = reactive({
    form: {},
    queryParams: {
      pageNum: 1,
      pageSize: 10,
      codeValue: null,
      scanIp: null,
      status: null
    }
  })

  const { queryParams, form } = toRefs(data)

  /** 查询防伪扫描记录列表 */
  function getList() {
    loading.value = true
    listScanlog(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        scanlogList.value = response.rows
        total.value = response.total
        loading.value = false
      }
    )
  }

  /** 搜索按钮操作 */
  function handleQuery() {
    queryParams.value.pageNum = 1
    getList()
  }

  /** 重置按钮操作 */
  function resetQuery() {
    dateRange.value = []
    proxy.resetForm('queryRef')
    handleQuery()
  }

  /** 多选框选中数据 */
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.logId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    const _logIds = row.logId || ids.value
    proxy.$modal
      .confirm('是否确认删除所选的扫描记录？')
      .then(function () {
        return delScanlog(_logIds)
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
      'feature/scanlog/export',
      {
        ...queryParams.value
      },
      `scanlog_${new Date().getTime()}.xlsx`
    )
  }

  getList()
</script>

<style scoped>
  .code-font {
    font-family: 'Consolas', 'Monaco', monospace;
    color: #409eff;
  }
</style>
