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

// async function getConnection() {
//     const connection = await mysql.createConnection({
//         host: 'localhost',
//         user: 'new_user',
//         password: 'password',
//         database: 'santos_financeiro'
//     });
//     return connection;
// }

// async function query(sql = '', values = []) {
//     const conn = await getConnection();
//     const result = await conn.query(sql, values);
//     conn.end();

//     return result[0];
// }

app.get("/", async function (request, response) {
    response.render('estoque-tenis', {
        data: 'data',
    })
});

app.get("/cadastrar-tenis", async function (request, response) {
    response.render('cadastrar-tenis', {
        data: 'data',
    })
});
app.get("/editar-tenis", async function (request, response) {
    response.render('editar-tenis', {
        data: 'data',
    })
});

app.get("/editar-estoque", async function (request, response) {
    response.render('editar-estoque', {
        data: 'data',
    })
});

app.get("/cadastrar-fornecedor", async function (request, response) {
    response.render('cadastrar-fornecedor', {
        data: 'data',
    })
});

app.get("/editar-fornecedor", async function (request, response) {
    response.render('editar-fornecedor', {
        data: 'data',
    })
});

app.listen(PORT, function () {
    console.log(`Server is running at port ${PORT}`);
});
