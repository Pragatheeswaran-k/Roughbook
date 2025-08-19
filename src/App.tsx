// App.tsx
import { Routes, Route, Outlet } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/LoginPage";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import IndexPage from "./pages/IndexPage";
import Layout from "./components/layout/Layout";
import RoughNote from "./pages/RoughNote";
import ExpenseTracker from "./components/homepage/ExpenseTracker";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<IndexPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/index-page" element={<IndexPage />} />
          <Route path="/page/:id" element={<RoughNote />} />
          <Route path="/expenses" element={<ExpenseTracker />} />
        </Route>
      </Routes>
    </Layout>
  );
}

export default App;
