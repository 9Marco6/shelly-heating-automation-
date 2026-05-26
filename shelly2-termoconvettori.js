// ============================================================
// SCRIPT SHELLY 2 - Controllo Termoconvettori
// Dispositivo: Shelly Plus 2PM (IP: 192.168.x.x)
// Canale 1 (switch:0) = Termoconvettore Scuola di Musica
// Canale 2 (switch:1) = Termoconvettore Sala Riunioni
// ============================================================

var IP1="192.168.x.x"; // IP del primo Shelly
var TG_TOKEN="IL_TUO_TOKEN";
var TG_CHAT="IL_TUO_CHAT_ID";
var avviso0=0;
var avviso1=0;
function tg(msg){Shelly.call("HTTP.GET",{url:"https://api.telegram.org/bot"+TG_TOKEN+"/sendMessage?chat_id="+TG_CHAT+"&text="+msg,timeout:10,ssl_ca:"*"},null);}
Shelly.addStatusHandler(function(e){if(e.component!=="switch:0"&&e.component!=="switch:1")return;if(typeof e.delta.output==="undefined")return;if(!e.delta.output)return;var src=e.delta.source;if(src==="loopback")return;Shelly.call("HTTP.GET",{url:"http://"+IP1+"/rpc/Switch.GetStatus?id=0"},function(r,err,msg){if(err!==0)return;var res=JSON.parse(r.body);if(!res.output){Shelly.call("Switch.Set",{id:0,on:false},null);Shelly.call("Switch.Set",{id:1,on:false},null);}});});
Timer.set(30000,true,function(){var s0=Shelly.getComponentStatus("switch:0");var s1=Shelly.getComponentStatus("switch:1");if(s0&&s0.output&&s0.apower<5){if(avviso0===0){tg("Termoconvettore%20Scuola%20di%20Musica%20spento%20manualmente!");avviso0=1;}else if(avviso0===10){tg("Termoconvettore%20Scuola%20di%20Musica%20ancora%20spento!");avviso0=11;}else if(avviso0<10){avviso0++;}}else{avviso0=0;}if(s1&&s1.output&&s1.apower<5){if(avviso1===0){tg("Termoconvettore%20Sala%20Riunioni%20spento%20manualmente!");avviso1=1;}else if(avviso1===10){tg("Termoconvettore%20Sala%20Riunioni%20ancora%20spento!");avviso1=11;}else if(avviso1<10){avviso1++;}}else{avviso1=0;}});
Timer.set(60000,true,function(){print("vivo");});
print("ok");
