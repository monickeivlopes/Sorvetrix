
# 🍨 Sorvetrix

Projeto Interdisciplinar desenvolvido para integrar as disciplinas:

- **Projeto de Interface do Usuário**
- **Programação Orientada a Serviços**
- **Projeto de Desenvolvimento de Sistemas para Internet**

---

## 📌 Proposta

Desenvolver um **sistema de gerenciamento para uma sorveteria**, incluindo:

- Interface web moderna (React)
- API de backend estruturada (FastAPI)
- Organização em módulos para produtos, pedidos e gerenciamento interno

---

## 👩‍💻 Desenvolvedores

- Eunice Cristina  
- Gabriely Medeiros  
- Lívia Vitória  
- Monicke Lopes  
- Wesley Darlly  

---

# 🚀 Como Rodar o Projeto

O projeto é dividido em duas partes:

- **Backend** → FastAPI  
- **Frontend** → React (Vite)

Para rodar localmente, execute os passos abaixo.

---

# 🛠️ 1. Rodar a API (FastAPI)

### 📂 Acessar a pasta do backend
```bash
cd backend
````

### 🧰 Criar e ativar ambiente virtual

```bash
python -m venv venv
venv\Scripts\activate
```

### 📦 Instalar dependências

```bash
pip install -r requirements.txt
```

Se não existir *requirements.txt*, instale manualmente:

```bash
pip install fastapi uvicorn
```

### ▶️ Rodar o servidor da API

```bash
python -m uvicorn main:app --reload
```

### 🌐 Acessar API e documentação

* API → **[http://127.0.0.1:8000](http://127.0.0.1:8000)**
* Swagger → **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**

---

# 🖥️ 2. Rodar o Frontend (React)

### 📂 Acessar a pasta do frontend

```bash
cd Front
```

### 📦 Instalar dependências (somente na primeira vez)

```bash
npm install
```

### ▶️ Rodar o servidor de desenvolvimento

```bash
npm run dev
```

### 🌐 Acessar o sistema

O projeto ficará disponível em:

* **[http://localhost:5173](http://localhost:5173)** (Vite)
* **[http://localhost:3000](http://localhost:3000)** (Create React App, se aplicável)

---

# 🧪 Observações Importantes

* A API deve estar rodando **antes** do frontend.
* Caso tenha erro de CORS, basta avisar que posso incluir uma configuração pronta para resolver.
* Se desejar rodar frontend + backend juntos com um único comando (`concurrently`), posso adicionar isso ao README também.


