// YOUR CODE HERE:
var roomname = "lobby";
var newdiv;
$.ajax("https://api.parse.com/1/classes/chatterbox").done(function(messages){
  for (var key in messages.results){
    //console.log(messages.results[key]);
    if (messages.results[key].objectId === "YM9OwByKlT"){
      console.log(messages.results[key].objectId);
    }
    $newdiv = $('<div class = "message"></div>').text(messages.results[key].text);
    $newdiv.addClass(messages.results[key].username);
    $newdiv.addClass(messages.results[key].roomname);
    $(document.body).append($newdiv);
  }
});




$(document).ready(function(){
  $('.send').click(function(){
    postMessage();
  });
});
var postMessage = function(){
var message = {
  'username': window.location.search.match(/(?:&|\?)username=([\w]+)/)[1],
  'text': $('.userMessage input').val(),
  'roomname': roomname
};
  $('.userMessage input').val("");
  $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log(message);
      console.log(data);
    },
    error: function (data) {
      console.error('chatterbox: Failed to send message');
    }
  });
};