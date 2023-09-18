import {useState, useEffect} from 'react';

// @feedback - This hook could be replaced by remix-utils's ow hook should we want to go down this route.
export function useIsHydrated() {
  const [isHydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Added setTimeout
    setTimeout(() => setHydrated(true), 200);
  }, []);

  return isHydrated;
}

// NOTES:
// Added setTimeout
// This is to provide a small delay before useState isHydrated will be set to true
// This may be unecessary, but is a precaution to avoid console error where
// Suspense boundary recieves update before it finishes hydrating thus switching to client rendering
