<template>
  <div id="app">
    <nav class="sidebar">
      <div class="logo">
        <h2>💼 Secretário</h2>
      </div>
      <ul>
        <li>
          <RouterLink to="/">📊 Dashboard</RouterLink>
        </li>
        <li>
          <RouterLink to="/pagamentos">💰 Pagamentos</RouterLink>
        </li>
        <li>
          <RouterLink to="/chat">🤖 Chat IA</RouterLink>
        </li>
      </ul>
    </nav>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', sans-serif;
  background: #f0f2f5;
  color: #333;
}

#app {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 220px;
  background: #1a1a2e;
  color: white;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  position: fixed;
  height: 100vh;
}

.sidebar .logo h2 {
  font-size: 1.2rem;
  color: #e0e0e0;
}

.sidebar ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar ul li a {
  display: block;
  padding: 10px 14px;
  border-radius: 8px;
  color: #ccc;
  text-decoration: none;
  font-size: 0.95rem;
  transition: background 0.2s;
}

.sidebar ul li a:hover,
.sidebar ul li a.router-link-active {
  background: #16213e;
  color: white;
}

.content {
  margin-left: 220px;
  padding: 32px;
  flex: 1;
}
</style>