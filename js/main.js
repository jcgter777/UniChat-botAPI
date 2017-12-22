//      ________          _ _____  _                      _          
//     /  ____  \        (_)  __ \| |                    (_)         
//    /  / ___|  \        _| |__) | |__   ___   ___ _ __  ___  __    
//   |  | |       |      | |  ___/| '_ \ / _ \ / _ \ '_ \| \ \/ /    
//   |  | |___    |      | | |    | | | | (_) |  __/ | | | |>  <     
//    \  \____|  /       |_|_|    |_| |_|\___/ \___|_| |_|_/_/\_\    
//     \________/    ______                                   ______ 
//                  |______|                                 |______|
//
// botAPI v1.0


var bots = [];
var activeBots = [];
var user;

var messageStatus = {
    get error() { return "ERROR"; },
	get warning() { return "WARNING"; },
	get message() { return "MESSAGE"; }
};

function User() {
	var username;
  this.username = function () {
    return username
  }
  chars = function(data, n) {
  	var len = data.length - 1;
  	var result = "";
  	for (var i = 0; i < n; i++) {
  		var rand = Math.floor(Math.random() * len);
  		result += data.charAt(rand);
  	}
  	return result;
  }
  init = function() {
  	username = "user_"+chars(Math.floor(Math.random() * 1048576).toString(16)+(new Date().getTime().toString(16).substring(2,8))+Math.floor(Math.random() * 1048576).toString(16),6);
  	log(messageStatus.message,'User created with username "'+username+'".');
  }
  init();
}

function findBot(bot_name,bot_array) {
	var index = -1;
	var i = -1;
	bot_array.forEach(function(bot) {
		i++;
		if (bot[0] == bot_name) {
			index = i;
		}
	});
	return index;
}

function sendMessage(data) {
  var header = data.text.substring(0,1);
  var f = {
    poster: data.un,
    message: data.text.substring(1, data.text.length),
    timestamp: formatTime(data.ts),
    rawTimestamp: data.ts
  }
  activeBots.forEach(function (bot) {
    if (header == bot[1]) {
    	if (typeof window[bot[2]] == 'function') {
    		log(messageStatus.message,'Callback for bot "'+bot[0]+'" triggered with message "'+f.message+'".');
      	window[bot[2]](f);
    	}
    	else
    	{
    		log(messageStatus.error,'Callback for bot "'+bot[0]+'" is not a function!');
    	}
    }
  });
}

function registerBot(username, botHeader, callback) {
	if (findBot(username, bots) == -1) {
 		bots.push([username, botHeader, callback]);
  	activeBots.push([username, botHeader, callback]);
  	log(messageStatus.message, 'Bot "' + username + '" initialized.');
 	} else {
 		log(messageStatus.error,'Two bots cannot have the same name! Duplicate bot name: "'+username+'".');
 	}
}

function activateBot(bot_name) {
  if (findBot(bot_name, activeBots) == -1) {
    log(messageStatus.message, 'Bot "'+bot_name+'" has been activated.');
	  activeBots.push(bots[findBot(bot_name, bots)]);
  }
  else
  {
    if (findBot(bot_name, bots) != -1) {
      log(messageStatus.warning, 'Bot "'+bot_name+'" is already active!');
    }
    else
    {
      log(messageStatus.error, 'Bot "'+bot_name+'" does not exist!');
    }
  }
}

function deactivateBot(bot_name) {
  if (findBot(bot_name, activeBots) != -1) {
    log(messageStatus.message, 'Bot "'+bot_name+'" has been deactivated.');
    activeBots.splice(findBot(bot_name, activeBots),1);
  }
  else
  {
    if (findBot(bot_name, bots) != -1) {
      log(messageStatus.warning, 'Bot "'+bot_name+'" is already deactivates!');
    }
    else
    {
      log(messageStatus.error, 'Bot "'+bot_name+'" does not exist!');
    }
  }
}

function log(status, message) {
  var n = document.createElement("p");
  var dt = new Date().getTime();
  n.innerHTML = '[' + formatTime(dt) + '] <span class="' + status.toLowerCase() + '">' + status + ': ' + message + '</div>';
  document.getElementById("console").appendChild(n);
  document.getElementById('output').scrollTop = document.getElementById("output").scrollHeight;
}

window.onload = function () {
  log(messageStatus.message, "botAPI local testing environment loaded.");
  user = new User();
  log(messageStatus.message, "Ready to load bots!");
  if (typeof initializeBots == 'function') { 
  	initializeBots();
  	log(messageStatus.message,format(bots.length, 0, "bot")+" loaded, "+format(bots.length, 0, "bot")+" active.");
	}
  else {
  	log(messageStatus.error,'Function "initializeBots()" does not exist! No bots loaded.');
  }
  document.getElementById("messageBox").addEventListener("keyup", function (event) {
  	event.preventDefault();
  	if (event.key === "Enter")
  	  input();
	});
}

function formatTime(ts) {
  var dt = new Date(ts);

  var hours = dt.getHours() % 12;
  var minutes = dt.getMinutes();
  var seconds = dt.getSeconds();

  // the above dt.get...() functions return a single digit
  // so I prepend the zero here when needed
  if (hours < 10)
    hours = '0' + hours;

  if (minutes < 10)
    minutes = '0' + minutes;

  if (seconds < 10)
    seconds = '0' + seconds;

  if (hours == '00')
    hours = '12';

  return hours + ":" + minutes + ":" + seconds;
}

function respond(cr, botName, data) {
	log(messageStatus.message,'Response from "'+botName+'" received.');
  var n = document.createElement("DIV");
  n.innerHTML = detectURL("[" + data.timestamp + "] [" + botName + "]: " + cr);
  document.getElementById("output").appendChild(n);
}

function input() {
  var message = document.getElementById("messageBox").value;
  if (message.length > 0 && message.length < 256) {
  	var data = {text: message, un: user.username(), ts: (new Date().getTime())};
  	var n = document.createElement("DIV");
    n.innerHTML = detectURL("[" + formatTime((new Date().getTime())) + "] " + user.username() + ": " + message);
    document.getElementById("output").appendChild(n);
    document.getElementById('output').scrollTop = document.getElementById("output").scrollHeight;
    document.getElementById("messageBox").value = "";
    sendMessage(data);
  }
}

function cleanse(message) {
  var n = document.createElement("DIV");
  n.innerText = message;
  return n.innerHTML;
}

function detectURL(message) {
  message = cleanse(message);
  if (message !== undefined && message !== null) {
    var result = "";
    var n = "";
    //I'm using SAX's URL detection regex, because it works.
    var url_pattern = 'https?:\\/\\/[A-Za-z0-9\\.\\-\\/?&+=;:%#_~]+';
    var pattern = new RegExp(url_pattern, 'g');
    var match = message.match(pattern);
    if (match) {
      for (var i = 0; i < match.length; i++) {
        var link = '<a href="' + match[i] + '">' + match[i] + '</a>';
        var start = message.indexOf(match[i]);
        var header = message.substring(n.length, start);
        n += header;
        n += match[i];
        result = result.concat(header);
        result = result.concat(link);
      }
      result += message.substring(n.length, message.length);
    } else {
      result = message;
    }
  } else {
    result = "";
  }
  return result
}

function format(value, numDecimals, unit, showTrailingZeros) {
	value = (showTrailingZeros) ? value.toFixed(numDecimals) : parseFloat(value.toFixed(numDecimals));
	var formattedValue = value + ' ' + ((value != 1) ? unit + 's' : unit);

	return formattedValue;
}