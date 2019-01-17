var websocket = viola.requireAPI('webSocket')

var old = viola.tasker.receive

viola.tasker.receive = function (tasks) {
  if (!Array.isArray(tasks)) {
    // transform to Array from String
    tasks = JSON.parse(tasks)
  }
  var t = tasks[0]
  if (t.module == 'webSocket') {
    old.call(viola.tasker, tasks)
  }
  websocket.send(JSON.stringify(t));
}

var isCreateBody = 0
websocket.WebSocket('ws://10.65.89.48:3000','');
websocket.onopen(function (e){
  
});
websocket.onmessage(function (e){
  var data = JSON.parse(e.data);

  viola.tasker.sendTask(data)  

});
websocket.onerror(function (e){
  
});
websocket.onclose(function (e){
});