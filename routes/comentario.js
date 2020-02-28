const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Comentario');
require('../models/Postagem');
const Comentario = mongoose.model('comentarios');
const Postagem = mongoose.model('postagens');
const {eAdmin} = require('../helpers/eAdmin');

router.get('/', eAdmin, (req, res) => {
    Comentario.find().sort({_id: 'desc'}).then((comentario) => {
        res.render('comentarios/index', { 
            comentario: comentario,
            titulo: 'Comentários'
         });
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao listar comentarios');
        res.redirect('/');
    })
})

//Rota para gravar comentário
router.post('/novo',  (req, res) => {
    Postagem.findOne({_id: req.body.id}).then((postagem) => {
        if (!req.user) {
            req.flash('error_msg', 'Para comentar é preciso estar logado.');
            res.redirect('/usuarios/login');
        } else if (!req.body.txtComentario) {
            req.flash('error_msg','Favor o inserir o seu comentário para postar.');
            res.redirect(`/postagem/${postagem.slug}`);
        } else {
            const novoComentario = new Comentario({
                nome: req.user.nome,
                usuario: req.user.id,
                slug: req.body.id,
                conteudo: req.body.txtComentario
            })
            novoComentario.save().then(() => {
                req.flash('success_msg', 'Comentário gravado com sucesso. Obrigado.');
                res.redirect(`/postagem/${postagem.slug}`);
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao salvar o comentário: ' + err);
                res.redirect('/');
            })
        }
    }).catch((err) => {
        req.flash('error_msg', 'Ocorreu um erro ao buscar a postagem.' + err);
        res.redirect('/');
    })
})


//Rota para excluir um comentário
router.get('/excluir/:id',  eAdmin, (req, res) => {
    Comentario.findByIdAndDelete({_id: req.params.id}).then((comentario) => {
        req.flash('success_msg', `Comentário excluido com sucesso.`);
        res.redirect('/admin');
    }).catch((err) => {
        req.flash('error_msg', 'Ocorreu um erro ao excluir o comentário.');
        res.redirect('/admin');
    })
})

module.exports = router;