const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Usuario');
const Usuario = mongoose.model('usuarios');
const { eAdmin } = require('../helpers/eAdmin');

//Módulo para realizar o hash da senha
const bcrypt = require('bcryptjs');
const passport = require('passport');

router.get('/registro', (req, res) => {
    res.render('usuarios/registro', { titulo: 'Registro' });
})

//Rota para gravar o usuário no banco de dados
router.post('/registro', (req, res) => {
    var arrayErros = [];

    //Validação do formulário
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        arrayErros.push({ texto: 'Nome inválido ou não preenchido.' });
    }

    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        arrayErros.push({ texto: 'Email inválido ou não preenchido' });
    }

    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        arrayErros.push({ texto: 'Senha inválida ou não preenchida' });
    }

    if (req.body.senha.length < 6) {
        arrayErros.push({ texto: 'A senha deve conter pelo menos 6 caracteres.' });
    }

    if (req.body.senha != req.body.ConfirmaSenha) {
        arrayErros.push({ texto: 'A senha e a confirmação da senha devem iguais!' });
    }

    //Se encontrou erros
    if (arrayErros.length > 0) {
        res.render('usuarios/registro', {
            arrayErros: arrayErros,
            titulo: 'Registro'
        });
    } else {
        Usuario.findOne({ email: req.body.email }).then((usuario) => {
            if (usuario) {
                req.flash('error_msg', 'Já existe uma conta com esse email.');
                res.redirect('/usuarios/registro');
            } else {
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if (erro) {
                            req.flash('error_msg', 'Ocorreu um erro ao salvar o usuário.');
                            res.redirect('/');
                        }

                        novoUsuario.senha = hash;
                        novoUsuario.save().then(() => {
                            req.flash('success_msg', 'Conta criada com sucesso.');
                            res.redirect('/');
                        }).catch((err) => {
                            req.flash('error_msg', 'Ocorreu um erro ao criar a conta, tente novamente.');
                            res.redirect('/usuarios/registro');
                        })

                    })
                })
            }
        }).catch((err) => {
            req.flash('error_msg', 'Ocorreu um erro interno.');
            res.redirect('/');
        })
    }
})


//Rota para realizar o login na aplicação
router.get('/login', (req, res) => {
    if (req.user) {
        req.flash('error_msg', 'Você já está logado!');
        res.redirect('/');
    } else {
        res.render('usuarios/login', { titulo: 'Login' });
    }
})

router.post('/login', (req, res, next) => {

    var arrayErros = [];

    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        arrayErros.push({ texto: 'Favor preencher o email' });
    }

    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        arrayErros.push({ texto: 'Favor informar a senha para logar' });
    }

    if (arrayErros.length > 0) {
        res.render('usuarios/login', {
            arrayErros: arrayErros,
            titulo: 'Login'
         });
    } else {
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/usuarios/login',
            failureFlash: true
        })(req, res, next)
    }
})

//Rota para acessar a página de novo administrador
router.get('/add', eAdmin, (req, res) => {
    res.render('usuarios/addusuario', { titulo: 'Adicionar Usuário' });
})

//Rota para adicionar um novo administrador
router.post('/novo', eAdmin, (req, res) => {
    var arrayErros = [];

    //Validação do formulário
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        arrayErros.push({ texto: 'Nome inválido ou não preenchido.' });
    }

    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        arrayErros.push({ texto: 'Email inválido ou não preenchido' });
    }

    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        arrayErros.push({ texto: 'Senha inválida ou não preenchida' });
    }

    if (req.body.senha.length < 6) {
        arrayErros.push({ texto: 'A senha deve conter pelo menos 6 caracteres.' });
    }

    if (req.body.senha != req.body.ConfirmaSenha) {
        arrayErros.push({ texto: 'A senha e a confirmação da senha devem iguais!' });
    }

    //Se encontrou erros
    if (arrayErros.length > 0) {
        res.render('usuarios/addusuario', {
            arrayErros: arrayErros,
            titulo: 'Adicionar Usuário'
        });
    } else {
        Usuario.findOne({ email: req.body.email }).then((usuario) => {
            if (usuario) {
                req.flash('error_msg', 'Já existe uma conta com esse email.');
                res.redirect('/usuarios/addusuario');
            } else {
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha,
                    eAdmin: 1
                })

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if (erro) {
                            req.flash('error_msg', 'Ocorreu um erro ao salvar o usuário.');
                            res.redirect('/');
                        }

                        novoUsuario.senha = hash;
                        novoUsuario.save().then(() => {
                            req.flash('success_msg', 'Conta criada com sucesso.');
                            res.redirect('/admin');
                        }).catch((err) => {
                            req.flash('error_msg', 'Ocorreu um erro ao criar a conta, tente novamente.');
                            res.redirect('/usuarios/addusuario');
                        })

                    })
                })
            }
        }).catch((err) => {
            req.flash('error_msg', 'Ocorreu um erro interno.');
            res.redirect('/');
        })
    }
})

//Rota para deletar um administrador
router.get('/deletar/:id', eAdmin, (req, res) => {
    Usuario.findByIdAndDelete({ _id: req.params.id }).then(() => {
        req.flash('success_msg', 'Usuário excluido com sucesso.');
        res.redirect('/admin');
    }).catch((err) => {
        req.flash('error_msg', 'Ocorreu um erro ao excluir o usuário.');
        res.redirect('/admin');
    })
})

//Rota para logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'Deslogado com sucesso');
    res.redirect('/');
})

module.exports = router;