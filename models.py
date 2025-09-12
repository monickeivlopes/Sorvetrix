from pydantic import BaseModel
from datetime import date
from typing import List

class Usuario(BaseModel):
    username:str
    password:str


class Produto(BaseModel):
    marca:str
    sabor:str
    lote:int
    validade:date

class Estoque(BaseModel):
    acervo: List[Produto]

class Vendas(BaseModel):
    produtos : List[Produto]
    quantidade : int
    data : date