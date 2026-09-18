const express = require("express");
const session = require("express-session");
const path = require("path");
const methodOverride = require("method-override");

const authRoutes = require("./routes/authRoutes");
const mecanicoRoutes = require("./routes/mecanicoRoutes");
const gerenteRoutes = require("./routes/gerenteRoutes");

const SequelizeStore = require("connect-session-sequelize")(session.Store);
const { sequelize } = require("./models");

const app = express();

app.set('trust proxy', 1);

// Traduzir os dados do corpo da requisição para variáveis
app.use(express.urlencoded({ extended: true }));

// Indica que o formato dos dados seja JSON
app.use(express.json());

// Chama o method override a partir da query "_method"
app.use(methodOverride("_method"));

// Configurar o middleware de sessão
const sessionStore = new SequelizeStore({
    db: sequelize,
});

app.use(
    session({
        secret: process.env.SESSION_SECRET || "opala123",
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === "production",
            maxAge: 1000 * 60 * 60,
        },
    })
);

// Sincroniza a tabela de sessões no banco de dados
sessionStore.sync();

// Servindo arquivos estáticos da pasta public
app.use(
    "/public",
    express.static(path.join(__dirname, "views/public"))
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Rotas
app.get("/", (req, res) => {
    res.render("index");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.use("/login", authRoutes);
app.use("/gerente", gerenteRoutes);
app.use("/mecanico", mecanicoRoutes);

// Porta da aplicação
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Ouvindo a porta ${PORT}`);
});