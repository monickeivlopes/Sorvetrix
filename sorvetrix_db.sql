-- Criar banco
CREATE DATABASE db_sorvetrix;

USE db_sorvetrix;

-- Tabela de Usuários
CREATE TABLE usuario (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL
);

-- Tabela de Produtos
CREATE TABLE produto (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    marca VARCHAR(50) NOT NULL,
    sabor VARCHAR(50) NOT NULL,
    lote INT NOT NULL,
    validade DATE NOT NULL
);

-- Tabela de Estoque
CREATE TABLE estoque (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    produto_id INT NOT NULL,
    quantidade INT NOT NULL DEFAULT 0,
    FOREIGN KEY (produto_id) REFERENCES produto(id) ON DELETE CASCADE
);

-- Tabela de Vendas
CREATE TABLE venda (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    data DATE NOT NULL,
    quantidade INT NOT NULL,
    produto_id INT NOT NULL,
    FOREIGN KEY (produto_id) REFERENCES produto(id) ON DELETE CASCADE
);
