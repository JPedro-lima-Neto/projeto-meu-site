import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  Dice5,
  Library,
  Gamepad2,
  Star,
  Clock3,
  Users,
  CalendarDays,
  PackageCheck,
  Eye,
} from 'lucide-react';
import styles from './BoardGames.module.css';

function BoardGamePage() {
  const [boardGames, setBoardGames] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [searchTerm, setSearchTerm] =
    useState('');

  const [activeFilter, setActiveFilter] =
    useState('all');

  const [sortBy, setSortBy] =
    useState('name');

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return null;
    }

    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    return `http://127.0.0.1:8000${imagePath}`;
  };

  useEffect(() => {
    const fetchBoardGames = async () => {
      setLoading(true);

      try {
        const response =
          await api.get(
            'user-boardgames/'
          );

        const data =
          response.data.results ||
          response.data;

        setBoardGames(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          'Erro ao buscar jogos de tabuleiro:',
          error
        );

        setBoardGames([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBoardGames();
  }, []);

  const normalizedGames =
    useMemo(() => {
      return boardGames
        .map((entry) => {
          const catalogGame =
            entry.game || null;

          if (!catalogGame) {
            return null;
          }

          return {
            id:
              catalogGame.id,

            entryId:
              entry.id,

            bggId:
              catalogGame.bgg_id,

            name:
              catalogGame.name,

            originalName:
              catalogGame.original_name,

            description:
              catalogGame.description,

            coverImage:
              catalogGame.cover_image,

            coverUrl:
              catalogGame.cover_url,

            thumbnailUrl:
              catalogGame.thumbnail_url,

            year:
              catalogGame.year,

            minPlayers:
              catalogGame.min_players,

            maxPlayers:
              catalogGame.max_players,

            minPlayTime:
              catalogGame.min_play_time,

            maxPlayTime:
              catalogGame.max_play_time,

            playTime:
              catalogGame.play_time,

            minAge:
              catalogGame.min_age,

            publisher:
              catalogGame.publisher,

            publishers:
              catalogGame.publishers || [],

            categories:
              catalogGame.categories || [],

            mechanics:
              catalogGame.mechanics || [],

            designers:
              catalogGame.designers || [],

            artists:
              catalogGame.artists || [],

            bggRating:
              catalogGame.bgg_rating,

            bggWeight:
              catalogGame.bgg_weight,

            owned:
              Boolean(entry.owned),

            played:
              Boolean(entry.played),

            rating:
              entry.rating !== null &&
              entry.rating !== undefined
                ? Number(entry.rating)
                : null,

            acquiredAt:
              entry.acquired_at,

            notes:
              entry.notes,
          };
        })
        .filter(Boolean);
    }, [boardGames]);

  const filteredGames =
    useMemo(() => {
      let result =
        [...normalizedGames];

      const normalizedSearch =
        searchTerm
          .trim()
          .toLowerCase();

      if (normalizedSearch) {
        result =
          result.filter((game) => {
            const name =
              game.name
                ?.toLowerCase() ||
              '';

            const publisher =
              game.publisher
                ?.toLowerCase() ||
              '';

            const description =
              game.description
                ?.toLowerCase() ||
              '';

            return (
              name.includes(
                normalizedSearch
              ) ||
              publisher.includes(
                normalizedSearch
              ) ||
              description.includes(
                normalizedSearch
              )
            );
          });
      }

      if (
        activeFilter ===
        'owned'
      ) {
        result =
          result.filter(
            (game) =>
              game.owned
          );
      }

      if (
        activeFilter ===
        'played'
      ) {
        result =
          result.filter(
            (game) =>
              game.played &&
              !game.owned
          );
      }

      result.sort((a, b) => {
        if (sortBy === 'name') {
          return (
            a.name || ''
          ).localeCompare(
            b.name || ''
          );
        }

        if (sortBy === 'year') {
          return (
            (b.year || 0) -
            (a.year || 0)
          );
        }

        if (
          sortBy ===
          'rating'
        ) {
          return (
            (b.rating || 0) -
            (a.rating || 0)
          );
        }

        return 0;
      });

      return result;
    }, [
      normalizedGames,
      searchTerm,
      activeFilter,
      sortBy,
    ]);

  const ownedGames =
    useMemo(() => {
      return filteredGames.filter(
        (game) =>
          game.owned
      );
    }, [filteredGames]);

  const playedNotOwnedGames =
    useMemo(() => {
      return filteredGames.filter(
        (game) =>
          game.played &&
          !game.owned
      );
    }, [filteredGames]);

  const totalOwned =
    normalizedGames.filter(
      (game) =>
        game.owned
    ).length;

  const totalPlayed =
    normalizedGames.filter(
      (game) =>
        game.played
    ).length;

  const ratedGames =
    normalizedGames.filter(
      (game) =>
        game.rating !== null &&
        game.rating !== undefined
    );

  const averageRating =
    ratedGames.length > 0
      ? (
          ratedGames.reduce(
            (sum, game) =>
              sum +
              Number(
                game.rating || 0
              ),
            0
          ) /
          ratedGames.length
        ).toFixed(1)
      : '—';

  const renderGameCard = (
    game
  ) => {
    const cover =
      getImageUrl(
        game.coverImage ||
        game.coverUrl ||
        game.thumbnailUrl
      );

    return (
      <Link
        to={`/boardgames/${game.id}`}
        key={game.entryId}
        className={
          styles.gameCard
        }
      >
        <div
          className={
            styles.gameCardImage
          }
        >
          {cover ? (
            <img
              src={cover}
              alt={game.name}
            />
          ) : (
            <div
              className={
                styles.noCover
              }
            >
              <Dice5 size={50} />
            </div>
          )}

          <div
            className={
              styles.gameCardStatus
            }
          >
            {game.owned ? (
              <>
                <PackageCheck
                  size={14}
                />

                Na coleção
              </>
            ) : (
              <>
                <Eye size={14} />

                Já joguei
              </>
            )}
          </div>
        </div>

        <div
          className={
            styles.gameCardContent
          }
        >
          <span
            className={
              styles.gamePublisher
            }
          >
            {game.publisher ||
              'Editora não informada'}
          </span>

          <h3>
            {game.name}
          </h3>

          <div
            className={
              styles.gameMiniMeta
            }
          >
            {game.year && (
              <span>
                <CalendarDays
                  size={14}
                />

                {game.year}
              </span>
            )}

            {game.minPlayers && (
              <span>
                <Users size={14} />

                {game.minPlayers}

                {game.maxPlayers &&
                game.maxPlayers !==
                  game.minPlayers
                  ? `–${game.maxPlayers}`
                  : ''}
              </span>
            )}

            {game.playTime && (
              <span>
                <Clock3 size={14} />

                {game.playTime}
              </span>
            )}
          </div>

          <div
            className={
              styles.gameRating
            }
          >
            <Star size={16} />

            <strong>
              {game.rating !==
                null &&
              game.rating !==
                undefined
                ? Number(
                    game.rating
                  ).toFixed(1)
                : '—'}
            </strong>

            <span>
              / 10
            </span>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div
      className={
        styles.boardGamesTheme
      }
    >
      <Navbar />

      <main
        className={
          styles.bgPage
        }
      >
        <div
          className={
            styles.ambientLight
          }
        ></div>

        <section
          className={
            styles.heroSection
          }
        >
          <div
            className={
              styles.heroContent
            }
          >
            <div
              className={
                styles.heroBadge
              }
            >
              <Dice5 size={17} />

              BOARD GAME COLLECTION
            </div>

            <h1>
              Minha coleção de

              <span>
                jogos de tabuleiro.
              </span>
            </h1>

            <p>
              Jogos que fazem parte da
              minha coleção e também
              aqueles que já passaram
              pela mesa.
            </p>
          </div>

          <div
            className={
              styles.statsGrid
            }
          >
            <article
              className={
                styles.statCard
              }
            >
              <Library size={22} />

              <div>
                <strong>
                  {totalOwned}
                </strong>

                <span>
                  na coleção
                </span>
              </div>
            </article>

            <article
              className={
                styles.statCard
              }
            >
              <Gamepad2
                size={22}
              />

              <div>
                <strong>
                  {totalPlayed}
                </strong>

                <span>
                  já jogados
                </span>
              </div>
            </article>

            <article
              className={
                styles.statCard
              }
            >
              <Star size={22} />

              <div>
                <strong>
                  {averageRating}
                </strong>

                <span>
                  nota média
                </span>
              </div>
            </article>
          </div>
        </section>

        <section
          className={
            styles.toolbar
          }
        >
          <div
            className={
              styles.searchBox
            }
          >
            <Search size={19} />

            <input
              type="text"
              placeholder="Buscar jogo, editora..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
            />
          </div>

          <div
            className={
              styles.filters
            }
          >
            <button
              type="button"
              className={
                activeFilter ===
                'all'
                  ? styles.activeFilter
                  : ''
              }
              onClick={() =>
                setActiveFilter(
                  'all'
                )
              }
            >
              Todos
            </button>

            <button
              type="button"
              className={
                activeFilter ===
                'owned'
                  ? styles.activeFilter
                  : ''
              }
              onClick={() =>
                setActiveFilter(
                  'owned'
                )
              }
            >
              Tenho
            </button>

            <button
              type="button"
              className={
                activeFilter ===
                'played'
                  ? styles.activeFilter
                  : ''
              }
              onClick={() =>
                setActiveFilter(
                  'played'
                )
              }
            >
              Já joguei
            </button>
          </div>

          <div
            className={
              styles.sortControl
            }
          >
            <SlidersHorizontal
              size={17}
            />

            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(
                  event.target.value
                )
              }
            >
              <option value="name">
                Nome
              </option>

              <option value="year">
                Ano
              </option>

              <option value="rating">
                Nota
              </option>
            </select>
          </div>
        </section>

        {loading ? (
          <section
            className={
              styles.loadingState
            }
          >
            <div
              className={
                styles.loader
              }
            ></div>

            <p>
              Carregando jogos de
              tabuleiro...
            </p>
          </section>
        ) : (
          <>
            {(activeFilter ===
              'all' ||
              activeFilter ===
                'owned') && (
              <section
                className={
                  styles.collectionSection
                }
              >
                <div
                  className={
                    styles.sectionHeader
                  }
                >
                  <div>
                    <span>
                      MINHA ESTANTE
                    </span>

                    <h2>
                      Jogos que tenho
                    </h2>
                  </div>

                  <strong>
                    {
                      ownedGames.length
                    }
                  </strong>
                </div>

                {ownedGames.length >
                0 ? (
                  <div
                    className={
                      styles.gamesGrid
                    }
                  >
                    {ownedGames.map(
                      renderGameCard
                    )}
                  </div>
                ) : (
                  <div
                    className={
                      styles.emptyState
                    }
                  >
                    <Dice5
                      size={42}
                    />

                    <h3>
                      Nenhum jogo
                      encontrado
                    </h3>

                    <p>
                      Não existem jogos
                      da coleção com os
                      filtros atuais.
                    </p>
                  </div>
                )}
              </section>
            )}

            {(activeFilter ===
              'all' ||
              activeFilter ===
                'played') && (
              <section
                className={
                  styles.collectionSection
                }
              >
                <div
                  className={
                    styles.sectionHeader
                  }
                >
                  <div>
                    <span>
                      EXPERIÊNCIAS
                    </span>

                    <h2>
                      Já joguei, mas
                      não possuo
                    </h2>
                  </div>

                  <strong>
                    {
                      playedNotOwnedGames.length
                    }
                  </strong>
                </div>

                {playedNotOwnedGames.length >
                0 ? (
                  <div
                    className={
                      styles.gamesGrid
                    }
                  >
                    {playedNotOwnedGames.map(
                      renderGameCard
                    )}
                  </div>
                ) : (
                  <div
                    className={
                      styles.emptyState
                    }
                  >
                    <Gamepad2
                      size={42}
                    />

                    <h3>
                      Nenhum jogo por
                      aqui
                    </h3>

                    <p>
                      Os jogos que você
                      já jogou, mas não
                      possui, vão
                      aparecer nesta
                      área.
                    </p>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default BoardGamePage;