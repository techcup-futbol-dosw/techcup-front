/**
 * @file src\App.tsx
 * @description Main source file for the DemoFront application architecture.
 */
import { RouterProvider } from 'react-router';
import { router } from './core/routes/router';

export default function App() {
  return <RouterProvider router={router} />;
}



