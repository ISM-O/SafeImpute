import { useState } from "react";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { Home } from "./components/Home";
import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState("register");
  const [user, setUser] = useState(null);

  const handleSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage("login");
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <strong>APPLICATION D'AUTH-FACIALE</strong>
          <span>
            {user
              ? "Bienvenue sur votre espace personnel"
              : "Inscris-toi ou connecte-toi avec la caméra"}
          </span>
        </div>

        <div className="page-switch">
          {!user ? (
            <>
              <button
                type="button"
                className={currentPage === "register" ? "active" : ""}
                onClick={() => setCurrentPage("register")}
              >
                Inscription
              </button>
              <button
                type="button"
                className={currentPage === "login" ? "active" : ""}
                onClick={() => setCurrentPage("login")}
              >
                Connexion
              </button>
            </>
          ) : (
            <button type="button" onClick={handleLogout}>
              Déconnexion
            </button>
          )}
        </div>
      </header>

      <main className="app-content">
        {user ? (
          <Home user={user} onLogout={handleLogout} />
        ) : currentPage === "register" ? (
          <Register onSuccess={handleSuccess} />
        ) : (
          <Login onSuccess={handleSuccess} />
        )}
      </main>
    </div>
  );
}

export default App;
