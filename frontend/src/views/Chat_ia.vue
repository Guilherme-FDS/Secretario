<template>
    <div>
      <h1 class="page-title">🤖 Chat IA</h1>
      <div class="chat-box">
        <div class="messages" ref="messagesEl">
          <div
            v-for="(msg, i) in mensagens"
            :key="i"
            :class="'msg ' + msg.role"
          >
            <span>{{ msg.content }}</span>
          </div>
          <div v-if="carregando" class="msg assistant">
            <span>⏳ Pensando...</span>
          </div>
        </div>
  
        <div class="input-area">
          <input
            v-model="pergunta"
            placeholder="Pergunte sobre os pagamentos..."
            @keyup.enter="enviar"
            :disabled="carregando"
          />
          <button @click="enviar" :disabled="carregando">Enviar</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, nextTick } from 'vue'
  import axios from 'axios'
  
  const pergunta = ref('')
  const mensagens = ref([
    { role: 'assistant', content: 'Olá! Pergunte-me sobre os pagamentos. Ex: "Quanto vamos pagar na Obra A?"' }
  ])
  const messagesEl = ref(null)
  const carregando = ref(false)
  
  async function enviar() {
    if (!pergunta.value.trim() || carregando.value) return
  
    mensagens.value.push({ role: 'user', content: pergunta.value })
    const p = pergunta.value
    pergunta.value = ''
    carregando.value = true
  
    await nextTick()
    messagesEl.value.scrollTop = messagesEl.value.scrollHeight
  
    try {
      const res = await axios.post('http://localhost:3000/chat', { pergunta: p })
      mensagens.value.push({ role: 'assistant', content: res.data.resposta })
    } catch (err) {
      mensagens.value.push({
        role: 'assistant',
        content: '❌ Erro ao conectar com a IA. Verifique o backend.',
      })
    } finally {
      carregando.value = false
      await nextTick()
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight
    }
  }
  </script>
  
  <style scoped>
  .page-title { margin-bottom: 24px; font-size: 1.5rem; }
  
  .chat-box {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    display: flex;
    flex-direction: column;
    height: 70vh;
  }
  
  .messages {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .msg { max-width: 70%; padding: 12px 16px; border-radius: 12px; font-size: 0.95rem; }
  .msg.user { background: #1a1a2e; color: white; align-self: flex-end; border-radius: 12px 12px 0 12px; }
  .msg.assistant { background: #f0f2f5; color: #333; align-self: flex-start; border-radius: 12px 12px 12px 0; }
  
  .input-area {
    display: flex;
    gap: 8px;
    padding: 16px;
    border-top: 1px solid #eee;
  }
  
  .input-area input {
    flex: 1;
    padding: 10px 16px;
    border-radius: 8px;
    border: 1px solid #ddd;
    font-size: 0.95rem;
  }
  
  .input-area input:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
  
  .input-area button {
    padding: 10px 24px;
    background: #1a1a2e;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.95rem;
    transition: opacity 0.2s;
  }
  
  .input-area button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  </style>