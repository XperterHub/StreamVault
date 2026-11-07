const http = require('http');
const { spawn } = require('child_process');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chromeProcess = spawn(chromePath, [
  '--headless',
  '--remote-debugging-port=9222',
  '--disable-gpu',
  'https://gen-lang-client-0020597755.web.app/profile'
]);

setTimeout(() => {
  http.get('http://127.0.0.1:9222/json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const list = JSON.parse(data);
        const page = list.find(p => p.type === 'page');
        if (!page) {
          console.log('No page found in Chrome');
          chromeProcess.kill();
          process.exit(1);
        }
        console.log('Target Page:', page.url);
        console.log('WebSocket URL:', page.webSocketDebuggerUrl);

        const ws = new globalThis.WebSocket(page.webSocketDebuggerUrl);
        ws.addEventListener('open', () => {
          ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
          ws.send(JSON.stringify({ id: 2, method: 'Log.enable' }));
          ws.send(JSON.stringify({ id: 3, method: 'Page.enable' }));
        });

        ws.addEventListener('message', (event) => {
          const msg = JSON.parse(event.data);
          if (msg.method === 'Runtime.exceptionThrown') {
            console.error('EXCEPTION:', JSON.stringify(msg.params.exceptionDetails, null, 2));
          } else if (msg.method === 'Runtime.consoleAPICalled') {
            console.log('CONSOLE:', msg.params.type, msg.params.args.map(a => a.value || a.description).join(' '));
          }
        });

        setTimeout(() => {
          ws.close();
          chromeProcess.kill();
          process.exit(0);
        }, 5000);
      } catch (err) {
        console.error(err);
        chromeProcess.kill();
        process.exit(1);
      }
    });
  }).on('error', (err) => {
    console.error('Failed to connect to Chrome debug port:', err);
    chromeProcess.kill();
    process.exit(1);
  });
}, 2000);
