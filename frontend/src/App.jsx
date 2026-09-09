import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Home from "./pages/HomePage.jsx";
import BoardGamePage from "./pages/BoardGamePage";
import BoardGameDetailsPage from "./pages/BoardGameDetailPage.jsx";
import ConsolesPage from "./pages/ConsolesPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import PokemonPage from "./pages/PokemonPage.jsx";
import PokemonHallOfFame from "./pages/PokemonHallOfFame.jsx";
import SuggestionsPage from "./pages/SuggestionsPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

import GamesPage from "./pages/GamesPage.jsx";
import LibraryPage from "./pages/LibraryPage.jsx";
import BeybladePage from "./pages/BeybladePage.jsx";


const PrivateRoute = ({ children }) => {
  const isAuthenticated =
    !!localStorage.getItem(
      "token"
    );

  return isAuthenticated
    ? children
    : <Navigate to="/register" />;
};


function App() {
  return (
    <Routes>

      {/* RAIZ */}
      <Route
        path="/"
        element={
          <Navigate to="/home" />
        }
      />


      {/* HOME */}
      <Route
        path="/home"
        element={<Home />}
      />


      {/* LOGIN */}
      <Route
        path="/login"
        element={<LoginPage />}
      />


      {/* CADASTRO */}
      <Route
        path="/register"
        element={<RegisterPage />}
      />

      <Route
        path="/cadastro"
        element={<RegisterPage />}
      />


      {/* PERFIL */}
      <Route
        path="/profile/:username?"
        element={<ProfilePage />}
      />


      {/* JOGOS DE TABULEIRO */}
      <Route
        path="/boardgames"
        element={<BoardGamePage />}
      />

      <Route
        path="/boardgames/:id"
        element={
          <BoardGameDetailsPage />
        }
      />


      {/* CONSOLES */}
      <Route
        path="/consoles"
        element={<ConsolesPage />}
      />


      {/* JOGOS */}
      <Route
        path="/games"
        element={<GamesPage />}
      />


      {/* BIBLIOTECA */}
      <Route
        path="/library"
        element={<LibraryPage />}
      />


      {/* BEYBLADE */}
      <Route
        path="/beyblade"
        element={<BeybladePage />}
      />


      {/* POKÉMON */}
      <Route
        path="/pokemon"
        element={<PokemonPage />}
      />

      <Route
        path="/pokemon/hall-of-fame"
        element={<PokemonHallOfFame />}
      />


      {/* SUGESTÕES */}
      <Route
        path="/sugestoes"
        element={<SuggestionsPage />}
      />

    </Routes>
  );
}

export default App;