var elasticsearch = require('elasticsearch');
var express = require('express');
var request = require('request');

var minutes = 15;
var client = new elasticsearch.Client({
  host: 'search-assignment4-au5xtwjxk3b2kxqoyvdytahkka.us-west-2.es.amazonaws.com',
  log: 'info'
});

// retrieve universal studios xml file and parse to an array
function fetchOnlineUsers() {
  request('https://crowbar.steamstat.us/Barney', function (error, response, body) {
    if (!error && response.statusCode == 200) {

      var jsonArray = JSON.parse(response.body);
      var ts = Math.round(new Date().getTime() / 1000);
      var usersOnline = jsonArray["services"]["online"]["title"];
      var data = [ts, usersOnline];
      sendData(data);
    }
  });
}

// send data to elastic search
function sendData(data) {
  var numberOfPlayers = parseInt(data[1].replace(/,/g, ''));
  var dataBody = JSON.stringify({ timestamp: data[0], numberOfPlayers: numberOfPlayers});
  client.create({
    index: 'players',
    type: 'onlinePlayers',
    id: data[0],
    body: dataBody
  }, function (err, response) {
    if (err) {
      console.log(err);
    } else {
      console.log(response);
    }
  });
};

// fetch data every quarter hour
function setTimer() {
  setInterval(function () {
    fetchWaitingTimes();
  }, minutes * 60 * 1000)
};

setTimer();
