import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from './components/ProtectRoute/ProtectRoute'; 
import AdminPage from './pages/AdminPage/AdminPage.tsx';
import AdminDetails from './pages/AdminDetailsPage/AdminDetailsPage.tsx';
import LoginPage from './pages/LoginPage/LoginPage.tsx';
import HomePage from './pages/HomePage/HomePage.tsx';
import LandingPage from "./pages/LandingPage/LandingPage.tsx";
import ServicePage from "./pages/ServicesPage/ServicesPage.tsx";
import ServiceStatusPage from "./pages/ServicesStatus/ServicesStatusPage.tsx";
import BookService from "./pages/BookServicePage/BookServicePage.tsx";
import MyOrdersPage from "./pages/MyOrdersPage/MyOrdersPage.tsx";


export default function App() {
  
  return (
    <Router>
      <AuthProvider>
        <Routes>
        <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/services" element={<ServicePage />} />
          <Route path="/serviceStatus/:id" element={<ServiceStatusPage />} />
          <Route path="/bookService/:serviceId" element={<BookService />} />
          <Route path="/myorders" element={<MyOrdersPage />} />
          <Route element={<ProtectedRoute/>} >
            <Route element={<ProtectedRoute adminOnly={true} />}>
              <Route path="/admin" element={<AdminPage/>} />
              <Route path="/details/:id" element={<AdminDetails/>} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  )
}