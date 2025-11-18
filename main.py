from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel,  Field
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from jose import jwt, JWTError
from passlib.context import CryptContext
from typing import Optional
import  datetime



app = FastAPI()
origins = ["http://localhost:5173"]  
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = "sqlite:///./users.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "segredo_super_seguro"
ALGORITHM = "HS256"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String)
    email = Column(String, unique=True)
    senha = Column(String)
    cargo = Column(String)

Base.metadata.create_all(bind=engine)



class UserCreate(BaseModel):
    nome: str
    email: str
    senha: str
    cargo: str

class UserLogin(BaseModel):
    email: str
    senha: str

class Produto(Base):
    __tablename__ = "produtos"
    id = Column(Integer, primary_key=True, index=True)
    marca = Column(String)
    sabor = Column(String)
    lote = Column(Integer)
    validade = Column(DateTime)


Base.metadata.create_all(bind=engine)

class ProdutoSchema(BaseModel):
    marca: str
    sabor: str
    lote: int
    validade: datetime.date


class Config:
    orm_mode = True

class Venda(Base):
    __tablename__ = "vendas"
    id = Column(Integer, primary_key=True, index=True)
    item = Column(String(200), nullable=False)
    cliente = Column(String(200), nullable=False)
    endereco = Column(String(300), nullable=True)
    status = Column(String(50), nullable=False, default="Em preparo")
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)


class VendaCreate(BaseModel):
    item: str
    cliente: str
    endereco: Optional[str] = None
    status: Optional[str] = Field(default="Em preparo")

class VendaRead(BaseModel):
    id: int
    item: str
    cliente: str
    endereco: Optional[str] = None
    status: str
    created_at: datetime.datetime

    class Config:
        orm_mode = True


Base.metadata.create_all(bind=engine)

 

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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



@app.post("/vendas", response_model=VendaRead)
def create_venda(venda: VendaCreate, db: Session = Depends(get_db)):
    v = Venda(
        item=venda.item,
        cliente=venda.cliente,
        endereco=venda.endereco,
        status=venda.status or "Em preparo",
    )
    db.add(v)
    db.commit()
    db.refresh(v)
    return v

@app.get("/vendas", response_model=list[VendaRead])
def list_vendas(db: Session = Depends(get_db)):
    vendas = db.query(Venda).order_by(Venda.created_at.desc()).all()
    return vendas

@app.get("/vendas/{venda_id}", response_model=VendaRead)
def get_venda(venda_id: int, db: Session = Depends(get_db)):
    v = db.query(Venda).filter(Venda.id == venda_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Venda não encontrada")
    return v

@app.put("/vendas/{venda_id}", response_model=VendaRead)
def update_venda(venda_id: int, payload: dict, db: Session = Depends(get_db)):
    v = db.query(Venda).filter(Venda.id == venda_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Venda não encontrada")
   
    if "status" in payload:
        v.status = payload["status"]
    if "item" in payload:
        v.item = payload["item"]
    if "cliente" in payload:
        v.cliente = payload["cliente"]
    if "endereco" in payload:
        v.endereco = payload["endereco"]
    db.commit()
    db.refresh(v)
    return v

@app.delete("/vendas/{venda_id}", status_code=204)
def delete_venda(venda_id: int, db: Session = Depends(get_db)):
    v = db.query(Venda).filter(Venda.id == venda_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Venda não encontrada")
    db.delete(v)
    db.commit()
    return None


@app.post("/produtos")
def create_produto(produto: ProdutoSchema, db: Session = Depends(get_db)):
    novo = Produto(**produto.dict())
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo


@app.get("/produtos")
def listar_produtos(db: Session = Depends(get_db)):
    return db.query(Produto).all()
