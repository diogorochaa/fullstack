/*variáveis globais que são utilizadas em mais funções no código*/

var busca = $('.input-busca');


/*Função que inicia o documento e busca a informação na URL informada*/
$(function() {
    var formulario = $("#formulario");
    formulario.on('submit', function(e) {
        e.preventDefault();
  
        $.ajax({
            
            url: "https://api.github.com/users/" + busca.val() 
              
        }).done(function(data) {
            $("#nome").text("Nome: " + data.name);
            $("#usuario").text("Usuário: " + data.login);
            $("#seguidores").text("Seguidores: " + data.followers);
            $(".avatar").attr('src', data.avatar_url);
            $("#repositorio").text("Repositórios Públicos: " + data.public_repos);
            /*percorre o documento e devolve os itens que foi solicitado já inserindo no html com o jquery*/
    
        }).fail(function() {
            alert('Usuário não encontrado :(');
            
        });
    });
    });

/*Função para buscar os repositorios do usuário informado*/
$(".buscaRepositorios").click(buscaRepositorios); 

function buscaRepositorios() {
    $.ajax({
        url: "https://api.github.com/users/" + busca.val() + "/repos"
    }).done(function(data){
    
        data.forEach(elemento => {/*percorre o documento e devolve o repositorio*/
            $("#insereRepositorio").append(elemento.name + "</br>");    
        });
    }).fail(function() {
        alert('Não foi possível encontrar um repositório :(');
    });
    limparPagina();
    
}

/*Função para buscar os repositorios mais visitados pelo usuário informado*/
$(".visitados").click(repositoriosVisitados); 

function repositoriosVisitados() {
    $.ajax({
        url: "https://api.github.com/users/"  + busca.val() + "/starred"
    }).done(function(data){
        data.forEach(elemento => { /*percorre o documento e devolve o nome e o repositorio*/
            $("#insereNomeRep").append(elemento.name + "</br>");
            $("#insereRepositorioVisitado").append(elemento.full_name + "</br>");
        });    
    }).fail(function() {
        alert('Não foi encontrado um repositório :(');
    });
    limparPagina();
    
}

/*Função para limpar a página assim que o botão é clicado novamente*/
function limparPagina(){
    $("#insereRepositorio").text(""); /*pega os campos e insere o valor em branco como texto*/
    $("#insereNomeRep").text("");
    $("#insereRepositorioVisitado").text("");
}

