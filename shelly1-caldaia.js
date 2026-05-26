// ============================================================
// SCRIPT SHELLY 1 - Controllo Caldaia
// Dispositivo: Shelly Plus 2PM (IP: 192.168.x.x)
// Canale 1 (switch:0) = Caldaia
// Canale 2 (switch:1) = Programma Antigelo
// ============================================================

var IP2="192.168.x.x"; // IP del secondo Shelly
var modo="auto";
var TG_TOKEN="IL_TUO_TOKEN";
var TG_CHAT="IL_TUO_CHAT_ID";
var avvisoBlocco=0;
function tg(msg){Shelly.call("HTTP.GET",{url:"https://api.telegram.org/bot"+TG_TOKEN+"/sendMessage?chat_id="+TG_CHAT+"&text="+msg,timeout:10,ssl_ca:"*"},null);}
function s2(id,on){Shelly.call("HTTP.GET",{url:"http://"+IP2+"/rpc/Switch.Set?id="+id+"&on="+on},null);}
function giorno(){var g=new Date().getDay();if(g===0)return 0;if(g===4)return 2;return 1;}
function caldaiaOn(){Shelly.call("Switch.Set",{id:1,on:false},null);if(modo==="manuale"){s2(0,"true");s2(1,"true");}else{var t=giorno();s2(0,t===1?"true":"false");s2(1,t===2?"true":"false");}}
function caldaiaOff(){var m=new Date().getMonth();var invernale=(m>=9||m<=2);Shelly.call("Switch.Set",{id:1,on:invernale},null);s2(0,"false");s2(1,"false");}
function notifica(on,source){var stato=on?"ACCESA":"SPENTA";var src=(source==="button")?"(manuale)":(source==="shc"||source==="SHC"||source==="HTTP_in")?"(da%20app)":"(automatico)";tg("Caldaia%20"+stato+"%20"+src);}
Shelly.addStatusHandler(function(e){if(e.component==="switch:0"&&typeof e.delta.output!=="undefined"){var src=e.delta.source;if(src==="button"){if(e.delta.output){modo="manuale";caldaiaOn();}else{modo="auto";caldaiaOff();}notifica(e.delta.output,"button");}else if(src==="shc"||src==="SHC"||src==="HTTP_in"){if(e.delta.output){if(modo!=="manuale"){caldaiaOn();}}else{caldaiaOff();}notifica(e.delta.output,"shc");}else if(src==="loopback"&&modo!=="manuale"){if(e.delta.output){caldaiaOn();}else{caldaiaOff();}notifica(e.delta.output,"auto");}}if(e.component==="switch:1"&&typeof e.delta.output!=="undefined"&&e.delta.output){var c=Shelly.getComponentStatus("switch:0");if(c&&c.output){Shelly.call("Switch.Set",{id:1,on:false},null);}}if(e.component==="input:1"&&typeof e.delta.state!=="undefined"){if(e.delta.state){tg("Caldaia%20in%20BLOCCO!");avvisoBlocco=1;}else{tg("Caldaia%20sbloccata!");avvisoBlocco=0;}}});
Timer.set(30000,true,function(){var inp=Shelly.getComponentStatus("input:1");if(inp&&inp.state){if(avvisoBlocco===10){tg("Caldaia%20ancora%20in%20BLOCCO!");avvisoBlocco=11;}else if(avvisoBlocco>0&&avvisoBlocco<10){avvisoBlocco++;}}else{avvisoBlocco=0;}});
Timer.set(60000,true,function(){print("vivo|"+modo);});
print("ok");
