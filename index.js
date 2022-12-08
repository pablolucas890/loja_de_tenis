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
        user: 'new_user',
        password: 'password',
        database: 'loja_de_tenis'
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
        // insere os dados na base de dados
        await query(sql, valores);

        sql = "UPDATE estoque SET qte_total = qte_total + ? WHERE id = ?";
        valores = [qtde_unitaria, id_estoque];
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
    if (fornecedores.length === 0) {
        response.redirect("fornecedores");
        return;
    }
    const objTransacao = fornecedores[0];
    response.render('editar-fornecedor', {
        objTransacao,
        path: "../"
    });
});

app.get("/editar-tenis/:id", async function (request, response) {
    const id = parseInt(request.params.id);
    const tenis = await query("SELECT * FROM tenis WHERE id = ?", [id]);
    if (tenis.length === 0) {
        response.redirect("listar-tenis");
        return;
    }
    let marcas = [
        { nome: 'Adidas', selected: false },
        { nome: 'Asics', selected: false },
        { nome: 'Nike', selected: false }]
    marcas = marcas.map((marca) => {
        if (marca.nome === tenis[0].marca)
            marca.selected = true
        return marca
    })
    let sexos = [
        { nome: 'Feminino', value: 'F', selected: false },
        { nome: 'Masculino', value: 'M', selected: false }]
    sexos = sexos.map((sexo) => {
        if (sexo.value === tenis[0].sexo)
            sexo.selected = true
        return sexo
    })
    response.render('editar-tenis', {
        qtde_unitaria: tenis[0].qtde_unitaria,
        marcas,
        sexos,
        id: tenis[0].id,
        path: "../"
    });
});

app.post('/editar-fornecedor', async (request, response) => {
    let { nome, cnpj, endereco, telefone, id } = request.body;
    const dadosPagina = {
        mensagem: '',
        objTransacao: { nome: nome, cnpj: cnpj, endereco: endereco, telefone: telefone, id: id },
    }

    try {
        if (!nome)
            throw new Error('Nome obrigatório!');

        let sql = "UPDATE fornecedor SET nome = ?, cnpj = ?, endereco = ?, telefone = ? WHERE id = ?";
        let valores = [nome, cnpj, endereco, telefone, id];
        // atualiza os dados na base de dados
        await query(sql, valores);
        dadosPagina.mensagem = 'Fornecedor atualizada com sucesso!';
        dadosPagina.cor = "green";
    }
    catch (e) {
        dadosPagina.mensagem = e.message;
        dadosPagina.cor = "red";
    }
    response.render('editar-fornecedor', dadosPagina);

});

app.post('/editar-tenis', async (request, response) => {
    let { sexo, marca, qtde_unitaria, id } = request.body;
    const dadosPagina = {
        mensagem: '',
        objTransacao: { sexo: sexo, marca: marca, qtde_unitaria: qtde_unitaria, id: id },
    }

    try {
        if (!sexo)
            throw new Error('Sexo obrigatório!');
        if (!marca)
            throw new Error('Marca obrigatório!');
        if (!qtde_unitaria)
            throw new Error('Qunatidade obrigatório!');

        let sql = "UPDATE tenis SET sexo = ?, marca = ?, qtde_unitaria = ? WHERE id = ?";
        let valores = [sexo, marca, qtde_unitaria, id];
        // atualiza os dados na base de dados
        await query(sql, valores);
        dadosPagina.mensagem = 'Tenis atualizado com sucesso!';
        dadosPagina.cor = "green";
    }
    catch (e) {
        dadosPagina.mensagem = e.message;
        dadosPagina.cor = "red";
    }
    const tenis = await query('SELECT * FROM estoque inner join tenis on (tenis.id_estoque = estoque.id)');
    response.render('listar-tenis', {
        tenis,
    })

});
app.get("/fornecedores", async function (request, response) {
    const fornecedores = await query('SELECT * FROM fornecedor');
    response.render('fornecedores', {
        fornecedores,
    })
});

app.get("/listar-tenis", async function (request, response) {
    const tenis = await query('SELECT * FROM estoque inner join tenis on (tenis.id_estoque = estoque.id)');
    response.render('listar-tenis', {
        tenis,
    })
});

app.get("/excluir-fornecedor/:id", async function (request, response) {
    const id = parseInt(request.params.id);
    if (!isNaN(id) && id >= 0) {
        // ` - Template String
        await query('DELETE FROM fornece WHERE id_fornecedor = ?', [id])
        await query('DELETE FROM fornecedor WHERE id = ?', [id]);
    }
    response.redirect('/');
});

app.get("/excluir-tenis/:id", async function (request, response) {
    const id = parseInt(request.params.id);
    if (!isNaN(id) && id >= 0) {
        // ` - Template String
        await query('DELETE FROM tenis WHERE id = ?', [id]);
    }
    response.redirect('/');
});

app.listen(PORT, function () {
    console.log(`Server is running at port ${PORT}`);
});
