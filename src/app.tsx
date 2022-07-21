import * as React from "react";
import { createRoot } from 'react-dom/client';

function render() {
    const container = document.body;
    const root = createRoot(container); // createRoot(container!) if you use TypeScript

    root.render(<p>Hello react!</p>)
}

render();