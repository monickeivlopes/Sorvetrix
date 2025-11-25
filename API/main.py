from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from jose import jwt
from passlib.context import CryptContext
from typing import Optional, List
import datetime
from sqlalchemy.orm import Session


from models import (
    User, Produto, Venda, VendaItem,
    Base, get_db, SessionLocal, UserCreate,UserLogin, ProdutoSchema,
    VendaCreate,VendaRead
)

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


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "segredo_super_seguro"
ALGORITHM = "HS256"


def create_token(email: str):
    payload = {
        "sub": email,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=3)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)



@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email já cadastrado!")

    senha_limpa = user.senha[:72] 
    hashed_pw = pwd_context.hash(senha_limpa)

    new_user = User(nome=user.nome, email=user.email, senha=hashed_pw, cargo=user.cargo)
    db.add(new_user)
    db.commit()
    return {"message": "Usuário criado com sucesso!"}


@app.post("/login")
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Credenciais inválidas!")

    senha_limpa = credentials.senha[:72]

    if not pwd_context.verify(senha_limpa, user.senha):
        raise HTTPException(status_code=401, detail="Credenciais inválidas!")

    token = create_token(user.email)
    return {"access_token": token, "user": user.nome, "cargo": user.cargo}



@app.post("/produtos")
def create_produto(produto: ProdutoSchema, db: Session = Depends(get_db)):
    validade_dt = datetime.datetime.strptime(produto.validade, "%Y-%m-%d")
    novo = Produto(
        marca=produto.marca,
        sabor=produto.sabor,
        lote=produto.lote,
        validade=validade_dt,
        valor=produto.valor,
        quantidade=produto.quantidade
    )
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo


@app.get("/produtos")
def listar_produtos(db: Session = Depends(get_db)):
    produtos = db.query(Produto).all()
    return produtos


@app.put("/produtos/{produto_id}")
def update_produto(produto_id: int, dados: dict, db: Session = Depends(get_db)):
    p = db.query(Produto).filter(Produto.id == produto_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    for campo in ["marca", "sabor", "lote", "valor", "quantidade"]:
        if campo in dados:
            setattr(p, campo, dados[campo])

    if "validade" in dados:
        p.validade = datetime.datetime.strptime(dados["validade"], "%Y-%m-%d")

    db.commit()
    db.refresh(p)
    return p


@app.delete("/produtos/{produto_id}", status_code=204)
def delete_produto(produto_id: int, db: Session = Depends(get_db)):
    p = db.query(Produto).filter(Produto.id == produto_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    db.delete(p)
    db.commit()
    return None



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
