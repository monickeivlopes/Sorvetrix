# models.py
from pydantic import BaseModel
from datetime import date
from typing import List

class UsuarioModel(BaseModel):
    username: str
    password: str

class ProdutoModel(BaseModel):
    marca: str
    sabor: str
    lote: int
    validade: date


class EstoqueModel(BaseModel):
    acervo: List[ProdutoModel]

class VendasModel(BaseModel):
    produtos: List[ProdutoModel]
    quantidade: int
    data: date
