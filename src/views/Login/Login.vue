<template>
  <div :class="prefixCls" class="login-page">
    <!-- 动态极光背景 -->
    <div class="aurora-bg">
      <div class="aurora aurora-1"></div>
      <div class="aurora aurora-2"></div>
      <div class="aurora aurora-3"></div>
    </div>
    <!-- 粒子画布 -->
    <canvas ref="canvasRef" class="particle-canvas"></canvas>
    <!-- 主内容 -->
    <div class="login-wrapper">
      <!-- 右上角主题切换 -->
      <div class="theme-bar">
        <ThemeSwitch />
      </div>
      <!-- 玻璃卡片 + 旋转边框 -->
      <div class="card-glow-wrap">
        <div class="card-glow"></div>
        <Transition appear enter-active-class="animate__animated animate__fadeInUp">
          <div class="glass-card">
            <!-- 光线扫过效果 -->
            <div class="card-sweep"></div>
            <div class="card-header">
              <div class="logo-wrap">
                <div class="logo-glow"></div>
                <img alt="" class="logo" src="@/assets/imgs/logo.png" />
              </div>
              <h1 class="title">{{ underlineToHump(appStore.getTitle) }}</h1>
            </div>
            <div class="card-body">
              <LoginForm />
              <ForgetPasswordForm />
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { underlineToHump } from '@/utils'
import { useDesign } from '@/hooks/web/useDesign'
import { useAppStore } from '@/store/modules/app'
import { ThemeSwitch } from '@/layout/components/ThemeSwitch'
import { LoginForm, ForgetPasswordForm } from './components'

defineOptions({ name: 'Login' })

const { t } = useI18n()
const appStore = useAppStore()
const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('login')

// ── 粒子动画（升级版）──────────────────────────────────
const canvasRef = ref<HTMLCanvasElement>()

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  baseRadius: number
  opacity: number
  hue: number
  pulse: number
  pulseSpeed: number
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')!

  let w = (canvas.width = window.innerWidth)
  let h = (canvas.height = window.innerHeight)

  const particles: Particle[] = []
  const count = 80

  for (let i = 0; i < count; i++) {
    const baseRadius = Math.random() * 2.5 + 0.8
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: baseRadius,
      baseRadius,
      opacity: Math.random() * 0.5 + 0.15,
      hue: Math.random() * 30 + 190, // ice blue range
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.01
    })
  }

  // 大型光球
  const orbs: { x: number; y: number; radius: number; hue: number; vx: number; vy: number }[] = [
    { x: w * 0.2, y: h * 0.3, radius: 130, hue: 200, vx: 0.12, vy: 0.08 },
    { x: w * 0.8, y: h * 0.7, radius: 110, hue: 195, vx: -0.08, vy: 0.1 },
    { x: w * 0.5, y: h * 0.15, radius: 90, hue: 210, vx: 0.06, vy: -0.08 }
  ]

  let mouseX = w / 2
  let mouseY = h / 2

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX
    mouseY = e.clientY
  })

  window.addEventListener('resize', () => {
    w = canvas.width = window.innerWidth
    h = canvas.height = window.innerHeight
  })

  let time = 0

  function draw() {
    time += 1
    ctx.clearRect(0, 0, w, h)

    // 大型光球（缓慢漂移）
    for (const orb of orbs) {
      orb.x += orb.vx
      orb.y += orb.vy
      if (orb.x < -orb.radius) orb.x = w + orb.radius
      if (orb.x > w + orb.radius) orb.x = -orb.radius
      if (orb.y < -orb.radius) orb.y = h + orb.radius
      if (orb.y > h + orb.radius) orb.y = -orb.radius

      const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius)
      grad.addColorStop(0, `hsla(${orb.hue}, 80%, 60%, 0.06)`)
      grad.addColorStop(0.5, `hsla(${orb.hue}, 70%, 50%, 0.02)`)
      grad.addColorStop(1, `hsla(${orb.hue}, 60%, 40%, 0)`)
      ctx.fillStyle = grad
      ctx.fillRect(orb.x - orb.radius, orb.y - orb.radius, orb.radius * 2, orb.radius * 2)
    }

    // 鼠标光晕（跟随鼠标）
    const mouseGrad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 300)
    mouseGrad.addColorStop(0, 'rgba(56, 189, 248, 0.07)')
    mouseGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.02)')
    mouseGrad.addColorStop(1, 'rgba(56, 189, 248, 0)')
    ctx.fillStyle = mouseGrad
    ctx.fillRect(mouseX - 300, mouseY - 300, 600, 600)

    // 粒子
    for (const p of particles) {
      const dx = mouseX - p.x
      const dy = mouseY - p.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 350) {
        p.vx += (dx / dist) * 0.008
        p.vy += (dy / dist) * 0.008
      }

      p.x += p.vx
      p.y += p.vy

      if (p.x < 0 || p.x > w) p.vx *= -1
      if (p.y < 0 || p.y > h) p.vy *= -1

      p.vx *= 0.999
      p.vy *= 0.999

      // 脉冲发光
      p.pulse += p.pulseSpeed
      p.radius = p.baseRadius + Math.sin(p.pulse) * 0.8

      // 外发光
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 4)
      glow.addColorStop(0, `hsla(${p.hue}, 80%, 70%, ${p.opacity * 0.3})`)
      glow.addColorStop(1, `hsla(${p.hue}, 80%, 70%, 0)`)
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius * 4, 0, Math.PI * 2)
      ctx.fill()

      // 粒子本体
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${p.hue}, 80%, 75%, ${p.opacity})`
      ctx.fill()
    }

    // 粒子连线（带渐变色）
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 160) {
          const alpha = 0.2 * (1 - dist / 160)
          const lineGrad = ctx.createLinearGradient(
            particles[i].x, particles[i].y,
            particles[j].x, particles[j].y
          )
          lineGrad.addColorStop(0, `hsla(${particles[i].hue}, 80%, 70%, ${alpha})`)
          lineGrad.addColorStop(1, `hsla(${particles[j].hue}, 80%, 70%, ${alpha})`)
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.strokeStyle = lineGrad
          ctx.lineWidth = 0.8
          ctx.stroke()
        }
      }
    }

    // 流星（随机触发）
    if (Math.random() < 0.005) {
      const sx = Math.random() * w
      const sy = 0
      const angle = Math.PI / 4 + Math.random() * 0.3
      const len = 80 + Math.random() * 60
      const ex = sx + Math.cos(angle) * len
      const ey = sy + Math.sin(angle) * len
      const shootGrad = ctx.createLinearGradient(sx, sy, ex, ey)
      shootGrad.addColorStop(0, 'rgba(200, 180, 255, 0)')
      shootGrad.addColorStop(0.3, 'rgba(200, 180, 255, 0.6)')
      shootGrad.addColorStop(1, 'rgba(255, 255, 255, 0.9)')
      ctx.beginPath()
      ctx.moveTo(sx, sy)
      ctx.lineTo(ex, ey)
      ctx.strokeStyle = shootGrad
      ctx.lineWidth = 1.5
      ctx.stroke()
    }

    requestAnimationFrame(draw)
  }

  draw()
})
</script>

<style lang="scss" scoped>
$prefix-cls: #{$namespace}-login;

.login-page {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  background: linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  overflow: hidden;
}

/* ── 极光背景 ─────────────────────────────────── */
.aurora-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

.aurora {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.25;
}

.aurora-1 {
  top: -20%;
  left: -10%;
  width: 60%;
  height: 60%;
  background: radial-gradient(circle, #38bdf8 0%, transparent 70%);
  animation: aurora1 12s ease-in-out infinite alternate;
}

.aurora-2 {
  bottom: -20%;
  right: -10%;
  width: 55%;
  height: 55%;
  background: radial-gradient(circle, #0ea5e9 0%, transparent 70%);
  animation: aurora2 15s ease-in-out infinite alternate;
}

.aurora-3 {
  top: 30%;
  left: 40%;
  width: 40%;
  height: 40%;
  background: radial-gradient(circle, #64748b 0%, transparent 70%);
  animation: aurora3 10s ease-in-out infinite alternate;
}

@keyframes aurora1 {
  0%   { transform: translate(0, 0) scale(1); }
  50%  { transform: translate(10%, 15%) scale(1.2); }
  100% { transform: translate(-5%, 5%) scale(0.9); }
}

@keyframes aurora2 {
  0%   { transform: translate(0, 0) scale(1); }
  50%  { transform: translate(-15%, -10%) scale(1.3); }
  100% { transform: translate(5%, -5%) scale(1.1); }
}

@keyframes aurora3 {
  0%   { transform: translate(0, 0) scale(1); opacity: 0.2; }
  50%  { transform: translate(5%, -10%) scale(1.15); opacity: 0.35; }
  100% { transform: translate(-10%, 5%) scale(0.85); opacity: 0.15; }
}

.particle-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.login-wrapper {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  padding: 20px;
}

.theme-bar {
  position: fixed;
  top: 20px;
  right: 24px;
  z-index: 10;
}

/* ── 卡片外围光效 ─────────────────────────────── */
.card-glow-wrap {
  position: relative;
}

.card-glow {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 22px;
  background: conic-gradient(
    from var(--glow-angle, 0deg),
    transparent 0%,
    #38bdf8 10%,
    #0ea5e9 20%,
    #7dd3fc 30%,
    transparent 40%,
    transparent 100%
  );
  opacity: 0.4;
  animation: rotateBorder 4s linear infinite;
  z-index: -1;
}

@keyframes rotateBorder {
  to { --glow-angle: 360deg; }
}

/* ── 玻璃卡片 ─────────────────────────────────── */
.glass-card {
  position: relative;
  width: 100%;
  max-width: 420px;
  padding: 40px 36px 32px;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  box-shadow:
    0 0 60px rgba(56, 189, 248, 0.06),
    0 8px 32px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  overflow: hidden;
  animation: cardFloat 6s ease-in-out infinite;
}

@keyframes cardFloat {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}

/* 光线扫过 */
.card-sweep {
  position: absolute;
  top: 0;
  left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.03) 40%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0.03) 60%,
    transparent 100%
  );
  animation: sweep 5s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

@keyframes sweep {
  0%   { left: -100%; }
  40%  { left: 150%; }
  100% { left: 150%; }
}

/* ── 卡片头部 ─────────────────────────────────── */
.card-header {
  position: relative;
  z-index: 1;
  text-align: center;
  margin-bottom: 28px;
}

.logo-wrap {
  position: relative;
  display: inline-block;
  margin-bottom: 14px;
}

.logo-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 90px;
  height: 90px;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(56, 189, 248, 0.35) 0%, transparent 70%);
  border-radius: 50%;
  animation: logoPulse 3s ease-in-out infinite;
  z-index: -1;
}

@keyframes logoPulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
  50%      { transform: translate(-50%, -50%) scale(1.3); opacity: 0.2; }
}

.logo {
  width: 56px;
  height: 56px;
  filter: drop-shadow(0 0 20px rgba(56, 189, 248, 0.5));
}

.title {
  font-size: 26px;
  font-weight: 800;
  color: #fff;
  margin: 0;
  letter-spacing: 2px;
  background: linear-gradient(135deg, #e0f2fe, #7dd3fc, #38bdf8, #0ea5e9);
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

/* ── 表单区域样式覆盖 ─────────────────────────── */
.card-body {
  position: relative;
  z-index: 1;

  :deep(.login-form) {
    background: transparent !important;
  }

  :deep(.el-form-item__label) {
    color: rgba(255, 255, 255, 0.7) !important;
  }

  :deep(.el-input__wrapper) {
    background: rgba(255, 255, 255, 0.04) !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    border-radius: 12px !important;
    box-shadow: none !important;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    height: 46px;

    &:hover {
      border-color: rgba(56, 189, 248, 0.25) !important;
      background: rgba(255, 255, 255, 0.06) !important;
    }

    &.is-focus {
      border-color: rgba(56, 189, 248, 0.5) !important;
      box-shadow:
        0 0 0 3px rgba(56, 189, 248, 0.08),
        0 0 20px rgba(56, 189, 248, 0.1) !important;
      background: rgba(255, 255, 255, 0.08) !important;
    }
  }

  :deep(.el-input__inner) {
    color: #e2e8f0 !important;
    font-size: 14px;

    &::placeholder {
      color: rgba(255, 255, 255, 0.25) !important;
    }
  }

  :deep(.el-input__prefix .el-icon) {
    color: rgba(255, 255, 255, 0.35) !important;
  }

  :deep(.el-checkbox__label) {
    color: rgba(255, 255, 255, 0.5) !important;
    font-size: 13px;
  }

  :deep(.el-checkbox__inner) {
    background: transparent;
    border-color: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }

  :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
    background: linear-gradient(135deg, #38bdf8, #0ea5e9);
    border-color: transparent;
  }

  :deep(.el-link) {
    color: #7dd3fc !important;
    font-size: 13px;
    transition: all 0.3s ease;

    &:hover {
      color: #bae6fd !important;
      text-shadow: 0 0 10px rgba(56, 189, 248, 0.3);
    }
  }

  // 登录按钮
  :deep(.el-button--primary) {
    position: relative;
    background: linear-gradient(135deg, #0ea5e9 0%, #38bdf8 50%, #7dd3fc 100%) !important;
    background-size: 200% 200% !important;
    border: none !important;
    border-radius: 12px !important;
    height: 46px;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 3px;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 24px rgba(14, 165, 233, 0.3);
    overflow: hidden;
    animation: btnGradient 3s ease infinite;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
      transition: left 0.6s ease;
    }

    &:hover {
      transform: translateY(-2px) scale(1.01);
      box-shadow:
        0 8px 32px rgba(14, 165, 233, 0.4),
        0 0 60px rgba(56, 189, 248, 0.12);

      &::after {
        left: 100%;
      }
    }

    &:active {
      transform: translateY(0) scale(0.99);
    }
  }
}

@keyframes btnGradient {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

// 忘记密码表单适配
:deep(.login-form) {
  background: transparent !important;
}
</style>

<style lang="scss">
@property --glow-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

.dark .login-form {
  .el-divider__text {
    background-color: transparent;
  }
  .el-card {
    background-color: transparent;
  }
}
</style>
