# 🍨 Sorvetrix

Projeto Interdisciplinar que abrange as disciplinas:

- **Projeto de Interface do Usuário**
- **Programação Orientada a Serviços**
- **Projeto de Desenvolvimento de Sistemas para Internet**

---

## 📌 Proposta

Desenvolver um **sistema de gerenciamento para uma sorveteria**, incluindo interface React e API em FastAPI.

---

## 👩‍💻 Desenvolvedores

- Eunice Cristina  
- Gabriely Medeiros  
- Lívia Vitória  
- Monicke Lopes  
- Wesley Darlly  

---

# 🚀 Como Rodar o Projeto

## 🔧 1. Rodar a API (FastAPI)

```bash
cd backend        # se a API estiver dentro de uma pasta chamada backend
python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt   # ou pip install uvicorn fastapi

python -m uvicorn main:app --reload
