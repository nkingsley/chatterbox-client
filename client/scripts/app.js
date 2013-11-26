$(document).ready(function(){
  var chat = new Chat();
  var friends = {};
  var roomname = getQueryVariable("room");
  var userName = getQueryVariable("username");
  var newdiv;
  $('.userMessage input').keyup(function(event){
    if (event.keyCode === 13){
      $('.send').click();
    }
  });
  $('.send').click(function(){
      chat.postMessage({
        success:function (data) {
          $('.userMessage input').val("");
        },
        error: function (data) {
          console.error('chatterbox: Failed to send message');
        },
        message: {
          'username': userName,
          'text': $('.userMessage input').val(),
          'roomname': roomname || 'lobby'
        }
    });
  });

  $('.makeRoom').click(function(){
    window.location += '&room=' + encodeURI( prompt('what would you like to call your new room?') );
  });
  $('.mainMessages').on('click','.message .username',function(){
    var username = $(this).attr("username");
    friends[username]=true;
    for (var friend in friends){
      $('[username="' + friend + '"]').parent().css({'font-weight':'600'});
    }
    return false;
  });

  $('.mainMessages').on('click','.message .roomname',function(){
    var roomname = $(this).attr("roomname");
    window.location += '&room=' + roomname;
    return false;
  });
  var getMsgOptions = {
    lastMsgTime: function(){
      var lastMsgTime;
      $firstChild = $('.mainMessages').children();
      if ($firstChild.length === 0){
        lastMsgTime = null;
      } else{
        lastMsgTime = $($firstChild[0]).attr('createdAt');
      }
      return lastMsgTime;
    },
    room: roomname,
    renderHtml : function(msg){
      $newLink = $('<a class="username" href="#"></a>');
      $newLink.text(msg.username+": ");
      $newLink2 = $('<a class="roomname" href="#"></a>');
      $newLink2.text(" Room: " + msg.roomname);
      $newdiv = $('<div class="message"></div>').text(msg.text);
      $newdiv.attr("createdAt",msg.createdAt);
      $newLink.attr("username",msg.username);
      $newLink2.attr("roomname",msg.roomname);
      $newdiv.prepend($newLink);
      $newdiv.append($newLink2);
      if (this.lastMsgTime){
        $('.mainMessages').prepend($newdiv);
      } else{
        $('.mainMessages').append($newdiv);
      }
    }
  };

  chat.getMessages(getMsgOptions);
  setInterval(function(){chat.getMessages(getMsgOptions);},3000);
});
var Chat = function(){

};

Chat.prototype.postMessage = function(options){
  $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'POST',
    data: JSON.stringify(options.message),
    contentType: 'application/json',
    success: options.success,
    error: options.error
  });
};
Chat.prototype.getMessages = function(options){
  $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox?order=-createdAt',
    type: 'GET'
    }).done(function(messages){
    var msg;
    for (var key in messages.results){
      msg = messages.results[key];
      if (options.lastMsgTime() && msg.createdAt <= options.lastMsgTime()){
        continue;
      }
      if (options.room){
        if (msg.roomname === options.room){
          options.renderHtml(msg);
        }
      } else {
        options.renderHtml(msg);
      }
    }
  });
};

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
