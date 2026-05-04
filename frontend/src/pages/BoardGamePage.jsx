import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import styles from './BoardGames.module.css';

function BoardGamePage() {
  const [boardGames, setBoardGames] = useState([]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/300x400?text=Sem+Capa";
    if (imagePath.startsWith('http')) return imagePath;
    return `http://127.0.0.1:8000${imagePath}`;
  };

  useEffect(() => {
    const fetchBoardGames = async () => {
      try {
        const response = await api.get('boardgames/');
        const data = response.data.results || response.data;
        setBoardGames(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao buscar jogos:", error);
      }
    };

    fetchBoardGames();
  }, []);

  return (
    <>
      <Navbar />

      <div className={styles.bgPage}>

        <header className={styles.header}>
          <h1>🎲 Coleção de Tabuleiro</h1>
          <p>Explore sua estante de jogos físicos</p>
        </header>

        <section className={styles.carouselSection}>
          <div className={styles.carouselTrack}>
            {boardGames.map(game => (
              <Link 
                to={`/boardgames/${game.id}`} 
                key={game.id} 
                className={styles.card}
              >
                <img 
                  src={getImageUrl(game.cover_image)} 
                  alt={game.name} 
                />
                <div className={styles.overlay}>
                  <h3>{game.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>

      <Footer />
    </>
  );
}

export default BoardGamePage;