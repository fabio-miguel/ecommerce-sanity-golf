import {RemixServer} from '@remix-run/react';
import {EntryContext} from '@shopify/remix-oxygen';
import isbot from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {generateNonce, NonceProvider} from '~/lib/nonce';

export default async function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  remixContext,
) {
  let nonce; // You can specify the type if needed: string | undefined
  if (process.env.NODE_ENV === 'production') {
    nonce = generateNonce();
    // You can uncomment the following lines when needed
    // responseHeaders.set(
    //   'Content-Security-Policy',
    //   `script-src 'nonce-${nonce}' 'strict-dynamic' cdn.shopify.com; object-src 'none'; base-uri 'none';`
    // );
  }

  const body = await renderToReadableStream(
    <NonceProvider value={nonce}>
      <RemixServer context={remixContext} url={request.url} />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        console.error(error); // eslint-disable-line no-console
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
