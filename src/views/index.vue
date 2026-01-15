<template>
  <div class="app-container home">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon bg-blue">
              <el-icon><Box /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">产品总数</div>
              <div class="stat-value">{{ data.totalProduct }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon bg-green">
              <el-icon><Ticket /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">赋码总量</div>
              <div class="stat-value">{{ data.totalCode }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon bg-purple">
              <el-icon><DataLine /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">累计扫码</div>
              <div class="stat-value">{{ data.totalScan }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon bg-red">
              <el-icon><WarningFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label text-danger">异常告警</div>
              <div class="stat-value text-danger">{{ data.abnormalScan }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt20">
      <el-col :span="14">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <el-icon><MapLocation /></el-icon>
              <span>全国扫码热力分布</span>
            </div>
          </template>
          <div
            v-loading="mapLoading"
            element-loading-text="地图资源加载中..."
            ref="mapChartRef"
            style="height: 450px"
          ></div>
        </el-card>
      </el-col>

      <el-col :span="10">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <el-icon><Histogram /></el-icon>
              <span>扫码省份排名 TOP 10</span>
            </div>
          </template>
          <div ref="provinceRankRef" style="height: 450px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt20">
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <el-icon><TrendCharts /></el-icon><span>近7天扫码趋势</span>
            </div>
          </template>
          <div ref="trendChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover" class="table-card">
          <template #header>
            <div class="card-header">
              <el-icon><List /></el-icon><span>最新实时扫码动态</span>
            </div>
          </template>
          <el-table
            :data="data.recentLogs"
            style="width: 100%; height: 300px; overflow-y: auto"
            :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
            stripe
            size="small"
          >
            <el-table-column
              type="index"
              label="序号"
              width="50"
              align="center"
            />
            <el-table-column prop="code_value" label="防伪码" width="180">
              <template #default="scope">
                <el-tag type="info" effect="plain" size="small">{{
                  maskCode(scope.row.codeValue)
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="scanLocation"
              label="扫码位置"
              show-overflow-tooltip
            />
            <el-table-column prop="createTime" label="时间" width="140">
              <template #default="scope">{{
                parseTime(scope.row.createTime)
              }}</template>
            </el-table-column>
            <el-table-column
              prop="status"
              label="状态"
              width="70"
              align="center"
            >
              <template #default="scope">
                <el-tag
                  v-if="scope.row.status === '0'"
                  type="success"
                  size="small"
                  >正常</el-tag
                >
                <el-tag v-else type="danger" size="small">异常</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Index">
  import { onMounted, onUnmounted, ref } from 'vue'
  import * as echarts from 'echarts'
  import axios from 'axios'
  import request from '@/utils/request'
  import provinceJson from '@/assets/data/province.json'
  import {
    Box,
    Ticket,
    DataLine,
    WarningFilled,
    TrendCharts,
    MapLocation,
    List,
    Histogram
  } from '@element-plus/icons-vue'

  const data = ref({
    totalProduct: 0,
    totalCode: 0,
    totalScan: 0,
    abnormalScan: 0,
    dateList: [],
    scanTrend: [],
    recentLogs: [],
    provinceStat: []
  })

  const mapLoading = ref(false)

  const trendChartRef = ref(null)
  const provinceRankRef = ref(null)
  const mapChartRef = ref(null)

  let trendChart = null
  let provinceRankChart = null
  let mapChart = null

  function getIndexData() {
    request({ url: '/feature/dashboard/data', method: 'get' }).then(res => {
      if (res.code === 200) {
        data.value = res.data
        initCharts()
        initMap()
      }
    })
  }

  function initCharts() {
    // 1. 趋势图
    if (trendChartRef.value) {
      trendChart = echarts.init(trendChartRef.value)
      trendChart.setOption({
        tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.9)' },
        grid: {
          left: '2%',
          right: '2%',
          bottom: '2%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: data.value.dateList
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { type: 'dashed', color: '#eee' } }
        },
        series: [
          {
            name: '扫码量',
            type: 'line',
            smooth: true,
            showSymbol: false,
            lineStyle: { width: 3, color: '#409eff' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(64, 158, 255, 0.4)' },
                { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
              ])
            },
            data: data.value.scanTrend
          }
        ]
      })
    }

    // 2. 省份排行图
    if (provinceRankRef.value) {
      provinceRankChart = echarts.init(provinceRankRef.value)
      const sortedProv = [...(data.value.provinceStat || [])]
        .sort((a, b) => b.value - a.value)
        .slice(0, 10)
      const provNames = sortedProv.map(item => item.name)
      const provValues = sortedProv.map(item => item.value)

      provinceRankChart.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: {
          left: '2%',
          right: '5%',
          bottom: '2%',
          top: '2%',
          containLabel: true
        },
        xAxis: { type: 'value', show: false },
        yAxis: {
          type: 'category',
          data: provNames,
          inverse: true,
          axisLine: { show: false },
          axisTick: { show: false }
        },
        series: [
          {
            type: 'bar',
            data: provValues,
            barWidth: 16,
            itemStyle: {
              borderRadius: [0, 20, 20, 0],
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#3a8ee6' },
                { offset: 1, color: '#8cc5ff' }
              ])
            },
            label: { show: true, position: 'right', color: '#666' }
          }
        ]
      })
    }
  }

  // [新增函数] 标准化省份名称：将 "陕西" 转为 "陕西省" 等
  function normalizeProvinceName(name) {
    if (!name) return name
    // 如果已经包含后缀，直接返回
    if (
      name.endsWith('省') ||
      name.endsWith('市') ||
      name.endsWith('自治区') ||
      name.endsWith('特别行政区')
    ) {
      return name
    }
    // 特殊处理直辖市和自治区
    if (['北京', '天津', '上海', '重庆'].includes(name)) {
      return name + '市'
    }
    if (name === '内蒙古') return '内蒙古自治区'
    if (name === '广西') return '广西壮族自治区'
    if (name === '西藏') return '西藏自治区'
    if (name === '宁夏') return '宁夏回族自治区'
    if (name === '新疆') return '新疆维吾尔自治区'
    if (name === '香港') return '香港特别行政区'
    if (name === '澳门') return '澳门特别行政区'
    // 其他默认为省
    return name + '省'
  }

  // [修改点] 地图样式优化：解决颜色冲突 + 数据名称匹配
  function initMap() {
    if (!mapChartRef.value) return
    mapLoading.value = true

    mapLoading.value = false
    echarts.registerMap('china', provinceJson)

    mapChart = echarts.init(mapChartRef.value)

    // [核心修改 3] 处理数据，将简称转换为全称
    const processedData = (data.value.provinceStat || []).map(item => ({
      name: normalizeProvinceName(item.name),
      value: item.value
    }))

    mapChart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: function (params) {
          const val = params.value ? params.value : 0
          return `${params.name}<br/>扫码量：<span style="font-weight:bold; color:#409eff">${val}</span>`
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        textStyle: { color: '#333' }
      },
      visualMap: {
        min: 0,
        max: calculateMax(processedData), // 使用处理后的数据计算最大值
        left: '20',
        bottom: '20',
        text: ['高', '低'],
        calculable: true,
        inRange: {
          color: ['#e0f7fa', '#80deea', '#0097a7']
        },
        textStyle: { color: '#666' }
      },
      series: [
        {
          name: '扫码分布',
          type: 'map',
          map: 'china',
          roam: true,
          zoom: 1.2,
          layoutCenter: ['50%', '57%'],
          layoutSize: '95%',

          labelLayout: {
            hideOverlap: true
          },

          label: {
            show: true,
            fontSize: 10,
            color: '#606266',
            textShadowColor: '#fff',
            textShadowBlur: 2,
            textShadowOffsetX: 0,
            textShadowOffsetY: 0
          },

          emphasis: {
            label: {
              show: false
            },
            itemStyle: {
              areaColor: 'rgba(64, 158, 255, 0.4)',
              shadowBlur: 10,
              shadowColor: 'rgba(0,0,0,0.1)'
            }
          },

          itemStyle: {
            borderColor: '#ffffff',
            borderWidth: 1.2,
            areaColor: '#eff4f9',
            shadowColor: 'rgba(0, 0, 0, 0.05)',
            shadowBlur: 4
          },
          // [核心修改 4] 使用处理后的全名数据
          data: processedData
        }
      ]
    })
  }

  function calculateMax(dataList) {
    if (!dataList || dataList.length === 0) return 100
    const maxVal = Math.max(...dataList.map(o => o.value))
    return maxVal > 0 ? maxVal : 100
  }

  function maskCode(code) {
    if (!code) return ''
    return code.substring(0, 8) + '****' + code.substring(code.length - 4)
  }

  onMounted(() => {
    getIndexData()
    window.addEventListener('resize', resizeCharts)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', resizeCharts)
    if (trendChart) trendChart.dispose()
    if (provinceRankChart) provinceRankChart.dispose()
    if (mapChart) mapChart.dispose()
  })

  function resizeCharts() {
    if (trendChart) trendChart.resize()
    if (provinceRankChart) provinceRankChart.resize()
    if (mapChart) mapChart.resize()
  }
</script>

<style scoped lang="scss">
  .home {
    padding: 24px;
    background-color: #f6f8f9;
    min-height: calc(100vh - 84px);

    .el-card {
      border: none;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    /* 统计卡片样式 */
    .stat-card {
      .el-card__body {
        padding: 20px;
      }
      .stat-content {
        display: flex;
        align-items: center;
        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          transition: all 0.3s;
          .el-icon {
            font-size: 28px;
            color: #fff;
          }
          &.bg-blue {
            background: linear-gradient(135deg, #3a8ee6, #66b1ff);
            box-shadow: 0 4px 10px rgba(58, 142, 230, 0.3);
          }
          &.bg-green {
            background: linear-gradient(135deg, #13ce66, #42d885);
            box-shadow: 0 4px 10px rgba(19, 206, 102, 0.3);
          }
          &.bg-purple {
            background: linear-gradient(135deg, #7b53ea, #a78bf2);
            box-shadow: 0 4px 10px rgba(123, 83, 234, 0.3);
          }
          &.bg-red {
            background: linear-gradient(135deg, #f56c6c, #ff9999);
            box-shadow: 0 4px 10px rgba(245, 108, 108, 0.3);
          }
        }
        &:hover .stat-icon {
          transform: scale(1.1);
        }
        .stat-info {
          flex: 1;
          .stat-label {
            font-size: 14px;
            color: #909399;
            margin-bottom: 5px;
          }
          .stat-value {
            font-size: 26px;
            font-weight: 700;
            color: #303133;
            font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', sans-serif;
          }
          .text-danger {
            color: #f56c6c;
          }
        }
      }
    }

    .card-header {
      display: flex;
      align-items: center;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      .el-icon {
        margin-right: 8px;
        font-size: 18px;
        color: #409eff;
      }
    }

    .mt20 {
      margin-top: 10px;
    }
  }
</style>
