<template>
  <div>
    <h1 class="page-title">💰 Pagamentos</h1>

    <div class="toolbar">
      <input v-model="busca" placeholder="🔍 Buscar por fornecedor, obra..." />
    </div>

    <div class="table-box">
      <table>
        <thead>
          <tr>
            <th>Empresa</th>
            <th>Fornecedor</th>
            <th>Obra</th>
            <th>Valor</th>
            <th>Vencimento</th>
            <th>Tipo</th>
            <th>Descrição IA</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in pagamentosFiltrados" :key="p.id">
            <td>{{ p.empresa }}</td>
            <td>{{ p.fornecedor }}</td>
            <td>{{ p.obra }}</td>
            <td>{{ formatCurrency(p.valor) }}</td>
            <td>{{ formatDate(p.data_vencimento) }}</td>
            <td><span :class="'tag ' + p.tipo_origem">{{ p.tipo_origem }}</span></td>
            <td class="descricao">{{ p.descricao_ia || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const pagamentos = ref([])
const busca = ref('')

onMounted(async () => {
  const res = await axios.get('http://localhost:3000/pagamentos')
  pagamentos.value = res.data
})

const pagamentosFiltrados = computed(() =>
  pagamentos.value.filter((p) =>
    [p.fornecedor, p.obra, p.empresa, p.descricao_ia]
      .join(' ')
      .toLowerCase()
      .includes(busca.value.toLowerCase())
  )
)

const formatCurrency = (v) =>
  parseFloat(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('pt-BR') : '—'
</script>

<style scoped>
.page-title { margin-bottom: 24px; font-size: 1.5rem; }

.toolbar { margin-bottom: 16px; }
.toolbar input {
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid #ddd;
  width: 360px;
  font-size: 0.95rem;
}

.table-box {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  overflow-x: auto;
}

table { width: 100%; border-collapse: collapse; }
th { text-align: left; padding: 12px 16px; font-size: 0.8rem; color: #888; border-bottom: 1px solid #eee; }
td { padding: 12px 16px; font-size: 0.9rem; border-bottom: 1px solid #f5f5f5; }

.tag { padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
.tag.contrato { background: #e3f2fd; color: #1565c0; }
.tag.compra { background: #e8f5e9; color: #2e7d32; }
.tag.direto { background: #fff3e0; color: #e65100; }

.descricao { max-width: 300px; color: #555; font-style: italic; }
</style>