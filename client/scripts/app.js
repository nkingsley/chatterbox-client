
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

var startingLocation = ""+window.location;
var friends = {};
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
  $newLink = $('<a class="username" href="#"></a>');
  $newLink.text(msg.username+": ");
  $newLink2 = $('<a class="roomname" href="#"></a>');
  $newLink2.text(" Room: " + msg.roomname);
  $newdiv = $('<div class="message"></div>').text(msg.text);
  $newLink.attr("username",msg.username);
  $newLink2.attr("roomname",msg.roomname);
  $newdiv.prepend($newLink);
  $newdiv.append($newLink2);
  if (lastMsgTime){
    $('.mainMessages').prepend($newdiv);
  } else{
    $('.mainMessages').append($newdiv);
  }
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
    window.location += '&room=' + encodeURI( prompt('what would you like to call your new room?') );
  });
  $('.mainMessages').on('click','.message .username',function(){
    var username = $(this).attr("username");
    friends[username]=true;
    styleFriends();
    return false;
  });

  $('.mainMessages').on('click','.message .roomname',function(){
    var roomname = $(this).attr("roomname");
    window.location += '&room=' + roomname;
    return false;
  });

});
var styleFriends = function(){
  for (var friend in friends){
    $('[username="' + friend + '"]').parent().css({'font-weight':'600'});
  }
};
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