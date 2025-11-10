/**
 * Application entry point
 * 
 * Initializes and renders the React app.
 * Mounts the <Main /> component into the root HTML element.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import Main from './Main.tsx';

/** Get root container element from index.html */
const container = document.getElementById('root');
if (!container) throw new Error('Root container not found');

/** Create React root and render the app */
const root = createRoot(container);
root.render(<Main />);