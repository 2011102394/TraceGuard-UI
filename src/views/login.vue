<template>
  <div class="login-container">
    <div class="login-overlay"></div>
    <div class="logo-container">
      <img src="@/assets/logo/logo1.png" alt="logo" />
    </div>
    <div class="login-content">
      <div class="brand-section">
        <div class="logo-box"></div>
        <h1 class="brand-title">齐峰花粉</h1>
        <div class="brand-line"></div>
        <p class="brand-slogan">
          全链路产品防伪与溯源平台<br />
          <span class="sub-slogan">赋予每一件商品独一无二的数字身份</span>
        </p>
      </div>

      <div class="login-card">
        <div class="login-header">
          <h3>欢迎回来</h3>
          <p>请登录您的账户以继续</p>
        </div>

        <el-form
          ref="loginRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              type="text"
              size="large"
              auto-complete="off"
              placeholder="请输入账号"
            >
              <template #prefix>
                <el-icon class="input-icon"><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              size="large"
              auto-complete="off"
              placeholder="请输入密码"
              show-password
              @keyup.enter="handleLogin"
            >
              <template #prefix>
                <el-icon class="input-icon"><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="code" v-if="captchaEnabled">
            <div class="captcha-row">
              <el-input
                v-model="loginForm.code"
                size="large"
                auto-complete="off"
                placeholder="验证码"
                class="captcha-input"
                @keyup.enter="handleLogin"
              >
                <template #prefix>
                  <el-icon class="input-icon"><Key /></el-icon>
                </template>
              </el-input>
              <div class="captcha-img-box">
                <img
                  :src="codeUrl"
                  @click="getCode"
                  class="login-code-img"
                  title="点击刷新验证码"
                />
              </div>
            </div>
          </el-form-item>

          <div class="remember-row">
            <el-checkbox v-model="loginForm.rememberMe">记住密码</el-checkbox>
          </div>

          <el-form-item style="width: 100%">
            <el-button
              :loading="loading"
              size="large"
              type="primary"
              class="login-btn"
              @click.prevent="handleLogin"
            >
              <span v-if="!loading">立即登录</span>
              <span v-else>登 录 中...</span>
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <div class="login-footer">
      <span>Copyright © 2023-2024 TraceGuard All Rights Reserved.</span>
    </div>
  </div>
</template>

<script setup>
  import { getCodeImg } from '@/api/login'
  import Cookies from 'js-cookie'
  import { encrypt } from '@/utils/jsencrypt'
  import useUserStore from '@/store/modules/user'
  import { useRouter } from 'vue-router'
  import { User, Lock, Key } from '@element-plus/icons-vue' // 显式引入图标

  const userStore = useUserStore()
  const router = useRouter()
  const { proxy } = getCurrentInstance()

  const loginForm = ref({
    username: '',
    password: '',
    rememberMe: false,
    code: '',
    uuid: ''
  })

  const loginRules = {
    username: [{ required: true, trigger: 'blur', message: '请输入您的账号' }],
    password: [{ required: true, trigger: 'blur', message: '请输入您的密码' }],
    code: [{ required: true, trigger: 'change', message: '请输入验证码' }]
  }

  const codeUrl = ref('')
  const loading = ref(false)
  const captchaEnabled = ref(true)
  const redirect = ref(undefined)

  function handleLogin() {
    proxy.$refs.loginRef.validate(valid => {
      if (valid) {
        loading.value = true
        if (loginForm.value.rememberMe) {
          Cookies.set('username', loginForm.value.username, { expires: 30 })
          Cookies.set('password', encrypt(loginForm.value.password), {
            expires: 30
          })
          Cookies.set('rememberMe', loginForm.value.rememberMe, { expires: 30 })
        } else {
          Cookies.remove('username')
          Cookies.remove('password')
          Cookies.remove('rememberMe')
        }
        userStore
          .login(loginForm.value)
          .then(() => {
            router.push({ path: redirect.value || '/' })
          })
          .catch(() => {
            loading.value = false
            if (captchaEnabled.value) {
              getCode()
            }
          })
      }
    })
  }

  function getCode() {
    getCodeImg().then(res => {
      captchaEnabled.value =
        res.captchaEnabled === undefined ? true : res.captchaEnabled
      if (captchaEnabled.value) {
        codeUrl.value = 'data:image/gif;base64,' + res.img
        loginForm.value.uuid = res.uuid
      }
    })
  }

  function getCookie() {
    const username = Cookies.get('username')
    const password = Cookies.get('password')
    const rememberMe = Cookies.get('rememberMe')
    loginForm.value = {
      username: username === undefined ? loginForm.value.username : username,
      password:
        password === undefined ? loginForm.value.password : decrypt(password),
      rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
    }
  }

  getCode()
  getCookie()
</script>

<style lang="scss" scoped>
  /* 背景图路径配置 - 指向您上传的真实文件 */
  $bg-image-url: '@/assets/images/login-background.jpg';

  .login-container {
    min-height: 100vh;
    width: 100%;
    background: url($bg-image-url) no-repeat center center;
    background-size: cover;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    font-family:
      'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
      'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  }

  .logo-container {
    position: absolute;
    top: 4px;
    right: 4px;
    z-index: 1;
    width: 160px;
    // background-color: rgba(255, 255, 255, 0.7);
    border-radius: 4px;
    img {
      width: 100%;
      height: auto;
    }
  }

  /* 深色半透明遮罩，增加背景图质感 */
  .login-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      135deg,
      rgba(0, 30, 60, 0.7) 0%,
      rgba(0, 0, 0, 0.1) 100%
    );
    z-index: 1;
  }

  .login-content {
    position: relative;
    z-index: 2;
    display: flex;
    width: 80%; /* 宽屏下占据更多空间 */
    max-width: 1200px;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
  }

  /* 左侧品牌区样式 */
  .brand-section {
    color: #fff;
    max-width: 500px;
    animation: slideInLeft 0.8s ease-out;

    .brand-title {
      font-size: 64px;
      font-weight: 800;
      margin: 0;
      letter-spacing: 4px;
      background: linear-gradient(to right, #fff, #a0cfff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    }

    .brand-line {
      width: 260px;
      height: 6px;
      background: #409eff;
      margin: 20px 0 30px;
      border-radius: 3px;
    }

    .brand-slogan {
      font-size: 28px;
      line-height: 1.4;
      font-weight: 300;

      .sub-slogan {
        display: block;
        margin-top: 10px;
        font-size: 16px;
        opacity: 0.8;
        font-weight: 400;
      }
    }
  }

  /* 右侧登录卡片 - 磨砂玻璃效果 */
  .login-card {
    width: 420px;
    background: rgba(255, 255, 255, 0.85); /* 半透明白 */
    backdrop-filter: blur(20px); /* 核心磨砂效果 */
    -webkit-backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 45px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.6);
    animation: slideInRight 0.8s ease-out;

    .login-header {
      margin-bottom: 35px;
      text-align: left;

      h3 {
        margin: 0 0 10px;
        font-size: 28px;
        color: #303133;
        font-weight: 700;
      }

      p {
        margin: 0;
        color: #909399;
        font-size: 14px;
      }
    }
  }

  .login-form {
    /* 输入框样式重写 */
    :deep(.el-input__wrapper) {
      background-color: #f7f9fa;
      box-shadow: none !important;
      border: 1px solid #dcdfe6;
      border-radius: 8px;
      padding-left: 15px;
      transition: all 0.3s;

      &:hover {
        background-color: #fff;
        border-color: #c0c4cc;
      }

      &.is-focus {
        background-color: #fff;
        border-color: #409eff;
        box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1) !important;
      }
    }

    :deep(.el-input__inner) {
      height: 48px;
      font-size: 15px;
      color: #303133;
    }

    .input-icon {
      font-size: 18px;
      color: #909399;
    }

    .captcha-row {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .captcha-input {
        flex: 1;
        margin-right: 15px;
      }

      .captcha-img-box {
        width: 120px;
        height: 48px;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid #dcdfe6;
        cursor: pointer;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;

          &:hover {
            transform: scale(1.05);
          }
        }
      }
    }

    .remember-row {
      margin-bottom: 25px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .login-btn {
      height: 50px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 2px;
      background: linear-gradient(135deg, #409eff 0%, #3a8ee6 100%);
      border: none;
      box-shadow: 0 8px 15px rgba(64, 158, 255, 0.25);
      transition: all 0.3s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(64, 158, 255, 0.35);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }

  .login-footer {
    position: absolute;
    bottom: 25px;
    width: 100%;
    text-align: center;
    color: rgba(255, 255, 255, 0.6);
    font-size: 12px;
    z-index: 2;
    letter-spacing: 1px;
  }

  /* 响应式调整 */
  @media (max-width: 992px) {
    .login-content {
      justify-content: center;
    }
    .brand-section {
      display: none; /* 小屏隐藏品牌区 */
    }
    .login-card {
      width: 100%;
      max-width: 400px;
      background: #fff; /* 小屏下去除磨砂，改为纯白，防止性能问题 */
    }
  }

  /* 进场动画 */
  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
</style>
