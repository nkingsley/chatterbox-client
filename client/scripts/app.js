
var getQueryVariable = function(variable){
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if(pair[0] == variable){
      return pair[1];
    }
  }
  return(false);
};


var friends = [];
var roomname = getQueryVariable("room");
var userName = getQueryVariable("username");
var newdiv;
var lastMsgTime = null;

var getMessages = function(room){
  $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox?order=-createdAt',
    type: 'GET'
    }).done(function(messages){
    var msg;
    for (var key in messages.results){
      msg = messages.results[key];
      if (lastMsgTime && (new Date(msg.createdAt) < lastMsgTime)){
        continue;
      }
      if (room){
        if (msg.roomname === room){
          msgRenderHtml(msg);
        }
      } else {
        msgRenderHtml(msg);
      }
    }
    lastMsgTime = new Date();
  });
};
getMessages(roomname);
setInterval(function(){getMessages(roomname);},3000);

var msgRenderHtml = function(msg){
  $newLink = $('<a href="#"></a>');
  $newLink.text(msg.username+": ");
  $newdiv = $('<div class="message"></div>').text(msg.text);
  $newdiv.addClass(msg.username);
  $newdiv.addClass(msg.roomname);
  $newdiv.prepend($newLink);
  $('.mainMessages').prepend($newdiv);
};


$(document).ready(function(){
  $('.userMessage input').keyup(function(event){
    if (event.keyCode === 13){
      $('.send').click();
    }
  });
  $('.send').click(function(){
    postMessage();
  });

  $('.makeRoom').click(function(){
    window.location += '&room=' + prompt('what would you like to call your new room?');
  });

});
var postMessage = function(){
  var message = {
    'username': userName,
    'text': $('.userMessage input').val(),
    'roomname': roomname || 'lobby'
  };
  $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      $('.userMessage input').val("");
    },
    error: function (data) {
      console.error('chatterbox: Failed to send message');
    }
  });
};