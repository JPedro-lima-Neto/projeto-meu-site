import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  Crown,
  Gamepad2,
  Medal,
  Trophy,
} from 'lucide-react';

import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

import './PokemonHallOfFame.css';

function HallOfFamePage() {
  const [pokemonGames, setPokemonGames] = useState([]);
  const [loading, setLoading] = useState(true);

  const getImageUrl = (img) => {
    if (!img) {
      return 'https://via.placeholder.com/300x420?text=Sem+Imagem';
    }

    if (img.startsWith('http')) {
      return img;
    }

    return `http://127.0.0.1:8000/${img}`;
  };

  useEffect(() => {
    async function fetchHallOfFame() {
      try {
        setLoading(true);

        const response = await api.get('library/');
        const data = response.data.results || response.data;

        const games = data.filter((entry) => {
          const game = entry.game_catalog || entry.game;
          const title = game?.title || '';

          return (
            title.toLowerCase().includes('pokemon') ||
            title.toLowerCase().includes('pokémon')
          );
        });

        setPokemonGames(games);
      } catch (error) {
        console.error('Erro ao carregar Hall da Fama:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchHallOfFame();
  }, []);

  const hallEntries = useMemo(() => {
    return pokemonGames
      .map((entry) => {
        const game = entry.game_catalog || entry.game;
        const hall =
          game?.hall_of_fame_entry ||
          entry?.hall_of_fame_entry ||
          null;

        return {
          libraryEntry: entry,
          game,
          hall,
        };
      })
      .filter((item) => item.hall);
  }, [pokemonGames]);

  const getHallDate = (hall) => {
    const rawDate =
      hall?.completed_at ||
      hall?.completion_date ||
      hall?.date ||
      hall?.created_at;

    if (!rawDate) {
      return 'Data não registrada';
    }

    const parsed = new Date(rawDate);

    if (Number.isNaN(parsed.getTime())) {
      return String(rawDate);
    }

    return parsed.toLocaleDateString('pt-BR');
  };

  const getTeam = (hall) => {
    if (Array.isArray(hall?.team) && hall.team.length > 0) {
      return hall.team.slice(0, 6).map((pokemon, index) => ({
        id: pokemon.id || pokemon.pokedex_id || index,
        name: pokemon.name || `Pokémon ${index + 1}`,
        sprite:
          pokemon.sprite_url ||
          pokemon.sprite ||
          pokemon.image ||
          pokemon.image_url,
      }));
    }

    return [1, 2, 3, 4, 5, 6]
      .map((index) => {
        const pokemon =
          hall?.[`pokemon_${index}`] ||
          hall?.[`member_${index}`] ||
          null;

        const sprite =
          hall?.[`sprite_${index}`] ||
          pokemon?.sprite_url ||
          pokemon?.sprite ||
          null;

        const name =
          hall?.[`pokemon_${index}_name`] ||
          pokemon?.name ||
          `Pokémon ${index}`;

        if (!sprite && !pokemon) {
          return null;
        }

        return {
          id: pokemon?.id || pokemon?.pokedex_id || index,
          name,
          sprite,
        };
      })
      .filter(Boolean);
  };

  if (loading) {
    return (
      <div className="hall-page">
        <Navbar />

        <main className="hall-loading">
          <div className="hall-loading-trophy">
            <Trophy size={42} />
          </div>

          <span>HALL DA FAMA</span>
          <h2>Carregando seus campeões...</h2>
        </main>
      </div>
    );
  }

  return (
    <div className="hall-page">
      <Navbar />

      <main className="hall-content">
        <div className="hall-topbar">
          <Link to="/pokemon" className="hall-back-button">
            <ArrowLeft size={18} />
            Voltar para a cidade
          </Link>
        </div>

        <section className="hall-hero">
          <div className="hall-hero-emblem">
            <Crown size={42} />
          </div>

          <span className="hall-eyebrow">SALÃO DOS CAMPEÕES</span>

          <h1>Hall da Fama</h1>

          <p>
            As equipes que marcaram o fim de cada uma das suas
            jornadas Pokémon ficam registradas aqui.
          </p>

          <div className="hall-summary">
            <div>
              <strong>{hallEntries.length}</strong>
              <span>Jornadas concluídas</span>
            </div>

            <div>
              <strong>
                {hallEntries.reduce(
                  (total, item) => total + getTeam(item.hall).length,
                  0
                )}
              </strong>
              <span>Pokémon campeões</span>
            </div>
          </div>
        </section>

        {hallEntries.length === 0 ? (
          <section className="hall-empty">
            <div className="hall-empty-trophy">
              <Trophy size={70} />
            </div>

            <span>NENHUM REGISTRO</span>

            <h2>Seu Hall da Fama ainda está vazio</h2>

            <p>
              Quando uma jornada Pokémon for registrada como concluída,
              a equipe campeã aparecerá neste salão.
            </p>

            <Link to="/pokemon" className="hall-empty-button">
              <Gamepad2 size={19} />
              Voltar para minhas jornadas
            </Link>
          </section>
        ) : (
          <section className="hall-grid">
            {hallEntries.map(({ libraryEntry, game, hall }, entryIndex) => {
              const team = getTeam(hall);

              return (
                <article
                  className="hall-champion-card"
                  key={libraryEntry?.id || game?.id || entryIndex}
                >
                  <div className="hall-card-header">
                    <div className="hall-rank">
                      <Medal size={18} />
                      CAMPEÃO #{String(entryIndex + 1).padStart(2, '0')}
                    </div>

                    <div className="hall-date">
                      <CalendarDays size={16} />
                      {getHallDate(hall)}
                    </div>
                  </div>

                  <div className="hall-card-body">
                    <div className="hall-game-cover">
                      <img
                        src={getImageUrl(
                          game?.cover_image || game?.cover_url
                        )}
                        alt={game?.title || 'Jogo Pokémon'}
                      />

                      <div className="hall-cover-badge">
                        <Trophy size={16} />
                        HALL OF FAME
                      </div>
                    </div>

                    <div className="hall-card-info">
                      <span className="hall-game-label">
                        JORNADA CONCLUÍDA
                      </span>

                      <h2>{game?.title || 'Pokémon'}</h2>

                      {hall?.region && (
                        <p className="hall-region">
                          Região de {hall.region}
                        </p>
                      )}

                      <div className="hall-divider" />

                      <span className="hall-team-label">
                        EQUIPE CAMPEÃ
                      </span>

                      <div className="hall-team">
                        {[0, 1, 2, 3, 4, 5].map((slotIndex) => {
                          const member = team[slotIndex];

                          return (
                            <div
                              className={[
                                'hall-team-slot',
                                member ? 'filled' : 'empty',
                              ].join(' ')}
                              key={slotIndex}
                            >
                              {member ? (
                                <>
                                  <div className="hall-pokemon-sprite">
                                    {member.sprite ? (
                                      <img
                                        src={member.sprite}
                                        alt={member.name}
                                      />
                                    ) : (
                                      <span>?</span>
                                    )}
                                  </div>

                                  <span>{member.name}</span>
                                </>
                              ) : (
                                <>
                                  <div className="hall-pokemon-sprite">
                                    <span>?</span>
                                  </div>

                                  <span>Vazio</span>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {(hall?.notes || hall?.memory || hall?.description) && (
                        <div className="hall-memory">
                          <span>MEMÓRIA DA JORNADA</span>
                          <p>
                            {hall.notes ||
                              hall.memory ||
                              hall.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default HallOfFamePage;