/**
 * Application Entry Point
 * 
 * Initializes React application and mounts root component to DOM.
 * 
 * @fileoverview
 * This file is the entry point for the client-side React application.
 * It:
 * - Creates React root
 * - Renders App component into DOM
 * - Imports global CSS styles
 * 
 * @author Lindsey Stead
 * @module client/main
 */

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css"; // Import global CSS styles (Tailwind, custom styles)

// ============================================================================
// APPLICATION INITIALIZATION
// ============================================================================

// Create React root from DOM element
// getElementById("root") gets the root div from index.html
// ! tells TypeScript we're sure this element exists
const rootElement = document.getElementById("root")!;

// Create React 18 root for concurrent rendering
const root = createRoot(rootElement);

// Render App component into root element
// This starts the React application
root.render(<App />);
