const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Categoria');
require('../models/Postagem');
require('../models/Comentario');
require('../models/Usuario');
const Categoria = mongoose.model('categorias');
const Postagem = mongoose.model('postagens');
const Comentario = mongoose.model('comentarios');
const Usuario = mongoose.model('usuarios');
const { eAdmin } = require('../helpers/eAdmin');

//Rota para página principal do administrador
router.get('/', eAdmin, (req, res) => {
    Categoria.find().sort({ _id: 'desc' }).then((categoria) => {
        Postagem.find().sort({ _id: 'desc' }).then((postagem) => {
            Comentario.find().sort({ _id: 'desc' }).limit(6).then((comentario) => {
                Usuario.find({ eAdmin: 1 }).sort({ _id: 'desc' }).then((usuarioAdmin) => {
                    res.render('admin/index', {
                        categoria: categoria,
                        postagem: postagem,
                        comentario: comentario,
                        usuarioAdmin: usuarioAdmin,
                        titulo: 'Painel Administrativo'
                    });
                }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro ao listar os usuarios admin');
                    res.redirect('/');
                })
            }).catch((err) => {
                req.flash('error_msg', 'Ocorreu um erro ao lista os comentários ' + err);
                res.redirect('/');
            });
        }).catch((err) => {
            req.flash('error_msg', 'Ocorreu um erro ao listar as postagens ' + err);
            res.redirect('/');
        })
    }).catch((err) => {
        req.flash('error_msg', 'Ocorreu um erro interno ao listar categorias ' + err);
        res.redirect('/');
    })
})

router.get('/posts', eAdmin, (req, res) => {
    res.send('Página de Posts');
})

router.get('/categorias', eAdmin, (req, res) => {
    Categoria.find().sort({ _id: 'desc' }).then((categorias) => {
        res.render('admin/categorias', { 
            categorias: categorias,
            titulo: 'Categorias'
        });
    }).catch((err) => {
        req.flash('error_msg', 'houve um erro ao listar as categorias.');
        res.redirect('/admin');
    })

})

router.get('/categorias/add', eAdmin, (req, res) => {
    res.render('admin/addcategorias', {titulo: 'Nova Categoria'});
})

router.post('/categorias/nova', eAdmin, (req, res) => {

    //Validação do formulário
    var arrayErros = [];

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        arrayErros.push({ texto: 'Nome da categoria inválido ou não preenchido.' });
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        arrayErros.push({ texto: 'Slug inválido ou não informado.' });
    }

    if (req.body.nome.length < 3) {
        arrayErros.push({ texto: 'O nome da categoria deve conter pelo menos três dígitos.' });
    }

    if (arrayErros.length > 0) {
        res.render('admin/addcategorias', {
            arrayErros: arrayErros,
            titulo: 'Nova Categoria'
         })
    } else {
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }

        new Categoria(novaCategoria).save().then(() => {
            req.flash('success_msg', `Categoria ${req.body.nome} criada com sucesso.`);
            res.redirect('/admin/categorias');
        }).catch((err) => {
            req.flash('error_msg', `Ocorreu um erro ao salvar a categoria ${req.body.nome}`);
            res.redirect('/admin');
        })
    }
})

router.get('/categorias/edit/:id', eAdmin, (req, res) => {

    Categoria.findOne({ _id: req.params.id }).then((categoria) => {
        res.render('admin/editcategorias', { 
            categoria: categoria,
            titulo: categoria.nome
         });
    }).catch((err) => {
        req.flash('error_msg', `Categoria ${categoria.nome} não encontrada`);
        res.redirect('/admin/categorias');
    })
})

//Rota para atualizar uma categoria
router.post('/categorias/edit', eAdmin, (req, res) => {

    var arrayErros = [];

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        arrayErros.push({ texto: 'Nome da categoria inválido ou não preenchido.' });
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        arrayErros.push({ texto: 'Slug inválido ou não informado.' });
    }

    if (req.body.nome.length < 3) {
        arrayErros.push({ texto: 'O nome da categoria deve conter pelo menos três dígitos.' });
    }

    if (arrayErros.length > 0) {
        Categoria.findOne({ _id: req.body.id }).then((categoria) => {
            res.render('admin/editcategorias', {
                arrayErros: arrayErros,
                categoria: categoria,
                titulo: 'Editar Categoria'
            })
        })
    } else {
        Categoria.findOne({ _id: req.body.id }).then((categoria) => {
            categoria.nome = req.body.nome;
            categoria.slug = req.body.slug;

            categoria.save().then(() => {
                req.flash('success_msg', `Categoria ${categoria.nome} alterada com sucesso.`);
                res.redirect('/admin/categorias');
            }).catch((err) => {
                req.flash('error_msg', `Erro ao atualizar a edição da categoria ${categoria.nome}.`);
                req.redirect('/admin/categorias');
            })

        }).catch((err) => {
            req.flash('error_msg', 'Ocorreu um erro ao editar a categoria.');
            res.redirect('/admin/categorias');
        })

    }

})

//Rota para excluir uma categoria
router.get('/categorias/deletar/:id', eAdmin, (req, res) => {
    Categoria.findOneAndDelete({ _id: req.params.id }).then((categoria) => {
        req.flash('success_msg', `Categoria ${categoria.nome} excluída com sucesso.`);
        res.redirect('/admin/categorias');
    }).catch((err) => {
        req.flash('error_msg', `Erro ao excluir a categoria ${categoria.nome}`);
        res.redirect('/admin/categorias');
    })
})

//Rota para listar as postagens
router.get('/postagens', eAdmin, (req, res) => {
    Postagem.find().populate('categoria').sort({ _id: 'desc' }).then((postagens) => {
        res.render('admin/postagens', {
            postagens: postagens,
            titulo: 'Postagens'
        });
    }).catch((err) => {
        req.flash('error_msg', 'Ocorreu um erro ao listar as postagens');
        res.redirect('/admin');
    })
})

router.get('/postagens/add', eAdmin, (req, res) => {
    Categoria.find().then((categorias) => {
        res.render('admin/addpostagem', {
            categorias: categorias,
            titulo: 'Nova Postagem'
        });
    }).catch((err) => {
        req.flash('error_msg', 'Ocorreu um erro ao carregar o formulário.');
        res.redirect('/admin')
    })
})

//rota para gravar postagem no banco de dados
router.post('/postagens/nova', eAdmin, (req, res) => {

    var arrayErros = [];
    if (req.body.categoria == '0') {
        arrayErros.push({ texto: 'Categoria inválida, cadastre uma categoria.' });
    }

    if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null) {
        arrayErros.push({ texto: 'Título da postagem inválido ou não preenchido.' });
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        arrayErros.push({ texto: 'O slug deve ser informado' });
    }

    if (!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null) {
        arrayErros.push({ texto: 'O campo descrição é obrigatório.' });
    }

    if (!req.body.categoria || typeof req.body.categoria == undefined || req.body.categoria == null) {
        arrayErros.push({ texto: 'O campo categoria deve ser informado.' });
    }

    if (!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null) {
        arrayErros.push({ texto: 'O campo conteúdo é obrigatório.' });
    }

    if (arrayErros.length > 0) {
        Categoria.find().then((categorias) => {
            res.render('admin/addpostagem', {
                arrayErros: arrayErros,
                categorias: categorias,
                titulo: 'Nova Postagem'
            });
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao listar categorias.');
            res.redirect('/admin/postagens');
        });
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash('success_msg', `Postagem ${req.body.titulo} criada com sucesso.`);
            res.redirect('/admin/postagens')
        }).catch((err) => {
            req.flash('error_msg', 'Ocorreu um erro ao salvar a postagem.');
            res.redirect('/admin/postagens');
        })
    }

})

router.get('/postagens/edit/:id', eAdmin, (req, res) => {
    Postagem.findOne({ _id: req.params.id }).then((postagem) => {
        Categoria.find().then((categorias) => {
            res.render('admin/editpostagens', {
                categorias: categorias,
                postagem: postagem,
                titulo: postagem.titulo
            });
        }).catch((err) => {
            req.flash('error_msg', 'Ocorreu um erro ao listar categorias');
            res.redirect('/admin/postagens');
        })
    }).catch((err) => {
        req.flash('error_msg', 'Ocorreu um erro ao carregar o formulario de edição.');
        res.redirect('/admin/postagens')
    })
})

router.post('/postagem/edit', eAdmin, (req, res) => {

    var arrayErros = [];

    if (req.body.categoria == '0') {
        arrayErros.push({ texto: 'Categoria inválida, cadastre uma categoria.' });
    }

    if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null) {
        arrayErros.push({ texto: 'Título da postagem inválido ou não preenchido.' });
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        arrayErros.push({ texto: 'O slug deve ser informado' });
    }

    if (!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null) {
        arrayErros.push({ texto: 'O campo descrição é obrigatório.' });
    }

    if (!req.body.categoria || typeof req.body.categoria == undefined || req.body.categoria == null) {
        arrayErros.push({ texto: 'O campo categoria deve ser informado.' });
    }

    if (!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null) {
        arrayErros.push({ texto: 'O campo conteúdo é obrigatório.' });
    }

    if (arrayErros.length > 0) {
        Postagem.findOne({ _id: req.body.id }).then((postagem) => {
            Categoria.find().then((categorias) => {
                res.render('admin/editpostagens', {
                    categorias: categorias,
                    postagem: postagem,
                    arrayErros: arrayErros,
                    titulo: postagem.titulo
                });
            }).catch((err) => {
                req.flash('error_msg', `Ocorreu um erro a listar os dados da postagem ${postagem.titulo}`, + err);
                res.redirect('/admin/postagens');
            })
        });

    } else {
        Postagem.findOne({ _id: req.body.id }).then((postagem) => {
            postagem.titulo = req.body.titulo,
                postagem.descricao = req.body.descricao,
                postagem.conteudo = req.body.conteudo,
                postagem.categoria = req.body.categoria,
                postagem.slug = req.body.slug

            postagem.save().then(() => {
                req.flash('success_msg', `Postagem ${req.body.titulo} atualizada com sucesso.`);
                res.redirect('/admin/postagens');
            }).catch((err) => {
                req.flash('error_msg', 'Ocorreu um erro ao gravar a postagem.');
                res.redirect('/admin/postagens');
            })

        }).catch((err) => {
            req.flash('error_msg', 'Ocorreu um erro ao atualizar a postagem.');
            res.redirect('/admin/postagens');
        })
    }
})

//Rota para excluir uma postagem
router.get('/postagens/deletar/:id', eAdmin, (req, res) => {
    Postagem.findOneAndDelete({ _id: req.params.id }).then((postagem) => {
        req.flash('success_msg', `Categoria ${postagem.titulo} excluída com sucesso.`);
        res.redirect('/admin/postagens');
    }).catch((err) => {
        req.flash('error_msg', `Erro ao excluir a categoria ${postagem.titulo}`);
        res.redirect('/admin/postagens');
    })
})

//Exportando a rota criada
module.exports = router;