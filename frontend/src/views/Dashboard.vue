<template>
  <div>
    <h1 class="page-title">📊 Dashboard</h1>

    <div class="cards">
      <div class="card">
        <span class="label">Total a pagar</span>
        <span class="value">{{ formatCurrency(totalGeral) }}</span>
      </div>
      <div class="card">
        <span class="label">Pagamentos</span>
        <span class="value">{{ pagamentos.length }}</span>
      </div>
      <div class="card">
        <span class="label">Obras</span>
        <span class="value">{{ totalObras }}</span>
      </div>
    </div>

    <div class="charts">
      <div class="chart-box">
        <h3>Por Obra</h3>
        <Pie v-if="obraData" :data="obraData" :options="chartOptions" />
      </div>
      <div class="chart-box">
        <h3>Por Conta</h3>
        <Pie v-if="contaData" :data="contaData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const pagamentos = ref([])

const cores = [
  '#4e79a7','#f28e2b','#e15759','#76b7b2',
  '#59a14f','#edc948','#b07aa1','#ff9da7',
]

onMounted(async () => {
  const res = await axios.get('http://localhost:3000/pagamentos')
  pagamentos.value = res.data
})

const totalGeral = computed(() =>
  pagamentos.value.reduce((acc, p) => acc + parseFloat(p.valor || 0), 0)
)

const totalObras = computed(() =>
  new Set(pagamentos.value.map((p) => p.obra)).size
)

const obraData = computed(() => {
  const agrupado = {}
  pagamentos.value.forEach((p) => {
    agrupado[p.obra] = (agrupado[p.obra] || 0) + parseFloat(p.valor || 0)
  })
  return {
    labels: Object.keys(agrupado),
    datasets: [{ data: Object.values(agrupado), backgroundColor: cores }],
  }
})

const contaData = computed(() => {
  const agrupado = {}
  pagamentos.value.forEach((p) => {
    agrupado[p.conta] = (agrupado[p.conta] || 0) + parseFloat(p.valor || 0)
  })
  return {
    labels: Object.keys(agrupado),
    datasets: [{ data: Object.values(agrupado), backgroundColor: cores }],
  }
})

const chartOptions = { responsive: true, plugins: { legend: { position: 'bottom' } } }

const formatCurrency = (v) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
</script>

<style scoped>
.page-title { margin-bottom: 24px; font-size: 1.5rem; }

.cards {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 20px 28px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.card .label { font-size: 0.85rem; color: #888; }
.card .value { font-size: 1.6rem; font-weight: 700; color: #1a1a2e; }

.charts {
  display: flex;
  gap: 24px;
}

.chart-box {
  background: white;
  border-radius: 12px;
  padding: 24px;
  flex: 1;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.chart-box h3 { margin-bottom: 16px; color: #444; }
</style>