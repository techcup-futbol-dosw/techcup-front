/**
 * @file src\main.tsx
 * @description Main source file for the DemoFront application architecture.
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from "@/core/auth/AuthContext.tsx";
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AuthProvider>
            <App />
        </AuthProvider>
    </React.StrictMode>,
)


