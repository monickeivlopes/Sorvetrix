# Arquivos atualizados

Abaixo estão os dois arquivos completos que implementei para você: `main.py` (backend FastAPI com controle de quantidade e migração do banco) e `Stocks.jsx` (componente de estoque adaptado para usar `quantidade`).

> **Instruções rápidas antes de executar**
>
> 1. **Faça backup** do arquivo `users.db` (ou do seu banco atual) antes de iniciar — a aplicação fará alterações no esquema/estrutura durante a primeira execução.
> 2. Instale dependências (se necessário): `pip install fastapi sqlalchemy pydantic jose passlib[bcrypt] uvicorn`.
> 3. Rode o servidor: `uvicorn main:app --reload`.
> 4. Ao iniciar, o servidor tentará adicionar a coluna `quantidade` (se ela não existir) e consolidar linhas duplicadas em registros com `quantidade` somada.

---

## main.py

```python
# main.py
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import (
    create_engine, Column, Integer, String, DateTime, Float, ForeignKey, func, text
)
from sqlalchemy.orm import sessionmaker, declarative_base, Session, relationship
from jose import jwt
from passlib.context import CryptContext
from typing import Optional, List
import datetime
import sqlite3

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = "sqlite:///./users.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "segredo_super_seguro"
ALGORITHM = "HS256"

# -----------------------------
# USERS
# -----------------------------
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String)
    email = Column(String, unique=True)
    senha = Column(String)
    cargo = Column(String)


class UserCreate(BaseModel):
    nome: str
    email: str
    senha: str
    cargo: str

class UserLogin(BaseModel):
    email: str
    senha: str

# -----------------------------
# PRODUTOS
# -----------------------------
class Produto(Base):
    __tablename__ = "produtos"
    id = Column(Integer, primary_key=True, index=True)
    marca = Column(String)
    sabor = Column(String)
    lote = Column(Integer)
    validade = Column(DateTime)
    valor = Column(Float)
    quantidade = Column(Integer, default=0)  # novo campo


class ProdutoSchema(BaseModel):
    marca: str
    sabor: str
    lote: int
    validade: str
    valor: float
    quantidade: Optional[int] = 0

# -----------------------------
# VENDAS + ITENS
# -----------------------------
class Venda(Base):
    __tablename__ = "vendas"
    id = Column(Integer, primary_key=True, index=True)
    cliente = Column(String(200), nullable=False)
    endereco = Column(String(300), nullable=True)
    status = Column(String(50), nullable=False, default="Em preparo")
    valor_total = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)

    items = relationship("VendaItem", back_populates="venda", cascade="all, delete-orphan")


class VendaItem(Base):
    __tablename__ = "venda_items"
    id = Column(Integer, primary_key=True, index=True)
    venda_id = Column(Integer, ForeignKey("vendas.id", ondelete="CASCADE"), nullable=False)
    produto_id = Column(Integer, nullable=False)
    nome = Column(String, nullable=False)         # ex: "Marca - Sabor"
    quantidade = Column(Integer, nullable=False)
    valor_unit = Column(Float, nullable=False)
    subtotal = Column(Float, nullable=False)

    venda = relationship("Venda", back_populates="items")


# --------------- Pydantic schemas para Vendas ---------------
class VendaItemCreate(BaseModel):
    produto_id: int
    quantidade: int = 1

class VendaItemRead(BaseModel):
    produto_id: int
    nome: str
    quantidade: int
    valor_unit: float
    subtotal: float

    class Config:
        orm_mode = True

class VendaCreate(BaseModel):
    cliente: str
    endereco: Optional[str] = None
    items: List[VendaItemCreate] = Field(..., min_items=1)

class VendaRead(BaseModel):
    id: int
    cliente: str
    endereco: Optional[str] = None
    status: str
    valor_total: float
    created_at: datetime.datetime
    items: List[VendaItemRead]

    class Config:
        orm_mode = True

# -----------------------------
# CREATE TABLES
# -----------------------------
Base.metadata.create_all(bind=engine)

# -----------------------------
# MIGRATION: garantir coluna `quantidade` e consolidar duplicatas
# -----------------------------
def ensure_quantity_and_consolidate():
    # Usamos sqlite diretamente para executar ALTER TABLE se necessário
    conn = sqlite3.connect("./users.db")
    cur = conn.cursor()

    # verificar se coluna existe
    cur.execute("PRAGMA table_info(produtos)")
    cols = [r[1] for r in cur.fetchall()]
    if 'quantidade' not in cols:
        try:
            cur.execute("ALTER TABLE produtos ADD COLUMN quantidade INTEGER DEFAULT 0")
            conn.commit()
        except Exception as e:
            # se falhar, apenas logamos (continua)
            print("Aviso: não foi possível adicionar coluna quantidade:", e)

    # Agora, muitos registros podem representar 1 unidade cada (modelo antigo).
    # Para consolidar, vamos somar registros que compartilham marca/sabor/lote/validade/valor
    try:
        cur.execute("SELECT id, marca, sabor, lote, validade, valor, quantidade FROM produtos")
        rows = cur.fetchall()
        if not rows:
            conn.close()
            return

        # mapa: (marca,sabor,lote,validade,valor) -> list of ids
        groups = {}
        for r in rows:
            _id, marca, sabor, lote, validade, valor, quantidade = r
            key = (marca, sabor, lote, validade, valor)
            groups.setdefault(key, []).append((_id, quantidade if quantidade is not None else 1))

        for key, items in groups.items():
            if len(items) <= 1:
                # se a única linha tem quantidade 0 ou null, ajustar para 1
                _id, q = items[0]
                if q is None or q == 0:
                    cur.execute("UPDATE produtos SET quantidade = 1 WHERE id = ?", (_id,))
                continue

            # existem duplicatas: manter o primeiro, somar quantidades e apagar os demais
            keep_id = items[0][0]
            total_q = 0
            for _id, q in items:
                total_q += (q if q is not None and q > 0 else 1)

            cur.execute("UPDATE produtos SET quantidade = ? WHERE id = ?", (total_q, keep_id))

            # deletar os demais ids (exceto keep_id)
            ids_to_delete = [str(i[0]) for i in items[1:]]
            if ids_to_delete:
                cur.execute(f"DELETE FROM produtos WHERE id IN ({','.join(ids_to_delete)})")

        conn.commit()
    except Exception as e:
        print("Aviso ao consolidar produtos:", e)
    finally:
        conn.close()

# executar a migração ao iniciar
ensure_quantity_and_consolidate()

# -----------------------------
# DB dependency
# -----------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -----------------------------
# AUTH helpers
# -----------------------------
def create_token(email: str):
    payload = {
        "sub": email,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=3)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

# -----------------------------
# USERS routes (kept same)
# -----------------------------
@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email já cadastrado!")

    hashed_pw = pwd_context.hash(user.senha[:72])
    new_user = User(nome=user.nome, email=user.email, senha=hashed_pw, cargo=user.cargo)
    db.add(new_user)
    db.commit()
    return {"message": "Usuário criado com sucesso!"}

@app.post("/login")
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not pwd_context.verify(credentials.senha, user.senha):
        raise HTTPException(status_code=401, detail="Credenciais inválidas!")

    token = create_token(user.email)
    return {"access_token": token, "user": user.nome, "cargo": user.cargo}


# -----------------------------
# PRODUTOS routes (updated + quantidade)
# -----------------------------
@app.post("/produtos")
def create_produto(produto: ProdutoSchema, db: Session = Depends(get_db)):
    validade_dt = datetime.datetime.strptime(produto.validade, "%Y-%m-%d")
    novo = Produto(
        marca=produto.marca,
        sabor=produto.sabor,
        lote=produto.lote,
        validade=validade_dt,
        valor=produto.valor,
        quantidade=produto.quantidade or 0
    )
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return {
        "id": novo.id,
        "marca": novo.marca,
        "sabor": novo.sabor,
        "lote": novo.lote,
        "validade": novo.validade.strftime("%Y-%m-%d"),
        "valor": novo.valor,
        "quantidade": novo.quantidade
    }

@app.get("/produtos")
def listar_produtos(db: Session = Depends(get_db)):
    produtos = db.query(Produto).all()
    return [
        {
            "id": p.id,
            "marca": p.marca,
            "sabor": p.sabor,
            "lote": p.lote,
            "validade": p.validade.strftime("%Y-%m-%d") if p.validade else None,
            "valor": p.valor,
            "quantidade": p.quantidade or 0
        }
        for p in produtos
    ]

@app.put("/produtos/{produto_id}")
def update_produto(produto_id: int, dados: dict, db: Session = Depends(get_db)):
    p = db.query(Produto).filter(Produto.id == produto_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    if "marca" in dados:
        p.marca = dados["marca"]
    if "sabor" in dados:
        p.sabor = dados["sabor"]
    if "lote" in dados:
        p.lote = dados["lote"]
    if "valor" in dados:
        p.valor = dados["valor"]
    if "validade" in dados:
        p.validade = datetime.datetime.strptime(dados["validade"], "%Y-%m-%d")
    if "quantidade" in dados:
        p.quantidade = int(dados["quantidade"]) if dados["quantidade"] is not None else 0
    db.commit()
    db.refresh(p)
    return {
        "id": p.id,
        "marca": p.marca,
        "sabor": p.sabor,
        "lote": p.lote,
        "validade": p.validade.strftime("%Y-%m-%d") if p.validade else None,
        "valor": p.valor,
        "quantidade": p.quantidade
    }

@app.delete("/produtos/{produto_id}", status_code=204)
def delete_produto(produto_id: int, db: Session = Depends(get_db)):
    p = db.query(Produto).filter(Produto.id == produto_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    db.delete(p)
    db.commit()
    return None

# -----------------------------
# VENDAS routes (multi-item support) - agora desconta do estoque
# -----------------------------
@app.post("/vendas", response_model=VendaRead)
def create_venda(venda: VendaCreate, db: Session = Depends(get_db)):
    # validate items and compute totals
    if not venda.items or len(venda.items) == 0:
        raise HTTPException(status_code=400, detail="Pedido deve conter ao menos 1 item")

    valor_total = 0.0
    nova_venda = Venda(
        cliente=venda.cliente,
        endereco=venda.endereco,
        status="Em preparo",
        valor_total=0.0
    )
    db.add(nova_venda)
    db.commit()
    db.refresh(nova_venda)

    items_to_add = []
    try:
        for it in venda.items:
            produto = db.query(Produto).filter(Produto.id == it.produto_id).with_for_update().first()
            if not produto:
                # rollback parcial: apagar venda criada
                db.delete(nova_venda)
                db.commit()
                raise HTTPException(status_code=404, detail=f"Produto id {it.produto_id} não encontrado")

            quantidade = max(1, int(it.quantidade))

            # verificar estoque
            if produto.quantidade is None:
                produto.quantidade = 0
            if produto.quantidade < quantidade:
                db.delete(nova_venda)
                db.commit()
                raise HTTPException(status_code=400, detail=f"Estoque insuficiente para {produto.marca} - {produto.sabor}. Disponível: {produto.quantidade}")

            subtotal = produto.valor * quantidade
            valor_total += subtotal

            # descontar estoque
            produto.quantidade -= quantidade
            db.add(produto)

            vi = VendaItem(
                venda_id=nova_venda.id,
                produto_id=produto.id,
                nome=f"{produto.marca} - {produto.sabor}",
                quantidade=quantidade,
                valor_unit=produto.valor,
                subtotal=subtotal
            )
            items_to_add.append(vi)

        # adicionar todos os items
        db.add_all(items_to_add)
        # atualizar venda com valor_total
        nova_venda.valor_total = valor_total
        db.commit()
        db.refresh(nova_venda)

        # for response: carregar items
        db.refresh(nova_venda)
        return {
            "id": nova_venda.id,
            "cliente": nova_venda.cliente,
            "endereco": nova_venda.endereco,
            "status": nova_venda.status,
            "valor_total": nova_venda.valor_total,
            "created_at": nova_venda.created_at,
            "items": [
                {
                    "produto_id": it.produto_id,
                    "nome": it.nome,
                    "quantidade": it.quantidade,
                    "valor_unit": it.valor_unit,
                    "subtotal": it.subtotal
                } for it in nova_venda.items
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        # tentar rollback se ocorrer erro inesperado
        db.rollback()
        db.delete(nova_venda)
        db.commit()
        raise HTTPException(status_code=500, detail=f"Erro ao criar venda: {e}")

@app.get("/vendas", response_model=List[VendaRead])
def list_vendas(db: Session = Depends(get_db)):
    vendas = db.query(Venda).order_by(Venda.created_at.desc()).all()
    result = []
    for v in vendas:
        items = [
            {
                "produto_id": it.produto_id,
                "nome": it.nome,
                "quantidade": it.quantidade,
                "valor_unit": it.valor_unit,
                "subtotal": it.subtotal
            } for it in v.items
        ]
        result.append({
            "id": v.id,
            "cliente": v.cliente,
            "endereco": v.endereco,
            "status": v.status,
            "valor_total": v.valor_total,
            "created_at": v.created_at,
            "items": items
        })
    return result

@app.get("/vendas/{venda_id}", response_model=VendaRead)
def get_venda(venda_id: int, db: Session = Depends(get_db)):
    v = db.query(Venda).filter(Venda.id == venda_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Venda não encontrada")
    items = [
        {
            "produto_id": it.produto_id,
            "nome": it.nome,
            "quantidade": it.quantidade,
            "valor_unit": it.valor_unit,
            "subtotal": it.subtotal
        } for it in v.items
    ]
    return {
        "id": v.id,
        "cliente": v.cliente,
        "endereco": v.endereco,
        "status": v.status,
        "valor_total": v.valor_total,
        "created_at": v.created_at,
        "items": items
    }

@app.put("/vendas/{venda_id}", response_model=VendaRead)
def update_venda(venda_id: int, payload: dict, db: Session = Depends(get_db)):
    v = db.query(Venda).filter(Venda.id == venda_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Venda não encontrada")

    if "status" in payload:
        v.status = payload["status"]

    # allow updating quantities of items or replacing items list if provided
    if "items" in payload:
        # Restaurar estoque com base nos items antigos
        for old in v.items:
            prod = db.query(Produto).filter(Produto.id == old.produto_id).first()
            if prod:
                prod.quantidade = (prod.quantidade or 0) + old.quantidade
                db.add(prod)

        # remove old items
        db.query(VendaItem).filter(VendaItem.venda_id == v.id).delete()
        db.commit()

        valor_total = 0.0
        new_items = []
        for it in payload["items"]:
            produto = db.query(Produto).filter(Produto.id == it["produto_id"]).first()
            if not produto:
                raise HTTPException(status_code=404, detail=f"Produto id {it['produto_id']} não encontrado")
            quantidade = max(1, int(it.get("quantidade", 1)))

            if produto.quantidade < quantidade:
                raise HTTPException(status_code=400, detail=f"Estoque insuficiente para {produto.marca} - {produto.sabor}")

            subtotal = produto.valor * quantidade
            valor_total += subtotal

            produto.quantidade -= quantidade
            db.add(produto)

            vi = VendaItem(
                venda_id=v.id,
                produto_id=produto.id,
                nome=f"{produto.marca} - {produto.sabor}",
                quantidade=quantidade,
                valor_unit=produto.valor,
                subtotal=subtotal
            )
            new_items.append(vi)
        db.add_all(new_items)
        v.valor_total = valor_total

    db.commit()
    db.refresh(v)
    items = [
        {
            "produto_id": it.produto_id,
            "nome": it.nome,
            "quantidade": it.quantidade,
            "valor_unit": it.valor_unit,
            "subtotal": it.subtotal
        } for it in v.items
    ]
    return {
        "id": v.id,
        "cliente": v.cliente,
        "endereco": v.endereco,
        "status": v.status,
        "valor_total": v.valor_total,
        "created_at": v.created_at,
        "items": items
    }

@app.delete("/vendas/{venda_id}", status_code=204)
def delete_venda(venda_id: int, db: Session = Depends(get_db)):
    v = db.query(Venda).filter(Venda.id == venda_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Venda não encontrada")

    # Restaurar estoque ao deletar venda
    for old in v.items:
        prod = db.query(Produto).filter(Produto.id == old.produto_id).first()
        if prod:
            prod.quantidade = (prod.quantidade or 0) + old.quantidade
            db.add(prod)

    db.delete(v)
    db.commit()
    return None
```

---

## Stocks.jsx (componente de estoque atualizado)

```jsx
// Stocks.jsx
import { useEffect, useState } from "react";
import Header from "./header";
import "../estoque.css"
import { NavLink, useNavigate } from "react-router-dom";

export default function Stocks({ screen, switchTo }) {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProdutos = async () => {
    try {
      const response = await fetch("http://localhost:8000/produtos");
      const data = await response.json();
      setProdutos(data);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  // Agrupar itens por lote + marca + sabor (agora usando quantidade)
  const produtosPorLote = produtos.reduce((grp, p) => {
    const key = `${p.lote}::${p.marca}::${p.sabor}`;
    if (!grp[key]) grp[key] = { ...p, quantidadeTotal: 0 };
    grp[key].quantidadeTotal += (p.quantidade || 0);
    return grp;
  }, {});

  const formatDate = (isoString) => {
    if (!isoString) return "—";
    const d = new Date(isoString);
    return d.toLocaleDateString("pt-BR");
  };

  return (
    <>
    <Header/>
    <section id="stock" className={`screen ${screen === "stock" ? "show" : ""}`}>
      <div className="drip"></div>
```
