import express from 'express';
import next from 'next';
import nextI18NextMiddleware from 'next-i18next/middleware';
import nextI18next from './i18n';

const port = process.env.PORT || 3000;
const app = next({ dev: process.env.NODE_ENV !== 'production' });
const appHandler = app.getRequestHandler();

(async () => {
    await app.prepare();
    await nextI18next.initPromise;

    await express()
        .use(nextI18NextMiddleware(nextI18next))
        .get('*', (req, res) => appHandler(req, res))
        .listen(port);
})();
