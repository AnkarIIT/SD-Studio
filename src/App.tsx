import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import StorefrontPage from './pages/StorefrontPage';
import ProductPage from './pages/ProductPage';
import AdminPage from './pages/AdminPage';
import ContentPage from './pages/ContentPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StorefrontPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/admin-control-7x9k2m4p" element={<AdminPage />} />
        <Route path="/about" element={<ContentPage slug="about" />} />
        <Route path="/privacy" element={<ContentPage slug="privacy" />} />
        <Route path="/terms" element={<ContentPage slug="terms" />} />
        <Route path="/shipping" element={<ContentPage slug="shipping" />} />
        <Route path="/returns" element={<ContentPage slug="returns" />} />
        <Route path="/contact" element={<ContentPage slug="contact" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}