const express = require('express');
const path = require('path');
const puppeteer = require('puppeteer');
const app = express();
const PORT = process.env.PORT || 3000;

let browser, page;
let currentTarget = 'https://www.freeshot.live/live-tv/cmtv/330';
let lastM3u8 = null;

// SSE clients
let clients = new Set();

app.get('/events', (req,res)=>{
  res.writeHead(200,{
    'Content-Type':'text/event-stream',
    'Cache-Control':'no-cache',
    Connection:'keep-alive'
  });
  clients.add(res);
  res.write(`event:init\ndata:${JSON.stringify({m3u8:lastM3u8,target:currentTarget})}\n\n`);
  req.on('close',()=>clients.delete(res));
});

app.get('/set-target',(req,res)=>{
  const url = req.query.url;
  if(!url) return res.status(400).json({error:"missing url"});
  currentTarget = url;
  if(global.reloadTarget) global.reloadTarget();
  return res.json({ok:true,target:currentTarget});
});

app.use('/',express.static(__dirname)); // serve root index.html

function broadcast(m3u8){
  lastM3u8 = m3u8;
  const payload = JSON.stringify({m3u8,target:currentTarget,ts:Date.now()});
  for(const c of clients){
    c.write(`event:update\ndata:${payload}\n\n`);
  }
}

function extract(url){
  return /\.m3u8(\?|$)/i.test(url) ? url : null;
}

async function start(){
  browser = await puppeteer.launch({headless:true,args:['--no-sandbox']});
  page = await browser.newPage();

  page.on('request',req=>{
    const url = req.url();
    const m = extract(url);
    if(m && m!== lastM3u8) broadcast(m);
  });

  page.on('response',async res=>{
    const url = res.url();
    if(/\.m3u8(\?|$)/i.test(url)){
      if(url!== lastM3u8) broadcast(url);
    }
  });

  global.reloadTarget = async ()=>{
    await page.goto(currentTarget,{waitUntil:'networkidle2'});
  };

  await global.reloadTarget();
  setInterval(global.reloadTarget,8000);
}

app.listen(PORT,()=>{
  console.log('Running on http://localhost:'+PORT);
  start();
});
