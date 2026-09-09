import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  BookOpen,
  Gamepad2,
  Home,
  Search,
  Sparkles,
  Star,
  Trophy,
  UserRound,
  Map,
} from 'lucide-react';

import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

import cidadePokemon from '../assets/cidade.png';
import hallOfFameSprite from '../assets/halloffame.png';
import ginasioSprite from '../assets/ginasio.png';
import laboratorioSprite from '../assets/laboratorio.png';
import centroPokemonSprite from '../assets/centropokemon.png';
import casaSprite from '../assets/casa.png';
import colecaoSprite from '../assets/coleção.png';
import gameCenterSprite from '../assets/game.png';

import './PokemonPage.css';

function PokemonPage() {
  const [activeSection, setActiveSection] = useState('city');
  const [activeGeneration, setActiveGeneration] = useState(1);
  const [labMode, setLabMode] = useState('pokedex');

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
    if (!img) {
      return 'https://via.placeholder.com/300x200?text=Sem+Imagem';
    }

    if (img.startsWith('http')) {
      return img;
    }

    return `http://127.0.0.1:8000/${img}`;
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const [gamesRes, dexRes, userRes] = await Promise.all([
          api.get('library/'),
          api.get('pokedex/'),
          api.get('user-pokemon/'),
        ]);

        const gamesData = gamesRes.data.results || gamesRes.data;

        const pkmGames = gamesData.filter((entry) => {
          const title =
            entry.game_catalog?.title ||
            entry.game?.title ||
            '';

          return (
            title.toLowerCase().includes('pokemon') ||
            title.toLowerCase().includes('pokémon')
          );
        });

        setPokemonGames(pkmGames);

        const dexData = dexRes.data.results || dexRes.data;
        setPokedex(dexData);

        const userData = userRes.data.results || userRes.data;

        const captured = new Set();
        const shiny = new Set();

        userData.forEach((u) => {
          const id =
            u.pokemon?.pokedex_id ||
            u.pokemon;

          if (u.is_shiny) {
            shiny.add(id);
          } else {
            captured.add(id);
          }
        });

        setMyCapturedIds(captured);
        setMyShinyIds(shiny);
      } catch (error) {
        console.error('Erro ao carregar dados Pokémon:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const toggleCapture = async (id, isShinyMode) => {
    const targetSet = isShinyMode
      ? myShinyIds
      : myCapturedIds;

    if (targetSet.has(id)) {
      return;
    }

    try {
      await api.post('user-pokemon/', {
        pokemon: id,
        is_shiny: isShinyMode,
      });

      if (isShinyMode) {
        setMyShinyIds((prev) => {
          const next = new Set(prev);
          next.add(id);
          return next;
        });
      } else {
        setMyCapturedIds((prev) => {
          const next = new Set(prev);
          next.add(id);
          return next;
        });
      }
    } catch (error) {
      console.error('Erro ao salvar Pokémon:', error);
    }
  };

  const currentGenInfo = generationLimits[activeGeneration];

  const filteredDex = useMemo(() => {
    return pokedex.filter((pokemon) => {
      const name = pokemon.name || '';
      const id = pokemon.pokedex_id;

      const matchesSearch =
        name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        String(id).includes(searchTerm);

      const matchesGeneration =
        id >= currentGenInfo.start &&
        id <= currentGenInfo.end;

      return matchesSearch && matchesGeneration;
    });
  }, [
    pokedex,
    searchTerm,
    currentGenInfo.start,
    currentGenInfo.end,
  ]);

  const capturedCount = myCapturedIds.size;
  const shinyCount = myShinyIds.size;

  const completedGames = pokemonGames.filter((entry) => {
    const game = entry.game_catalog || entry.game;
    return game?.hall_of_fame_entry;
  }).length;

  const openSection = (section) => {
    setActiveSection(section);
    setSearchTerm('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };


  const openLab = (mode = 'pokedex') => {
    setLabMode(mode);
    setActiveSection('lab');
    setSearchTerm('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const renderCity = () => {
    return (
      <main className="pokemon-city-section">
        <section className="pokemon-world-section">
          <div className="pokemon-world">
            <img
              src={cidadePokemon}
              alt="Cidade Pokémon"
              className="pokemon-world-map"
              draggable="false"
            />

            <img
              src={hallOfFameSprite}
              alt=""
              className="map-building-sprite halloffame-building-sprite"
              draggable="false"
            />

            <img
              src={ginasioSprite}
              alt=""
              className="map-building-sprite ginasio-building-sprite"
              draggable="false"
            />

            <img
              src={laboratorioSprite}
              alt=""
              className="map-building-sprite laboratorio-building-sprite"
              draggable="false"
            />

            <img
              src={centroPokemonSprite}
              alt=""
              className="map-building-sprite centropokemon-building-sprite"
              draggable="false"
            />

            <img
              src={casaSprite}
              alt=""
              className="map-building-sprite casa-building-sprite"
              draggable="false"
            />
            <img
                src={gameCenterSprite}
                alt=""
                className="map-building-sprite gamecenter-building-sprite"
                draggable="false"
              />

            <img
              src={colecaoSprite}
              alt=""
              className="map-building-sprite centrocolecao-building-sprite"
              draggable="false"
            />

            <div className="pokemon-world-hud">
              <div className="world-hud-title">
                <Map size={18} />
                <span>MINHA JORNADA</span>
              </div>

              <div className="world-hud-stats">
                <div>
                  <strong>{capturedCount}</strong>
                  <span>Pokédex</span>
                </div>

                <div>
                  <strong>{shinyCount}</strong>
                  <span>Shinies</span>
                </div>

                <div>
                  <strong>{completedGames}</strong>
                  <span>Hall da Fama</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="map-hotspot hotspot-lab"
              onClick={() => openLab('pokedex')}
              aria-label="Entrar no Laboratório"
            >
              <span>Laboratório</span>
            </button>

            <button
              type="button"
              className="map-hotspot hotspot-gym"
              onClick={() => openSection('gym')}
              aria-label="Entrar no Ginásio"
            >
              <span>Ginásio</span>
            </button>

            <button
              type="button"
              className="map-hotspot hotspot-game-center"
              onClick={() => openSection('games')}
              aria-label="Entrar no Game Center"
            >
              <span>Game Center</span>
            </button>

            <button
              type="button"
              className="map-hotspot hotspot-trainer-house"
              onClick={() => openSection('trainer')}
              aria-label="Entrar na Casa do Treinador"
            >
              <span>Casa do Treinador</span>
            </button>

            <button
              type="button"
              className="map-hotspot hotspot-pokemon-center"
              onClick={() => openSection('pokemon-center')}
              aria-label="Entrar no Centro Pokémon"
            >
              <span>Centro Pokémon</span>
            </button>

            <button
              type="button"
              className="map-hotspot hotspot-pc"
              onClick={() => openSection('favorites')}
              aria-label="Entrar no PC e Centro de Coleções"
            >
              <span>PC / Centro de Coleções</span>
            </button>

            <Link
              to="/pokemon/hall-of-fame"
              className="map-hotspot hotspot-hall-of-fame"
              aria-label="Entrar no Hall da Fama"
            >
              <span>Hall da Fama</span>
            </Link>

            <div className="trainer-map-character">
              <div className="trainer-map-sprite">
                <UserRound size={25} />
              </div>

              <span>Você</span>
            </div>
          </div>
        </section>

        <section className="pokemon-map-help">
          <div>
            <span className="pixel-label">
              MAPA
            </span>

            <h1>
              Explore sua cidade
            </h1>

            <p>
              Clique em um dos locais da cidade para acessar
              sua jornada Pokémon.
            </p>
          </div>

          <div className="trainer-summary">
            <div>
              <strong>{capturedCount}</strong>
              <span>Pokémon</span>
            </div>

            <div>
              <strong>{shinyCount}</strong>
              <span>Shinies</span>
            </div>

            <div>
              <strong>{completedGames}</strong>
              <span>Hall of Fame</span>
            </div>
          </div>
        </section>

        <section className="quick-access">
          <div className="section-title">
            <span>ACESSO RÁPIDO</span>

            <h2>
              Onde deseja ir?
            </h2>

            <p>
              Você também pode navegar sem usar o mapa.
            </p>
          </div>

          <div className="quick-grid">
            <button
              type="button"
              onClick={() => openSection('trainer')}
            >
              <Home size={22} />
              Trainer Card
            </button>

            <button
              type="button"
              onClick={() => openLab('pokedex')}
            >
              <BookOpen size={22} />
              Pokédex
            </button>

            <button
              type="button"
              onClick={() => openLab('shiny')}
            >
              <Sparkles size={22} />
              Shiny Dex
            </button>

            <button
              type="button"
              onClick={() => openSection('games')}
            >
              <Gamepad2 size={22} />
              Jogos
            </button>

            <button
              type="button"
              onClick={() => openSection('gym')}
            >
              <Award size={22} />
              Ginásio
            </button>

            <button
              type="button"
              onClick={() => openSection('favorites')}
            >
              <Star size={22} />
              PC Pokémon
            </button>

            <Link to="/pokemon/hall-of-fame">
              <Trophy size={22} />
              Hall da Fama
            </Link>
          </div>
        </section>
      </main>
    );
  };

  const renderBackButton = () => {
    return (
      <button
        type="button"
        className="pokemon-back-button"
        onClick={() => openSection('city')}
      >
        ← Voltar para a cidade
      </button>
    );
  };

  const renderTrainer = () => {
    return (
      <main className="pokemon-content-section">
        {renderBackButton()}

        <section className="trainer-page">
          <div className="section-title">
            <span>CASA DO TREINADOR</span>

            <h1>
              Trainer Card
            </h1>

            <p>
              Essa será sua identidade dentro do mundo Pokémon
              do Meu Acervo.
            </p>
          </div>

          <div className="trainer-card-preview">
            <div className="trainer-card-photo">
              <UserRound size={90} />

              <span>
                Foto do treinador
              </span>
            </div>

            <div className="trainer-card-data">
              <span className="trainer-card-label">
                TRAINER CARD
              </span>

              <h2>
                Treinador
              </h2>

              <p>
                ID No. ------
              </p>

              <div className="trainer-card-stats">
                <div>
                  <strong>{capturedCount}</strong>
                  <span>Pokédex</span>
                </div>

                <div>
                  <strong>{shinyCount}</strong>
                  <span>Shiny Dex</span>
                </div>

                <div>
                  <strong>{completedGames}</strong>
                  <span>Hall da Fama</span>
                </div>
              </div>

              <div className="trainer-coming-soon">
                Perfil completo será conectado ao Trainer
                Profile do usuário.
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  };

  const renderGames = () => {
    return (
      <main className="pokemon-content-section">
        {renderBackButton()}

        <section className="section-title">
          <span>GAME CENTER</span>

          <h1>
            Minhas Jornadas
          </h1>

          <p>
            Todos os jogos Pokémon da sua coleção.
          </p>
        </section>

        <div className="pokemon-grid">
          {pokemonGames.length === 0 ? (
            <div className="empty-state">
              <Gamepad2 size={42} />

              <p>
                Nenhum jogo Pokémon encontrado.
              </p>
            </div>
          ) : (
            pokemonGames.map((entry) => {
              const game =
                entry.game_catalog ||
                entry.game;

              const hof =
                game?.hall_of_fame_entry;

              return (
                <article
                  key={entry.id}
                  className="pokemon-card-game"
                >
                  <div className="game-cover-wrapper">
                    <img
                      src={getImageUrl(
                        game?.cover_image ||
                        game?.cover_url
                      )}
                      alt={game?.title || 'Jogo Pokémon'}
                    />

                    {hof && (
                      <span className="champion-badge">
                        CAMPEÃO
                      </span>
                    )}
                  </div>

                  <div className="card-info">
                    <h3>
                      {game?.title}
                    </h3>

                    <div className="hall-of-fame">
                      {hof ? (
                        <>
                          <span className="hof-label">
                            HALL OF FAME
                          </span>

                          <div className="team">
                            {[1, 2, 3, 4, 5, 6].map(
                              (index) =>
                                hof[`sprite_${index}`] && (
                                  <img
                                    key={index}
                                    src={hof[`sprite_${index}`]}
                                    alt=""
                                  />
                                )
                            )}
                          </div>
                        </>
                      ) : (
                        <span className="not-finished">
                          Jornada ainda não registrada
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </main>
    );
  };

  const renderDex = (isShiny = false) => {
    const caughtSet = isShiny
      ? myShinyIds
      : myCapturedIds;

    return (
      <section className="dex-view">
        <div className="section-title dex-section-title">
          <span>
            {isShiny ? 'SHINY DEX' : 'POKÉDEX'}
          </span>

          <h2>
            {isShiny ? 'Shiny Dex' : 'Pokédex'}
          </h2>

          <p>
            {isShiny
              ? `${shinyCount} Pokémon shiny registrados.`
              : `${capturedCount} Pokémon registrados.`}
          </p>
        </div>

        <div className="dex-container">
          <div className="dex-toolbar">
            <div className="dex-search-wrapper">
              <Search size={20} />

              <input
                className="dex-search"
                placeholder="Nome ou número..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />
            </div>

            <div className="dex-progress">
              <strong>{caughtSet.size}</strong>
              <span> / {pokedex.length || 1025}</span>
            </div>
          </div>

          <div className="gen-selector">
            {totalGenerations.map((gen) => (
              <button
                type="button"
                key={gen}
                className={
                  activeGeneration === gen
                    ? 'active-gen'
                    : ''
                }
                onClick={() =>
                  setActiveGeneration(gen)
                }
              >
                <strong>
                  Gen {gen}
                </strong>

                <span>
                  {generationLimits[gen].name}
                </span>
              </button>
            ))}
          </div>

          <div className="dex-region-title">
            <span>
              GERAÇÃO {activeGeneration}
            </span>

            <h2>
              {currentGenInfo.name}
            </h2>

            <p>
              #{String(currentGenInfo.start).padStart(4, '0')}
              {' — '}
              #{String(currentGenInfo.end).padStart(4, '0')}
            </p>
          </div>

          <div className="dex-grid">
            {filteredDex.map((poke) => {
              const isCaught =
                caughtSet.has(poke.pokedex_id);

              const sprite = isShiny
                ? poke.shiny_sprite_url
                : poke.sprite_url;

              return (
                <button
                  type="button"
                  key={poke.pokedex_id}
                  className={[
                    'dex-card',
                    isCaught
                      ? 'caught'
                      : 'uncaptured',
                    isShiny
                      ? 'shiny'
                      : '',
                  ].join(' ')}
                  onClick={() =>
                    toggleCapture(
                      poke.pokedex_id,
                      isShiny
                    )
                  }
                  aria-label={
                    isCaught
                      ? `${poke.name} já registrado`
                      : `Registrar ${poke.name}`
                  }
                >
                  <div className="dex-card-number">
                    #{String(poke.pokedex_id).padStart(4, '0')}
                  </div>

                  <div className="dex-sprite-wrapper">
                    <img
                      src={sprite}
                      alt={poke.name}
                    />
                  </div>

                  <p>
                    {poke.name}
                  </p>

                  {isCaught ? (
                    <div className="check">
                      ✓
                    </div>
                  ) : (
                    <span className="register-label">
                      Clique para registrar
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>
    );
  };

  const renderLab = () => {
    return (
      <main className="pokemon-content-section">
        {renderBackButton()}

        <section className="section-title">
          <span>LABORATÓRIO POKÉMON</span>
          <h1>Laboratório</h1>
          <p>
            Consulte e registre seus Pokémon normais e shiny.
          </p>
        </section>

        <div className="lab-dex-switcher">
          <button
            type="button"
            className={labMode === 'pokedex' ? 'active' : ''}
            onClick={() => {
              setLabMode('pokedex');
              setSearchTerm('');
            }}
          >
            <BookOpen size={20} />
            Pokédex
          </button>

          <button
            type="button"
            className={labMode === 'shiny' ? 'active' : ''}
            onClick={() => {
              setLabMode('shiny');
              setSearchTerm('');
            }}
          >
            <Sparkles size={20} />
            Shiny Dex
          </button>
        </div>

        {renderDex(labMode === 'shiny')}
      </main>
    );
  };

  const renderPokemonCenter = () => {
    return (
      <main className="pokemon-content-section">
        {renderBackButton()}

        <section className="section-title">
          <span>CENTRO POKÉMON</span>
          <h1>Centro Pokémon</h1>
          <p>
            Este local está livre para receber uma função própria depois.
          </p>
        </section>

        <div className="coming-soon-panel">
          <Sparkles size={72} />
          <h2>Em breve</h2>
          <p>
            A Shiny Dex agora fica no Laboratório, junto da Pokédex.
          </p>
        </div>
      </main>
    );
  };

  const renderGym = () => {
    return (
      <main className="pokemon-content-section">
        {renderBackButton()}

        <section className="section-title">
          <span>GINÁSIO</span>

          <h1>
            Conquistas
          </h1>

          <p>
            Insígnias, títulos e desafios do treinador.
          </p>
        </section>

        <div className="coming-soon-panel">
          <Award size={72} />

          <h2>
            Seu Ginásio está sendo preparado
          </h2>

          <p>
            Aqui aparecerão suas insígnias, títulos,
            Pokédex completas, conquistas especiais e
            desafios.
          </p>

          <div className="badge-preview-grid">
            <div>?</div>
            <div>?</div>
            <div>?</div>
            <div>?</div>
            <div>?</div>
            <div>?</div>
            <div>?</div>
            <div>?</div>
          </div>
        </div>
      </main>
    );
  };

  const renderFavorites = () => {
    return (
      <main className="pokemon-content-section">
        {renderBackButton()}

        <section className="section-title">
          <span>PC / CENTRO DE COLEÇÕES</span>

          <h1>
            Favoritos
          </h1>

          <p>
            Escolha seus Pokémon favoritos e seu parceiro
            principal.
          </p>
        </section>

        <div className="coming-soon-panel">
          <Star size={72} />

          <h2>
            PC ainda vazio
          </h2>

          <p>
            Quando criarmos o sistema de favoritos, seus
            Pokémon marcados com estrela aparecerão aqui.
          </p>

          <div className="partner-preview">
            <span>
              PARTNER POKÉMON
            </span>

            <div className="partner-slot">
              ?
            </div>

            <p>
              Nenhum parceiro escolhido
            </p>
          </div>
        </div>
      </main>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'trainer':
        return renderTrainer();

      case 'games':
        return renderGames();

      case 'lab':
        return renderLab();

      case 'pokemon-center':
        return renderPokemonCenter();

      case 'gym':
        return renderGym();

      case 'favorites':
        return renderFavorites();

      case 'city':
      default:
        return renderCity();
    }
  };

  if (loading) {
    return (
      <div className="pokemon-page">
        <Navbar />

        <main className="pokemon-loading">
          <div className="pokeball-loader">
            <div />
          </div>

          <span>
            CARREGANDO...
          </span>

          <h2>
            Preparando sua jornada Pokémon
          </h2>
        </main>
      </div>
    );
  }

  return (
    <div className="pokemon-page">
      <Navbar />

      {renderContent()}

      <Footer />
    </div>
  );
}

export default PokemonPage;