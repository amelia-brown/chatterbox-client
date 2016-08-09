$(document).ready(function() {

  var username = window.location.search.substr(1).split('=')[1];
  var getMessages = function() {
    $.ajax({
      method: 'get',
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

  var renderMessages = function(data) {
    //store parsed node-date of top node
    //compare the node-date to each results.createdAt property
    // when node-date === createdAt, everything 0 -> i in Array is new.
    // remove i number of nodes from bottom of messages
    // prepend 0 -> i from Array into messages.
    var newMessages;
    var newestNodeDate = Date.parse($('.message-container div:first-child').data('created-at')) || null;
    for (var i = 0; i < data.results.length; i++) {
      if (newestNodeDate >= Date.parse(data.results[i].createdAt)) {
        firstRender = false;
        newMessages = data.results.slice(0, i);
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
      
      var newNode = $('<div class="message" ' + 'data-created-at="' + data.results[i].createdAt + '"></div>');
      var user = $('<span class="user">' + newMessages[i].username + '</span>');
      var message = ': ' + newMessages[i].text;
      newNode.text(message);
      newNode.prepend(user);
      $('.message-container').prepend(newNode);
    }
    // var node = $('<div class="message" ' + 'data-created-at="' + data.results[i].createdAt + '"></div>');
    // var message = data.results[i].username + ': ' + data.results[i].text;
    // node.text(message);
    // $('.message-container').prepend(node);
  
  };

  var postMessage = function(text) {

    var message = {
      text: text, 
      username: username,
      roomname: '4chan',
    };

    $.ajax({
      method: 'post',
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

  setInterval(getMessages, 1000);
  window.app = {init: function() {} };
});
