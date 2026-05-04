<template>
  <el-form
    v-show="getShow"
    ref="formSmsResetPassword"
    :model="resetPasswordData"
    :rules="rules"
    class="login-form forget-form"
    label-position="top"
    label-width="120px"
    size="large"
  >
    <el-row class="mx-[-10px]">
      <el-col :span="24" class="px-10px">
        <h2 class="forget-title">{{ t('login.resetPassword') || '重置密码' }}</h2>
      </el-col>
      <!-- 租户名 -->
      <el-col v-if="resetPasswordData.tenantEnable === 'true'" :span="24" class="px-10px">
        <el-form-item prop="tenantName">
          <el-input
            v-model="resetPasswordData.tenantName"
            :placeholder="t('login.tenantNamePlaceholder')"
            :prefix-icon="iconHouse"
            type="primary"
            link
          />
        </el-form-item>
      </el-col>
      <!-- 手机号 -->
      <el-col :span="24" class="px-10px">
        <el-form-item prop="mobile">
          <el-input
            v-model="resetPasswordData.mobile"
            :placeholder="t('login.mobileNumberPlaceholder')"
            :prefix-icon="iconCellphone"
          />
        </el-form-item>
      </el-col>
      <Verify
        ref="verify"
        v-if="resetPasswordData.captchaEnable === 'true'"
        :captchaType="captchaType"
        :imgSize="{ width: '400px', height: '200px' }"
        mode="pop"
        @success="getSmsCode"
      />
      <!-- 验证码 -->
      <el-col :span="24" class="px-10px">
        <el-form-item prop="code">
          <el-row :gutter="5" justify="space-between" style="width: 100%">
            <el-col :span="24">
              <el-input
                v-model="resetPasswordData.code"
                :placeholder="t('login.codePlaceholder')"
                :prefix-icon="iconCircleCheck"
              >
                <template #append>
                  <span
                    v-if="mobileCodeTimer <= 0"
                    class="getMobileCode"
                    style="cursor: pointer"
                    @click="getCode"
                  >
                    {{ t('login.getSmsCode') }}
                  </span>
                  <span v-if="mobileCodeTimer > 0" class="getMobileCode" style="cursor: pointer">
                    {{ mobileCodeTimer }}秒后可重新获取
                  </span>
                </template>
              </el-input>
            </el-col>
          </el-row>
        </el-form-item>
      </el-col>
      <el-col :span="24" class="px-10px">
        <el-form-item prop="password">
          <InputPassword
            v-model="resetPasswordData.password"
            :placeholder="t('login.passwordPlaceholder')"
            class="w-full"
            :strength="true"
          />
        </el-form-item>
      </el-col>
      <el-col :span="24" class="px-10px">
        <el-form-item prop="check_password">
          <InputPassword
            v-model="resetPasswordData.check_password"
            :placeholder="t('login.checkPassword')"
            class="w-full"
            :strength="true"
          />
        </el-form-item>
      </el-col>
      <!-- 重置按钮 -->
      <el-col :span="24" class="px-10px">
        <el-form-item>
          <XButton
            :loading="loginLoading"
            :title="t('login.resetPassword')"
            class="w-full"
            type="primary"
            @click="resetPassword()"
          />
        </el-form-item>
      </el-col>
      <!-- 返回登录 -->
      <el-col :span="24" class="px-10px">
        <el-form-item>
          <XButton
            :loading="loginLoading"
            :title="t('login.backLogin')"
            class="w-full back-btn"
            @click="handleBackLogin()"
          />
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script lang="ts" setup>
import type { RouteLocationNormalizedLoaded } from 'vue-router'

import { useIcon } from '@/hooks/web/useIcon'

import { sendSmsCode, smsResetPassword } from '@/api/login'
import { LoginStateEnum, useFormValid, useLoginState } from './useLogin'
import { ElLoading } from 'element-plus'
import * as authUtil from '@/utils/auth'
import * as LoginApi from '@/api/login'

defineOptions({ name: 'ForgetPasswordForm' })

const verify = ref()
const { t } = useI18n()
const message = useMessage()
const { currentRoute } = useRouter()
const formSmsResetPassword = ref()
const loginLoading = ref(false)
const iconHouse = useIcon({ icon: 'ep:house' })
const iconCellphone = useIcon({ icon: 'ep:cellphone' })
const iconCircleCheck = useIcon({ icon: 'ep:circle-check' })
const { validForm } = useFormValid(formSmsResetPassword)
const { handleBackLogin, getLoginState, setLoginState } = useLoginState()
const getShow = computed(() => unref(getLoginState) === LoginStateEnum.RESET_PASSWORD)
const captchaType = ref('blockPuzzle')

const validatePass2 = (_rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== resetPasswordData.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const rules = {
  tenantName: [{ required: true, min: 2, max: 20, trigger: 'blur', message: '长度为4到16位' }],
  mobile: [{ required: true, min: 11, max: 11, trigger: 'blur', message: '手机号长度为11位' }],
  password: [
    {
      required: true,
      min: 4,
      max: 16,
      validator: validatePass2,
      trigger: 'blur',
      message: '密码长度为4到16位'
    }
  ],
  check_password: [{ required: true, validator: validatePass2, trigger: 'blur' }],
  code: [required]
}

const resetPasswordData = reactive({
  captchaEnable: import.meta.env.VITE_APP_CAPTCHA_ENABLE,
  tenantEnable: import.meta.env.VITE_APP_TENANT_ENABLE,
  tenantName: '',
  username: '',
  password: '',
  check_password: '',
  mobile: '',
  code: ''
})

const smsVO = reactive({
  tenantName: '',
  mobile: '',
  captchaVerification: '',
  scene: 23
})
const mobileCodeTimer = ref(0)
const redirect = ref<string>('')

// 获取验证码
const getCode = async () => {
  if (resetPasswordData.captchaEnable === 'false') {
    await getSmsCode({})
  } else {
    verify.value.show()
  }
}

const getSmsCode = async (params: any) => {
  if (resetPasswordData.tenantEnable === 'true') {
    await getTenantId()
  }
  smsVO.captchaVerification = params.captchaVerification
  smsVO.mobile = resetPasswordData.mobile
  await sendSmsCode(smsVO).then(async () => {
    message.success(t('login.SmsSendMsg'))
    mobileCodeTimer.value = 60
    const msgTimer = setInterval(() => {
      mobileCodeTimer.value = mobileCodeTimer.value - 1
      if (mobileCodeTimer.value <= 0) {
        clearInterval(msgTimer)
      }
    }, 1000)
  })
}
watch(
  () => currentRoute.value,
  (route: RouteLocationNormalizedLoaded) => {
    redirect.value = route?.query?.redirect as string
  },
  { immediate: true }
)

const getTenantId = async () => {
  if (resetPasswordData.tenantEnable === 'true') {
    const res = await LoginApi.getTenantIdByName(resetPasswordData.tenantName)
    if (res == null) {
      message.error(t('login.invalidTenantName'))
      throw t('login.invalidTenantName')
    }
    authUtil.setTenantId(res)
  }
}

// 重置密码
const resetPassword = async () => {
  const data = await validForm()
  if (!data) return
  await getTenantId()
  loginLoading.value = true
  await smsResetPassword(resetPasswordData)
    .then(async () => {
      message.success(t('login.resetPasswordSuccess'))
      setLoginState(LoginStateEnum.LOGIN)
    })
    .catch(() => {})
    .finally(() => {
      loginLoading.value = false
      setTimeout(() => {
        const loadingInstance = ElLoading.service()
        loadingInstance.close()
      }, 400)
    })
}
</script>

<style lang="scss" scoped>
.forget-form {
  background: transparent;
}

.forget-title {
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 20px;
  letter-spacing: 2px;
  background: linear-gradient(135deg, #e0f2fe, #7dd3fc, #38bdf8);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientShift 4s ease infinite;
}

@keyframes gradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.getMobileCode {
  color: #7dd3fc;
  font-size: 13px;

  &:hover {
    color: #bae6fd;
  }
}

.back-btn :deep(.el-button) {
  background: rgba(255, 255, 255, 0.04) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  color: rgba(255, 255, 255, 0.6) !important;
  border-radius: 12px !important;
  height: 46px;
  font-size: 14px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: rgba(255, 255, 255, 0.08) !important;
    border-color: rgba(56, 189, 248, 0.25) !important;
    color: #bae6fd !important;
    box-shadow: 0 0 20px rgba(56, 189, 248, 0.08);
    transform: translateY(-1px);
  }
}
</style>
