<template>
  <el-row :gutter="16">
    <el-col :span="6" v-for="card in cards" :key="card.title">
      <div class="kpi-card" :style="{ borderTopColor: card.color }">
        <div class="kpi-icon" :style="{ backgroundColor: card.color + '20', color: card.color }">
          <Icon :icon="card.icon" :size="28" />
        </div>
        <div class="kpi-info">
          <div class="kpi-value">{{ card.value }}</div>
          <div class="kpi-title">{{ card.title }}</div>
        </div>
      </div>
    </el-col>
  </el-row>
</template>
<script lang="ts" setup>
import type { DashboardKpiVO } from '@/api/erp/statistics/dashboard'

defineOptions({ name: 'KpiCards' })

const props = defineProps<{ kpi: DashboardKpiVO | undefined }>()

const cards = computed(() => [
  {
    title: '今日订单数',
    value: props.kpi?.todayOrderCount ?? 0,
    icon: 'ep:document',
    color: '#409EFF'
  },
  {
    title: '今日出库数',
    value: props.kpi?.todayOutCount ?? 0,
    icon: 'ep:box',
    color: '#67C23A'
  },
  {
    title: '在途运输数',
    value: props.kpi?.transportingCount ?? 0,
    icon: 'ep:truck',
    color: '#E6A23C'
  },
  {
    title: '库存预警数',
    value: props.kpi?.stockAlertCount ?? 0,
    icon: 'ep:warning-filled',
    color: '#F56C6C'
  }
])
</script>
<style lang="scss" scoped>
.kpi-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--el-bg-color-overlay);
  border-radius: 8px;
  border-top: 3px solid;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }
}

.kpi-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  flex-shrink: 0;
}

.kpi-info {
  flex: 1;
}

.kpi-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--el-text-color-primary);
}

.kpi-title {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}
</style>
