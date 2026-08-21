import React, {
  useState,
  useEffect,
  useCallback,
} from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  Gamepad2,
  Cpu,
  Check,
  Minus,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Disc3,
  Monitor,
  CalendarDays,
  Trophy,
  Circle,
} from 'lucide-react';
import './ConsolesPage.css';

function ConsolesPage() {
  const [consoles, setConsoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedConsole, setSelectedConsole] = useState(null);

  const [games, setGames] = useState([]);
  const [gamesLoading, setGamesLoading] = useState(false);

  const [currentGameIndex, setCurrentGameIndex] = useState(0);

  const consoleCatalog = [
    {
      brand: 'PlayStation',
      className: 'playstation',

      consoles: [
        {
          name: 'PlayStation',
          shortName: 'PS1',
          key: 'ps1',
          image: '/foto de consoles/ps1.png',

          aliases: [
            'playstation',
            'ps1',
          ],

          theme: {
            background: '#d3d3d3',
            secondary: '#a9a9a9',
            accent: '#305aa6',
            text: '#181818',
            muted: '#555555',
          },
        },

        {
          name: 'PlayStation 2',
          shortName: 'PS2',
          key: 'ps2',
          image: '/foto de consoles/ps2.png',

          aliases: [
            'playstation 2',
            'ps2',
          ],

          theme: {
            background: '#050609',
            secondary: '#07122b',
            accent: '#246cff',
            text: '#ffffff',
            muted: '#8795b5',
          },
        },

        {
          name: 'PlayStation 3',
          shortName: 'PS3',
          key: 'ps3',
          image: '/foto de consoles/ps3.png',

          aliases: [
            'playstation 3',
            'ps3',
          ],

          theme: {
            background: '#090909',
            secondary: '#242424',
            accent: '#c7c7c7',
            text: '#ffffff',
            muted: '#9a9a9a',
          },
        },

        {
          name: 'PlayStation 4',
          shortName: 'PS4',
          key: 'ps4',
          image: '/foto de consoles/ps4.png',

          aliases: [
            'playstation 4',
            'ps4',
          ],

          theme: {
            background: '#001c49',
            secondary: '#003791',
            accent: '#ffffff',
            text: '#ffffff',
            muted: '#b8c9e8',
          },
        },

        {
          name: 'PlayStation 5',
          shortName: 'PS5',
          key: 'ps5',
          image: '/foto de consoles/ps5.png',

          aliases: [
            'playstation 5',
            'ps5',
          ],

          theme: {
            background: '#f3f6fb',
            secondary: '#d9e5ff',
            accent: '#006fcd',
            text: '#101828',
            muted: '#667085',
          },
        },

        {
          name: 'PlayStation Portable',
          shortName: 'PSP',
          key: 'psp',
          image: '/foto de consoles/psp.png',

          aliases: [
            'playstation portable',
            'playstation portable psp',
            'psp',
          ],

          theme: {
            background: '#04060b',
            secondary: '#07182f',
            accent: '#357cff',
            text: '#ffffff',
            muted: '#8ea1c1',
          },
        },

        {
          name: 'PlayStation Vita',
          shortName: 'PS Vita',
          key: 'psvita',
          image: '/foto de consoles/psvita.png',

          aliases: [
            'playstation vita',
            'ps vita',
            'psvita',
          ],

          theme: {
            background: '#020816',
            secondary: '#003c86',
            accent: '#2e8cff',
            text: '#ffffff',
            muted: '#9ec0e8',
          },
        },
      ],
    },

    {
      brand: 'Nintendo',
      className: 'nintendo',

      consoles: [
        {
          name: 'Nintendo Entertainment System',
          shortName: 'NES',
          key: 'nes',
          image: '/foto de consoles/nes.png',

          aliases: [
            'nintendo entertainment system',
            'nes',
          ],

          theme: {
            background: '#dedbd7',
            secondary: '#b9b5b0',
            accent: '#e60012',
            text: '#262626',
            muted: '#686868',
          },
        },

        {
          name: 'Super Nintendo',
          shortName: 'SNES',
          key: 'snes',
          image: '/foto de consoles/snes.png',

          aliases: [
            'super nintendo',
            'snes',
          ],

          theme: {
            background: '#d6d2da',
            secondary: '#aaa5b3',
            accent: '#7255a3',
            text: '#25222a',
            muted: '#66616e',
          },
        },

        {
          name: 'Nintendo 64',
          shortName: 'N64',
          key: 'n64',
          image: '/foto de consoles/nintendo 64.png',

          aliases: [
            'nintendo 64',
            'n64',
          ],

          theme: {
            background: '#161616',
            secondary: '#292929',
            accent: '#f6c500',
            text: '#ffffff',
            muted: '#aaaaaa',
          },
        },

        {
          name: 'Nintendo GameCube',
          shortName: 'GameCube',
          key: 'gamecube',
          image: '/foto de consoles/gamecube.png',

          aliases: [
            'gamecube',
            'nintendo gamecube',
          ],

          theme: {
            background: '#1d1637',
            secondary: '#443074',
            accent: '#8c6ad6',
            text: '#ffffff',
            muted: '#beb1df',
          },
        },

        {
          name: 'Nintendo Wii',
          shortName: 'Wii',
          key: 'wii',
          image: '/foto de consoles/nintendo wii.png',

          aliases: [
            'nintendo wii',
            'wii',
          ],

          theme: {
            background: '#f7f9fa',
            secondary: '#dfecef',
            accent: '#34beed',
            text: '#20252a',
            muted: '#6f7b82',
          },
        },

        {
          name: 'Nintendo Wii U',
          shortName: 'Wii U',
          key: 'wiiu',
          image: '/foto de consoles/wiiu.png',

          aliases: [
            'nintendo wii u',
            'wii u',
          ],

          theme: {
            background: '#f5f7f8',
            secondary: '#dceff5',
            accent: '#009ac7',
            text: '#1d2529',
            muted: '#647780',
          },
        },

        {
          name: 'Nintendo Switch',
          shortName: 'Switch',
          key: 'switch',
          image: '/foto de consoles/switch.png',

          aliases: [
            'nintendo switch',
            'switch',
          ],

          theme: {
            background: '#e60012',
            secondary: '#97000c',
            accent: '#ffffff',
            text: '#ffffff',
            muted: '#ffd3d6',
          },
        },

        {
          name: 'Game Boy',
          shortName: 'Game Boy',
          key: 'gameboy',
          image: '/foto de consoles/gameboy.png',

          aliases: [
            'game boy',
          ],

          theme: {
            background: '#b7b8aa',
            secondary: '#93978a',
            accent: '#4c436f',
            text: '#20211d',
            muted: '#5e6158',
          },
        },

        {
          name: 'Game Boy Color',
          shortName: 'GBC',
          key: 'gameboy-color',
          image: '/foto de consoles/gameboycolor.png',

          aliases: [
            'game boy color',
            'gbc',
          ],

          theme: {
            background: '#451759',
            secondary: '#762b86',
            accent: '#e65ebf',
            text: '#ffffff',
            muted: '#dab5df',
          },
        },

        {
          name: 'Game Boy Advance',
          shortName: 'GBA',
          key: 'gba',
          image: '/foto de consoles/gba.png',

          aliases: [
            'game boy advance',
            'gba',
          ],

          theme: {
            background: '#37215d',
            secondary: '#6843a3',
            accent: '#a98ae0',
            text: '#ffffff',
            muted: '#c8b7e4',
          },
        },

        {
          name: 'Nintendo DS',
          shortName: 'DS',
          key: 'ds',
          image: '/foto de consoles/dsfat.png',

          aliases: [
            'nintendo ds',
            'ds',
          ],

          theme: {
            background: '#bfc3c8',
            secondary: '#8f959c',
            accent: '#ffffff',
            text: '#202327',
            muted: '#555b62',
          },
        },

        {
          name: 'Nintendo DS Lite',
          shortName: 'DS Lite',
          key: 'ds-lite',
          image: '/foto de consoles/dslite.png',

          aliases: [
            'nintendo ds lite',
            'ds lite',
          ],

          theme: {
            background: '#f1f3f5',
            secondary: '#cdd4da',
            accent: '#7d9cb8',
            text: '#20262c',
            muted: '#687784',
          },
        },

        {
          name: 'Nintendo DSi',
          shortName: 'DSi',
          key: 'dsi',
          image: '/foto de consoles/dsi.png',

          aliases: [
            'nintendo dsi',
            'dsi',
          ],

          theme: {
            background: '#eff4f6',
            secondary: '#cfe9f1',
            accent: '#44a9d0',
            text: '#1f2b31',
            muted: '#687c86',
          },
        },

        {
          name: 'Nintendo 3DS',
          shortName: '3DS',
          key: 'n3ds',
          image: '/foto de consoles/3ds.png',

          aliases: [
            'nintendo 3ds',
            '3ds',
          ],

          theme: {
            background: '#151515',
            secondary: '#420b0d',
            accent: '#e60012',
            text: '#ffffff',
            muted: '#c1a5a7',
          },
        },
      ],
    },

    {
      brand: 'Xbox',
      className: 'xbox',

      consoles: [
        {
          name: 'Xbox',
          shortName: 'Xbox',
          key: 'xbox',
          image: '/foto de consoles/Xbox classico.png',

          aliases: [
            'xbox',
          ],

          theme: {
            background: '#050805',
            secondary: '#092009',
            accent: '#52b043',
            text: '#ffffff',
            muted: '#99ae96',
          },
        },

        {
          name: 'Xbox 360',
          shortName: 'Xbox 360',
          key: 'xbox360',
          image: '/foto de consoles/xbox 360.png',

          aliases: [
            'xbox 360',
          ],

          theme: {
            background: '#f5f5f3',
            secondary: '#dfe5dc',
            accent: '#52b043',
            text: '#20241f',
            muted: '#697168',
          },
        },

        {
          name: 'Xbox One',
          shortName: 'Xbox One',
          key: 'xbox-one',
          image: '/foto de consoles/xboxone.png',

          aliases: [
            'xbox one',
          ],

          theme: {
            background: '#070907',
            secondary: '#111c11',
            accent: '#107c10',
            text: '#ffffff',
            muted: '#9cad9c',
          },
        },

        {
          name: 'Xbox Series S',
          shortName: 'Series S',
          key: 'series-s',
          image: '/foto de consoles/xboxones.png',

          aliases: [
            'xbox series s',
            'series s',
          ],

          theme: {
            background: '#f5f5f3',
            secondary: '#dfe4df',
            accent: '#107c10',
            text: '#202520',
            muted: '#697269',
          },
        },

        {
          name: 'Xbox Series X',
          shortName: 'Series X',
          key: 'series-x',
          image: '/foto de consoles/xboxseriesx.png',

          aliases: [
            'xbox series x',
            'series x',
          ],

          theme: {
            background: '#050705',
            secondary: '#0b1b0b',
            accent: '#19c83f',
            text: '#ffffff',
            muted: '#91a895',
          },
        },
      ],
    },
  ];

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return null;
    }

    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    return `http://127.0.0.1:8000${imagePath}`;
  };

  const getConsoleImage = (catalogConsole) => {
    return catalogConsole?.image || null;
  };

  const normalizeConsoleName = (name = '') => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[()]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const findOwnedConsole = (catalogConsole) => {
    return consoles.find((ownedConsole) => {
      const ownedName =
        normalizeConsoleName(
          ownedConsole.name
        );

      return catalogConsole.aliases.some(
        (alias) =>
          ownedName ===
          normalizeConsoleName(alias)
      );
    });
  };

  useEffect(() => {
    const fetchConsoles = async () => {
      try {
        const response =
          await api.get('consoles/');

        const data =
          response.data.results
            ? response.data.results
            : response.data;

        setConsoles(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          'Erro ao buscar consoles:',
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchConsoles();
  }, []);

  const handleConsoleClick = async (
    catalogConsole,
    ownedConsole,
    brand
  ) => {
    setSelectedConsole({
      ...catalogConsole,
      ownedData: ownedConsole || null,
      brand,
    });

    setGames([]);
    setCurrentGameIndex(0);
    setGamesLoading(true);

    try {
      const response =
        await api.get(
          'owned-games/',
          {
            params: {
              username: 'pedrolima',
            },
          }
        );

      const data =
        response.data.results
          ? response.data.results
          : response.data;

      const ownedGames =
        Array.isArray(data)
          ? data
          : [];

      const aliases =
        catalogConsole.aliases.map(
          normalizeConsoleName
        );

      const filteredGames =
        ownedGames.filter((entry) => {

          const platformName =
            entry.platform?.name ||
            entry.game_catalog
              ?.platform
              ?.name ||
            '';

          const normalizedPlatform =
            normalizeConsoleName(
              platformName
            );

          return aliases.some(
            (alias) =>
              normalizedPlatform === alias ||
              normalizedPlatform.includes(
                alias
              ) ||
              alias.includes(
                normalizedPlatform
              )
          );
        });

      setGames(filteredGames);
      setCurrentGameIndex(0);

    } catch (error) {
      console.error(
        'Erro ao buscar jogos da coleção:',
        error
      );

      setGames([]);
    } finally {
      setGamesLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedConsole(null);
    setGames([]);
    setCurrentGameIndex(0);
  };

  const handlePreviousGame =
    useCallback(() => {

      if (games.length === 0) {
        return;
      }

      setCurrentGameIndex(
        (currentIndex) =>
          currentIndex === 0
            ? games.length - 1
            : currentIndex - 1
      );

    }, [games.length]);

  const handleNextGame =
    useCallback(() => {

      if (games.length === 0) {
        return;
      }

      setCurrentGameIndex(
        (currentIndex) =>
          currentIndex ===
          games.length - 1
            ? 0
            : currentIndex + 1
      );

    }, [games.length]);

  useEffect(() => {
    if (
      !selectedConsole ||
      games.length <= 1
    ) {
      return undefined;
    }

    const handleKeyboard =
      (event) => {

        if (
          event.key ===
          'ArrowLeft'
        ) {
          handlePreviousGame();
        }

        if (
          event.key ===
          'ArrowRight'
        ) {
          handleNextGame();
        }
      };

    window.addEventListener(
      'keydown',
      handleKeyboard
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyboard
      );
    };

  }, [
    selectedConsole,
    games.length,
    handlePreviousGame,
    handleNextGame,
  ]);

  const pageStyle =
    selectedConsole?.theme
      ? {
          '--console-bg':
            selectedConsole.theme.background,

          '--console-secondary':
            selectedConsole.theme.secondary,

          '--console-accent':
            selectedConsole.theme.accent,

          '--console-text':
            selectedConsole.theme.text,

          '--console-muted':
            selectedConsole.theme.muted,
        }
      : {};

  const currentGame =
    games.length > 0
      ? games[currentGameIndex]
      : null;

  const currentGameData =
    currentGame?.game_catalog || null;

  const currentGameCover =
    currentGameData?.cover_image ||
    currentGameData?.cover_url ||
    null;

  const formatGameNumber =
    (number) =>
      String(number).padStart(
        2,
        '0'
      );

  return (
    <div
      className={`
        consoles-page
        ${
          selectedConsole
            ? `console-theme-active theme-${selectedConsole.key}`
            : ''
        }
      `}
      style={pageStyle}
    >

      <Navbar />

      <main className="consoles-main">

        {!selectedConsole && (
          <section className="consoles-hero">

            <div className="hero-badge">
              <Cpu size={16} />
              HARDWARE COLLECTION
            </div>

            <h1>
              Minha coleção de
              <span> consoles.</span>
            </h1>

            <p>
              Uma vitrine através das gerações
              de PlayStation, Nintendo e Xbox.
              Os consoles destacados fazem
              parte da minha coleção.
            </p>

            <div className="hero-info">
              <Gamepad2 size={20} />

              <strong>
                {consoles.length}
              </strong>

              <span>
                consoles na coleção
              </span>
            </div>

          </section>
        )}

        <section className="console-showcase">

          {loading ? (
            <div className="console-loading">

              <div className="loader"></div>

              <p>
                Carregando coleção...
              </p>

            </div>
          ) : (
            <>

              {!selectedConsole && (
                <div className="brands-showcase">

                  {consoleCatalog.map(
                    (brand) => (
                      <section
                        key={brand.brand}
                        className={
                          `brand-section ${brand.className}`
                        }
                      >

                        <div className="brand-header">

                          <div>

                            <span className="brand-small">
                              ECOSSISTEMA
                            </span>

                            <h2>
                              {brand.brand}
                            </h2>

                          </div>

                          <span className="brand-line"></span>

                        </div>

                        <div className="brand-consoles">

                          {brand.consoles.map(
                            (catalogConsole) => {

                              const ownedConsole =
                                findOwnedConsole(
                                  catalogConsole
                                );

                              const owned =
                                Boolean(
                                  ownedConsole
                                );

                              const consoleImage =
                                getConsoleImage(
                                  catalogConsole
                                );

                              return (
                                <article
                                  key={
                                    catalogConsole.key
                                  }
                                  className={`
                                    showcase-console
                                    ${catalogConsole.key}
                                    ${
                                      owned
                                        ? 'owned'
                                        : 'not-owned'
                                    }
                                    clickable
                                  `}
                                  onClick={() =>
                                    handleConsoleClick(
                                      catalogConsole,
                                      ownedConsole,
                                      brand.brand
                                    )
                                  }
                                >

                                  <div className="console-status">

                                    {owned ? (
                                      <>
                                        <Check
                                          size={14}
                                        />

                                        NA COLEÇÃO
                                      </>
                                    ) : (
                                      <>
                                        <Minus
                                          size={13}
                                        />

                                        NÃO POSSUO
                                      </>
                                    )}

                                  </div>

                                  <div className="showcase-image">

                                    <div className="showcase-glow"></div>

                                    {consoleImage ? (
                                      <img
                                        src={
                                          consoleImage
                                        }
                                        alt={
                                          catalogConsole.name
                                        }
                                        className={
                                          owned
                                            ? 'owned-console-image'
                                            : 'locked-console-image'
                                        }
                                      />
                                    ) : (
                                      <div className="console-placeholder">

                                        <Gamepad2
                                          size={45}
                                        />

                                      </div>
                                    )}

                                  </div>

                                  <div className="showcase-info">

                                    <span>
                                      {brand.brand}
                                    </span>

                                    <h3>
                                      {
                                        catalogConsole.shortName
                                      }
                                    </h3>

                                    <button
                                      className="explore-console"
                                      type="button"
                                      onClick={(event) => {

                                        event.stopPropagation();

                                        handleConsoleClick(
                                          catalogConsole,
                                          ownedConsole,
                                          brand.brand
                                        );
                                      }}
                                    >
                                      Explorar
                                    </button>

                                  </div>

                                </article>
                              );
                            }
                          )}

                        </div>

                      </section>
                    )
                  )}

                </div>
              )}

              {selectedConsole && (
                <section className="selected-console-section">

                  <button
                    type="button"
                    className="back-to-consoles"
                    onClick={handleBack}
                  >
                    <ArrowLeft size={18} />
                    Voltar para a vitrine
                  </button>

                  <div className="selected-console-header">

                    <div className="selected-console-text">

                      <span>
                        {selectedConsole.brand}
                      </span>

                      <h2>
                        {
                          selectedConsole.shortName
                        }
                      </h2>

                      <p>
                        Minha coleção de jogos
                      </p>

                      <div className="selected-games-count">

                        <strong>
                          {games.length}
                        </strong>

                        <span>
                          {games.length === 1
                            ? 'jogo'
                            : 'jogos'}
                        </span>

                      </div>

                    </div>

                    {getConsoleImage(
                      selectedConsole
                    ) && (
                      <div className="selected-console-image">

                        <div className="selected-console-glow"></div>

                        <img
                          src={
                            getConsoleImage(
                              selectedConsole
                            )
                          }
                          alt={
                            selectedConsole.shortName
                          }
                          className={
                            selectedConsole.ownedData
                              ? 'owned-console-image'
                              : 'locked-console-image'
                          }
                        />

                      </div>
                    )}

                  </div>

                  <div className="games-title">

                    <div>

                      <span>
                        BIBLIOTECA
                      </span>

                      <h3>
                        Meus jogos
                      </h3>

                    </div>

                    <div className="games-title-line"></div>

                  </div>

                  {gamesLoading ? (
                    <div className="console-loading">

                      <div className="loader"></div>

                      <p>
                        Carregando jogos...
                      </p>

                    </div>
                  ) : currentGame ? (
                    <div className="game-carousel">

                      <div className="game-carousel-stage">

                        {games.length > 1 && (
                          <button
                            type="button"
                            className="
                              game-carousel-arrow
                              game-carousel-arrow-left
                            "
                            onClick={
                              handlePreviousGame
                            }
                            aria-label="Jogo anterior"
                          >
                            <ChevronLeft
                              size={30}
                            />
                          </button>
                        )}

                        <div className="game-carousel-content">

                          <div className="game-carousel-cover-side">

                            <div className="game-carousel-cover-glow"></div>

                            <div
                              className="game-carousel-cover"
                              key={
                                `cover-${currentGame.id}`
                              }
                            >

                              {currentGameCover ? (
                                <img
                                  src={
                                    currentGameCover.startsWith(
                                      'http'
                                    )
                                      ? currentGameCover
                                      : getImageUrl(
                                          currentGameCover
                                        )
                                  }
                                  alt={
                                    currentGameData?.title
                                  }
                                />
                              ) : (
                                <div className="game-carousel-no-cover">

                                  <Gamepad2
                                    size={70}
                                  />

                                </div>
                              )}

                            </div>

                          </div>

                          <div
                            className="game-carousel-details"
                            key={
                              `details-${currentGame.id}`
                            }
                          >

                            <div className="game-carousel-eyebrow">

                              <Gamepad2
                                size={15}
                              />

                              JOGO DA COLEÇÃO

                            </div>

                            <h2>
                              {
                                currentGameData?.title
                              }
                            </h2>

                            {currentGameData?.genre && (
                              <p className="game-carousel-genre">
                                {
                                  currentGameData.genre
                                }
                              </p>
                            )}

                            <div className="game-carousel-metadata">

                              <div className="game-meta-item">

                                <div className="game-meta-icon">
                                  <Monitor
                                    size={18}
                                  />
                                </div>

                                <div>

                                  <span>
                                    Plataforma
                                  </span>

                                  <strong>
                                    {
                                      currentGame
                                        .platform
                                        ?.name
                                    }
                                  </strong>

                                </div>

                              </div>

                              <div className="game-meta-item">

                                <div className="game-meta-icon">
                                  <CalendarDays
                                    size={18}
                                  />
                                </div>

                                <div>

                                  <span>
                                    Ano
                                  </span>

                                  <strong>
                                    {
                                      currentGameData
                                        ?.release_year ||
                                      'Não informado'
                                    }
                                  </strong>

                                </div>

                              </div>

                              <div className="game-meta-item">

                                <div className="game-meta-icon">
                                  <Disc3
                                    size={18}
                                  />
                                </div>

                                <div>

                                  <span>
                                    Formato
                                  </span>

                                  <strong>
                                    {
                                      currentGame
                                        .ownership_type_display ||
                                      (
                                        currentGame
                                          .ownership_type ===
                                        'FISICO'
                                          ? 'Físico'
                                          : 'Digital'
                                      )
                                    }
                                  </strong>

                                </div>

                              </div>

                              <div className="game-meta-item">

                                <div className="game-meta-icon">

                                  {currentGame.completed ? (
                                    <Trophy
                                      size={18}
                                    />
                                  ) : (
                                    <Circle
                                      size={18}
                                    />
                                  )}

                                </div>

                                <div>

                                  <span>
                                    Progresso
                                  </span>

                                  <strong>
                                    {
                                      currentGame.completed
                                        ? 'Zerado'
                                        : 'Não zerado'
                                    }
                                  </strong>

                                </div>

                              </div>

                            </div>

                            <div className="game-carousel-footer">

                              <div className="game-carousel-counter">

                                <strong>
                                  {
                                    formatGameNumber(
                                      currentGameIndex + 1
                                    )
                                  }
                                </strong>

                                <span>
                                  /
                                </span>

                                <span>
                                  {
                                    formatGameNumber(
                                      games.length
                                    )
                                  }
                                </span>

                              </div>

                              {games.length > 1 && (
                                <span className="game-carousel-hint">
                                  Use ← → para navegar
                                </span>
                              )}

                            </div>

                          </div>

                        </div>

                        {games.length > 1 && (
                          <button
                            type="button"
                            className="
                              game-carousel-arrow
                              game-carousel-arrow-right
                            "
                            onClick={
                              handleNextGame
                            }
                            aria-label="Próximo jogo"
                          >
                            <ChevronRight
                              size={30}
                            />
                          </button>
                        )}

                      </div>

                    </div>
                  ) : (
                    <div className="no-console-games">

                      <Gamepad2
                        size={50}
                      />

                      <h3>
                        Nenhum jogo na coleção
                      </h3>

                      <p>
                        Você ainda não possui
                        nenhum jogo físico ou
                        digital cadastrado para
                        este console.
                      </p>

                    </div>
                  )}

                </section>
              )}

            </>
          )}

        </section>

      </main>

      <Footer />

    </div>
  );
}

export default ConsolesPage;