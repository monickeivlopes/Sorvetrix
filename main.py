from fastapi import FastAPI, HTTPException
from models import Usuario, Produto, Estoque, Vendas
from typing import List

app = FastAPI(title="SorveTrix")


usuarios: List[Usuario] = []
produtos: List[Produto] = []
estoque = Estoque(acervo=[])
vendas: List[Vendas] = []


@app.post("/usuarios", response_model=Usuario)
def criar_usuario(usuario: Usuario):
    usuarios.append(usuario)
    return usuario

@app.get("/usuarios", response_model=List[Usuario])
def listar_usuarios():
    return usuarios


@app.post("/produtos", response_model=Produto)
def cadastrar_produto(produto: Produto):
    produtos.append(produto)
    estoque.acervo.append(produto)
    return produto

@app.get("/produtos", response_model=List[Produto])
def listar_produtos():
    return produtos


@app.get("/estoque", response_model=Estoque)
def ver_estoque():
    return estoque


@app.post("/vendas", response_model=Vendas)
def registrar_venda(venda: Vendas):
    vendas.append(venda)
    return venda

@app.get("/vendas", response_model=List[Vendas])
def listar_vendas():
    return vendas
