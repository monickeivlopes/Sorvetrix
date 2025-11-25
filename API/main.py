
# main.py
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import (
    create_engine, Column, Integer, String, DateTime, Float, ForeignKey, func
)
from sqlalchemy.orm import sessionmaker, declarative_base, Session, relationship
from jose import jwt
from passlib.context import CryptContext
from typing import Optional, List
import datetime

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
    quantidade = Column(Integer, default=1)  # 🟢 campo adicionado

class ProdutoSchema(BaseModel):
    marca: str
    sabor: str
    lote: int
    validade: str
    valor: float
    quantidade: int = 1

    class Config:
        from_attributes = True


# -----------------------------
# VENDAS + ITENS
# -----------------------------
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
    nome = Column(String, nullable=False)
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
    class Config: orm_mode = True

class VendaCreate(BaseModel):
    cliente: str
    endereco: Optional[str] = None
    items: List[VendaItemCreate]

class VendaRead(BaseModel):
    id: int
    cliente: str
    endereco: Optional[str]
    status: str
    valor_total: float
    created_at: datetime.datetime
    items: List[VendaItemRead]
    class Config: orm_mode = True


# -----------------------------
# CREATE TABLES
# -----------------------------
Base.metadata.create_all(bind=engine)

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
# PRODUTOS routes (kept + returns valor)
# -----------------------------
@app.post("/produtos")
def create_produto(produto: ProdutoSchema, db: Session = Depends(get_db)):
    validade_dt = datetime.datetime.strptime(produto.validade, "%Y-%m-%d")
    novo = Produto(
        marca=produto.marca,
        sabor=produto.sabor,
        lote=produto.lote,
        validade=validade_dt,
        valor=produto.valor
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
        "valor": novo.valor
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
            "quantidade": p.quantidade   # 🔥🔥🔥 AQUI FALTAVA!!
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

    # 🟢 ADICIONADO: atualizar quantidade
    if "quantidade" in dados:
        p.quantidade = dados["quantidade"]

    db.commit()
    db.refresh(p)

    return {
        "id": p.id,
        "marca": p.marca,
        "sabor": p.sabor,
        "lote": p.lote,
        "validade": p.validade.strftime("%Y-%m-%d") if p.validade else None,
        "valor": p.valor,
        "quantidade": p.quantidade  # 🟢 devolve quantidade também
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
# VENDAS routes (multi-item support)
# -----------------------------
@app.post("/vendas", response_model=VendaRead)
def create_venda(venda: VendaCreate, db: Session = Depends(get_db)):
    if not venda.items:
        raise HTTPException(status_code=400, detail="Pedido precisa ter itens")

    nova = Venda(
        cliente=venda.cliente,
        endereco=venda.endereco,
        status="Em preparo",
        valor_total=0
    )
    db.add(nova)
    db.commit()
    db.refresh(nova)

    total = 0
    itens_to_add = []

    for it in venda.items:
        prod = db.query(Produto).filter(Produto.id == it.produto_id).first()
        if not prod:
            db.delete(nova)
            db.commit()
            raise HTTPException(status_code=404, detail="Produto não encontrado")

        qty = max(1, it.quantidade)
        subtotal = prod.valor * qty
        total += subtotal

        itens_to_add.append(
            VendaItem(
                venda_id=nova.id,
                produto_id=prod.id,
                nome=f"{prod.marca} - {prod.sabor}",
                quantidade=qty,
                valor_unit=prod.valor,
                subtotal=subtotal
            )
        )

        # 🔥🔥🔥 ATUALIZAÇÃO DO ESTOQUE (Faltava isso!)
        if prod.quantidade is None:
            prod.quantidade = 0

        prod.quantidade -= qty

        if prod.quantidade < 0:
            prod.quantidade = 0


    
        

    db.add_all(itens_to_add)
    nova.valor_total = total
    db.commit()
    db.refresh(nova)


    return nova


@app.get("/vendas", response_model=List[VendaRead])
def list_vendas(db: Session = Depends(get_db)):
    vendas = db.query(Venda).order_by(Venda.created_at.desc()).all()
    return vendas


@app.get("/vendas/{venda_id}", response_model=VendaRead)
def get_venda(venda_id: int, db: Session = Depends(get_db)):
    venda = db.query(Venda).filter_by(id=venda_id).first()
    if not venda:
        raise HTTPException(status_code=404, detail="Venda não encontrada")
    return venda
@app.put("/vendas/{venda_id}", response_model=VendaRead)
def update_venda(venda_id: int, payload: dict, db: Session = Depends(get_db)):
    v = db.query(Venda).filter(Venda.id == venda_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Venda não encontrada")

    if "status" in payload:
        v.status = payload["status"]

    if "items" in payload:
        db.query(VendaItem).filter(VendaItem.venda_id == v.id).delete()
        db.commit()

        total = 0
        new_items = []

        for it in payload["items"]:
            prod = db.query(Produto).filter(Produto.id == it["produto_id"]).first()
            if not prod:
                raise HTTPException(status_code=404, detail="Produto não encontrado")

            qty = max(1, it.get("quantidade", 1))
            subtotal = prod.valor * qty
            total += subtotal

            new_items.append(
                VendaItem(
                    venda_id=v.id,
                    produto_id=prod.id,
                    nome=f"{prod.marca} - {prod.sabor}",
                    quantidade=qty,
                    valor_unit=prod.valor,
                    subtotal=subtotal
                )
            )

        db.add_all(new_items)
        v.valor_total = total

    db.commit()
    db.refresh(v)
    return v


@app.delete("/vendas/{venda_id}", status_code=204)
def delete_venda(venda_id: int, db: Session = Depends(get_db)):
    v = db.query(Venda).filter_by(id=venda_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Venda não encontrada")
    db.delete(v)
    db.commit()
