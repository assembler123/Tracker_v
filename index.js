const WebSocket = require("ws");
const express = require("express");
const app = express();
const cors = require("cors")
const path = require("path")
const wss = new WebSocket.Server({port:4500})
loc = {}
wss.on("connection",(wc,req)=>{
    console.log("Connected",req.url)
    tck_id = req.url.split("/")[1]|0
    console.log(tck_id)
    wc["TRACK"] = tck_id
    if(tck_id){
        if(loc[tck_id]){
            wc.send(JSON.stringify({
                type:"LOC_INIT",
                ...loc[tck_id]
            }))
        }
        else{
            wc.send(JSON.stringify({
            type:"ERR_404",
            msg:"No Such User Found"}))
        }
    }
    wc.on("message",(e)=>{
        console.log(e.toString());
        try{
        st = e.toString()
        if(st == "ping"){
            wc.send("pong")
        }else{
        obj = JSON.parse(st);
        loc[obj.id] = obj.type == "LOC_UPDATE"?{ Lat:obj.lat,Long:obj.long}:{Lat:loc[obj.id].Lat|0,Long:loc[obj.id].Long|0};
        wss.clients.forEach(e=>{
            if(e.TRACK == obj.id){
                e.send(JSON.stringify({
                    type:"LOC_SEND",
                    ...loc[obj.id]
                }))
            }
        })
    }
    }catch(e){
            console.log(e)
        }
    })
})
app.use(cors())
app.use('*', express.static(path.join(__dirname, 'public')))

app.listen(3000,()=>{
    console.log("Port opened 3000")
})