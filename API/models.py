from sqlalchemy import (
    create_engine, Column, Integer, String, DateTime, Float, ForeignKey
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship, Session
import datetime
from typing import Optional, List
from pydantic import BaseModel

DATABASE_URL = "sqlite:///./users.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()


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



class Produto(Base):
    __tablename__ = "produtos"
    id = Column(Integer, primary_key=True, index=True)
    marca = Column(String)
    sabor = Column(String)
    lote = Column(Integer)
    validade = Column(DateTime)
    valor = Column(Float)
    quantidade = Column(Integer, default=1)


class ProdutoSchema(BaseModel):
    marca: str
    sabor: str
    lote: int
    validade: str
    valor: float
    quantidade: int = 1

    class Config:
        from_attributes = True



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
        from_attributes = True


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

    class Config:
        from_attributes = True


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



Base.metadata.create_all(bind=engine)
