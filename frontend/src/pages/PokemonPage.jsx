import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './PokemonPage.css';

function PokemonPage() {
  const [activeTab, setActiveTab] = useState('games');
  const [activeGeneration, setActiveGeneration] = useState(1);

  const [pokemonGames, setPokemonGames] = useState([]);
  const [pokedex, setPokedex] = useState([]);

  const [myCapturedIds, setMyCapturedIds] = useState(new Set());
  const [myShinyIds, setMyShinyIds] = useState(new Set());

  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const generationLimits = {
    1: { name: 'Kanto', start: 1, end: 151 },
    2: { name: 'Johto', start: 152, end: 251 },
    3: { name: 'Hoenn', start: 252, end: 386 },
    4: { name: 'Sinnoh', start: 387, end: 493 },
    5: { name: 'Unova', start: 494, end: 649 },
    6: { name: 'Kalos', start: 650, end: 721 },
    7: { name: 'Alola', start: 722, end: 809 },
    8: { name: 'Galar', start: 810, end: 905 },
    9: { name: 'Paldea', start: 906, end: 1025 },
  };

  const totalGenerations = Object.keys(generationLimits).map(Number);

  const getImageUrl = (img) => {
    if (!img) return "https://via.placeholder.com/300x200?text=Sem+Imagem";
    if (img.startsWith('http')) return img;
    return `http://127.0.0.1:8000/${img}`;
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const [gamesRes, dexRes, userRes] = await Promise.all([
          api.get('library/'),
          api.get('pokedex/'),
          api.get('user-pokemon/')
        ]);

        // Jogos Pokémon
        const gamesData = gamesRes.data.results || gamesRes.data;
        const pkmGames = gamesData.filter(entry => {
          const title = entry.game_catalog?.title || entry.game?.title || "";
          return title.toLowerCase().includes('pokemon') || title.toLowerCase().includes('pokémon');
        });

        setPokemonGames(pkmGames);

        // Pokédex
        const dexData = dexRes.data.results || dexRes.data;
        setPokedex(dexData);

        // Usuário
        const userData = userRes.data.results || userRes.data;
        const captured = new Set();
        const shiny = new Set();

        userData.forEach(u => {
          const id = u.pokemon.pokedex_id || u.pokemon;
          if (u.is_shiny) shiny.add(id);
          else captured.add(id);
        });

        setMyCapturedIds(captured);
        setMyShinyIds(shiny);

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const toggleCapture = async (id, isShinyMode) => {
    const targetSet = isShinyMode ? myShinyIds : myCapturedIds;

    if (targetSet.has(id)) return;

    try {
      await api.post('user-pokemon/', {
        pokemon: id,
        is_shiny: isShinyMode
      });

      if (isShinyMode) {
        setMyShinyIds(prev => new Set(prev).add(id));
      } else {
        setMyCapturedIds(prev => new Set(prev).add(id));
      }

    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  const currentGenInfo = generationLimits[activeGeneration];

  const filteredDex = pokedex.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(p.pokedex_id).includes(searchTerm);

    const matchesGen =
      p.pokedex_id >= currentGenInfo.start &&
      p.pokedex_id <= currentGenInfo.end;

    return matchesSearch && matchesGen;
  });

  if (loading) {
    return (
      <div className="pokemon-page">
        <Navbar />
        <h2 className="loading-text">Carregando Centro Pokémon...</h2>
      </div>
    );
  }

  return (
    <div className="pokemon-page">
      <Navbar />

      {/* HEADER */}
      <header className="pokemon-header">
        <h1>Centro Pokémon</h1>
        <p>Gerencie seus jogos e sua Pokédex pessoal</p>

        <div className="tabs-container">
          <button className={`tab-btn ${activeTab === 'games' ? 'active' : ''}`} onClick={() => setActiveTab('games')}>
            🎮 Jogos
          </button>
          <button className={`tab-btn ${activeTab === 'pokedex' ? 'active' : ''}`} onClick={() => setActiveTab('pokedex')}>
            📘 Pokédex
          </button>
          <button className={`tab-btn ${activeTab === 'shiny' ? 'active' : ''}`} onClick={() => setActiveTab('shiny')}>
            ✨ Shiny
          </button>
        </div>
      </header>

      {/* ABA JOGOS */}
      {activeTab === 'games' && (
        <div className="pokemon-grid">
          {pokemonGames.length === 0 ? (
            <div className="empty-state">
              <p>Nenhum jogo encontrado</p>
            </div>
          ) : (
            pokemonGames.map(entry => {
              const game = entry.game_catalog || entry.game;
              const hof = game.hall_of_fame_entry;

              return (
                <div key={entry.id} className="pokemon-card-game">
                  <img src={getImageUrl(game.cover_image || game.cover_url)} />

                  <div className="card-info">
                    <h3>{game.title}</h3>

                    <div className="hall-of-fame">
                      {hof ? (
                        <div className="team">
                          {[1,2,3,4,5,6].map(i =>
                            hof[`sprite_${i}`] && (
                              <img key={i} src={hof[`sprite_${i}`]} />
                            )
                          )}
                        </div>
                      ) : (
                        <span className="not-finished">Não finalizado</span>
                      )}
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ABA POKEDEX */}
      {(activeTab === 'pokedex' || activeTab === 'shiny') && (
        <div className="dex-container">

          <input
            className="dex-search"
            placeholder="Buscar Pokémon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="gen-selector">
            {totalGenerations.map(gen => (
              <button
                key={gen}
                className={activeGeneration === gen ? 'active-gen' : ''}
                onClick={() => setActiveGeneration(gen)}
              >
                Gen {gen}
              </button>
            ))}
          </div>

          <div className="dex-grid">
            {filteredDex.map(poke => {
              const isShiny = activeTab === 'shiny';
              const isCaught = isShiny
                ? myShinyIds.has(poke.pokedex_id)
                : myCapturedIds.has(poke.pokedex_id);

              const sprite = isShiny
                ? poke.shiny_sprite_url
                : poke.sprite_url;

              return (
                <div
                  key={poke.pokedex_id}
                  className={`dex-card ${isCaught ? 'caught' : 'uncaptured'} ${isShiny ? 'shiny' : ''}`}
                  onClick={() => toggleCapture(poke.pokedex_id, isShiny)}
                >
                  <span>#{poke.pokedex_id}</span>

                  <img src={sprite} />

                  <p>{poke.name}</p>

                  {isCaught && <div className="check">✔</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default PokemonPage;