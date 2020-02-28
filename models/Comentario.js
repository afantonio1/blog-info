const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Comentario = new Schema({
    nome:{
        type: String,
        required: true
    },
    usuario:{
        type: Schema.Types.ObjectId,
        ref: 'usuarios',
        required: true
    },
    conteudo: {
        type: String,
        required: true
    },
    slug: {
        type: Schema.Types.ObjectId,
        ref: 'postagens',
        required: true
    },
    data:{
        type: Date,
        default: Date.now()
    }
})

mongoose.model('comentarios', Comentario);