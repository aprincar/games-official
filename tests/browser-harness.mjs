import fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function findChrome() {
  const candidates = [
    process.env.CHROME_BIN,
    'google-chrome',
    'google-chrome-stable',
    'chromium',
    'chromium-browser',
  ].filter(Boolean);
  for (const candidate of candidates) {
    const probe = spawnSync(candidate, ['--version'], { encoding: 'utf8' });
    if (probe.status === 0) return candidate;
  }
  throw new Error('Chrome/Chromium nao encontrado. Defina CHROME_BIN ou instale google-chrome/chromium.');
}

async function freePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  await new Promise((resolve) => server.close(resolve));
  return port;
}

function mimeType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8';
  if (filePath.endsWith('.js') || filePath.endsWith('.mjs')) return 'text/javascript; charset=utf-8';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  return 'application/octet-stream';
}

async function startStaticServer() {
  const server = http.createServer((req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url || '/', 'http://127.0.0.1').pathname);
      if (pathname === '/favicon.ico') {
        res.writeHead(204).end();
        return;
      }
      const resolved = path.resolve(ROOT, '.' + pathname);
      if (resolved !== ROOT && !resolved.startsWith(ROOT + path.sep)) {
        res.writeHead(403).end('forbidden');
        return;
      }
      const stat = fs.statSync(resolved);
      if (!stat.isFile()) {
        res.writeHead(404).end('not found');
        return;
      }
      res.writeHead(200, {
        'content-type': mimeType(resolved),
        'cache-control': 'no-store',
      });
      fs.createReadStream(resolved).pipe(res);
    } catch {
      res.writeHead(404).end('not found');
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  return {
    baseUrl: 'http://127.0.0.1:' + port,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

class CdpClient {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.nextId = 1;
    this.pending = new Map();
    this.pageErrors = [];
  }

  async connect() {
    this.ws = new WebSocket(this.url);
    await new Promise((resolve, reject) => {
      const onOpen = () => resolve();
      const onError = (event) => reject(event.error || new Error('Falha ao conectar ao CDP'));
      this.ws.addEventListener('open', onOpen, { once: true });
      this.ws.addEventListener('error', onError, { once: true });
    });
    this.ws.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data));
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result || {});
        return;
      }
      if (message.method === 'Runtime.exceptionThrown') {
        const details = message.params && message.params.exceptionDetails;
        this.pageErrors.push(
          (details && details.exception && details.exception.description) ||
          (details && details.text) ||
          'Runtime.exceptionThrown'
        );
      }
      if (message.method === 'Log.entryAdded') {
        const entry = message.params && message.params.entry;
        if (entry && entry.level === 'error') this.pageErrors.push(entry.text);
      }
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const response = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
      userGesture: true,
    });
    if (response.exceptionDetails) {
      const details = response.exceptionDetails;
      const description = details.exception && details.exception.description;
      throw new Error(description || details.text || 'Falha ao avaliar expressao no browser');
    }
    return response.result && response.result.value;
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function waitForJsonEndpoint(url, attempts = 200) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch (error) {
      lastError = error;
    }
    await sleep(100);
  }
  throw lastError || new Error('Chrome DevTools nao respondeu em ' + url);
}

function hostPrelude(options = {}) {
  const recognized = options.handwritingRecognized !== false;
  return [
    '(() => {',
    '  const host = window.__APRINCAR_TEST_HOST__ = { events: [], storage: Object.create(null), handwritingRecognized: ' + (recognized ? 'true' : 'false') + ' };',
    '  const respond = (port, message, payload) => port.postMessage({ type: "host.response", requestId: message.requestId, ok: true, payload });',
    '  addEventListener("DOMContentLoaded", () => {',
    '    const channel = new MessageChannel();',
    '    channel.port1.onmessage = (event) => {',
    '      const message = event.data;',
    '      host.events.push({ type: message && message.type, payload: message && message.payload || null });',
    '      if (!message || !message.requestId) return;',
    '      const payload = message.payload || {};',
    '      if (message.type === "storage.set") { host.storage[payload.key] = payload.value; respond(channel.port1, message, { stored: true }); return; }',
    '      if (message.type === "storage.get") { respond(channel.port1, message, host.storage[payload.key] ?? null); return; }',
    '      if (message.type === "storage.remove") { delete host.storage[payload.key]; respond(channel.port1, message, { removed: true }); return; }',
    '      if (message.type === "capability.request") {',
    '        if (payload.name === "handwriting.evaluate") { respond(channel.port1, message, { recognized: host.handwritingRecognized, confidence: host.handwritingRecognized ? 0.96 : 0.25 }); return; }',
    '        respond(channel.port1, message, { granted: true }); return;',
    '      }',
    '      if (message.type === "session.start") { respond(channel.port1, message, { sessionId: "browser-quality-session" }); return; }',
    '      if (message.type === "evidence.submit") { respond(channel.port1, message, { accepted: true }); return; }',
    '      if (message.type === "reward.request") { respond(channel.port1, message, { granted: true }); return; }',
    '      respond(channel.port1, message, {});',
    '    };',
    '    channel.port1.start();',
    '    window.postMessage({ type: "APRINCAR_CONNECT", protocolVersion: 1 }, "*", [channel.port2]);',
    '  }, { once: true });',
    '})();',
  ].join('\n');
}

async function launchChrome() {
  const chrome = findChrome();
  const debugPort = await freePort();
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aprincar-browser-quality-'));
  const args = [
    '--headless=new',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-background-networking',
    '--disable-default-apps',
    '--disable-extensions',
    '--disable-sync',
    '--metrics-recording-only',
    '--mute-audio',
    '--no-first-run',
    '--remote-allow-origins=*',
    '--remote-debugging-port=' + debugPort,
    '--user-data-dir=' + userDataDir,
    '--window-size=960,640',
    'about:blank',
  ];
  const processRef = spawn(chrome, args, { stdio: ['ignore', 'ignore', 'pipe'] });
  let stderr = '';
  processRef.stderr.on('data', (chunk) => { stderr += String(chunk); });

  try {
    await waitForJsonEndpoint('http://127.0.0.1:' + debugPort + '/json/version');
  } catch (error) {
    processRef.kill('SIGKILL');
    throw new Error('Chrome headless nao iniciou: ' + error.message + '\n' + stderr);
  }

  return {
    debugPort,
    processRef,
    userDataDir,
    async close() {
      if (processRef.exitCode === null) processRef.kill('SIGTERM');
      await sleep(100);
      if (processRef.exitCode === null) processRef.kill('SIGKILL');
      fs.rmSync(userDataDir, { recursive: true, force: true });
    },
  };
}

async function createPage(debugPort, initSource, viewport = {}) {
  const response = await fetch(
    'http://127.0.0.1:' + debugPort + '/json/new?' + encodeURIComponent('about:blank'),
    { method: 'PUT' }
  );
  if (!response.ok) throw new Error('Falha ao criar target CDP: HTTP ' + response.status);
  const target = await response.json();
  const client = new CdpClient(target.webSocketDebuggerUrl);
  await client.connect();
  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('Log.enable');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: viewport.width ?? 960,
    height: viewport.height ?? 640,
    deviceScaleFactor: viewport.deviceScaleFactor ?? 1,
    mobile: viewport.mobile ?? false,
  });
  await client.send('Page.addScriptToEvaluateOnNewDocument', { source: initSource });
  return { client, targetId: target.id };
}

async function closeTarget(debugPort, targetId) {
  try {
    await fetch('http://127.0.0.1:' + debugPort + '/json/close/' + targetId);
  } catch {}
}

export async function startBrowserHarness() {
  const server = await startStaticServer();
  const chrome = await launchChrome();

  async function openGame(slug, options = {}) {
    const page = await createPage(chrome.debugPort, hostPrelude(options), options.viewport);
    const client = page.client;
    if (options.touch === true) {
      await client.send('Emulation.setTouchEmulationEnabled', {
        enabled: true,
        maxTouchPoints: 5,
      });
    }
    const url = server.baseUrl + '/games/' + slug + '/game.html';
    await client.send('Page.navigate', { url });

    await waitFor(async () => (await client.evaluate('document.readyState')) === 'complete', {
      label: slug + ': document.readyState',
    });
    await waitFor(async () => {
      const state = await client.evaluate('window.__APRINCAR_GAME_STATE__ ?? null');
      return state && state.inputReady === true ? state : false;
    }, { label: slug + ': inputReady', timeoutMs: 12000 });

    return {
      slug,
      client,
      async state() {
        return client.evaluate('window.__APRINCAR_GAME_STATE__ ?? null');
      },
      async host() {
        return client.evaluate('window.__APRINCAR_TEST_HOST__ ?? null');
      },
      async close() {
        client.close();
        await closeTarget(chrome.debugPort, page.targetId);
      },
    };
  }

  return {
    openGame,
    async close() {
      await chrome.close();
      await server.close();
    },
  };
}

export async function waitFor(predicate, options = {}) {
  const timeoutMs = options.timeoutMs || 5000;
  const intervalMs = options.intervalMs || 25;
  const label = options.label || 'condicao';
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const result = await predicate();
      if (result) return result;
    } catch (error) {
      lastError = error;
    }
    await sleep(intervalMs);
  }
  if (lastError) throw new Error('Timeout aguardando ' + label + ': ' + lastError.message);
  throw new Error('Timeout aguardando ' + label);
}

export function targetBy(state, kind, value) {
  const target = (state && state.targets || []).find((candidate) =>
    candidate.kind === kind && (value === undefined || candidate.value === value)
  );
  if (!target) throw new Error('Target nao encontrado: kind=' + kind + ' value=' + String(value));
  return target;
}

export function targetCenter(target) {
  if (Number.isFinite(target?.x) && Number.isFinite(target?.y)) {
    return { x: target.x, y: target.y };
  }
  if (target?.normalized) {
    return {
      x: target.normalized.x * 960,
      y: target.normalized.y * 640
    };
  }
  throw new Error('Target sem coordenadas utilizaveis');
}

export async function mouseTap(client, point) {
  await client.send('Input.dispatchMouseEvent', {
    type: 'mousePressed', x: point.x, y: point.y, button: 'left', buttons: 1, clickCount: 1,
  });
  await client.send('Input.dispatchMouseEvent', {
    type: 'mouseReleased', x: point.x, y: point.y, button: 'left', buttons: 0, clickCount: 1,
  });
}

export async function mouseDrag(client, from, to, steps = 8) {
  await client.send('Input.dispatchMouseEvent', {
    type: 'mouseMoved', x: from.x, y: from.y, button: 'none', buttons: 0,
  });
  await client.send('Input.dispatchMouseEvent', {
    type: 'mousePressed', x: from.x, y: from.y, button: 'left', buttons: 1, clickCount: 1,
  });
  await sleep(24);
  for (let i = 1; i <= steps; i++) {
    const ratio = i / steps;
    await client.send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x: from.x + (to.x - from.x) * ratio,
      y: from.y + (to.y - from.y) * ratio,
      button: 'left',
      buttons: 1,
    });
    await sleep(18);
  }
  await sleep(24);
  await client.send('Input.dispatchMouseEvent', {
    type: 'mouseReleased', x: to.x, y: to.y, button: 'left', buttons: 0, clickCount: 1,
  });
}

export async function touchTap(client, point) {
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: point.x, y: point.y, id: 1, radiusX: 1, radiusY: 1, force: 1 }],
  });
  await sleep(36);
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(24);
}

export async function touchDrag(client, from, to, steps = 8) {
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: from.x, y: from.y, id: 1, radiusX: 1, radiusY: 1, force: 1 }],
  });
  await sleep(24);
  for (let i = 1; i <= steps; i++) {
    const ratio = i / steps;
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{
        x: from.x + (to.x - from.x) * ratio,
        y: from.y + (to.y - from.y) * ratio,
        id: 1,
        radiusX: 1,
        radiusY: 1,
        force: 1,
      }],
    });
    await sleep(18);
  }
  await sleep(24);
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

export async function waitForResult(page, result, timeoutMs = 2500) {
  return waitFor(async () => {
    const state = await page.state();
    return state && state.lastResult === result ? state : false;
  }, { label: page.slug + ': lastResult=' + result, timeoutMs });
}

export async function waitForInputReady(page, timeoutMs = 3000) {
  return waitFor(async () => {
    const state = await page.state();
    return state && state.inputReady === true ? state : false;
  }, { label: page.slug + ': inputReady', timeoutMs });
}

export function assertNoPageErrors(page) {
  if (page.client.pageErrors.length) {
    throw new Error(page.slug + ': erros no browser:\n' + page.client.pageErrors.join('\n'));
  }
}
