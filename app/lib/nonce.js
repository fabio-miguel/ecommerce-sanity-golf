import {createContext, useContext} from 'react';

/**
 * Generates a random base64-encoded string of 128 bits of data
 * from a cryptographically secure random number generator
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce#generating_values
 */
function generateNonce() {
  const nonce = crypto.getRandomValues(new Uint8Array(16));
  return btoa(String.fromCodePoint(...nonce));
}

// The default value (`undefined`) will be used on the client
const NonceContext = createContext(undefined);

const NonceProvider = NonceContext.Provider;

const useNonce = () => useContext(NonceContext);

export {generateNonce, NonceProvider, useNonce};
