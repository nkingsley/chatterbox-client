$(document).ready(function(){
  var chat = new Chat();
  new ChatView(chat);
});
var events = _.clone(Backbone.Events);
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
Chat.prototype.getMessages = function(lastMsgTime,roomname){
  $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox?order=-createdAt',
    type: 'GET'
    }).done(function(messages){
    var msg;
    var counter = 0;
    for (var key in messages.results){
      msg = messages.results[key];
      counter++;
      if (counter === 4){
        break;
      }
      if (lastMsgTime && msg.createdAt <= lastMsgTime){
        continue;
      }
      if (roomname){
        if (msg.roomname === roomname){
          events.trigger('message:display', msg);
        }
      } else {
        events.trigger('message:display', msg);
      }
    }
  });
};

var ChatView = function(options){
  this.chat = options;
  events.on('message:display', this.renderHtml, this);
  var that = this;
  // this.getMsgOptions = {
  //   lastMsgTime: this.lastMessageTime,
  //   room: this.roomname//,
  //   // renderHtml : this.renderHtml
  // };
  this.friends = {};
  this.roomname = getQueryVariable("room");
  this.userName = getQueryVariable("username");
  $('.userMessage input').keyup(that.enterTrigger);
  var clickTrigger = $.proxy(this.clickTrigger,this);
  $('.send').click(clickTrigger);
  $('.makeRoom').click(that.makeRoom);
  $('.mainMessages').on('click','.message .username',this.addFriend);
  $('.mainMessages').on('click','.message .roomname',this.enterRoom);

  this.chat.getMessages(this.lastMessageTime(),this.roomname);
  setInterval(function(){
    that.chat.getMessages(that.lastMessageTime(),that.roomname);
  },3000);
};

ChatView.prototype.lastMessageTime = function(){
  var lastMsgTime;
  $firstChild = $('.mainMessages').children();
  if ($firstChild.length === 0){
    lastMsgTime = null;
  } else{
    lastMsgTime = $($firstChild[0]).attr('createdAt');
  }
  return lastMsgTime;
};
ChatView.prototype.clickTrigger = function(){
  this.chat.postMessage({
    success:function (data) {
      $('.userMessage input').val("");
    },
    error: function (data) {
      console.error('chatterbox: Failed to send message');
    },
    message: {
      'username': this.userName,
      'text': $('.userMessage input').val(),
      'roomname': this.roomname || 'lobby'
    }
  });
};

ChatView.prototype.renderHtml = function(msg){
  var $newLink = $('<a class="username" href="#"></a>');
  $newLink.text(msg.username+": ");
  var $newLink2 = $('<a class="roomname" href="#"></a>');
  $newLink2.text(" Room: " + msg.roomname);
  var $newdiv = $('<div class="message"></div>').text(msg.text);
  $newdiv.attr("createdAt",msg.createdAt);
  $newLink.attr("username",msg.username);
  $newLink2.attr("roomname",msg.roomname);
  $newdiv.prepend($newLink);
  $newdiv.append($newLink2);
  $('.mainMessages').prepend($newdiv);
  ChatView.prototype.styleFriends();
};
ChatView.prototype.enterTrigger = function(event){
  if (event.keyCode === 13){
    $('.send').click();
  }
};
ChatView.prototype.makeRoom = function(){
  window.location += '&room=' + encodeURI( prompt('what would you like to call your new room?') );
};
ChatView.prototype.addFriend = function(){
  var username = $(this).attr("username");
  var amigos = JSON.parse(localStorage.getItem("amigos"));
  if (!amigos){
    amigos = {};
  }
  amigos[username]=true;
  localStorage.setItem("amigos",JSON.stringify(amigos));
  ChatView.prototype.styleFriends();
  return false;
};
ChatView.prototype.styleFriends = function() {
  var amigos = JSON.parse(localStorage.getItem("amigos"));
  for (var friend in amigos){
    $('[username="' + friend + '"]').parent().css({'font-weight':'600'});
  }
};
ChatView.prototype.enterRoom = function(){
  var roomname = $(this).attr("roomname");
  window.location += '&room=' + roomname;
  return false;
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
