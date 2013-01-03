# Node.js Trello API Action Event Handler
[View Trello’s API documentation online][apidocs]. For information on Trello’s API development, visit [their Trello board][trellotrello], of course.

[apidocs]: https://trello.com/docs/
[trellotrello]: https://trello.com/board/trello-public-api/4ed7e27fe6abb2517a21383d

## Install
```
npm install trello_tools
```

### Getting your key and token
* [Generate your developer key][devkey] and supply it as the first constructor parameter.
* To read a user’s private information, get a token by directing them to `https://trello.com/1/connect?key=<PUBLIC_KEY>&name=MyApp&response_type=token&scope=read,write` replacing, of course, &lt;PUBLIC_KEY&gt; with the public key obtained in the first step.
* If you need write access as well as read, `&scope=read,write` to the request for your user token.

[devkey]: https://trello.com/1/appKey/generate

## Background

Nearly anything you do on a Trello board is captured as an action. Actions can be queried via the Trello API.

The TrelloEvents library is an EventEmitter. Once you tell it to monitor a board, it will:

* grab the latest batch of actions
* update an internal ```since``` variable so that the next request results in a fresh batch actions
* emit an event for each type of action passing in the associated data for the action

All you have to do is bind listeners to the events you care about.

This project uses the [peanut] functional testing tool for node.js

The tests that are included are meant to get you familiar with the Trello API using the [node-trello] project.

[peanut]: https://github.com/didit-tech/peanut
[node-trello]: https://github.com/adunkman/node-trello

Take a look at the code in: ```features/step_definitions``` to see what is going on in each scenario from ```features/trello.feature```

## Typical usage

```
var TrelloEventsClass = require('trello_events')

var trelloEvents = TrelloEventsClass(myKey, myToken)

trelloEvents.on('createList', function(data) {
  // act on the data from the createList event
})

trelloEvents.on('updateBoard', function(data) {
  // act on the data from the updateBoard event
})

trelloEvents.monitor('MyBoard')
```

A complete list of all the actions exposed via the Trello API can be found [here][apidocs]

## TrelloEvents API

### constructor

TrelloEvents uses the module pattern and as such the ```new``` opertor is not needed.

```
var TrelloEventsClass = require('trello_events')
var trelloEvents = TrelloEventsClass(<key>, <token>)
```

### credentials

```
trelloEvents.credentials()
```

returns: { key: <key>, token: <token> }

### monitor

```
trelloEvents.monitor(<board name>, { since: <date>, interval: <millis> })
```

This starts an event loop which retrieves Trello actions via the Trello API. Any actions that are retrieved will be emitted as events keyed on the type of action.

The second parameter is optional. If provided, either or both ```since``` and ```interval``` can be provided.

```since``` is a fully qualified date string in the form: 
'2013-01-02T19:53:24.930Z'. Trello actions will be retrieved from the time after ```since```, if provided. If not provided, all Trello actions will be retrieved (see Issues below).

```interval``` is the number of milliseconds between the event loop runs. NOTE: If the event loop (which make Trello API calls) runs longer than the interval you specify, the event loop will simply run again immediately. The default value for interval is: 1000

### unmonitor

```
trelloEvents.unmonitor(<board name>)
```

Turns off Trello action monitoring for that specified board.

### monitoring

```
trelloEvents.monitoring(<board name>)
```

returns: true || false

## Setup for running the tests

You'll need to create a ```config/environments/test/settings.js``` based on the example file found there.

You'll need to provide a ```key```, ```token``` and ```board``` name.

***SUPER IMPORTANT NOTE***: When you run the tests, all existing lanes and cards on the named board will be archived. Do not, under any circumstances, reference a board that is currently in use. You should create a totally new board to reference for this code.

Make sure that peanut is installed:

```
npm install -g peanut
```

## Running the tests

```
make
```

## ToDo/Issues

* There is no support for paging and limits right now. If you are looking at a board with tons of actions, some might be missed.
* While TrelloEvents supports monitoring more than one board, emitted events are not board specifici.
