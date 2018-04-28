"use strict";
var startedDate = new Date();
var http = require('http');
module.exports = {
    listen:function(){
        const PORT=process.env.PORT || 5000;
        function handleRequest(request:any, response:any){
                response.end("Alive since: " + startedDate);

        }
        var server = http.createServer(handleRequest);
        server.listen(PORT, function(){
            //Callback triggered when server is successfully listening. Hurray!
            console.log("Server listening on: http://localhost:%s", PORT);
        });
    }
};


var http = require("http");
setInterval(function() {
    try{
        console.log("keep alive!");
        http.get("http://bk-feed-reader.herokuapp.com");
    }catch(e){
        console.log("Failed to ping myself..?", e);
    }
}, 30000); // every 30s (30000)