<template>
  <div class="h5-container">
    <div v-if="loading" class="loading-box">
      <i class="el-icon-loading"></i> 正在鉴定真伪...
    </div>

    <div v-else class="result-box">
      <div class="status-card" :class="result.authStatus">
        <div v-if="result.authStatus === 'SUCCESS'" class="icon-area success">
          <el-icon :size="60"><CircleCheckFilled /></el-icon>
          <h2>官方正品认证</h2>
          <p class="sub-text">您所查询的是正牌产品，请放心使用</p>
        </div>

        <div
          v-else-if="result.authStatus === 'WARNING'"
          class="icon-area warning"
        >
          <el-icon :size="60"><WarningFilled /></el-icon>
          <h2 style="color: #ff4949">谨防假冒</h2>
          <p class="sub-text">该防伪码已被查询过，请核对首次查询时间</p>
        </div>

        <div v-else class="icon-area error">
          <el-icon :size="60"><CircleCloseFilled /></el-icon>
          <h2>查询失败</h2>
          <p class="sub-text">{{ errorMsg }}</p>
        </div>
      </div>

      <div v-if="result.authStatus" class="info-card">
        <div class="info-row" v-if="!result.isFirst">
          <label>首次查询时间：</label>
          <span>{{ result.firstScanTime }}</span>
        </div>
        <div class="info-row">
          <label>当前查询次数：</label>
          <span class="highlight">{{ result.scanCount }} 次</span>
        </div>
      </div>

      <div v-if="result.product" class="product-card">
        <div class="card-header">产品档案</div>
        <div class="info-row">
          <label>产品名称：</label>
          <span>{{ result.product.productName }}</span>
        </div>
        <div class="info-row">
          <label>生产批次：</label>
          <span>{{ result.batchNo }}</span>
        </div>

        <div v-if="result.product.reportImg" class="report-section">
          <div class="label">质检报告：</div>
          <el-image
            :src="result.product.reportImg"
            :preview-src-list="[result.product.reportImg]"
            fit="cover"
            class="report-img"
          />
        </div>

        <div class="desc-section">
          <div class="label">产品介绍：</div>
          <div class="rich-text" v-html="result.product.instruction"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import axios from 'axios' // 建议直接用axios，避开后台request.js里的token拦截

  const route = useRoute()
  const loading = ref(true)
  const errorMsg = ref('')
  const result = ref({})

  // 这里的 baseURL 要根据你的部署环境改，开发环境通常是 /dev-api
  const baseURL = import.meta.env.VITE_APP_BASE_API

  onMounted(() => {
    // 获取URL参数 ?c=xxxx-xxxx
    const code = route.query.c
    if (!code) {
      errorMsg.value = '未检测到防伪码'
      loading.value = false
      return
    }
    doVerify(code)
  })

  function doVerify(code) {
    // 注意：这里直接发请求，不走系统的 request.js，因为那个会拦截401跳转登录页
    axios
      .post(baseURL + '/api/h5/verify', { code: code })
      .then(res => {
        const data = res.data
        if (data.code === 200) {
          result.value = data.data
        } else {
          errorMsg.value = data.msg
        }
      })
      .catch(err => {
        errorMsg.value = '网络连接超时'
      })
      .finally(() => {
        loading.value = false
      })
  }
</script>

<style scoped>
  /* 简单的手机端样式适配 */
  .h5-container {
    min-height: 100vh;
    background-color: #f5f7fa;
    padding: 15px;
    font-family:
      -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica,
      'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial,
      sans-serif;
  }
  .status-card {
    background: #fff;
    border-radius: 12px;
    padding: 30px 20px;
    text-align: center;
    margin-bottom: 15px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  }
  .icon-area.success {
    color: #67c23a;
  }
  .icon-area.warning {
    color: #f56c6c;
  }
  .icon-area h2 {
    margin: 10px 0 5px;
    font-size: 20px;
  }
  .sub-text {
    font-size: 14px;
    color: #909399;
    margin: 0;
  }

  .info-card,
  .product-card {
    background: #fff;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
  }
  .card-header {
    font-weight: bold;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
    margin-bottom: 10px;
    font-size: 16px;
  }
  .info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 14px;
    color: #606266;
  }
  .highlight {
    color: #f56c6c;
    font-weight: bold;
  }
  .report-img {
    width: 100px;
    height: 100px;
    border-radius: 4px;
    margin-top: 5px;
  }
  .rich-text {
    font-size: 13px;
    color: #666;
    line-height: 1.6;
  }
</style>
