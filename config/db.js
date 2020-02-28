if (process.env.NODE_ENV == 'production'){
    module.exports = {mongoURI: 'mongodb://<user>:<password>@sua_url_de_producao'}
}else{
    module.exports = {mongoURI: 'mongodb://127.0.0.1:27017/blogapp'}
}