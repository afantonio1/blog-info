//Código pra ajustar conteudo do textarea ao tamanho da tela
$("#conteudoPost").height($("#conteudoPost")[0].scrollHeight);


//Constrói a URL depois que o DOM estiver pronto
document.addEventListener("DOMContentLoaded", function () {
    //conteúdo que será compartilhado: Título da página + URL
    var conteudo = encodeURIComponent(document.title + " " + window.location.href);
    document.getElementById("whatsapp-btn").href = "https://api.whatsapp.com/send?text=" + conteudo;
}, false);
