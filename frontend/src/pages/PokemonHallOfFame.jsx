import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  Crown,
  Gamepad2,
  Medal,
  Sparkles,
  Trophy,
} from 'lucide-react';

import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

import sabrina from '../assets/sabrina.png';

import './PokemonHallOfFame.css';

function HallOfFamePage() {
  const [pokemonGames, setPokemonGames] = useState([]);
  const [hallOfFameEntries, setHallOfFameEntries] = useState([]);
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

        const [
          libraryResponse,
          hallResponse,
        ] = await Promise.all([
          api.get('library/'),
          api.get('hall-of-fame/'),
        ]);

        const libraryData =
          libraryResponse.data.results ||
          libraryResponse.data;

        const hallData =
          hallResponse.data.results ||
          hallResponse.data;

        const games = libraryData.filter((entry) => {
          const game =
            entry.game_catalog ||
            entry.game;

          const title = game?.title || '';

          return (
            title.toLowerCase().includes('pokemon') ||
            title.toLowerCase().includes('pokémon')
          );
        });

        setPokemonGames(games);
        setHallOfFameEntries(hallData);
      } catch (error) {
        console.error(
          'Erro ao carregar Hall da Fama:',
          error
        );
      } finally {
        setLoading(false);
      }
    }

    fetchHallOfFame();
  }, []);

  const hallEntries = useMemo(() => {
    const hallById = new Map(
      hallOfFameEntries.map((hall) => [
        Number(hall.id),
        hall,
      ])
    );

    return pokemonGames
      .map((entry) => {
        const game =
          entry.game_catalog ||
          entry.game;

        const hallReference =
          entry?.hall_of_fame;

        let hall = null;

        if (
          hallReference &&
          typeof hallReference === 'object'
        ) {
          hall = hallReference;
        } else if (hallReference) {
          hall =
            hallById.get(
              Number(hallReference)
            ) ||
            null;
        }

        if (!hall) {
          hall =
            game?.hall_of_fame_entry ||
            entry?.hall_of_fame_entry ||
            null;
        }

        return {
          libraryEntry: entry,
          game,
          hall,
        };
      })
      .filter((item) => item.hall);
  }, [
    pokemonGames,
    hallOfFameEntries,
  ]);

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
    return [1, 2, 3, 4, 5, 6]
      .map((index) => {
        const pokemon =
          hall?.[`pokemon_${index}`];

        if (!pokemon) {
          return null;
        }

        const isShiny =
          Boolean(
            hall?.[`pokemon_${index}_shiny`]
          );

        const sprite =
          isShiny
            ? (
                pokemon.shiny_sprite_url ||
                pokemon.sprite_url
              )
            : pokemon.sprite_url;

        return {
          id:
            pokemon.pokedex_id ||
            index,
          pokedexId:
            pokemon.pokedex_id,
          name:
            pokemon.name ||
            `Pokémon ${index}`,
          sprite,
          isShiny,
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

          <h2>
            Carregando seus campeões...
          </h2>
        </main>
      </div>
    );
  }

  return (
    <div className="hall-page">
      <Navbar />

      <main className="hall-content">
        <div className="hall-topbar">
          <Link
            to="/pokemon"
            className="hall-back-button"
          >
            <ArrowLeft size={18} />
            Voltar para a cidade
          </Link>
        </div>

        <section className="hall-hero">
          <div className="hall-hero-emblem">
            <Crown size={42} />
          </div>

          <span className="hall-eyebrow">
            SALÃO DOS CAMPEÕES
          </span>

          <h1>
            Hall da Fama
          </h1>

          <p>
            As equipes que marcaram o fim de cada uma
            das suas jornadas Pokémon ficam
            registradas aqui.
          </p>

          <div className="hall-summary">
            <div>
              <strong>
                {hallEntries.length}
              </strong>

              <span>
                Jornadas concluídas
              </span>
            </div>

            <div>
              <strong>
                {hallEntries.reduce(
                  (total, item) =>
                    total +
                    getTeam(item.hall).length,
                  0
                )}
              </strong>

              <span>
                Pokémon campeões
              </span>
            </div>
          </div>
        </section>

        <section className="hall-sabrina-intro">
          <div className="hall-sabrina-character">
            <img
              src={sabrina}
              alt="Sabrina, anfitriã do Hall da Fama"
              className="hall-sabrina-image"
              draggable="false"
            />
          </div>

          <div className="hall-sabrina-dialogue">
            <div className="hall-sabrina-name">
              SABRINA
            </div>

            <div className="hall-sabrina-message">
              <p>
                Ora, ora... parece que temos um novo campeão diante de nós.
                Seja muito bem-vindo ao <strong>Hall da Fama</strong>.
              </p>

              <p>
                Eu sou Sabrina, responsável por preservar as histórias dos
                treinadores que conseguiram chegar até aqui.
              </p>

              <p>
                Vitórias são importantes, é claro... mas os Pokémon que
                estiveram ao seu lado durante a jornada são o que tornam cada
                conquista verdadeiramente inesquecível.
              </p>

              <p>
                Escolha a jornada que deseja eternizar e apresente o time que
                esteve com você até o fim. A partir daqui, eles farão parte da
                sua história.
              </p>

              <p>
                Afinal... <strong>uma vitória pode durar alguns instantes.
                Um legado permanece para sempre.</strong>
              </p>
            </div>
          </div>
        </section>

        {hallEntries.length === 0 ? (
          <section className="hall-empty">
            <div className="hall-empty-trophy">
              <Trophy size={70} />
            </div>

            <span>
              NENHUM REGISTRO
            </span>

            <h2>
              Seu Hall da Fama ainda está vazio
            </h2>

            <p>
              Registre uma equipe campeã no Game
              Center para ela aparecer neste salão.
            </p>

            <Link
              to="/pokemon"
              className="hall-empty-button"
            >
              <Gamepad2 size={19} />
              Voltar para minhas jornadas
            </Link>
          </section>
        ) : (
          <section className="hall-grid">
            {hallEntries.map(
              (
                {
                  libraryEntry,
                  game,
                  hall,
                },
                entryIndex
              ) => {
                const team =
                  getTeam(hall);

                return (
                  <article
                    className="hall-champion-card"
                    key={
                      hall?.id ||
                      libraryEntry?.id ||
                      game?.id ||
                      entryIndex
                    }
                  >
                    <div className="hall-card-header">
                      <div className="hall-rank">
                        <Medal size={18} />

                        CAMPEÃO #
                        {String(
                          entryIndex + 1
                        ).padStart(2, '0')}
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
                            game?.cover_image ||
                            game?.cover_url
                          )}
                          alt={
                            game?.title ||
                            hall?.game_name ||
                            'Jogo Pokémon'
                          }
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

                        <h2>
                          {game?.title ||
                            hall?.game_name ||
                            'Pokémon'}
                        </h2>

                        <div className="hall-divider" />

                        <span className="hall-team-label">
                          EQUIPE CAMPEÃ
                        </span>

                        <div className="hall-team">
                          {[0, 1, 2, 3, 4, 5].map(
                            (slotIndex) => {
                              const member =
                                team[slotIndex];

                              return (
                                <div
                                  className={[
                                    'hall-team-slot',
                                    member
                                      ? 'filled'
                                      : 'empty',
                                    member?.isShiny
                                      ? 'shiny'
                                      : '',
                                  ].join(' ')}
                                  key={slotIndex}
                                >
                                  {member ? (
                                    <>
                                      <div className="hall-pokemon-sprite">
                                        {member.sprite ? (
                                          <img
                                            src={
                                              member.sprite
                                            }
                                            alt={
                                              member.name
                                            }
                                          />
                                        ) : (
                                          <span>
                                            ?
                                          </span>
                                        )}

                                        {member.isShiny && (
                                          <div
                                            className="hall-shiny-mark"
                                            title="Shiny"
                                          >
                                            <Sparkles
                                              size={14}
                                            />
                                          </div>
                                        )}
                                      </div>

                                      <span>
                                        {member.name}
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <div className="hall-pokemon-sprite">
                                        <span>
                                          ?
                                        </span>
                                      </div>

                                      <span>
                                        Vazio
                                      </span>
                                    </>
                                  )}
                                </div>
                              );
                            }
                          )}
                        </div>

                        {(hall?.notes ||
                          hall?.memory ||
                          hall?.description) && (
                          <div className="hall-memory">
                            <span>
                              MEMÓRIA DA JORNADA
                            </span>

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
              }
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default HallOfFamePage;