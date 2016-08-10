var app = {
  firstRender: true,
  roomsList: [],
  friends: {},
  username: ''
};

app.init = function() {
  var username = window.location.search.substr(1).split('=');
  app.username = username[username.length - 1].split('%20').join(' ');
  
  $('.submit').on('click', function() {
    if ($('.textbox').val()) {
      app.postMessage($('.textbox').val());
      $('.textbox').val('');
    }
    return false;
  });

  $('.message-box').keydown(function(e) {
    if (e.keyCode == 13) {
      e.preventDefault();
      if ($('.message-box').val().trim()) {
        app.postMessage($('.message-box').val());
      }
      $('.message-box').val('');
    }
  });

  $('.new-room').on('click', function() {
    $('.room-input').toggle('slide');
    if ($('.room-input').val().length > 0) { 
      var newRoom = $('.room-input').val();
      app.roomsList.push(newRoom);
      newRoom = $('<option>' + newRoom + '</option>');
      $('.rooms').prepend(newRoom);
      $('.rooms').val(newRoom);
    }
    $('.room-input').val('');
  });

  $('.room-input').keydown(function(e) {
    if (e.keyCode == 13) {
      e.preventDefault();
      if ($('.room-input').val().trim()) {
        var newRoom = $('.room-input').val();
        app.roomsList.push(newRoom);
        newRoom = $('<button value="' + newRoom + '" selected>' + newRoom + '</button>');
        $('.rooms').prepend(newRoom);
        $('.rooms').val(newRoom);
      }
      $('.room-input').val('');
    }
  });

  setInterval(app.fetch, 1000);
};

app.fetch = function () {
  $.ajax({
    method: 'GET',
    url: 'https://api.parse.com/1/classes/messages',
    data: {
      format: 'json'
    },
    success: function(data) {
      app.renderMessages(data);
    },
    error: function() {
      console.log('error when fetching data');
    }
  });  
};

app.renderMessages = function(data) {
  var roomSelection = $('.rooms').val();
  if (roomSelection !== 'all') {
    $('.message').css('display', 'none');
    $('.' + roomSelection).css('display', 'block');
  } else {
    $('.message').css('display', 'block');
  }
  var newMessages;
  var newestNodeDate = Date.parse($('.message-container div:first-child').data('created-at')) || null;

  for (var i = 0; i < data.results.length; i++) {
    if (newestNodeDate >= Date.parse(data.results[i].createdAt)) {
      app.firstRender = false;
      newMessages = data.results.slice(0, i);
      if (app.roomsList.indexOf(data.results[i].roomname) === -1 && data.results[i].roomname !== undefined) {
        app.createNewRoomButton(data.results[i].roomname);
      }
      break;
    }
  }

  if (newMessages === undefined) {
    newMessages = data.results.slice();
  }

  for (i = newMessages.length - 1; i >= 0; i--) {
    app.composeMessageNode(newMessages[i]);
  }
};

app.composeMessageNode = function(newMessage) {
  if (!app.firstRender) {
    $('.message-container div:last-child').remove();
  }

  var newNode = $('<div class="message ' + newMessage.roomname + '" ' + 'data-created-at="' + newMessage.createdAt + '"></div>');
  var parsedUser = newMessage.username.split(' ').join('').split('%20').join('');
  var user = $('<span class="user ' + parsedUser + '">' + newMessage.username.split('%20').join(' ') + '</span>');
  
  if (app.friends[newMessage.username] !== undefined) {
    user.addClass('friend');
  }

  var message = ': ' + newMessage.text;
  newNode.text(message);
  newNode.prepend(user);
  $('.message-container').prepend(newNode);
  newNode.find('span').on('click', function() {
    var user = $(this).text();
    var parsedUser = user.split(' ').join('').split('%20').join('');
    if (app.friends[user] === undefined) {
      app.friends[user] = user;
    } else {
      delete app.friends[user];
    }
    $('.' + parsedUser).toggleClass('friend');
  });
};

app.getCurrentRoom = function() {
};

app.appendMessageNodes = function() {
};

app.createNewRoomButton = function(roomname) {
  app.roomsList.push(roomname);
  var newRoom = $('<option>' + roomname + '</option>');
  $('.rooms').append(newRoom);
};

app.postMessage = function(text) {

  var message = {
    text: text, 
    username: app.username,
    roomname: $('.rooms').val()
  };

  $.ajax({
    method: 'POST',
    url: 'https://api.parse.com/1/classes/messages',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function(data) {
      console.log('chatterbox: Message sent', data);
    },
    error: function() {
      console.log('error when sending data');
    }
  });  
}; 



