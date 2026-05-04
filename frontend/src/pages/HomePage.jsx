import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Trophy, Star, Search, Users, Eye } from 'lucide-react'; 
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();

  const [videoGames, setVideoGames] = useState([]);
  const [popularProfiles, setPopularProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/300x400?text=Sem+Capa";
    if (imagePath.startsWith('http')) return imagePath;
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `http://127.0.0.1:8000/${cleanPath}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gamesResponse, profilesResponse] = await Promise.all([
            api.get('library/'),        
            api.get('profiles/?ordering=-profile_views') 
        ]);

        const rawGames = Array.isArray(gamesResponse.data) ? gamesResponse.data : (gamesResponse.data.results || []);
        const rawProfiles = Array.isArray(profilesResponse.data) ? profilesResponse.data : (profilesResponse.data.results || []);

        const formattedGames = rawGames.map(entry => {
            const gameData = entry.game_catalog || entry.game || {}; 
            return {
                id: entry.id,
                title: gameData.title || "Jogo Sem Título",
                image: gameData.cover_image || gameData.cover_url,
                score: entry.rating || 0
            };
        });

        setVideoGames(formattedGames);
        setPopularProfiles(rawProfiles.slice(0, 6)); 

      } catch (error) {
        console.error("Erro ao carregar Home:", error);
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
    .filter(g => g.score > 0)
    .sort((a, b) => b.score - a.score);

  const top3Games = sortedGames.slice(0, 3);

  const trendingGames = sortedGames.slice(0, 5);
  const recentActivity = videoGames.slice(0, 5);

  const topRated = videoGames.filter(g => g.score >= 8);
  const midRated = videoGames.filter(g => g.score >= 5 && g.score < 8);
  const lowRated = videoGames.filter(g => g.score < 5 || g.score === 0);

  const CarouselRow = ({ title, games }) => {
    const scrollRef = useRef();

    const scroll = (dir) => {
      scrollRef.current.scrollBy({
        left: dir === 'left' ? -300 : 300,
        behavior: 'smooth'
      });
    };

    if (!games.length) return null;

    return (
      <section className="carousel-section">
        <h2>{title}</h2>

        <div className="carousel-wrapper">
          <button className="nav-btn left" onClick={() => scroll('left')}>‹</button>

          <div className="carousel-track" ref={scrollRef}>
            {games.map(game => (
              <div key={game.id} className="carousel-card">
                <img src={getImageUrl(game.image)} alt={game.title} />
                <div className="carousel-overlay">
                  <h4>{game.title}</h4>
                  <span>{game.score > 0 ? game.score : '-'}</span>
                </div>
              </div>
            ))}
          </div>

          <button className="nav-btn right" onClick={() => scroll('right')}>›</button>
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

      <section className="hero-section modern-hero">
        <div className="hero-content">
          <h1>Central Gamer</h1>
          <p>Explore perfis, rankings e sua coleção pessoal</p>

          <form onSubmit={handleSearch} className="hero-search-form">
            <input 
              type="text" 
              placeholder="Buscar jogador..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit"><Search size={20} /></button>
          </form>
        </div>
      </section>

      <section className="discover-section">
        <h2>🔥 Descubra Agora</h2>

        <div className="discover-grid">

          <div className="discover-card">
            <h3><Users /> Jogadores</h3>
            <div className="mini-list">
              {popularProfiles.map(profile => (
                <Link to={`/profile/${profile.username}`} key={profile.username}>
                  <div className="mini-item">
                    <img 
                      src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`} 
                      alt={profile.username}
                    />
                    <span>{profile.username}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="discover-card">
            <h3><Trophy /> Em Alta</h3>
            <div className="mini-list">
              {trendingGames.map(game => (
                <div key={game.id} className="mini-item">
                  <img src={getImageUrl(game.image)} alt={game.title} />
                  <span>{game.title}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="discover-card">
            <h3>⚡ Atividade</h3>
            <div className="activity-list">
              {recentActivity.map(game => (
                <div key={game.id} className="activity-item">
                  <span>Alguém avaliou</span>
                  <strong>{game.title}</strong>
                  <small>★ {game.score}</small>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {top3Games.length > 0 && (
        <section className="podium-section modern-podium">
          <h2><Trophy /> Top Games</h2>
          <div className="top3-grid">
            {top3Games.map((game, index) => (
              <div key={game.id} className={`top-card rank-${index}`}>
                <img src={getImageUrl(game.image)} alt={game.title} />
                <div className="top-info">
                  <h3>{game.title}</h3>
                  <span><Star size={14}/> {game.score}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <CarouselRow title="⭐ Top Avaliados" games={topRated} />
      <CarouselRow title="🎮 Bem Avaliados" games={midRated} />
      <CarouselRow title="🕹️ Outros Jogos" games={lowRated} />

      <Footer />
    </div>
  );
}

export default HomePage;