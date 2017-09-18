require('dotenv').load();
var striptags = require('striptags');
var Botkit = require('botkit');
var querystring = require('querystring');
var http = require('http');
var responseClient = "";

var controller = Botkit.facebookbot({
        access_token: process.env.PAGE_TOKEN,
        verify_token: process.env.VERIFY_TOKEN,
});

function getClientResponse (input) {
  var context = "null";
  var jsonQuestion = JSON.stringify({"text": input, "context": context});

  console.log(jsonQuestion);

  var headers = {
    'Content-Type': 'application/json',
    'Content-Length' : jsonQuestion.length
  };

  var options = {
    host : '10.0.1.31',
    port : '8080',
    path : '/chat/response',
    method : 'POST',
    headers: headers
  };

  var responseString = '';

  var req = http.request(options, function(res) {
    res.setEncoding('utf-8');

    res.on('data', function(data) {
      responseClient = data;
    });
  });

  req.write(jsonQuestion);
  req.end();

  req.on('error', function (e) {
    console.error(e);
  });
}

var bot = controller.spawn({
});

controller.setupWebserver(process.env.PORT, function(err,webserver) {
  controller.createWebhookEndpoints(controller.webserver, bot, function() {
      console.log('online');
  });
});

controller.on('facebook_optin', function(bot, message) {
    bot.reply(message, 'Hola, soy el Asistente Virtual TEC360 del Infonavit. Le puedo ayudar con cualquier tema de solicitud de crédito');
});

controller.hears(['(.*)'], 'message_received', function(bot, message) {
    console.log(message.text);
    getClientResponse(message.text);
    setTimeout(function(){
      console.log(responseClient);
      var obj = JSON.parse(responseClient);
      bot.reply(message, striptags(obj.text, [], ' '));
    }, 1000);
});
