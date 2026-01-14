<template>
  <div class="login-container">
    <div class="login-left">
      <div class="login-left-content">
        <div class="brand-title">齐峰花粉</div>
        <div class="brand-subtitle">产品标签溯源平台</div>
        <div class="brand-desc">
          为每一件商品赋予唯一的数字身份<br />
          保障品质，传递信任
        </div>
      </div>
    </div>

    <div class="login-right">
      <div class="login-form-box">
        <div class="form-header">
          <h3>欢迎登录</h3>
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
              placeholder="账号"
            >
              <template #prefix
                ><el-icon class="el-input__icon"><user /></el-icon
              ></template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              size="large"
              auto-complete="off"
              placeholder="密码"
              @keyup.enter="handleLogin"
            >
              <template #prefix
                ><el-icon class="el-input__icon"><lock /></el-icon
              ></template>
            </el-input>
          </el-form-item>

          <el-form-item prop="code" v-if="captchaEnabled">
            <div class="captcha-container">
              <el-input
                v-model="loginForm.code"
                size="large"
                auto-complete="off"
                placeholder="验证码"
                style="width: 60%"
                @keyup.enter="handleLogin"
              >
                <template #prefix
                  ><el-icon class="el-input__icon"><key /></el-icon
                ></template>
              </el-input>
              <div class="login-code">
                <img :src="codeUrl" @click="getCode" class="login-code-img" />
              </div>
            </div>
          </el-form-item>

          <el-checkbox
            v-model="loginForm.rememberMe"
            style="margin: 0px 0px 25px 0px"
            >记住密码</el-checkbox
          >

          <el-form-item style="width: 100%">
            <el-button
              :loading="loading"
              size="large"
              type="primary"
              style="width: 100%; font-size: 16px"
              @click.prevent="handleLogin"
            >
              <span v-if="!loading">登 录</span>
              <span v-else>登 录 中...</span>
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <div class="el-login-footer">
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
  // 验证码开关
  const captchaEnabled = ref(true)
  // 注册开关
  const register = ref(false)
  const redirect = ref(undefined)

  function handleLogin() {
    proxy.$refs.loginRef.validate(valid => {
      if (valid) {
        loading.value = true
        // 勾选了需要记住密码设置在 cookie 中设置记住用户名和密码
        if (loginForm.value.rememberMe) {
          Cookies.set('username', loginForm.value.username, { expires: 30 })
          Cookies.set('password', encrypt(loginForm.value.password), {
            expires: 30
          })
          Cookies.set('rememberMe', loginForm.value.rememberMe, { expires: 30 })
        } else {
          // 否则移除
          Cookies.remove('username')
          Cookies.remove('password')
          Cookies.remove('rememberMe')
        }
        // 调用action的登录方法
        userStore
          .login(loginForm.value)
          .then(() => {
            router.push({ path: redirect.value || '/' })
          })
          .catch(() => {
            loading.value = false
            // 重新获取验证码
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
  // 引入你的背景图片，如果你的图片路径不一样，请修改这里
  $bg-image-url: '@/assets/images/login-background.png';

  .login-container {
    display: flex;
    height: 100vh;
    width: 100%;
    overflow: hidden;
    background-color: #fff;

    // 左侧区域
    .login-left {
      position: relative;
      width: 50%; // 左侧宽度占比
      height: 100%;
      // 背景图设置
      background: url($bg-image-url) no-repeat center center;
      background-size: cover;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;

      // 黑色遮罩层，让文字更清晰
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.1);
      }

      .login-left-content {
        position: relative;
        z-index: 1;
        text-align: left;
        padding: 0 80px;
        margin-left: 25%;

        .brand-title {
          font-size: 48px;
          font-weight: bold;
          margin-bottom: 10px;
          letter-spacing: 2px;
        }
        .brand-subtitle {
          font-size: 24px;
          margin-bottom: 30px;
          font-weight: 300;
        }
        .brand-desc {
          font-size: 16px;
          line-height: 1.8;
          opacity: 0.8;
        }
      }
    }

    // 右侧区域
    .login-right {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #ffffff;

      .login-form-box {
        width: 420px; // 表单盒子宽度
        padding: 40px;

        // 可选：给右侧加一个淡淡的阴影盒子效果
        // background: #fff;
        // box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        // border-radius: 12px;

        .form-header {
          margin-bottom: 40px;
          text-align: left;
          h3 {
            font-size: 32px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 10px;
          }
          p {
            font-size: 16px;
            color: #909399;
          }
        }

        .login-form {
          .el-input {
            --el-input-height: 50px; // 增加输入框高度
            :deep(.el-input__wrapper) {
              box-shadow: none;
              background-color: #f5f7fa; // 浅灰色背景
              border-radius: 8px;
              border: 1px solid transparent;
              transition: all 0.3s;

              // 聚焦时的效果
              &.is-focus {
                background-color: #fff;
                border-color: var(--el-color-primary);
                box-shadow: 0 0 0 1px var(--el-color-primary) inset !important;
              }
            }
          }

          .captcha-container {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .login-code {
              width: 35%;
              height: 50px;
              margin-left: 15px;
              border-radius: 8px;
              overflow: hidden;
              border: 1px solid #dcdfe6;
              img {
                width: 100%;
                height: 100%;
                cursor: pointer;
                object-fit: cover;
              }
            }
          }

          .el-button--primary {
            height: 50px;
            border-radius: 8px;
            font-weight: 600;
            letter-spacing: 2px;
            background: linear-gradient(
              to right,
              var(--el-color-primary-light-3),
              var(--el-color-primary)
            );
            border: none;
            transition: all 0.3s;
            &:hover {
              opacity: 0.9;
              transform: translateY(-1px);
              box-shadow: 0 8px 20px rgba(var(--el-color-primary-rgb), 0.3);
            }
          }
        }
      }
    }

    .el-login-footer {
      position: absolute;
      bottom: 20px;
      right: 40px;
      color: #909399;
      font-size: 12px;
      letter-spacing: 1px;
    }
  }

  // 响应式适配：小屏幕下隐藏左侧
  @media (max-width: 992px) {
    .login-container {
      .login-left {
        display: none;
      }
      .login-right {
        background: url($bg-image-url) no-repeat center center;
        background-size: cover;
        position: relative;

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.85); // 白色半透明遮罩
          backdrop-filter: blur(5px); // 毛玻璃效果
        }

        .login-form-box {
          position: relative;
          z-index: 1;
          background: #fff;
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
        }
      }
      .el-login-footer {
        left: 0;
        right: 0;
        text-align: center;
        color: #606266;
      }
    }
  }
</style>
