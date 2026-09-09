import React from 'react';
import {
  Link,
  useNavigate,
} from 'react-router-dom';
import './Navbar.css';

const IconHome = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line
      x1="6"
      y1="12"
      x2="10"
      y2="12"
    />

    <line
      x1="8"
      y1="10"
      x2="8"
      y2="14"
    />

    <line
      x1="15"
      y1="13"
      x2="15.01"
      y2="13"
    />

    <line
      x1="18"
      y1="11"
      x2="18.01"
      y2="11"
    />

    <rect
      x="2"
      y="6"
      width="20"
      height="12"
      rx="2"
    />
  </svg>
);

const IconConsoles = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect
      x="2"
      y="3"
      width="20"
      height="14"
      rx="2"
    />

    <line
      x1="8"
      y1="21"
      x2="16"
      y2="21"
    />

    <line
      x1="12"
      y1="17"
      x2="12"
      y2="21"
    />
  </svg>
);

const IconGames = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path
      d="
        M6 11
        h4
      "
    />

    <path
      d="
        M8 9
        v4
      "
    />

    <path
      d="
        M15 12
        h.01
      "
    />

    <path
      d="
        M18 10
        h.01
      "
    />

    <path
      d="
        M17.3 5
        H6.7
        a4 4 0 0 0-3.8 2.7
        L1.5 12
        a4 4 0 0 0
        6.8 3.9
        L10 14
        h4
        l1.7 1.9
        a4 4 0 0 0
        6.8-3.9
        l-1.4-4.3
        A4 4 0 0 0
        17.3 5
        Z
      "
    />
  </svg>
);

const IconDice = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect
      x="2"
      y="2"
      width="20"
      height="20"
      rx="5"
    />

    <path d="M16 8h.01" />
    <path d="M8 8h.01" />
    <path d="M8 16h.01" />
    <path d="M16 16h.01" />
    <path d="M12 12h.01" />
  </svg>
);

const IconLibrary = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path
      d="
        M4 19.5
        A2.5 2.5 0 0 1
        6.5 17
        H20
      "
    />

    <path
      d="
        M6.5 2
        H20
        v20
        H6.5
        A2.5 2.5 0 0 1
        4 19.5
        v-15
        A2.5 2.5 0 0 1
        6.5 2
        Z
      "
    />
  </svg>
);

const IconBeyblade = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle
      cx="12"
      cy="12"
      r="8"
    />

    <circle
      cx="12"
      cy="12"
      r="3"
    />

    <path d="M12 2v4" />
    <path d="M12 18v4" />
    <path d="M2 12h4" />
    <path d="M18 12h4" />
  </svg>
);

const IconSuggestion = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path
      d="
        M21 15
        a2 2 0 0 1-2 2
        H7
        l-4 4
        V5
        a2 2 0 0 1 2-2
        h14
        a2 2 0 0 1 2 2
        z
      "
    />

    <line
      x1="9"
      y1="10"
      x2="15"
      y2="10"
    />

    <line
      x1="12"
      y1="7"
      x2="12"
      y2="13"
    />
  </svg>
);

const IconGhost = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path
      d="
        M9 22
        v-2
        a2.5 2.5 0 0 1 5 0
        v2
      "
    />

    <path
      d="
        M4.8 18.2
        A9 9 0 1 1
        19.2 18.2
      "
    />

    <path d="M10 9h.01" />
    <path d="M14 9h.01" />
  </svg>
);

const IconUser = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path
      d="
        M20 21
        v-2
        a4 4 0 0 0-4-4
        H8
        a4 4 0 0 0-4 4
        v2
      "
    />

    <circle
      cx="12"
      cy="7"
      r="4"
    />
  </svg>
);

const IconLogout = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path
      d="
        M9 21
        H5
        a2 2 0 0 1-2-2
        V5
        a2 2 0 0 1 2-2
        h4
      "
    />

    <polyline
      points="16 17 21 12 16 7"
    />

    <line
      x1="21"
      y1="12"
      x2="9"
      y2="12"
    />
  </svg>
);

function Navbar() {
  const navigate =
    useNavigate();

  const isGuest =
    !localStorage.getItem(
      'token'
    );

  const myUsername =
    localStorage.getItem(
      'username'
    );

  const handleLogout = () => {
    localStorage.removeItem(
      'token'
    );

    localStorage.removeItem(
      'username'
    );

    localStorage.removeItem(
      'user_id'
    );

    localStorage.removeItem(
      'email'
    );

    navigate('/login');
  };

  return (
    <nav className="main-navbar">

      <div className="nav-brand">
        <Link to="/home">
          GEEK'S JOURNEY
        </Link>
      </div>

      <div className="nav-links">

        <Link
          to="/home"
          className="nav-link"
        >
          <IconHome />
          Home
        </Link>

        <Link
          to="/games"
          className="nav-link"
        >
          <IconGames />
          Jogos
        </Link>

        <Link
          to="/consoles"
          className="nav-link"
        >
          <IconConsoles />
          Consoles
        </Link>

        <Link
          to="/boardgames"
          className="nav-link"
        >
          <IconDice />
          Tabuleiro
        </Link>

        <Link
          to="/library"
          className="nav-link"
        >
          <IconLibrary />
          Biblioteca
        </Link>

        <Link
          to="/beyblade"
          className="nav-link"
        >
          <IconBeyblade />
          Beyblade
        </Link>

        <Link
          to="/pokemon"
          className="nav-link"
        >
          <IconGhost />
          Pokémon
        </Link>

        <Link
          to="/sugestoes"
          className="nav-link"
        >
          <IconSuggestion />
          Sugestões
        </Link>

        <Link
          to={
            isGuest
              ? '/login'
              : `/profile/${myUsername}`
          }
          className="nav-link"
        >
          <IconUser />
          Perfil
        </Link>

      </div>

      {isGuest ? (
        <div className="nav-auth">

          <Link
            to="/register"
            className="nav-register"
          >
            Cadastrar
          </Link>

          <Link
            to="/login"
            className="
              btn-logout
              nav-login
            "
          >
            Entrar
          </Link>

        </div>
      ) : (
        <button
          type="button"
          onClick={handleLogout}
          className="btn-logout"
          title="Sair do sistema"
        >
          <IconLogout />
          Sair
        </button>
      )}

    </nav>
  );
}

export default Navbar;