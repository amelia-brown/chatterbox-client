$(document).ready(function() {

  var username = window.location.search.substr(1).split('=')[1];
  var getMessages = function() {
    $.ajax({
      method: 'GET',
      url: 'https://api.parse.com/1/classes/messages',
      data: {
        format: 'json'
      },
      success: function(data) {
        renderMessages(data);
      },
      error: function() {
        console.log('error when fetching data');
      }
    });  
  };

  var firstRender = true;
  window.roomsList = [];

  var renderMessages = function(data) {
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
        firstRender = false;
        newMessages = data.results.slice(0, i);
        if (roomsList.indexOf(data.results[i].roomname) === -1 && data.results[i].roomname !== undefined) {
          roomsList.push(data.results[i].roomname);
          var newRoom = $('<option>' + data.results[i].roomname + '</option>');
          $('.rooms').append(newRoom);
        }
        break;
      }
    }

    if (newMessages === undefined) {
      newMessages = data.results.slice();
    }

    for (i = newMessages.length - 1; i >= 0; i--) {
      if (!firstRender) {
        $('.message-container div:last-child').remove();
      }
      
      var newNode = $('<div class="message ' + data.results[i].roomname + '" ' + 'data-created-at="' + data.results[i].createdAt + '"></div>');
      var user = $('<span class="user">' + newMessages[i].username + '</span>');
      var message = ': ' + newMessages[i].text;
      newNode.text(message);
      newNode.prepend(user);
      $('.message-container').prepend(newNode);

    }

  
  };

  var postMessage = function(text) {

    var message = {
      text: text, 
      username: username,
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

  $('.submit').on('click', function() {
    if ($('.textbox').val()) {
      postMessage($('.textbox').val());
      $('.textbox').val('');
    }
    return false;
  });

  $('.new-room').on('click', function() {
    var input = $('<input type="text">');
    $('.form')  
  });

  setInterval(getMessages, 1000);
  window.app = {init: function() {} };
  app.send = postMessage;
  app.fetch = getMessages;
});
