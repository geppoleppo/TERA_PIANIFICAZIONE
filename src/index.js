import { createRoot } from 'react-dom/client';
import './index.css';
import React from 'react';
import App from './App';

// Configura la chiave di licenza direttamente nel codice
import { registerLicense } from '@syncfusion/ej2-base';
registerLicense('Ngo9BigBOggjHTQxAR8/V1NBaF5cXmZCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdnWXpcdnVVQmZeUEx3WUc=');

const root = createRoot(document.getElementById('sample'));
root.render(<App />);
