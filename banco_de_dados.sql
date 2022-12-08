-- CREATE USER 'new_user'@'localhost' IDENTIFIED BY 'password';

-- GRANT ALL PRIVILEGES ON * . * TO 'new_user'@'localhost';

DROP DATABASE IF EXISTS loja_de_tenis;
CREATE DATABASE loja_de_tenis;
USE loja_de_tenis;
CREATE DATABASE if not exists loja_de_tenis;
USE loja_de_tenis;

/*Criação das tabelas do banco de Loja Tenis */
DROP TABLE IF EXISTS tenis_compra;
DROP TABLE IF EXISTS fornece;
DROP TABLE IF EXISTS compra;
DROP TABLE IF EXISTS cliente;
DROP TABLE IF EXISTS tenis;
DROP TABLE IF EXISTS estoque;
DROP TABLE IF EXISTS fornecedor;


CREATE TABLE IF NOT EXISTS estoque(id int not null auto_increment, numeracao int, qte_total int, primary key(id));
CREATE TABLE IF NOT EXISTS fornecedor(id int not null auto_increment, nome varchar(70), cnpj varchar(40), endereco varchar(70), telefone varchar(70), primary key(id));
CREATE TABLE IF NOT EXISTS cliente(id int not null auto_increment, nome varchar(70), cpf varchar(30), endereco varchar(70), telefone varchar(70), primary key(id));
CREATE TABLE IF NOT EXISTS compra(id int not null auto_increment, valor double, data_compra date, primary key(id));
CREATE TABLE IF NOT EXISTS tenis(id int not null auto_increment, sexo varchar(2), marca varchar(50), qtde_unitaria int,primary key(id));
CREATE TABLE IF NOT EXISTS tenis_compra(id_tenis int, id_compra int, primary key(id_tenis, id_compra), foreign key (id_tenis) references tenis(id), foreign key (id_compra) references compra(id));
CREATE TABLE IF NOT EXISTS fornece(id_tenis int, id_fornecedor int, data date, quantidade int, primary key(id_tenis, id_fornecedor), foreign key(id_tenis) references tenis(id), foreign key(id_fornecedor) references fornecedor(id));

INSERT INTO estoque(numeracao, qte_total)values(38,40),(39,38),(40,42);
INSERT INTO fornecedor(nome, cnpj, endereco, telefone)values('Netshoes','17.942.793/0001-94','São Paulo','(11)3721-5698'),
('Centauro','17.942.793/0001-95', 'Rio de Janeiro', '(21)3712-5274'),
('World Tennis','17.942.793/0001-96','Mato Grosso Do Sul', '(68)3713-6241');

INSERT INTO cliente(nome, cpf, endereco, telefone)values('Pablo', '145.658.148-58','Rua Argentina,85,Centro,Poços de Caldas','(35)96574-8954'),
('Marcelo', '362.458.047-87','Rua Goiânia,330,Centro,Poços de Caldas','(35)99856-7485'),
('Adriano', '236.458.741-54','Rua Maranhão,85,Vivaldi Leite,Poços de Caldas','(35)99102-8763');

ALTER TABLE compra add id_cliente int;
ALTER TABLE compra add foreign key(id_cliente) references cliente(id);
INSERT INTO compra(id_cliente, data_compra, valor)value(1,STR_TO_DATE('25/06/2018', '%d/%m/%Y'),50.00);
INSERT INTO compra(id_cliente, data_compra, valor)value(1,STR_TO_DATE('27/07/2018', '%d/%m/%Y'),77.90);
INSERT INTO compra(id_cliente, data_compra, valor)value(3,STR_TO_DATE('03/05/2019', '%d/%m/%Y'),180.00);

ALTER TABLE tenis add id_estoque int;
ALTER TABLE tenis add foreign key(id_estoque) references estoque(id);
INSERT INTO tenis(sexo, marca, id_estoque, qtde_unitaria)values('F', 'Adidas', 1,4),('M','Nike',1,3),('M','Asics',2,8),('F','Nike', 3, 5);

INSERT INTO fornece(id_tenis, id_fornecedor,data ,quantidade)values(1,1,STR_TO_DATE('07/02/2017', '%d/%m/%Y'),30),
(2,1,STR_TO_DATE('08/02/2017', '%d/%m/%Y'),40),
(3,2,STR_TO_DATE('09/02/2017', '%d/%m/%Y'),25),
(3,3,STR_TO_DATE('10/02/2017', '%d/%m/%Y'),60);

INSERT INTO tenis_compra(id_tenis, id_compra)values(1,1),
(2,1),
(3,1),
(1,2);
/*Fim  da criação de  tabelas do banco de Loja Tenis */

/*
------------------ CONSULTA 1 ---------------------
- Consulta utilizando no mínimo tres tabela com join
- Recupera a marca de tenis e o nome dos clientes que compraram 
os respectivos clientes;
*/
SELECT distinct tenis.marca,cliente.nome from tenis inner join (tenis_compra
inner join compra inner join cliente on  cliente.id  = compra.id_cliente ) on tenis_compra.id_tenis = tenis.id;
/*
------------------ CONSULTA 2 ---------------------
- Seleciona todos os Clientes que compraram no mes de maio
*/

SELECT cliente.nome, compra.data_compra FROM compra INNER JOIN cliente on cliente.id = compra.id_cliente WHERE MONTH(compra.data_compra) = "05";
/*
------------------ CONSULTA 3 ---------------------
- Seleciona A Quantidade os Tenis da Marca Nike
*/
SELECT sum(qte_total) as quantidade_de_tenis_da_nike FROM tenis INNER JOIN estoque on tenis.id_estoque = estoque.id WHERE tenis.marca = "Nike";
/*
------------------ CONSULTA 4 ---------------------
- 
*/
SELECT * from fornecedor WHERE endereco = 'São Paulo';
/*
------------------ VIEW ---------------------

*/
DROP VIEW TennisMasculino;
CREATE VIEW TennisMasculino AS SELECT id, sexo, marca, qtde_unitaria FROM tenis where sexo = "M";
SELECT * FROM TennisMasculino;