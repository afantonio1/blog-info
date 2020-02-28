//Carregando módulos
const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const app = express();
const admin = require('./routes/admin');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
var dateFormat = require('dateformat');
require('./models/Postagem');
require('./models/Categoria');
require('./models/Comentario');
const Postagem = mongoose.model('postagens');
const Categoria = mongoose.model('categorias');
const Comentario = mongoose.model('comentarios');
const usuarios = require('./routes/usuario');
const passport = require('passport');
require('./config/auth')(passport);
const sobre = require('./routes/sobre');
const comentarios = require('./routes/comentario');
const db = require('./config/db');

const log = console.log;

// --------- Configurações -------------//

//Sessões
app.use(session({
    secret: 'cursodenodejs',
    resave: true,
    saveUninitialized: true
}))

app.use(passport.initialize());
app.use(passport.session());
app.use(flash())

//Midlewares
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next()
})

//bodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Handlebars
app.engine('handlebars', handlebars({
    defaultLayout: 'main',
    helpers: {
        formatDate: (date) => {
            return dateFormat(date, 'dd/mm/yyyy');
        }
    }
}));

app.set('view engine', 'handlebars');

//Mongoose
mongoose.Promise = global.Promise;
mongoose.connect(db.mongoURI, {
    useUnifiedTopology: false,
    useNewUrlParser: true
}).then(() => {
    log('Conectado ao mongo');
}).catch((err) => {
    log('Erro ao estabelecer conexao com o mongo ' + err)
})

//Public
app.use(express.static(path.join(__dirname, 'public')));

// ------------ Rotas ----------------//

//Rota para pagina principal
app.get('/', (req, res) => {
    Postagem.find().populate('categoria').sort({ _id: 'desc' }).limit(5).then((postagens) => {
        res.render('index', {
            postagens: postagens,
            titulo: 'Home'
         });
    }).catch((err) => {
        req.flash('error_msg', 'Ocorreu um erro ao listar as postagens');
        res.redirect('/404');
    })
})
//Rota para erro
app.get('/404', (req, res) => {
    res.send('erro 404');
})

//rota para ler a postagem completa
app.get('/postagem/:slug', (req, res) => {
    Postagem.findOne({ slug: req.params.slug }).then((postagem) => {
        if (postagem) {
            postagem.visualizacoes = postagem.visualizacoes + 1;
            postagem.save().then(() => {
                Comentario.find({ slug: postagem._id }).then((comentarios) => {
                    res.render('postagem/index', {
                        postagem: postagem,
                        comentarios: comentarios,
                        titulo: postagem.titulo
                    });
                })
            }).catch((err) => {
                req.flash('error_msg', 'Ocorreu um erro ao atualizar a visualizacao dessa postagem');
                res.redirect('/');
            })
        } else {
            req.flash('error_msg', 'Postagem não encontrada.');
            res.redirect('/');
        }
    }).catch((err) => {
        res.flash('error_msg', 'Ocorreu um erro interno.');
        res.redirect('/');
    })
})

//Rota para listar categorias na página inicial do blog
app.get('/categorias', (req, res) => {
    Categoria.find().then((categorias) => {
        res.render('categorias/index', {
            categorias: categorias,
            titulo: 'Categorias'
        });
    }).catch((err) => {
        req.flash('error_msg', 'Ocorreu um erro ao listar as categorias');
        res.redirect('/');
    })
})

app.get('/categorias/:slug', (req, res) => {
    Categoria.findOne({ slug: req.params.slug }).then((categoria) => {
        if (categoria) {
            Postagem.find({ categoria: categoria._id }).then((postagens) => {
                res.render('categorias/postagens', {
                    postagens: postagens,
                    categoria: categoria,
                    titulo: categoria.nome
                 });
            }).catch((err) => {
                req.flash('error_msg', 'Ocorreu um erro ao listar as postagens');
                res.redirect('/');
            })
        } else {
            req.flash('error_msg', 'Essa categoria não existe');
            res.redirect('/');
        }
    }).catch((err) => {
        req.flash('error_msg', 'Ocorreu um erro interno ao carregar a página dessa categoria');
        res.redirect('/');
    })
})

//Rota para parte administrativa do site
app.use('/admin', admin);

//Rota para controle de acesso e usuarios
app.use('/usuarios', usuarios);

//Rota para página sobre
app.use('/sobre', sobre);

//Rota para os comentarios
app.use('/comentarios', comentarios);

//Outros
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    log('Servidor rodando na porta: http://localhost:' + PORT);
})
