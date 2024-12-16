import React from "react";
import ReactDOM from "react-dom/client";

const Metadata = React.lazy(() => import('./Metadata.jsx'));

const elm = document.getElementById('root');
const root = ReactDOM.createRoot(elm);
root.render(
  <React.Suspense fallback="Загрузка...">
    <Metadata/>
  </React.Suspense>
);
