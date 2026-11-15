// Compatibility entry point; Vite serves the existing app without a backend.
import {createServer} from 'vite';
const server=await createServer({server:{host:'0.0.0.0'}});
await server.listen();
server.printUrls();
