import { createReadStream, existsSync, statSync } from 'node:fs';
import { access } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const host = '127.0.0.1';
const port = Number(process.env.PORT || 4173);
const rootDir = process.cwd();
const resolvedRootDir = resolve(rootDir);

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8'
};

function resolveRequestPath(urlPath) {
  const decodedPath = decodeURIComponent(urlPath.split('?')[0]);
  const relativePath = decodedPath === '/' ? 'demo.html' : decodedPath.replace(/^\/+/, '');
  const normalizedPath = normalize(relativePath);
  return resolve(join(rootDir, normalizedPath));
}

function isPathInsideRoot(filePath) {
  return filePath.startsWith(resolvedRootDir);
}

async function sendFile(response, filePath) {
  const stats = statSync(filePath);
  const targetPath = stats.isDirectory() ? join(filePath, 'index.html') : filePath;

  await access(targetPath);

  const contentType = contentTypes[extname(targetPath)] || 'application/octet-stream';
  response.writeHead(200, { 'Content-Type': contentType });
  createReadStream(targetPath).pipe(response);
}

const server = createServer(async (request, response) => {
  try {
    const filePath = resolveRequestPath(request.url || '/');

    if (!isPathInsideRoot(filePath) || !existsSync(filePath)) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }

    await sendFile(response, filePath);
  } catch {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Unable to serve the requested file.');
  }
});

server.listen(port, host, () => {
  console.log(`Notepad demo available at http://${host}:${port}`);
});
