import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Gamepad } from 'lucide-react';
import './ConsolesPage.css';

function ConsolesPage() {
  const [consoles, setConsoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/300x200?text=Sem+Imagem";
    if (imagePath.startsWith('http')) return imagePath;
    return `http://127.0.0.1:8000${imagePath}`;
  };

  useEffect(() => {
    const fetchConsoles = async () => {
      try {
        const response = await api.get('consoles/');
        const data = response.data.results ? response.data.results : response.data;
        setConsoles(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao buscar consoles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConsoles();
  }, []);

  const featured = consoles[0];
  const others = consoles.slice(1);

  return (
    <div className="consoles-container">
      <Navbar />
      
      <section className="consoles-header">
        <h1><Gamepad /> Consoles</h1>
        <p>As máquinas que marcaram sua jornada gamer</p>
      </section>

      {loading ? (
        <div className="loading">Carregando hardware...</div>
      ) : consoles.length > 0 ? (
        <>
          {/* FEATURED */}
          {featured && (
            <div className="featured-console">
              <img src={getImageUrl(featured.photo || featured.image)} alt={featured.name} />
              <div className="featured-overlay">
                <h2>{featured.name}</h2>
              </div>
            </div>
          )}

          {/* GRID */}
          <div className="consoles-grid modern">
            {others.map(consoleItem => (
              <div key={consoleItem.id} className="console-card-modern">
                <img 
                  src={getImageUrl(consoleItem.photo || consoleItem.image)} 
                  alt={consoleItem.name} 
                />
                <div className="console-overlay">
                  <h3>{consoleItem.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="empty">
          Nenhum console encontrado.
        </div>
      )}
      
      <Footer />
    </div>
  );
}

export default ConsolesPage;