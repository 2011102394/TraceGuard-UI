<template>
  <div class="h5-container">
    <div v-if="loading" class="loading-box">
      <el-icon class="is-loading" :size="40"><Loading /></el-icon>
      <p>正品溯源中...</p>
    </div>

    <div v-else-if="result.product" class="content-wrapper">
      <div class="brand-header" v-if="result.product.companyLogo">
        <img
          :src="getFullUrl(result.product.companyLogo)"
          alt="Brand Logo"
          class="brand-logo"
        />
      </div>

      <div class="auth-header" :class="authStatusClass">
        <div class="shield-icon">
          <el-icon v-if="result.authStatus === 'SUCCESS'" :size="50"
            ><CircleCheckFilled
          /></el-icon>
          <el-icon v-else :size="50"><WarningFilled /></el-icon>
        </div>
        <div class="auth-text">
          <h2>{{ statusTitle }}</h2>
          <p class="scan-info">
            第 <b>{{ result.scanCount || 1 }}</b> 次查询
          </p>
          <p class="scan-time" v-if="result.firstScanTime || result.scanTime">
            首次查询: {{ formatTime(result.firstScanTime || result.scanTime) }}
          </p>
        </div>
        <div class="wave"></div>
      </div>

      <div class="section-card product-basic">
        <div class="prod-img">
          <img :src="getFullUrl(result.product.productImage)" alt="产品图片" />
        </div>
        <div class="prod-info">
          <h3>{{ result.product.productName }}</h3>
          <p>批次号：{{ result.batchNo }}</p>
          <p>规格：{{ result.product.spec || '标准规格' }}</p>
          <div class="verified-tag">
            <el-icon><SuccessFilled /></el-icon> 官方正品认证
          </div>
        </div>
      </div>

      <div class="tab-section">
        <el-tabs v-model="activeTab" class="custom-tabs" stretch>
          <el-tab-pane label="品质档案" name="quality">
            <div class="tab-content">
              <div class="quality-grid" v-if="qualityParams.length > 0">
                <div
                  class="q-item"
                  v-for="(item, index) in qualityParams"
                  :key="index"
                >
                  <span class="q-val">{{ item.value }}</span>
                  <span class="q-label">{{ item.label }}</span>
                </div>
              </div>

              <div
                class="report-box"
                v-if="result.product.reportImage || result.product.reportFile"
              >
                <div class="section-title">官方检测报告</div>
                <el-image
                  v-if="result.product.reportImage"
                  :src="getFullUrl(result.product.reportImage)"
                  :preview-src-list="[getFullUrl(result.product.reportImage)]"
                  fit="cover"
                  class="report-img"
                >
                  <template #error
                    ><div class="image-slot">暂无预览图</div></template
                  >
                </el-image>

                <div class="pdf-download" v-if="result.product.reportFile">
                  <a
                    :href="getFullUrl(result.product.reportFile)"
                    target="_blank"
                    class="download-btn"
                  >
                    <el-icon style="margin-right: 5px"><Document /></el-icon>
                    查看/下载完整PDF报告
                  </a>
                </div>
              </div>
              <div v-else class="empty-tip">暂无检测报告</div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="使用攻略" name="guide">
            <div class="tab-content">
              <div
                class="rich-text"
                v-if="result.product.usageContent"
                v-html="formatRichText(result.product.usageContent)"
              ></div>
              <div v-else class="empty-tip">暂无使用攻略</div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="公司简介" name="company">
            <div class="tab-content">
              <div
                class="rich-text"
                v-if="result.product.companyContent"
                v-html="formatRichText(result.product.companyContent)"
              ></div>
              <div v-else class="empty-tip">暂无企业简介</div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <div class="footer-section">
        <div class="company-name">
          {{ result.product.companyInfo || '陕西齐峰美农农业科技有限公司' }}
        </div>
        <div class="footer-divider"></div>
        <div class="contact-info">
          <p>
            <el-icon style="margin-right: 5px"><LocationInformation /></el-icon>
            地址：{{ result.product.address || '陕西眉县国家级猕猴桃产业园区' }}
          </p>
          <p>
            <el-icon style="margin-right: 5px"><Phone /></el-icon> 电话：{{
              result.product.contactUs || '0917-5665658'
            }}
          </p>
        </div>
      </div>
    </div>

    <div v-else class="loading-box">
      <el-icon :size="40" color="#f56c6c"><CircleCloseFilled /></el-icon>
      <p>未查询到产品信息</p>
    </div>
  </div>
</template>

<script setup>
  import { onMounted, ref, computed } from 'vue'
  import { useRoute } from 'vue-router'
  import request from '@/utils/request'

  const route = useRoute()
  const loading = ref(true)
  // result 初始化为空对象
  const result = ref({})
  const activeTab = ref('quality')
  const qualityParams = ref([])

  const baseUrl = import.meta.env.VITE_APP_BASE_API

  const authStatusClass = computed(() => {
    if (result.value.authStatus === 'SUCCESS') return 'bg-success'
    return 'bg-warning'
  })

  const statusTitle = computed(() => {
    if (result.value.authStatus === 'SUCCESS') return '正品认证 · 放心使用'
    return '警告 · 防伪码异常'
  })

  onMounted(() => {
    const codeVal = route.query.code
    if (codeVal) doVerify(codeVal)
    else loading.value = false
  })

  function doVerify(codeVal) {
    request({
      url: '/h5/verify',
      method: 'get',
      params: { code: codeVal }
    })
      .then(res => {
        loading.value = false
        if (res.code === 200) {
          result.value = res.data

          try {
            // 安全解析 JSON
            if (res.data.product && res.data.product.qualityJson) {
              qualityParams.value = JSON.parse(res.data.product.qualityJson)
            }
          } catch (e) {
            console.error('JSON Error', e)
          }
        }
      })
      .catch(() => (loading.value = false))
  }

  function formatTime(timeStr) {
    if (!timeStr) return ''
    const date = new Date(timeStr)
    if (isNaN(date.getTime())) return timeStr
    const y = date.getFullYear()
    const m = (date.getMonth() + 1).toString().padStart(2, '0')
    const d = date.getDate().toString().padStart(2, '0')
    const h = date.getHours().toString().padStart(2, '0')
    const min = date.getMinutes().toString().padStart(2, '0')
    const s = date.getSeconds().toString().padStart(2, '0')
    return `${y}-${m}-${d} ${h}:${min}:${s}`
  }

  function getFullUrl(url) {
    if (!url) return ''
    if (url.startsWith('http') || url.startsWith('https')) return url
    return baseUrl + url
  }

  function formatRichText(html) {
    if (!html) return ''
    return html.replace(/src="\/profile\//g, `src="${baseUrl}/profile/`)
  }
</script>

<style scoped lang="scss">
  .h5-container {
    min-height: 100vh;
    background-color: #f8f9fa;
    display: flex;
    flex-direction: column;
  }

  .loading-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 60vh;
    color: #909399;
    p {
      margin-top: 15px;
      font-size: 14px;
    }
  }

  .content-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  /* 品牌顶部栏样式 */
  .brand-header {
    background: #fff;
    padding: 10px 0;
    text-align: center;
    border-bottom: 1px solid #f5f5f5;
    .brand-logo {
      height: 40px;
      width: auto;
      object-fit: contain;
    }
  }

  .auth-header {
    position: relative;
    padding: 30px 20px 60px;
    color: #fff;
    border-bottom-left-radius: 30px;
    border-bottom-right-radius: 30px;
    display: flex;
    align-items: center;
    overflow: hidden;

    &.bg-success {
      background: linear-gradient(135deg, #07c160, #10ad7c);
    }
    &.bg-warning {
      background: linear-gradient(135deg, #ff976a, #ff4d4f);
    }

    .auth-text {
      margin-left: 15px;
      z-index: 2;
    }
    h2 {
      margin: 0 0 5px;
      font-size: 22px;
      font-weight: bold;
    }
    p {
      margin: 2px 0;
      font-size: 13px;
      opacity: 0.95;
    }
    .shield-icon {
      z-index: 2;
    }
  }

  .wave {
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 100%;
    height: 50px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50% 50% 0 0;
    transform: scaleX(1.5);
  }

  .section-card {
    background: #fff;
    border-radius: 12px;
    margin: -40px 15px 15px;
    padding: 15px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    position: relative;
    z-index: 5;
  }

  .product-basic {
    display: flex;
    align-items: center;
    .prod-img {
      width: 90px;
      height: 90px;
      border-radius: 8px;
      background: #f0f0f0;
      margin-right: 15px;
      overflow: hidden;
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    .prod-info {
      h3 {
        margin: 0 0 8px;
        font-size: 17px;
        color: #333;
        font-weight: bold;
      }
      p {
        margin: 4px 0;
        font-size: 13px;
        color: #666;
      }
      .verified-tag {
        color: #07c160;
        font-weight: bold;
        font-size: 12px;
        margin-top: 8px;
        display: flex;
        align-items: center;
        .el-icon {
          margin-right: 2px;
        }
      }
    }
  }

  .tab-section {
    background: #fff;
    margin: 0 15px;
    border-radius: 12px;
    min-height: 300px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
    :deep(.el-tabs__header) {
      margin-bottom: 0;
    }
    :deep(.el-tabs__nav-wrap::after) {
      height: 1px;
      background-color: #f0f0f0;
    }
    .tab-content {
      padding: 20px;
    }
  }

  .quality-grid {
    display: flex;
    justify-content: space-around;
    margin-bottom: 20px;
    background: #f9fcff;
    padding: 15px 0;
    border-radius: 8px;
    border: 1px solid #eef5fe;
    .q-item {
      text-align: center;
      .q-val {
        display: block;
        font-size: 18px;
        font-weight: bold;
        color: #409eff;
      }
      .q-label {
        font-size: 12px;
        color: #999;
        margin-top: 5px;
      }
    }
  }

  .report-box {
    text-align: center;
    margin-top: 25px;
    .section-title {
      font-weight: bold;
      margin-bottom: 15px;
      position: relative;
      display: inline-block;
      font-size: 15px;
      &::after {
        content: '';
        display: block;
        width: 30px;
        height: 3px;
        background: #409eff;
        margin: 5px auto 0;
        border-radius: 2px;
      }
    }
    .report-img {
      width: 100%;
      border-radius: 6px;
      border: 1px solid #eee;
      margin-bottom: 15px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
  }

  .pdf-download {
    margin-top: 15px;
    .download-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80%;
      margin: 0 auto;
      padding: 10px 0;
      background: #f2f6fc;
      color: #409eff;
      text-decoration: none;
      border-radius: 25px;
      font-size: 14px;
      font-weight: 500;
      border: 1px solid #d9ecff;
      &:active {
        background: #ecf5ff;
      }
    }
  }

  .rich-text {
    font-size: 14px;
    line-height: 1.8;
    color: #333;
    overflow-x: hidden;
    :deep(img) {
      max-width: 100% !important;
      height: auto !important;
      border-radius: 4px;
      margin: 10px 0;
    }
    :deep(p) {
      margin-bottom: 10px;
    }
  }

  .empty-tip {
    text-align: center;
    color: #ccc;
    padding: 40px 0;
    font-size: 13px;
  }

  .footer-section {
    background-color: #70b62c;
    color: #ffffff;
    padding: 30px 20px;
    margin-top: 30px;
    text-align: left;

    .company-name {
      font-size: 18px;
      font-weight: bold;
      letter-spacing: 1px;
      margin-bottom: 15px;
    }
    .footer-divider {
      width: 100%;
      height: 1px;
      background-color: rgba(255, 255, 255, 0.4);
      margin-bottom: 15px;
    }
    .contact-info {
      p {
        margin: 8px 0;
        font-size: 14px;
        line-height: 1.4;
        display: flex;
        align-items: center;
        opacity: 0.95;
      }
    }
  }
</style>
