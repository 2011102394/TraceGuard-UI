<template>
  <div class="h5-container">
    <div class="banner-box">
      <div class="banner-content">
        <div class="brand-row">
          <div class="logo-wrapper">
            <img
              v-if="result.product && result.product.companyLogo"
              :src="getFullUrl(result.product.companyLogo)"
              class="app-logo"
              alt="logo"
            />
            <img
              v-else
              src="@/assets/logo/logo.png"
              class="app-logo"
              alt="logo"
            />
          </div>
          <div class="banner-text-col">
            <div class="banner-title">防伪溯源查询中心</div>
            <div class="banner-sub">正品保障 · 全程溯源</div>
          </div>
        </div>
      </div>
      <div class="banner-curve"></div>
    </div>

    <div v-if="loading" class="loading-box">
      <el-icon class="is-loading" :size="36" color="#3dbf6e"
        ><Loading
      /></el-icon>
      <p>正品数据查询中...</p>
    </div>

    <div v-else-if="result.product">
      <div class="section-card verify-card">
        <div class="verify-header">
          <el-icon color="#07c160" :size="24"><SuccessFilled /></el-icon>
          <span class="verify-title">正品认证通过</span>
        </div>
        <div class="verify-content">
          <p class="main-msg">
            尊敬的客户您好,您查询的产品是由
            <b>{{ result.product.companyInfo }}</b> 生产的
            <b>{{ result.product.productName }}</b
            >,产品编码为<b>{{ result.code }}</b
            >, 经系统核验为正牌产品,请放心使用。
          </p>
          <div class="divider"></div>
          <div class="detail-list">
            <div class="d-item">
              <span class="label">查询次数：</span>
              <span class="value highlight"
                >{{ result.scanCount || 1 }} 次</span
              >
            </div>
            <div class="d-item">
              <span class="label">首次查询：</span>
              <span class="value">{{
                result.firstScanTime
                  ? formatTime(result.firstScanTime)
                  : formatTime(result.scanTime)
              }}</span>
            </div>
            <div class="d-item">
              <span class="label">查询位置：</span>
              <span class="value">{{
                result.firstScanLoc || '位置信息未授权'
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="section-card">
        <div class="card-header"><span class="bar"></span>产品详情</div>

        <div class="product-detail-flex">
          <div class="left-img-box">
            <el-image
              :src="getFullUrl(result.product.productImage)"
              fit="contain"
              class="detail-img"
              :preview-src-list="[getFullUrl(result.product.productImage)]"
              :initial-index="0"
              preview-teleported
              hide-on-click-modal
            >
              <template #error>
                <div class="img-error-slot">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>

          <div class="right-info-box">
            <div class="info-row title-row">
              <span class="p-label">产品名称：</span>
              <span class="p-value title">{{
                result.product.productName
              }}</span>
            </div>

            <div
              class="info-row"
              v-for="(item, index) in qualityParams"
              :key="index"
            >
              <span class="p-label">{{ item.label }}：</span>
              <span class="p-value">{{ item.value }}</span>
            </div>

            <div
              v-if="!qualityParams || qualityParams.length === 0"
              class="no-param-tip"
            >
              暂无更多参数
            </div>
          </div>
        </div>
      </div>

      <div class="section-card">
        <div class="card-header"><span class="bar"></span>溯源服务</div>
        <div class="grid-menu">
          <div class="grid-item" @click="openModule('code')">
            <div class="icon-circle">
              <el-icon><Goods /></el-icon>
            </div>
            <span>一瓶一码</span>
          </div>
          <div class="grid-item" @click="openModule('guide')">
            <div class="icon-circle">
              <el-icon><Reading /></el-icon>
            </div>
            <span>使用说明</span>
          </div>
          <div class="grid-item" @click="openModule('report')">
            <div class="icon-circle">
              <el-icon><DocumentChecked /></el-icon>
            </div>
            <span>检测报告</span>
          </div>
          <div class="grid-item" @click="openModule('storage')">
            <div class="icon-circle">
              <el-icon><Refrigerator /></el-icon>
            </div>
            <span>储存醒粉</span>
          </div>
          <div class="grid-item" @click="openModule('company')">
            <div class="icon-circle">
              <el-icon><OfficeBuilding /></el-icon>
            </div>
            <span>公司介绍</span>
          </div>
          <div class="grid-item" @click="openModule('contact')">
            <div class="icon-circle">
              <el-icon><Phone /></el-icon>
            </div>
            <span>联系我们</span>
          </div>
        </div>
      </div>

      <div class="footer-area">
        <p>中煤航测遥感集团有限公司提供防伪溯源技术支持</p>
      </div>
    </div>

    <div v-else class="error-wrapper">
      <el-icon :size="48" color="#ccc"><WarningFilled /></el-icon>
      <p>暂未查询到相关产品信息</p>
    </div>

    <el-drawer
      v-model="drawer.visible"
      :title="drawer.title"
      direction="btt"
      size="80%"
      :lock-scroll="true"
      destroy-on-close
      class="custom-drawer"
    >
      <div class="drawer-body">
        <div v-if="drawer.type === 'code'" class="code-detail">
          <div class="code-card">
            <div class="label">防伪身份码</div>
            <div class="code-val">{{ result.code || '未获取到编码' }}</div>
          </div>
          <el-descriptions :column="1" border class="mt-20">
            <el-descriptions-item label="产品名称">{{
              result.product.productName
            }}</el-descriptions-item>
            <el-descriptions-item label="生产批次">{{
              result.batchNo || '见包装喷码'
            }}</el-descriptions-item>

            <el-descriptions-item
              v-for="(item, index) in qualityParams"
              :key="index"
              :label="item.label"
            >
              {{ item.value }}
            </el-descriptions-item>

            <!-- <el-descriptions-item label="当前状态">
              <el-tag type="success">已激活</el-tag>
            </el-descriptions-item> -->
          </el-descriptions>
        </div>

        <div v-if="drawer.type === 'storage'">
          <div
            class="rich-text-box"
            v-if="result.product.storageContent"
            v-html="formatRichText(result.product.storageContent)"
          ></div>
          <div v-else class="empty-tip">
            <el-empty description="暂无储存说明" :image-size="80"></el-empty>
          </div>
        </div>

        <div v-if="drawer.type === 'report'" class="report-detail">
          <el-image
            v-if="result.product.reportImage"
            :src="getFullUrl(result.product.reportImage)"
            :preview-src-list="[getFullUrl(result.product.reportImage)]"
            preview-teleported
            hide-on-click-modal
            style="width: 100%; border-radius: 4px; border: 1px solid #eee"
          />
          <div
            v-if="result.product.reportFile"
            style="margin-top: 20px; text-align: center"
          >
            <a
              :href="getFullUrl(result.product.reportFile)"
              target="_blank"
              class="download-link"
            >
              <el-button type="primary" icon="Download" round
                >下载完整PDF报告</el-button
              >
            </a>
          </div>
          <el-empty
            v-if="!result.product.reportImage && !result.product.reportFile"
            description="暂无检测报告"
          />
        </div>

        <div v-if="drawer.type === 'contact'" class="contact-detail">
          <div class="business-card">
            <div class="biz-header">
              <img
                v-if="result.product.companyLogo"
                :src="getFullUrl(result.product.companyLogo)"
                class="biz-logo"
              />
              <h3>{{ result.product.companyInfo }}</h3>
            </div>
            <div class="biz-body">
              <div class="biz-row">
                <div class="icon">
                  <el-icon><Location /></el-icon>
                </div>
                <div class="info">
                  <div class="label">公司地址</div>
                  <div class="val">
                    {{ result.product.address || '暂无地址信息' }}
                  </div>
                </div>
              </div>
              <div class="biz-row" @click="callPhone(result.product.contactUs)">
                <div class="icon">
                  <el-icon><PhoneFilled /></el-icon>
                </div>
                <div class="info">
                  <div class="label">服务热线</div>
                  <div class="val link">
                    {{ result.product.contactUs || '暂无联系方式' }}
                  </div>
                </div>
                <el-icon class="arrow"><ArrowRight /></el-icon>
              </div>
            </div>
          </div>
        </div>

        <div v-if="['guide', 'company'].includes(drawer.type)">
          <div class="rich-text-box" v-html="drawer.content"></div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
  import { onMounted, ref, reactive } from 'vue'
  import { useRoute } from 'vue-router'
  import request from '@/utils/request'

  const route = useRoute()
  const loading = ref(true)
  const result = ref({})
  const qualityParams = ref([])
  const baseUrl = import.meta.env.VITE_APP_BASE_API

  const drawer = reactive({
    visible: false,
    title: '',
    type: '',
    content: ''
  })

  onMounted(() => {
    const codeVal = route.query.code
    if (codeVal) {
      doVerify(codeVal)
    } else {
      loading.value = false
    }
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
            if (res.data.product && res.data.product.qualityJson) {
              qualityParams.value = JSON.parse(res.data.product.qualityJson)
            }
          } catch (e) {
            console.error('JSON Parse Error', e)
          }
        }
      })
      .catch(() => {
        loading.value = false
      })
  }

  function openModule(type) {
    drawer.type = type
    drawer.visible = true
    const p = result.value.product || {}

    const titles = {
      code: '一瓶一码信息',
      guide: '使用说明',
      report: '权威检测报告',
      storage: '储存与醒粉攻略',
      company: '企业介绍',
      contact: '联系我们'
    }
    drawer.title = titles[type]

    if (type === 'guide')
      drawer.content =
        formatRichText(p.usageContent) ||
        '<p style="text-align:center;color:#999;padding:20px">暂无说明</p>'
    if (type === 'company')
      drawer.content =
        formatRichText(p.companyContent) ||
        '<p style="text-align:center;color:#999;padding:20px">暂无介绍</p>'
  }

  function callPhone(num) {
    if (num) window.location.href = 'tel:' + num
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
    background-color: #f2f3f5;
    padding-bottom: 40px;
    font-family:
      'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
      'Microsoft YaHei', Arial, sans-serif;
  }

  /* Banner 样式 */
  .banner-box {
    height: 140px;
    background: linear-gradient(135deg, #1f9e56 0%, #4cc77b 100%);
    position: relative;
    border-radius: 0 0 30px 30px;

    .banner-content {
      padding: 20px 20px 0 20px;

      .brand-row {
        display: flex;
        align-items: center;
        width: 100%;
        padding-left: 20px;
        .logo-wrapper {
          width: 64px;
          height: 64px;
          background: #fff;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 20px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);

          .app-logo {
            width: 56px;
            height: 56px;
            object-fit: contain;
          }
        }

        .banner-text-col {
          color: #fff;
          .banner-title {
            font-size: 20px;
            font-weight: bold;
            letter-spacing: 1px;
            margin-bottom: 4px;
          }
          .banner-sub {
            font-size: 12px;
            opacity: 0.8;
            font-weight: 300;
          }
        }
      }
    }

    .banner-curve {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 40px;
      border-radius: 0 0 40px 40px;
    }
  }

  /* 通用卡片容器 */
  .section-card {
    background: #fff;
    margin: 0 16px 16px;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
    position: relative;
  }

  .card-header {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    .bar {
      width: 4px;
      height: 16px;
      background: #1f9e56;
      margin-right: 10px;
      border-radius: 2px;
    }
  }

  /* 验证卡片 */
  .verify-card {
    margin-top: -30px;

    .verify-header {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 15px;
      .verify-title {
        font-size: 18px;
        font-weight: bold;
        color: #07c160;
        margin-left: 8px;
      }
    }

    .verify-content {
      .main-msg {
        font-size: 14px;
        color: #333;
        line-height: 1.6;
        text-align: justify;
        b {
          color: #1f9e56;
          font-weight: 600;
        }
      }

      .divider {
        height: 1px;
        background: #f0f0f0;
        margin: 15px 0;
      }

      .detail-list {
        .d-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 13px;

          .label {
            color: #888;
          }
          .value {
            color: #333;
            font-family: 'Arial', sans-serif;
          }
          .highlight {
            color: #ff6b00;
            font-weight: bold;
            font-size: 15px;
          }
        }
      }
    }
  }

  /* --- 产品详情 (左右布局优化) --- */
  .product-detail-flex {
    display: flex;
    align-items: stretch;
    gap: 15px;
    min-height: 140px;
  }

  /* 左侧图片容器 */
  .left-img-box {
    width: 110px;
    flex-shrink: 0;
    background-color: #f8f8f8;
    border-radius: 8px;
    border: 1px solid #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    .detail-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .img-error-slot {
      font-size: 24px;
      color: #ccc;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      width: 100%;
    }
  }

  /* 右侧信息容器 */
  .right-info-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 5px 0;

    .info-row {
      display: flex;
      margin-bottom: 8px;
      line-height: 1.5;
      font-size: 13px;

      &:last-child {
        margin-bottom: 0;
      }

      /* 关键：修复对齐问题的 CSS */
      .p-label {
        color: #888;
        width: 72px; /* 设置固定宽度，确保标签等宽 */
        flex-shrink: 0;
        text-align: justify;
        text-align-last: justify; /* 强制两端对齐 */
        margin-right: 5px; /* 冒号前的间隙或冒号后的间隙 */
        font-weight: 400;
      }

      .p-value {
        color: #333;
        flex: 1;
        font-weight: 500;

        &.title {
          font-size: 15px;
          font-weight: bold;
          color: #000;
        }

        &.code-text {
          font-family: 'Consolas', Monaco, monospace;
          color: #e6a23c;
          word-break: break-all;
          font-weight: bold;
        }
      }
    }

    .no-param-tip {
      font-size: 12px;
      color: #ccc;
      margin-top: 5px;
    }
  }

  /* 六宫格菜单 */
  .grid-menu {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -5px;

    .grid-item {
      width: 33.33%;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 15px 5px;
      cursor: pointer;

      .icon-circle {
        width: 48px;
        height: 48px;
        border-radius: 16px;
        background: #f0f9f4;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 8px;
        color: #1f9e56;
        font-size: 24px;
        transition: all 0.2s;
      }
      span {
        font-size: 12px;
        color: #666;
      }
      &:active .icon-circle {
        background: #dcf5e3;
        transform: scale(0.95);
      }
    }
  }

  /* 抽屉 & 弹窗内容 */
  .drawer-body {
    padding: 10px 20px 40px;
  }

  .code-card {
    background: linear-gradient(135deg, #1f9e56, #4cc77b);
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    color: #fff;
    margin-bottom: 20px;

    .label {
      font-size: 14px;
      opacity: 0.9;
      margin-bottom: 10px;
    }
    .code-val {
      font-size: 16px;
      font-weight: bold;
      letter-spacing: 1px;
      word-break: break-all;
      line-height: 1.4;
    }
  }

  .business-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    overflow: hidden;

    .biz-header {
      background: #f9fcfb;
      padding: 20px;
      text-align: center;
      border-bottom: 1px solid #f0f0f0;

      .biz-logo {
        width: 60px;
        height: 60px;
        border-radius: 8px;
        margin-bottom: 10px;
      }
      h3 {
        margin: 0;
        font-size: 16px;
        color: #333;
      }
    }

    .biz-body {
      padding: 10px 20px;
      .biz-row {
        display: flex;
        align-items: center;
        padding: 15px 0;
        border-bottom: 1px solid #f9f9f9;

        &:last-child {
          border-bottom: none;
        }

        .icon {
          width: 36px;
          height: 36px;
          background: #e1f5ea;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1f9e56;
          margin-right: 15px;
        }
        .info {
          flex: 1;
          .label {
            font-size: 12px;
            color: #999;
            margin-bottom: 4px;
          }
          .val {
            font-size: 14px;
            color: #333;
            font-weight: 500;
          }
          .val.link {
            color: #1f9e56;
          }
        }
        .arrow {
          color: #ccc;
        }
      }
    }
  }

  .rich-text-box {
    line-height: 1.8;
    color: #444;
    font-size: 14px;
    :deep(img) {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      display: block;
      margin: 10px auto;
    }
  }

  .footer-area {
    text-align: center;
    font-size: 11px;
    color: #ccc;
    margin-top: 30px;
  }
  .mt-20 {
    margin-top: 20px;
  }

  /* 加载和错误提示 */
  .loading-box,
  .error-wrapper {
    padding-top: 100px;
    text-align: center;
    color: #999;
    p {
      margin-top: 15px;
      font-size: 14px;
    }
  }
</style>

<style lang="scss">
  /* 全局覆盖：强制将 Element Plus 图片预览层的 z-index 设为最高 */
  .el-image-viewer__wrapper {
    z-index: 20000 !important;
  }
</style>
