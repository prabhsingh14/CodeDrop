import express from 'express';
import { httpProxy } from 'http-proxy';

const app = express();
const port = 8000;

const BASE_PATH = '' // Set this to the base path of your S3 bucket or the path you want to proxy to
const proxy = httpProxy.createProxy();

app.use((req, res) => {
    const hostname = req.hostname;
    const subdomain = hostname.split('.')[0]; 

    const resolvesTo = `${BASE_PATH}/${subdomain}`;

    return proxy.web(req, res, { target: resolvesTo, changeOrigin: true})
})

proxy.on('proxyReq', (proxyReq, req, res) => {
    const url = req.url;
    if(url === '/') proxyReq.path += '/index.html'; 
})

app.listen(port, () => {
    console.log(`Reverse proxy server is running at http://localhost:${port}`);
});