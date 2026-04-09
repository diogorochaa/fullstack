
/*
        --------- FEITO ANTES------
$("#btnBusca").click(function(){
  $("#resultado").html("");
  var artista = $("#artista").val();
  var musica = $("#musica").val();
  
  $.get("https://api.lyrics.ovh/v1/" + artista + "/" + musica)
  .done( function(data) { 
      $("#letraMusica").append("<h2> Artista:  "+ artista + "</h2");
      $("#letraMusica").append("<h2> Música:   "  + musica + "</h2");
      $("#letraMusica").append("<h3> Letra-----  " + data.lyrics + "</h3");
      
      
    } )
    .fail( function(err) {
        alert("Música não encontrada");
    });
});*/


$(function() {
  var formulario = $(".formulario");
  var artista = $('#artista');
  var musica = $('#musica');
  var letraMusica = $("#letraMusica");

  formulario.on('submit', function(e) {
      e.preventDefault();

      $.ajax({
          url: "https://api.lyrics.ovh/v1/" + artista.val() + "/" + musica.val()
      }).done(function(data) {
          letraMusica.html(data.lyrics);
      }).fail(function() {
          alert('Música não encontrada :(');
          
      });
  });
});

