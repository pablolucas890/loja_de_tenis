const express = require('express');
const expressHandlebars = require('express-handlebars');
const path = require('path');
var url = require('url');
const mysql = require('mysql2/promise');

const PORT = process.env.PORT || 3001;
const app = express();

app.engine('handlebars', expressHandlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

async function getConnection() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'jadyla',
        password: 'jadyla',
        database: 'lojatenis'
    });
    return connection;
}

async function query(sql = '', values = []) {
    const conn = await getConnection();
    const result = await conn.query(sql, values);
    conn.end();

    return result[0];
}

app.get("/", async function (request, response) {
    let estoques_de_tenis = await query('SELECT * FROM estoque inner join tenis on (tenis.id_estoque = estoque.id)');
    estoques_de_tenis = estoques_de_tenis.map((tenis) => {
        tenis.marca = tenis.marca.toUpperCase()
        return tenis
    })
    console.log(estoques_de_tenis)
    response.render('estoque-tenis', {
        data: 'data',
        estoques_de_tenis,
    })
});

app.get("/cadastrar-tenis", async function (request, response) {
    const ids_estoque = await query('SELECT * FROM estoque');
    response.render('cadastrar-tenis', {
        data: 'data',
        listaIds: ids_estoque
    })
});

app.post('/cadastrar-tenis', async (request, response) => {
    let sexo = request.body.sexo;
    let marca = request.body.marca;
    let qtde_unitaria = request.body.qtde_unitaria
    let id_estoque = request.body.id_estoque;
    dadosPagina = {
        mensagem: '',
        sexo,
        marca,
        qtde_unitaria,
        id_estoque
    }

    try {
        if (!sexo)
            throw new Error('Sexo é obrigatório!');

        if (!marca)
            throw new Error('Marca é obrigatório!');

        if (!qtde_unitaria)
            throw new Error('Quantidade é obrigatório!');

        if (!id_estoque)
            throw new Error('Estoque é obrigatório!');

        if (sexo == 'Feminino') {
            sexo = 'F';
        } else {
            sexo = 'M';
        }

        let sql = "INSERT INTO tenis(sexo, marca, qtde_unitaria, id_estoque) VALUES (?, ?, ?, ?)";
        let valores = [sexo, marca, qtde_unitaria, id_estoque];
        console.log(valores)
        // insere os dados na base de dados
        await query(sql, valores);

        sql = "UPDATE estoque SET qte_total = qte_total + ? WHERE id = ?";
        valores = [qtde_unitaria, id_estoque];
        console.log(valores)
        // insere os dados na base de dados
        await query(sql, valores);

        dadosPagina.mensagem = 'Tênis Cadastrado com sucesso!';
        dadosPagina.cor = "green";
    }
    catch (error) {
        dadosPagina.mensagem = error.message;
        dadosPagina.cor = "red";
    }
    response.render('cadastrar-tenis', dadosPagina);
});

app.get("/editar-tenis", async function (request, response) {
    response.render('editar-tenis', {
        data: 'data',
    })
});

app.get("/editar-estoque", async function (request, response) {
    const estoques = await query('SELECT * FROM estoque');
    response.render('editar-estoque', {
        data: 'data',
        listaEstoques: estoques,
    })
});

app.get("/cadastrar-fornecedor", async function (request, response) {
    response.render('cadastrar-fornecedor', {
        data: 'data',
    })
});

app.post('/cadastrar-fornecedor', async (request, response) => {
    let nome = request.body.nome;
    let cnpj = request.body.cnpj;
    let endereco = request.body.endereco
    let telefone = request.body.telefone;
    dadosPagina = {
        mensagem: '',
        nome,
        cnpj,
        endereco,
        telefone
    }

    try {
        if (!nome)
            throw new Error('Nome é obrigatório!');

        if (!cnpj)
            throw new Error('CNPJ é obrigatório!');

        if (!endereco)
            throw new Error('Endereço é obrigatório!');

        if (!telefone)
            throw new Error('Telefone é obrigatório!');

        let sql = "INSERT INTO fornecedor(nome, cnpj, endereco, telefone) VALUES (?, ?, ?, ?)";
        let valores = [nome, cnpj, endereco, telefone];
        console.log(valores)
        // insere os dados na base de dados
        await query(sql, valores);
        dadosPagina.mensagem = 'Fornecedor Cadastrado com sucesso!';
        dadosPagina.cor = "green";
    }
    catch (error) {
        dadosPagina.mensagem = error.message;
        dadosPagina.cor = "red";
    }
    response.render('cadastrar-fornecedor', dadosPagina);
});

app.get("/cadastrar-estoque", async function (request, response) {
    response.render('cadastrar-estoque', {
        data: 'data',
    })
});

app.post('/cadastrar-estoque', async (request, response) => {
    let numeracao = request.body.numeracao;
    let qtde = 0;
    dadosPagina = {
        mensagem: '',
        numeracao
    }

    try {
        if (!numeracao)
            throw new Error('Numeração é obrigatório!');

        let sql = "INSERT INTO estoque(numeracao, qte_total) VALUES (?, ?)";
        let valores = [numeracao, qtde];
        console.log(valores)
        // insere os dados na base de dados
        await query(sql, valores);
        dadosPagina.mensagem = 'Estoque Cadastrado com sucesso!';
        dadosPagina.cor = "green";
    }
    catch (error) {
        dadosPagina.mensagem = error.message;
        dadosPagina.cor = "red";
    }
    response.render('cadastrar-estoque', dadosPagina);
});

app.get("/editar-fornecedor/:id", async function (request, response) {
    const id = parseInt(request.params.id);
    const fornecedores = await query("SELECT * FROM fornecedor WHERE id = ?", [id]);
    console.log(fornecedores)
    if(fornecedores.length === 0){
        response.redirect("fornecedores");
        return;
    }
    const objTransacao = fornecedores[0];
    console.log("/////" + objTransacao)
    response.render('editar-fornecedor', {
        objTransacao
    });
});

app.post('/editar-fornecedor', async (request, response) => {
    let {nome, cnpj, endereco, telefone, id} = request.body;
    const dadosPagina = {
        mensagem: '',
        objTransacao: {nome: nome, cnpj: cnpj, endereco: endereco, telefone:telefone, id: id},        
    }

    try{
        //console.log(request.body);
        if(!nome) 
            throw new Error('Nome obrigatório!');
        
        let sql = "UPDATE fornecedor SET nome = ?, cnpj = ?, endereco = ?, telefone = ? WHERE id = ?";
        let valores = [nome, cnpj, endereco, telefone, id];
        // atualiza os dados na base de dados
        await query(sql, valores);       
        dadosPagina.mensagem = 'Fornecedor atualizada com sucesso!';
        dadosPagina.cor = "green";        
    }
    catch(e){
        dadosPagina.mensagem = e.message;
        dadosPagina.cor = "red";
    }
    response.render('editar-fornecedor', dadosPagina);
   
});

app.get("/fornecedores", async function (request, response) {
    const fornecedores = await query('SELECT * FROM fornecedor');
    console.log(fornecedores)
    response.render('fornecedores', {
        fornecedores,
    })
});

app.get("/listar-tenis", async function (request, response) {
    const tenis = await query('SELECT * FROM tenis');
    console.log(tenis)
    response.render('listar-tenis', {
        tenis,
    })
});

app.get("/excluir-fornecedor/:id", async function(request, response){
    const id = parseInt(request.params.id);
    //console.log(id)
    if(!isNaN(id) && id >= 0){
        // ` - Template String
        await query('DELETE FROM fornece WHERE id_fornecedor = ?', [id])
        await query('DELETE FROM fornecedor WHERE id = ?', [id]);
    }
    response.redirect('/');
});

app.get("/excluir-tenis/:id", async function(request, response){
    const id = parseInt(request.params.id);
    //console.log(id)
    if(!isNaN(id) && id >= 0){
        // ` - Template String
        await query('DELETE FROM tenis WHERE id = ?', [id]);
    }
    response.redirect('/');
});

app.listen(PORT, function () {
    console.log(`Server is running at port ${PORT}`);
});
