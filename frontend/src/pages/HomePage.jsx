import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  Trophy,
  Star,
  Search,
  BookOpen,
  Dices,
  Gamepad2,
  FlaskConical,
  ChevronRight,
  Eye
} from 'lucide-react';

import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();

  const [videoGames, setVideoGames] = useState([]);
  const [popularProfiles, setPopularProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return 'https://via.placeholder.com/500x700?text=Sem+Capa';
    }

    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    const cleanPath = imagePath.startsWith('/')
      ? imagePath.substring(1)
      : imagePath;

    return `http://127.0.0.1:8000/${cleanPath}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gamesResponse, profilesResponse] = await Promise.all([
          api.get('library/'),
          api.get('profiles/?ordering=-profile_views')
        ]);

        const rawGames = Array.isArray(gamesResponse.data)
          ? gamesResponse.data
          : gamesResponse.data.results || [];

        const rawProfiles = Array.isArray(profilesResponse.data)
          ? profilesResponse.data
          : profilesResponse.data.results || [];

        const formattedGames = rawGames.map((entry) => {
          const gameData = entry.game_catalog || entry.game || {};

          return {
            id: entry.id,
            title: gameData.title || 'Jogo Sem Título',
            image: gameData.cover_image || gameData.cover_url,
            score: entry.rating || 0,
            genre: gameData.genre || 'Aventura',
            platform: gameData.platform || 'PC',
            description:
              gameData.description ||
              'Uma experiência marcante dentro do universo gamer.'
          };
        });

        setVideoGames(formattedGames);
        setPopularProfiles(rawProfiles.slice(0, 6));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      navigate(`/profile/${searchQuery.trim()}`);
    }
  };

  const sortedGames = [...videoGames]
    .filter((g) => g.score > 0)
    .sort((a, b) => b.score - a.score);

  const top3Games = sortedGames.slice(0, 3);
  const featuredGames = sortedGames.slice(0, 4);

  const CarouselRow = ({ title, games, icon }) => {
    const scrollRef = useRef();

    const scroll = (dir) => {
      scrollRef.current.scrollBy({
        left: dir === 'left' ? -400 : 400,
        behavior: 'smooth'
      });
    };

    if (!games.length) return null;

    return (
      <section className="carousel-section">
        <div className="section-header">
          <h2>
            {icon}
            {title}
          </h2>

          <button className="view-more-btn">
            Ver Mais
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="carousel-wrapper">
          <button
            className="nav-btn left"
            onClick={() => scroll('left')}
          >
            ‹
          </button>

          <div className="carousel-track" ref={scrollRef}>
            {games.map((game) => (
              <div className="modern-game-card" key={game.id}>
                <div className="game-image-wrapper">
                  <img
                    src={getImageUrl(game.image)}
                    alt={game.title}
                  />

                  <div className="game-score">
                    <Star size={14} />
                    {game.score}
                  </div>
                </div>

                <div className="game-card-content">
                  <span className="game-platform">
                    {game.platform}
                  </span>

                  <h3>{game.title}</h3>

                  <p>{game.description}</p>

                  <button className="details-btn">
                    Confira
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            className="nav-btn right"
            onClick={() => scroll('right')}
          >
            ›
          </button>
        </div>
      </section>
    );
  };

  if (loading) {
    return (
      <div className="home-container loading-screen">
        <h2>Carregando...</h2>
      </div>
    );
  }

  return (
    <div className="home-container">
      <Navbar />

      <section className="hero-section">
        <div className="hero-overlay"></div>

        <div className="floating-items">
          <span>🎮</span>
          <span>⭐</span>
          <span>🕹️</span>
          <span>📚</span>
          <span>🎲</span>
          <span>👾</span>
          <span>⚔️</span>
          <span>💎</span>
        </div>

        <div className="hero-content">
          <span className="hero-tag">
            Meu universo geek pessoal
          </span>

          <h1>My Geek World</h1>

          <p>
            Jogos zerados, board games, literatura geek,
            rankings pessoais e projetos criativos em um
            único lugar.
          </p>

          <form
            onSubmit={handleSearch}
            className="hero-search-form"
          >
            <input
              type="text"
              placeholder="Buscar jogador..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <button type="submit">
              <Search size={20} />
            </button>
          </form>

          <div className="hero-buttons">
            <button className="primary-btn">
              Explorar Games
            </button>

            <button className="secondary-btn">
              Ver Rankings
            </button>
          </div>
        </div>
      </section>

<section className="news-section">
  <div className="section-header">
    <h2>🔥 Geek News</h2>

    <button className="view-more-btn">
      Ver Tudo
      <ChevronRight size={18} />
    </button>
  </div>

    <div className="geek-news-layout">
      <div className="featured-news">
        <img
          src={getImageUrl(featuredGames[0]?.image)}
          alt={featuredGames[0]?.title}
        />

        <div className="featured-news-overlay">
          <span className="news-category">
            Último Jogo Zerado
          </span>

          <h2>{featuredGames[0]?.title}</h2>

          <p>
            Finalizei mais uma jornada incrível e compartilhei
            minhas opiniões, momentos favoritos e análise completa
            da experiência.
          </p>

          <button>
            Ler Matéria
          </button>
        </div>
      </div>

      <div className="side-news-list">
        {featuredGames.slice(1, 5).map((game, index) => (
          <article className="side-news-card" key={game.id}>
            <img
              src={getImageUrl(game.image)}
              alt={game.title}
            />

            <div className="side-news-content">
              <span>
                {index === 0 && 'Board Game'}
                {index === 1 && 'Mangá'}
                {index === 2 && 'Colecionável'}
                {index === 3 && 'Review'}
              </span>

              <h3>{game.title}</h3>

              <p>
                Novidades, opiniões e descobertas dentro do meu
                universo geek pessoal.
              </p>

              <button>
                Continuar Lendo
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>

      {top3Games.length > 0 && (
        <section className="ranking-section">
          <div className="section-header">
            <h2>
              <Trophy />
              Meu Top Games
            </h2>
          </div>

          <div className="ranking-grid">
            {top3Games.map((game, index) => (
              <div
                className={`ranking-card place-${index}`}
                key={game.id}
              >
                <div className="ranking-position">
                  #{index + 1}
                </div>

                <img
                  src={getImageUrl(game.image)}
                  alt={game.title}
                />

                <div className="ranking-content">
                  <h3>{game.title}</h3>

                  <div className="ranking-score">
                    <Star size={16} />
                    {game.score}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <CarouselRow
        title="Jogos Zerados"
        games={sortedGames}
        icon={<Gamepad2 />}
      />

      <section className="boardgames-section">
        <div className="section-header">
          <h2>
            <Dices />
            Board Games
          </h2>

          <button className="view-more-btn">
            Ver Mais
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="boardgames-grid">
          {featuredGames.slice(0, 3).map((game, index) => (
            <div className="boardgame-card" key={game.id}>
              <div className="tier-badge">
                TOP {index + 1}
              </div>

              <img
                src={getImageUrl(game.image)}
                alt={game.title}
              />

              <div className="boardgame-content">
                <h3>{game.title}</h3>

                <p>
                  Estratégia, rejogabilidade e momentos
                  memoráveis em mesa.
                </p>

                <button>Confira</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="literature-section">
        <div className="section-header">
          <h2>
            <BookOpen />
            Literatura Geek
          </h2>

          <button className="view-more-btn">
            Ver Mais
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="books-grid">
          {featuredGames.slice(0, 4).map((book) => (
            <div className="book-card" key={book.id}>
              <img
                src={getImageUrl(book.image)}
                alt={book.title}
              />

              <div className="book-content">
                <span>Mangá • HQ • Livro</span>

                <h3>{book.title}</h3>

                <p>
                  Uma jornada narrativa cheia de momentos
                  memoráveis e personagens marcantes.
                </p>

                <button>Ver Review</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="lab-section">
        <div className="section-header">
          <h2>
            <FlaskConical />
            Laboratório
          </h2>
        </div>

        <div className="lab-grid">
          <div className="lab-card">
            <h3>Projetos Criativos</h3>

            <p>
              Ferramentas, interfaces e experimentos
              desenvolvidos dentro do universo geek.
            </p>

            <button>Explorar</button>
          </div>

          <div className="lab-card">
            <h3>Recursos</h3>

            <p>
              Componentes, sistemas e ideias para outras
              pessoas utilizarem em seus próprios projetos.
            </p>

            <button>Ver Recursos</button>
          </div>

          <div className="lab-card">
            <h3>Experimentos</h3>

            <p>
              Conceitos visuais, animações e experiências
              interativas em desenvolvimento.
            </p>

            <button>Acessar</button>
          </div>
        </div>
      </section>

      <section className="community-section">
        <div className="section-header">
          <h2>🌎 Exploradores Geek</h2>
        </div>

        <div className="community-grid">
          {popularProfiles.map((profile) => (
            <Link
              to={`/profile/${profile.username}`}
              key={profile.username}
              className="community-card"
            >
              <img
                src={
                  profile.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`
                }
                alt={profile.username}
              />

              <div>
                <h4>{profile.username}</h4>

                <span>
                  <Eye size={14} />
                  {profile.profile_views || 0} views
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default HomePage;