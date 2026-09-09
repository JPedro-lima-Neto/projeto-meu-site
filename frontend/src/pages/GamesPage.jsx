import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

import api from '../services/api';

import {
  Search,
  Plus,
  X,
  Gamepad2,
  Trophy,
  Check,
  LoaderCircle,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

import './GamesPage.css';


function GamesPage() {
  const [ownedGames, setOwnedGames] =
    useState([]);

  const [gameEntries, setGameEntries] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [selectedWorld, setSelectedWorld] =
    useState(null);

  const [detailGame, setDetailGame] =
    useState(null);

  const [showAddGame, setShowAddGame] =
    useState(false);

  const [searchTerm, setSearchTerm] =
    useState('');

  const [searchResults, setSearchResults] =
    useState([]);

  const [searching, setSearching] =
    useState(false);

  const [selectedGame, setSelectedGame] =
    useState(null);

  const [
    selectedPlatform,
    setSelectedPlatform,
  ] = useState('');

  const [owned, setOwned] =
    useState(false);

  const [
    ownershipType,
    setOwnershipType,
  ] = useState('FISICO');

  const [status, setStatus] =
    useState('JOGUEI');

  const [rating, setRating] =
    useState('');

  const [completed, setCompleted] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState('');

  const [
    galaxySearch,
    setGalaxySearch,
  ] = useState('');

  const [
    worldViewMode,
    setWorldViewMode,
  ] = useState('stars');


  const username =
    localStorage.getItem(
      'username'
    );


  const fetchMyGames =
    async () => {
      setLoading(true);

      try {
        const [
          ownedResponse,
          entriesResponse,
        ] = await Promise.all([
          api.get(
            'owned-games/',
            {
              params: {
                username,
              },
            }
          ),

          api.get(
            'library/',
            {
              params: {
                username,
              },
            }
          ),
        ]);

        const ownedData =
          ownedResponse.data.results ||
          ownedResponse.data;

        const entriesData =
          entriesResponse.data.results ||
          entriesResponse.data;

        setOwnedGames(
          Array.isArray(
            ownedData
          )
            ? ownedData
            : []
        );

        setGameEntries(
          Array.isArray(
            entriesData
          )
            ? entriesData
            : []
        );

      } catch (error) {
        console.error(
          'Erro ao carregar jogos:',
          error
        );

        setOwnedGames([]);
        setGameEntries([]);

      } finally {
        setLoading(false);
      }
    };


  useEffect(() => {
    fetchMyGames();
  }, []);


  useEffect(() => {
    const modalOpen =
      showAddGame ||
      detailGame;

    document.body.style.overflow =
      modalOpen
        ? 'hidden'
        : '';

    return () => {
      document.body.style.overflow =
        '';
    };
  }, [
    showAddGame,
    detailGame,
  ]);


  useEffect(() => {
    const handleEscape =
      (event) => {
        if (
          event.key !==
          'Escape'
        ) {
          return;
        }

        if (detailGame) {
          setDetailGame(null);
          return;
        }

        if (showAddGame) {
          setShowAddGame(false);
          return;
        }

        if (selectedWorld) {
          setSelectedWorld(null);
        }
      };

    window.addEventListener(
      'keydown',
      handleEscape
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleEscape
      );
    };
  }, [
    detailGame,
    showAddGame,
    selectedWorld,
  ]);


  const normalizePlatform =
    (platformName = '') => {
      return String(
        platformName
      )
        .toLowerCase()
        .normalize('NFD')
        .replace(
          /[\u0300-\u036f]/g,
          ''
        )
        .replace(
          /[^a-z0-9]+/g,
          '-'
        )
        .replace(
          /^-+|-+$/g,
          ''
        );
    };


  const normalizeText =
    (value = '') => {
      return String(
        value
      )
        .toLowerCase()
        .normalize('NFD')
        .replace(
          /[\u0300-\u036f]/g,
          ''
        );
    };


  const createSeed =
    (value = '') => {
      const text =
        String(
          value
        );

      let hash = 0;

      for (
        let index = 0;
        index < text.length;
        index += 1
      ) {
        hash =
          (
            (
              hash << 5
            ) -
            hash
          ) +
          text.charCodeAt(
            index
          );

        hash |= 0;
      }

      return Math.abs(
        hash
      );
    };


  const getGameEntry =
    (gameId) => {
      if (!gameId) {
        return null;
      }

      return (
        gameEntries.find(
          (entry) =>
            entry.game_catalog
              ?.id ===
            gameId
        ) ||
        null
      );
    };


  const worlds =
    useMemo(() => {
      const map =
        new Map();

      ownedGames.forEach(
        (entry) => {
          const platform =
            entry.platform;

          const game =
            entry.game_catalog;

          if (
            !platform?.name ||
            !game
          ) {
            return;
          }

          const key =
            platform.id ||
            platform.name;

          if (
            !map.has(
              key
            )
          ) {
            map.set(
              key,
              {
                id:
                  platform.id,

                igdbId:
                  platform.igdb_id,

                name:
                  platform.name,

                abbreviation:
                  platform.abbreviation,

                slug:
                  platform.slug,

                games: [],
              }
            );
          }

          map
            .get(
              key
            )
            .games
            .push(
              entry
            );
        }
      );

      return Array.from(
        map.values()
      )
        .map(
          (world) => ({
            ...world,

            games:
              Array.from(
                new Map(
                  world.games.map(
                    (entry) => [
                      entry.id,
                      entry,
                    ]
                  )
                ).values()
              ),
          })
        )
        .sort(
          (a, b) =>
            a.name.localeCompare(
              b.name
            )
        );
    }, [
      ownedGames,
    ]);


  const filteredWorlds =
    useMemo(() => {
      const query =
        normalizeText(
          galaxySearch.trim()
        );

      if (!query) {
        return worlds;
      }

      return worlds
        .map(
          (world) => ({
            ...world,

            games:
              world.games.filter(
                (entry) =>
                  normalizeText(
                    entry
                      .game_catalog
                      ?.title
                  ).includes(
                    query
                  )
              ),
          })
        )
        .filter(
          (world) =>
            world.games.length >
            0
        );
    }, [
      worlds,
      galaxySearch,
    ]);


  const completedGames =
    useMemo(() => {
      return gameEntries
        .filter(
          (entry) =>
            entry.status ===
              'ZEREI' ||
            entry.status ===
              'PLATINEI'
        )
        .map(
          (entry) => {
            const ownedEntry =
              ownedGames.find(
                (ownedGame) =>
                  ownedGame
                    .game_catalog
                    ?.id ===
                  entry
                    .game_catalog
                    ?.id
              );

            return {
              libraryEntry:
                entry,

              ownedEntry:
                ownedEntry ||
                null,

              game:
                entry.game_catalog,
            };
          }
        );
    }, [
      gameEntries,
      ownedGames,
    ]);


  const filteredCompletedGames =
    useMemo(() => {
      const query =
        normalizeText(
          galaxySearch.trim()
        );

      if (!query) {
        return completedGames;
      }

      return completedGames.filter(
        (item) =>
          normalizeText(
            item.game
              ?.title
          ).includes(
            query
          )
      );
    }, [
      completedGames,
      galaxySearch,
    ]);


  const totalOwnedGames =
    ownedGames.length;


  const completedCount =
    completedGames.length;


  const playingCount =
    useMemo(() => {
      return gameEntries.filter(
        (entry) =>
          entry.status ===
          'JOGANDO'
      ).length;
    }, [
      gameEntries,
    ]);


  const getWorldStyle =
    (
      world,
      index
    ) => {
      const seed =
        createSeed(
          `${world.name}-${index}`
        );

      const positions = [
        {
          x: 16,
          y: 26,
        },
        {
          x: 45,
          y: 18,
        },
        {
          x: 78,
          y: 26,
        },
        {
          x: 25,
          y: 65,
        },
        {
          x: 58,
          y: 69,
        },
        {
          x: 86,
          y: 66,
        },
        {
          x: 10,
          y: 79,
        },
        {
          x: 72,
          y: 48,
        },
        {
          x: 42,
          y: 45,
        },
      ];

      const position =
        positions[
          index %
          positions.length
        ];

      const size =
        130 +
        (
          seed %
          70
        );

      const delay =
        (
          seed %
          40
        ) /
        10;

      const duration =
        7 +
        (
          seed %
          7
        );

      const hue =
        seed %
        360;

      return {
        '--planet-x':
          `${position.x}%`,

        '--planet-y':
          `${position.y}%`,

        '--planet-size':
          `${size}px`,

        '--planet-delay':
          `-${delay}s`,

        '--planet-duration':
          `${duration}s`,

        '--planet-hue':
          hue,
      };
    };


  const getStarStyle =
    (
      ownedEntry,
      index
    ) => {
      const game =
        ownedEntry
          ?.game_catalog;

      const seed =
        createSeed(
          `${game?.id}-${game?.title}-${index}`
        );

      const rings = [
        {
          distance: 165,
          capacity: 6,
        },
        {
          distance: 245,
          capacity: 10,
        },
        {
          distance: 325,
          capacity: 14,
        },
        {
          distance: 405,
          capacity: 18,
        },
        {
          distance: 475,
          capacity: 22,
        },
      ];

      let remainingIndex =
        index;

      let ringIndex = 0;

      while (
        ringIndex <
          rings.length - 1 &&
        remainingIndex >=
          rings[ringIndex]
            .capacity
      ) {
        remainingIndex -=
          rings[ringIndex]
            .capacity;

        ringIndex += 1;
      }

      const ring =
        rings[
          ringIndex
        ];

      const slot =
        remainingIndex %
        ring.capacity;

      const step =
        360 /
        ring.capacity;

      const ringOffset =
        (
          ringIndex %
          2
        ) *
        (
          step /
          2
        );

      const seedOffset =
        (
          seed %
          9
        ) -
        4;

      const angle =
        (
          slot *
          step
        ) +
        ringOffset +
        seedOffset;

      const size =
        20 +
        (
          seed %
          7
        );

      return {
        '--star-angle':
          `${angle}deg`,

        '--star-distance':
          `${ring.distance}px`,

        '--star-size':
          `${size}px`,
      };
    };


  const getStatusLabel =
    (statusValue) => {
      const labels = {
        JOGUEI:
          'Joguei',

        JOGANDO:
          'Jogando',

        ZEREI:
          'Zerei',

        PLATINEI:
          'Platinei',

        PAUSADO:
          'Pausado',

        QUERO:
          'Quero jogar',
      };

      return (
        labels[
          statusValue
        ] ||
        statusValue ||
        'Não informado'
      );
    };


  const getOwnershipLabel =
    (ownedEntry) => {
      if (!ownedEntry) {
        return 'Não possuo';
      }

      if (
        ownedEntry
          .ownership_type_display
      ) {
        return (
          ownedEntry
            .ownership_type_display
        );
      }

      return (
        ownedEntry
          .ownership_type ===
        'DIGITAL'
          ? 'Digital'
          : 'Físico'
      );
    };


  const getStarState =
    (ownedEntry) => {
      const gameId =
        ownedEntry
          ?.game_catalog
          ?.id;

      const libraryEntry =
        getGameEntry(
          gameId
        );

      const classes = [
        'galaxy-game-star',
      ];

      if (
        ownedEntry
          ?.ownership_type ===
        'FISICO'
      ) {
        classes.push(
          'star-physical'
        );
      }

      if (
        ownedEntry
          ?.ownership_type ===
        'DIGITAL'
      ) {
        classes.push(
          'star-digital'
        );
      }

      if (
        libraryEntry
          ?.status ===
        'JOGANDO'
      ) {
        classes.push(
          'star-playing'
        );
      }

      if (
        libraryEntry
          ?.status ===
        'ZEREI'
      ) {
        classes.push(
          'star-completed'
        );
      }

      if (
        libraryEntry
          ?.status ===
        'PLATINEI'
      ) {
        classes.push(
          'star-platinum'
        );
      }

      return classes.join(
        ' '
      );
    };


  const openOwnedGameDetails =
    (
      ownedEntry
    ) => {
      const game =
        ownedEntry
          ?.game_catalog;

      if (!game) {
        return;
      }

      setDetailGame({
        game,

        ownedEntry,

        libraryEntry:
          getGameEntry(
            game.id
          ),
      });
    };


  const openCompletedGameDetails =
    (
      item
    ) => {
      if (!item.game) {
        return;
      }

      setDetailGame({
        game:
          item.game,

        ownedEntry:
          item.ownedEntry,

        libraryEntry:
          item.libraryEntry,
      });
    };


  const searchGames =
    async (
      event
    ) => {
      event.preventDefault();

      const query =
        searchTerm.trim();

      if (!query) {
        return;
      }

      setSearching(true);
      setMessage('');
      setSelectedGame(null);
      setSearchResults([]);

      try {
        const response =
          await api.get(
            'catalog/search-igdb/',
            {
              params: {
                q: query,
              },
            }
          );

        const data =
          response.data.results ||
          response.data;

        setSearchResults(
          Array.isArray(
            data
          )
            ? data
            : []
        );

      } catch (error) {
        console.error(
          'Erro na busca IGDB:',
          error
        );

        setSearchResults([]);

        setMessage(
          error.response
            ?.data
            ?.error ||
          'Não foi possível pesquisar os jogos.'
        );

      } finally {
        setSearching(false);
      }
    };


  const selectGame =
    (
      game
    ) => {
      setSelectedGame(
        game
      );

      setSelectedPlatform(
        game.platforms?.[0] ||
        ''
      );

      setOwned(false);

      setOwnershipType(
        'FISICO'
      );

      setStatus(
        'JOGUEI'
      );

      setRating('');

      setCompleted(false);

      setMessage('');
    };


  const resetModal =
    () => {
      setShowAddGame(false);

      setSelectedGame(null);

      setSearchResults([]);

      setSearchTerm('');

      setMessage('');

      setOwned(false);

      setOwnershipType(
        'FISICO'
      );

      setStatus(
        'JOGUEI'
      );

      setRating('');

      setCompleted(false);

      setSelectedPlatform('');
    };


  const saveGame =
    async () => {
      if (!selectedGame) {
        return;
      }

      if (!selectedPlatform) {
        setMessage(
          'Escolha uma plataforma.'
        );

        return;
      }

      setSaving(true);
      setMessage('');

      try {
        await api.post(
          'catalog/import-igdb/',
          {
            igdb_id:
              selectedGame.igdb_id,

            platform:
              selectedPlatform,

            owned,

            ownership_type:
              ownershipType,

            status,

            rating:
              rating !== ''
                ? Number(
                    rating
                  )
                : null,

            completed,
          }
        );

        setMessage(
          'Jogo salvo com sucesso!'
        );

        await fetchMyGames();

        setTimeout(
          () => {
            resetModal();
          },
          900
        );

      } catch (error) {
        console.error(
          'Erro ao salvar jogo:',
          error
        );

        setMessage(
          error.response
            ?.data
            ?.error ||
          'Não foi possível salvar o jogo.'
        );

      } finally {
        setSaving(false);
      }
    };


  const formatRating =
    (
      value
    ) => {
      if (
        value === null ||
        value === undefined ||
        value === ''
      ) {
        return 'Sem nota';
      }

      const number =
        Number(
          value
        );

      if (
        Number.isNaN(
          number
        )
      ) {
        return value;
      }

      return number.toFixed(
        1
      );
    };


  const selectedWorldGames =
    selectedWorld
      ? selectedWorld.games
      : [];


  const selectedWorldCompleted =
    selectedWorldGames.filter(
      (entry) => {
        const libraryEntry =
          getGameEntry(
            entry.game_catalog
              ?.id
          );

        return (
          libraryEntry
            ?.status ===
            'ZEREI' ||
          libraryEntry
            ?.status ===
            'PLATINEI'
        );
      }
    ).length;


  const selectedWorldPhysical =
    selectedWorldGames.filter(
      (entry) =>
        entry.ownership_type ===
        'FISICO'
    ).length;


  const selectedWorldDigital =
    selectedWorldGames.filter(
      (entry) =>
        entry.ownership_type ===
        'DIGITAL'
    ).length;


  return (
    <div className="games-page">

      <Navbar />


      <main className="games-main">


        <div className="galaxy-background">

          <div className="galaxy-nebula galaxy-nebula-one">
          </div>

          <div className="galaxy-nebula galaxy-nebula-two">
          </div>

          <div className="galaxy-nebula galaxy-nebula-three">
          </div>


          {Array.from(
            {
              length: 110,
            }
          ).map(
            (
              _,
              index
            ) => {
              const seed =
                createSeed(
                  `background-star-${index}`
                );

              return (
                <span
                  key={
                    index
                  }
                  className="galaxy-background-star"
                  style={{
                    '--bg-star-x':
                      `${seed % 100}%`,

                    '--bg-star-y':
                      `${
                        (
                          seed *
                          7
                        ) %
                        100
                      }%`,

                    '--bg-star-size':
                      `${
                        1 +
                        (
                          seed %
                          3
                        )
                      }px`,

                    '--bg-star-delay':
                      `-${
                        (
                          seed %
                          40
                        ) /
                        10
                      }s`,
                  }}
                />
              );
            }
          )}

        </div>


        {!selectedWorld && (
          <section className="galaxy-view">


            <header className="galaxy-header">

              <div className="galaxy-header-copy">

                <div className="galaxy-eyebrow">

                  <Sparkles
                    size={15}
                  />

                  MINHA GALÁXIA

                </div>


                <h1>
                  Universo
                  <span>
                    de Jogos.
                  </span>
                </h1>


                <p>
                  Cada planeta representa
                  uma plataforma da minha
                  coleção. Entre em um
                  mundo e descubra os jogos
                  espalhados como estrelas
                  pelo universo.
                </p>

              </div>


              <div className="galaxy-header-actions">

                <div className="galaxy-comet-search">

                  <span className="galaxy-comet-tail">
                  </span>

                  <span className="galaxy-comet-tail galaxy-comet-tail-two">
                  </span>

                  <span className="galaxy-comet-glow">
                  </span>

                  <div className="galaxy-comet-body">

                    <Search
                      size={19}
                    />

                    <input
                      type="text"
                      value={
                        galaxySearch
                      }
                      placeholder="Buscar jogo..."
                      onChange={(
                        event
                      ) =>
                        setGalaxySearch(
                          event
                            .target
                            .value
                        )
                      }
                    />

                    {galaxySearch && (
                      <button
                        type="button"
                        onClick={() =>
                          setGalaxySearch('')
                        }
                      >

                        <X
                          size={15}
                        />

                      </button>
                    )}

                  </div>

                </div>


                <button
                  type="button"
                  className="galaxy-add-game"
                  onClick={() =>
                    setShowAddGame(
                      true
                    )
                  }
                >

                  <Plus
                    size={18}
                  />

                  Adicionar jogo

                </button>

              </div>

            </header>


            <div className="galaxy-hud">

              <div className="galaxy-hud-item">

                <span>
                  MUNDOS
                </span>

                <strong>
                  {worlds.length}
                </strong>

              </div>


              <div className="galaxy-hud-item">

                <span>
                  JOGOS
                </span>

                <strong>
                  {totalOwnedGames}
                </strong>

              </div>


              <div className="galaxy-hud-item">

                <span>
                  CONCLUÍDOS
                </span>

                <strong>
                  {completedCount}
                </strong>

              </div>


              <div className="galaxy-hud-item">

                <span>
                  EM JOGO
                </span>

                <strong>
                  {playingCount}
                </strong>

              </div>

            </div>


            {loading ? (
              <div className="galaxy-loading">

                <LoaderCircle
                  size={34}
                />

                <span>
                  Formando galáxia...
                </span>

              </div>
            ) : filteredWorlds.length > 0 ? (
              <div className="galaxy-space">


                <div className="galaxy-core">

                  <div className="galaxy-core-ring galaxy-core-ring-one">
                  </div>

                  <div className="galaxy-core-ring galaxy-core-ring-two">
                  </div>

                  <div className="galaxy-core-light">
                  </div>

                </div>


                {filteredWorlds.map(
                  (
                    world,
                    index
                  ) => (
                    <button
                      key={
                        world.id ||
                        world.name
                      }
                      type="button"
                      className={`
                        galaxy-planet-wrapper
                        planet-${
                          normalizePlatform(
                            world.name
                          )
                        }
                      `}
                      style={
                        getWorldStyle(
                          world,
                          index
                        )
                      }
                      onClick={() => {
                        setSelectedWorld(
                          world
                        );

                        setWorldViewMode(
                          'stars'
                        );
                      }}
                    >

                      <span className="galaxy-planet-orbit">
                      </span>

                      <span className="galaxy-planet">

                        <span className="galaxy-planet-surface">
                        </span>

                        <span className="galaxy-planet-light">
                        </span>

                        <span className="galaxy-planet-shadow">
                        </span>

                      </span>


                      <span className="galaxy-planet-info">

                        <strong>
                          {
                            world
                              .abbreviation ||
                            world.name
                          }
                        </strong>

                        <small>
                          {
                            world.games
                              .length
                          }{' '}
                          {
                            world.games
                              .length ===
                            1
                              ? 'jogo'
                              : 'jogos'
                          }
                        </small>

                      </span>

                    </button>
                  )
                )}

              </div>
            ) : (
              <div className="galaxy-empty">

                <Gamepad2
                  size={54}
                />

                <h2>
                  Nenhum jogo encontrado
                </h2>

                <p>
                  Tente pesquisar por outro
                  nome.
                </p>

              </div>
            )}


            {filteredCompletedGames.length >
              0 && (
              <section className="meteor-section">


                <div
                  className="meteor-section-header"
                  style={{
                    maxWidth: 'none',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    gap: '32px',
                    flexWrap: 'wrap',
                  }}
                >

                  <div
                    style={{
                      minWidth: 0,
                      flex: '1 1 420px',
                    }}
                  >

                    <div className="meteor-eyebrow">

                      <Trophy
                        size={14}
                      />

                      CONSTELAÇÃO CONCLUÍDA

                    </div>

                    <h2>
                      Estrelas
                      <span>
                        conquistadas.
                      </span>
                    </h2>

                    <p>
                      Jogos zerados e platinados
                      ficam registrados aqui como
                      estrelas fixas da sua jornada.
                    </p>

                  </div>


                  <div
                    className="meteor-comet-search"
                    style={{
                      width: 'min(520px, 100%)',
                      margin: 0,
                      flex: '0 1 520px',
                    }}
                  >

                    <span className="meteor-comet-flame">
                    </span>

                    <span className="meteor-comet-flame meteor-comet-flame-two">
                    </span>

                    <span className="meteor-comet-glow">
                    </span>

                    <div className="meteor-search-body">

                      <Search
                        size={18}
                      />

                      <input
                        type="text"
                        value={
                          galaxySearch
                        }
                        placeholder="Buscar nas conquistas..."
                        onChange={(
                          event
                        ) =>
                          setGalaxySearch(
                            event
                              .target
                              .value
                          )
                        }
                      />

                      {galaxySearch && (
                        <button
                          type="button"
                          onClick={() =>
                            setGalaxySearch('')
                          }
                        >

                          <X
                            size={15}
                          />

                        </button>
                      )}

                    </div>

                  </div>

                </div>


                <div className="completed-games-grid">

                  {filteredCompletedGames.map(
                    (
                      item,
                      index
                    ) => (
                      <button
                        key={
                          `${item.game?.id}-${index}`
                        }
                        type="button"
                        className={`
                          completed-game-card
                          ${
                            item
                              .libraryEntry
                              ?.status ===
                            'PLATINEI'
                              ? 'completed-game-card-platinum'
                              : ''
                          }
                        `}
                        onClick={() =>
                          openCompletedGameDetails(
                            item
                          )
                        }
                      >

                        <span className="completed-game-card-stars">

                          <span className="completed-game-card-star completed-game-card-star-one">
                          </span>

                          <span className="completed-game-card-star completed-game-card-star-two">
                          </span>

                          <span className="completed-game-card-star completed-game-card-star-three">
                          </span>

                        </span>


                        <span className="completed-game-cover">

                          {item.game
                            ?.cover_url ? (
                            <img
                              src={
                                item.game
                                  .cover_url
                              }
                              alt={
                                item.game
                                  .title
                              }
                            />
                          ) : (
                            <span className="completed-game-no-cover">

                              <Gamepad2
                                size={42}
                              />

                            </span>
                          )}

                          <span className="completed-game-status">

                            {
                              item
                                .libraryEntry
                                ?.status ===
                              'PLATINEI'
                                ? 'PLATINADO'
                                : 'ZERADO'
                            }

                          </span>

                        </span>


                        <span className="completed-game-content">

                          <span className="completed-game-eyebrow">

                            <Sparkles
                              size={13}
                            />

                            ESTRELA CONQUISTADA

                          </span>

                          <strong>
                            {
                              item.game
                                ?.title ||
                              'Jogo'
                            }
                          </strong>

                          <small>

                            {
                              item
                                .ownedEntry
                                ?.platform
                                ?.name ||
                              'Plataforma não informada'
                            }

                          </small>

                          <span className="completed-game-footer">

                            <span>

                              <Trophy
                                size={14}
                              />

                              {
                                item
                                  .libraryEntry
                                  ?.status ===
                                'PLATINEI'
                                  ? 'Platinado'
                                  : 'Concluído'
                              }

                            </span>

                            {
                              item
                                .libraryEntry
                                ?.rating !==
                                null &&
                              item
                                .libraryEntry
                                ?.rating !==
                                undefined && (
                                <span>
                                  {
                                    item
                                      .libraryEntry
                                      .rating
                                  }/10
                                </span>
                              )
                            }

                          </span>

                        </span>

                      </button>
                    )
                  )}

                </div>



              </section>
            )}

          </section>
        )}


        {selectedWorld && (
          <section className="world-view">


            <header className="world-header">

              <button
                type="button"
                className="world-back"
                onClick={() => {
                  setSelectedWorld(
                    null
                  );

                  setDetailGame(
                    null
                  );

                  setWorldViewMode(
                    'stars'
                  );
                }}
              >

                <ArrowLeft
                  size={18}
                />

                Voltar à galáxia

              </button>


              <div className="world-header-content">

                <div>

                  <div className="world-eyebrow">

                    <Sparkles
                      size={14}
                    />

                    MUNDO EXPLORADO

                  </div>


                  <h1>
                    {
                      selectedWorld
                        .name
                    }
                  </h1>


                  <p>
                    Cada estrela representa
                    um jogo da sua coleção
                    nesta plataforma.
                  </p>

                </div>


                <div className="world-stats">

                  <div>

                    <span>
                      ESTRELAS
                    </span>

                    <strong>
                      {
                        selectedWorldGames
                          .length
                      }
                    </strong>

                  </div>


                  <div>

                    <span>
                      FÍSICOS
                    </span>

                    <strong>
                      {
                        selectedWorldPhysical
                      }
                    </strong>

                  </div>


                  <div>

                    <span>
                      DIGITAIS
                    </span>

                    <strong>
                      {
                        selectedWorldDigital
                      }
                    </strong>

                  </div>


                  <div>

                    <span>
                      CONCLUÍDOS
                    </span>

                    <strong>
                      {
                        selectedWorldCompleted
                      }
                    </strong>

                  </div>

                </div>


                <button
                  type="button"
                  className="world-view-toggle"
                  onClick={() =>
                    setWorldViewMode(
                      (
                        currentMode
                      ) =>
                        currentMode ===
                        'stars'
                          ? 'list'
                          : 'stars'
                    )
                  }
                >

                  <Gamepad2
                    size={17}
                  />

                  {
                    worldViewMode ===
                    'stars'
                      ? 'Ver em lista'
                      : 'Ver como estrelas'
                  }

                </button>

              </div>

            </header>


            {worldViewMode ===
              'stars' ? (
              <div className="world-system">


              <div className="world-orbit world-orbit-one">
              </div>

              <div className="world-orbit world-orbit-two">
              </div>

              <div className="world-orbit world-orbit-three">
              </div>

              <div className="world-orbit world-orbit-four">
              </div>


              <div className="world-planet-center">

                <div className="world-planet-atmosphere">
                </div>

                <div
                  className={`
                    world-planet
                    planet-${
                      normalizePlatform(
                        selectedWorld.name
                      )
                    }
                  `}
                >

                  <div className="world-planet-surface">
                  </div>

                  <div className="world-planet-highlight">
                  </div>

                  <div className="world-planet-shadow">
                  </div>

                </div>


                <div className="world-planet-name">

                  <span>
                    PLATAFORMA
                  </span>

                  <strong>
                    {
                      selectedWorld
                        .abbreviation ||
                      selectedWorld
                        .name
                    }
                  </strong>

                </div>

              </div>


              {selectedWorldGames.map(
                (
                  ownedEntry,
                  index
                ) => {
                  const game =
                    ownedEntry
                      .game_catalog;

return (
                    <button
                      key={
                        `${ownedEntry.id}-${index}`
                      }
                      type="button"
                      className={
                        getStarState(
                          ownedEntry
                        )
                      }
                      style={
                        getStarStyle(
                          ownedEntry,
                          index
                        )
                      }
                      onClick={() =>
                        openOwnedGameDetails(
                          ownedEntry
                        )
                      }
                    >
                      <span className="galaxy-star-pulse">
                      </span>

                      <span className="galaxy-star-core">
                      </span>

                      <span className="galaxy-star-name">
                        {
                          game?.title ||
                          'Jogo'
                        }
                      </span>

                    </button>
                  );
                }
              )}


              <div className="world-legend">

                <div>

                  <span className="legend-symbol legend-physical">
                  </span>

                  Físico

                </div>


                <div>

                  <span className="legend-symbol legend-digital">
                  </span>

                  Digital

                </div>


                <div>

                  <span className="legend-symbol legend-completed">
                  </span>

                  Zerado

                </div>


                <div>

                  <span className="legend-symbol legend-playing">
                  </span>

                  Jogando

                </div>


                <div>

                  <span className="legend-symbol legend-platinum">
                  </span>

                  Platinado

                </div>

              </div>

            </div>
            ) : (
              <div className="world-list-view">

                <div className="world-list-heading">

                  <div>

                    <span>
                      BIBLIOTECA DO MUNDO
                    </span>

                    <h2>
                      Jogos de {
                        selectedWorld
                          .abbreviation ||
                        selectedWorld
                          .name
                      }
                    </h2>

                  </div>

                  <strong>
                    {
                      selectedWorldGames
                        .length
                    }
                  </strong>

                </div>


                <div className="world-games-grid">

                  {selectedWorldGames.map(
                    (
                      ownedEntry
                    ) => {
                      const game =
                        ownedEntry
                          .game_catalog;

                      const libraryEntry =
                        getGameEntry(
                          game?.id
                        );

                      return (
                        <button
                          key={
                            ownedEntry.id
                          }
                          type="button"
                          className="world-game-card"
                          onClick={() =>
                            openOwnedGameDetails(
                              ownedEntry
                            )
                          }
                        >

                          <span className="world-game-card-cover">

                            {game?.cover_url ? (
                              <img
                                src={
                                  game.cover_url
                                }
                                alt={
                                  game.title
                                }
                              />
                            ) : (
                              <span className="world-game-card-no-cover">

                                <Gamepad2
                                  size={44}
                                />

                              </span>
                            )}

                            <span className="world-game-card-format">
                              {
                                getOwnershipLabel(
                                  ownedEntry
                                )
                              }
                            </span>

                          </span>


                          <span className="world-game-card-content">

                            <span className="world-game-card-eyebrow">

                              <Sparkles
                                size={12}
                              />

                              ESTRELA DO MUNDO

                            </span>

                            <strong>
                              {
                                game?.title ||
                                'Jogo'
                              }
                            </strong>

                            <small>
                              {
                                game
                                  ?.release_year ||
                                'Ano não informado'
                              }
                            </small>

                            <span className="world-game-card-footer">

                              <span>
                                {
                                  getStatusLabel(
                                    libraryEntry
                                      ?.status
                                  )
                                }
                              </span>

                              <span>
                                {
                                  libraryEntry
                                    ?.rating !==
                                    null &&
                                  libraryEntry
                                    ?.rating !==
                                    undefined
                                    ? `${libraryEntry.rating}/10`
                                    : 'Sem nota'
                                }
                              </span>

                            </span>

                          </span>

                        </button>
                      );
                    }
                  )}

                </div>

              </div>
            )}

          </section>
        )}


        {detailGame && (
          <div
            className="game-star-detail-backdrop"
            onMouseDown={(
              event
            ) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                setDetailGame(
                  null
                );
              }
            }}
          >

            <section className="game-star-detail">


              <button
                type="button"
                className="game-star-detail-close"
                onClick={() =>
                  setDetailGame(
                    null
                  )
                }
              >

                <X
                  size={20}
                />

              </button>


              <div className="game-star-detail-cover">

                <div className="game-star-cover-glow">
                </div>

                <div className="game-star-cover-frame">

                  {detailGame
                    .game
                    ?.cover_url ? (
                    <img
                      src={
                        detailGame
                          .game
                          .cover_url
                      }
                      alt={
                        detailGame
                          .game
                          .title
                      }
                    />
                  ) : (
                    <div className="game-star-no-cover">

                      <Gamepad2
                        size={60}
                      />

                    </div>
                  )}

                </div>

              </div>


              <div className="game-star-detail-info">

                <div className="game-star-detail-eyebrow">

                  <Sparkles
                    size={14}
                  />

                  ESTRELA DESCOBERTA

                </div>


                <h2>
                  {
                    detailGame
                      .game
                      ?.title
                  }
                </h2>


                <div className="game-star-detail-tags">

                  {detailGame
                    .game
                    ?.release_year && (
                    <span>
                      {
                        detailGame
                          .game
                          .release_year
                      }
                    </span>
                  )}


                  {Array.isArray(
                    detailGame
                      .game
                      ?.genres
                  ) &&
                    detailGame
                      .game
                      .genres
                      .map(
                        (
                          genre
                        ) => (
                          <span
                            key={
                              genre
                            }
                          >
                            {genre}
                          </span>
                        )
                      )}

                </div>


                <div className="game-star-detail-grid">


                  <div>

                    <span>
                      Plataforma
                    </span>

                    <strong>
                      {
                        detailGame
                          .ownedEntry
                          ?.platform
                          ?.name ||
                        'Não informada'
                      }
                    </strong>

                  </div>


                  <div>

                    <span>
                      Formato
                    </span>

                    <strong>
                      {
                        getOwnershipLabel(
                          detailGame
                            .ownedEntry
                        )
                      }
                    </strong>

                  </div>


                  <div>

                    <span>
                      Status
                    </span>

                    <strong>
                      {
                        getStatusLabel(
                          detailGame
                            .libraryEntry
                            ?.status
                        )
                      }
                    </strong>

                  </div>


                  <div>

                    <span>
                      Minha nota
                    </span>

                    <strong>
                      {
                        detailGame
                          .libraryEntry
                          ?.rating !==
                          null &&
                        detailGame
                          .libraryEntry
                          ?.rating !==
                          undefined
                          ? `${detailGame.libraryEntry.rating}/10`
                          : 'Sem nota'
                      }
                    </strong>

                  </div>


                  <div>

                    <span>
                      Nota IGDB
                    </span>

                    <strong>
                      {
                        formatRating(
                          detailGame
                            .game
                            ?.igdb_rating
                        )
                      }
                    </strong>

                  </div>


                  <div>

                    <span>
                      Crítica
                    </span>

                    <strong>
                      {
                        formatRating(
                          detailGame
                            .game
                            ?.aggregated_rating
                        )
                      }
                    </strong>

                  </div>

                </div>


                {detailGame
                  .libraryEntry
                  ?.status ===
                    'ZEREI' && (
                  <div className="game-star-achievement">

                    <Trophy
                      size={19}
                    />

                    Jogo concluído

                  </div>
                )}


                {detailGame
                  .libraryEntry
                  ?.status ===
                    'PLATINEI' && (
                  <div className="game-star-achievement game-star-platinum">

                    <Trophy
                      size={19}
                    />

                    Jogo platinado

                  </div>
                )}

              </div>

            </section>

          </div>
        )}


        {showAddGame && (
          <div className="games-modal-backdrop">

            <div className="games-modal">


              <div className="games-modal-header">

                <div>

                  <span>
                    IGDB DATABASE
                  </span>

                  <h2>
                    Adicionar jogo
                  </h2>

                </div>


                <button
                  type="button"
                  className="games-close-button"
                  onClick={
                    resetModal
                  }
                >

                  <X
                    size={20}
                  />

                </button>

              </div>


              {!selectedGame ? (
                <>


                  <form
                    className="games-search-form"
                    onSubmit={
                      searchGames
                    }
                  >

                    <Search
                      size={19}
                    />


                    <input
                      type="text"
                      value={
                        searchTerm
                      }
                      placeholder="Pesquisar na IGDB..."
                      onChange={(
                        event
                      ) =>
                        setSearchTerm(
                          event
                            .target
                            .value
                        )
                      }
                    />


                    <button
                      type="submit"
                      disabled={
                        searching
                      }
                    >

                      {searching ? (
                        <LoaderCircle
                          size={18}
                        />
                      ) : (
                        'Buscar'
                      )}

                    </button>

                  </form>


                  {searching && (
                    <div className="games-loading">

                      <LoaderCircle
                        size={26}
                      />

                      <span>
                        Pesquisando na
                        IGDB...
                      </span>

                    </div>
                  )}


                  {!searching && (
                    <div className="games-search-results">

                      {searchResults.map(
                        (
                          game
                        ) => (
                          <button
                            type="button"
                            key={
                              game.igdb_id
                            }
                            className="games-search-card"
                            onClick={() =>
                              selectGame(
                                game
                              )
                            }
                          >

                            <div className="games-search-cover">

                              {game.cover_url ? (
                                <img
                                  src={
                                    game.cover_url
                                  }
                                  alt={
                                    game.name
                                  }
                                />
                              ) : (
                                <div className="games-no-cover">

                                  <Gamepad2
                                    size={46}
                                  />

                                </div>
                              )}

                            </div>


                            <div className="games-search-card-info">

                              <strong>
                                {
                                  game.name
                                }
                              </strong>

                              <p>
                                {
                                  game
                                    .release_year ||
                                  'Ano desconhecido'
                                }
                              </p>

                              <small>
                                {
                                  game.platforms
                                    ?.slice(
                                      0,
                                      3
                                    )
                                    .join(
                                      ' • '
                                    ) ||
                                  'Plataforma não informada'
                                }
                              </small>

                            </div>

                          </button>
                        )
                      )}

                    </div>
                  )}


                  {!searching &&
                    searchTerm &&
                    searchResults.length ===
                      0 &&
                    !message && (
                      <div className="games-empty">

                        Nenhum resultado
                        encontrado.

                      </div>
                    )}


                  {message && (
                    <p className="games-message">

                      {message}

                    </p>
                  )}

                </>
              ) : (
                <>


                  <button
                    type="button"
                    className="games-selected-back"
                    onClick={() => {
                      setSelectedGame(
                        null
                      );

                      setMessage('');
                    }}
                  >

                    <ArrowLeft
                      size={17}
                    />

                    Voltar para resultados

                  </button>


                  <div className="games-selected-layout">


                    <div className="games-selected-cover">

                      {selectedGame
                        .cover_url ? (
                        <img
                          src={
                            selectedGame
                              .cover_url
                          }
                          alt={
                            selectedGame
                              .name
                          }
                        />
                      ) : (
                        <div className="games-no-cover">

                          <Gamepad2
                            size={60}
                          />

                        </div>
                      )}

                    </div>


                    <div className="games-selected-info">

                      <span className="games-selected-year">
                        {
                          selectedGame
                            .release_year ||
                          'ANO DESCONHECIDO'
                        }
                      </span>


                      <h2>
                        {
                          selectedGame
                            .name
                        }
                      </h2>


                      <div className="games-field">

                        <label>
                          Plataforma
                        </label>

                        <select
                          value={
                            selectedPlatform
                          }
                          onChange={(
                            event
                          ) =>
                            setSelectedPlatform(
                              event
                                .target
                                .value
                            )
                          }
                        >

                          {selectedGame
                            .platforms
                            ?.map(
                              (
                                platform
                              ) => (
                                <option
                                  key={
                                    platform
                                  }
                                  value={
                                    platform
                                  }
                                >
                                  {
                                    platform
                                  }
                                </option>
                              )
                            )}

                        </select>

                      </div>


                      <label className="games-checkbox">

                        <input
                          type="checkbox"
                          checked={
                            owned
                          }
                          onChange={(
                            event
                          ) =>
                            setOwned(
                              event
                                .target
                                .checked
                            )
                          }
                        />

                        <span>
                          Tenho esse jogo
                        </span>

                      </label>


                      {owned && (
                        <div className="games-field">

                          <label>
                            Formato
                          </label>

                          <select
                            value={
                              ownershipType
                            }
                            onChange={(
                              event
                            ) =>
                              setOwnershipType(
                                event
                                  .target
                                  .value
                              )
                            }
                          >

                            <option
                              value="FISICO"
                            >
                              Físico
                            </option>

                            <option
                              value="DIGITAL"
                            >
                              Digital
                            </option>

                          </select>

                        </div>
                      )}


                      <div className="games-field">

                        <label>
                          Status
                        </label>

                        <select
                          value={
                            status
                          }
                          onChange={(
                            event
                          ) => {
                            const value =
                              event
                                .target
                                .value;

                            setStatus(
                              value
                            );

                            setCompleted(
                              value ===
                                'ZEREI' ||
                              value ===
                                'PLATINEI'
                            );
                          }}
                        >

                          <option value="JOGUEI">
                            Joguei
                          </option>

                          <option value="JOGANDO">
                            Jogando
                          </option>

                          <option value="ZEREI">
                            Zerei
                          </option>

                          <option value="PLATINEI">
                            Platinei
                          </option>

                          <option value="PAUSADO">
                            Pausado
                          </option>

                          <option value="QUERO">
                            Quero jogar
                          </option>

                        </select>

                      </div>


                      <div className="games-field">

                        <label>
                          Minha nota
                        </label>

                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.5"
                          placeholder="0 a 10"
                          value={
                            rating
                          }
                          onChange={(
                            event
                          ) =>
                            setRating(
                              event
                                .target
                                .value
                            )
                          }
                        />

                      </div>


                      <button
                        type="button"
                        className="games-save-button"
                        onClick={
                          saveGame
                        }
                        disabled={
                          saving
                        }
                      >

                        {saving ? (
                          <>

                            <LoaderCircle
                              size={18}
                            />

                            Salvando...

                          </>
                        ) : (
                          <>

                            <Check
                              size={18}
                            />

                            Salvar jogo

                          </>
                        )}

                      </button>


                      {message && (
                        <p className="games-message">

                          {message}

                        </p>
                      )}

                    </div>

                  </div>

                </>
              )}

            </div>

          </div>
        )}

      </main>


      <Footer />

    </div>
  );
}


export default GamesPage;