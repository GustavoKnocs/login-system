const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Credenciais
const users = {
    "admin": {password: "123", name: "Administrador"},
    "gustavo": {password: "123456", name: "Gustavo Oliveira"},
    "joao": {password: "654321", name: "Joao Brasil"}
};

// Função para a tela restrita
function buildUserScreen(userName){
     return `
    <h1>Bem-vindo, ${userName}!</h1>
    <p>Aqui estão suas informações restritas [...]</p>
    <a href="/logout">Logout</a>
  `;
};

// Rota inicial '/'
app.get('/', (req, res) => {
    const user = req.cookies.currentUser;
    if (user && users[user]){
        return res.redirect("/retricted"); 
    }
    res.sendFile(path.join(__dirname, "public", "login.html"))
});

// Rota de login
app.post('/login', (req, res) => {
    const {login, password, keep} = req.body;
    const user = users[login];

    if (user && user.password === password){
        if (keep === "1"){
            res.cookie("currentUser", login, {maxAge: 3 * 24 * 60 * 60 * 1000});
        }
        else{
            res.cookie("currentUser", login);
        }
        return res.redirect("/retricted");
    }
    else{
        return res.status(401).send(`
            <h3>Credenciais inválidas!</h3>
            <a href="/">Voltar para login</a>
            `);
    }
});

// Rota restrita
app.get('/retricted', (req, res) => {
    const user = req.cookies.currentUser;
    if(!user || !users[user]){
        return res.redirect("/");
    }
    res.send(buildUserScreen(users[user].name));
});

// Rota de logout
app.get('/logout', (req,res) => {
    res.clearCookie("currentUser");
    res.redirect("/");
});

// Inicialização do servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

