import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  BookOpen,
  Camera,
  Check,
  Dice5,
  Edit3,
  Eye,
  Gamepad2,
  Heart,
  LayoutDashboard,
  LogOut,
  Monitor,
  Save,
  Sparkles,
  Trophy,
  UserRound,
  X,
} from 'lucide-react';

import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

import './ProfilePage.css';

const EMPTY_PROFILE = {
  username: '',
  avatar: null,
  bio: '',
  profile_views: 0,
  profile_likes_count: 0,
  liked_by_me: false,
};

const EMPTY_PORTFOLIO = {
  videoGames: [],
  boardGames: [],
  consoles: [],
  pokemon: [],
  beyblades: [],
  library: [],
};

function ProfilePage() {
  const { username } = useParams();
  const fileInputRef = useRef(null);

  const myUsername = localStorage.getItem('username');

  const isMyProfile = !username || username === myUsername;
  const currentProfileUser = isMyProfile ? myUsername : username;

  const [profileData, setProfileData] = useState(EMPTY_PROFILE);
  const [portfolio, setPortfolio] = useState(EMPTY_PORTFOLIO);

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState('');
  const [bioSaving, setBioSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');

  const apiOrigin = useMemo(() => {
    const baseURL = api.defaults?.baseURL;

    if (!baseURL) {
      return 'http://127.0.0.1:8000';
    }

    return baseURL
      .replace(/\/api\/?$/i, '')
      .replace(/\/$/, '');
  }, []);

  const extractList = (response) => {
    if (Array.isArray(response?.data)) {
      return response.data;
    }

    return response?.data?.results || [];
  };

  const getImageUrl = (path, fallbackText = 'Sem imagem') => {
    if (!path) {
      return `https://placehold.co/500x500/18283b/f6f0d8?text=${encodeURIComponent(fallbackText)}`;
    }

    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    return `${apiOrigin}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const getGameTitle = (game) => {
    return (
      game?.game_catalog?.title ||
      game?.game?.title ||
      game?.title ||
      'Jogo sem título'
    );
  };

  const getGameImage = (game) => {
    return (
      game?.game_catalog?.cover_image ||
      game?.game_catalog?.cover_url ||
      game?.game?.cover_image ||
      game?.cover_image ||
      game?.cover_url ||
      null
    );
  };

  const getBoardGameName = (boardGame) => {
    return (
      boardGame?.game?.name ||
      boardGame?.name ||
      boardGame?.boardgame?.name ||
      boardGame?.board_game?.name ||
      'Board game sem título'
    );
  };

  const getBoardGameImage = (boardGame) => {
    return (
      boardGame?.game?.cover_image ||
      boardGame?.game?.cover_url ||
      boardGame?.game?.thumbnail_url ||
      boardGame?.cover_image ||
      boardGame?.cover_url ||
      boardGame?.boardgame?.cover_image ||
      boardGame?.boardgame?.cover_url ||
      boardGame?.board_game?.cover_image ||
      null
    );
  };

  const getPokemonName = (entry) => {
    return (
      entry?.pokemon?.name ||
      entry?.pokemon?.nome ||
      'Pokémon'
    );
  };

  const getPokemonImage = (entry) => {
    return (
      entry?.pokemon?.sprite ||
      entry?.pokemon?.sprite_url ||
      entry?.pokemon?.image ||
      entry?.pokemon?.image_url ||
      entry?.pokemon?.official_artwork ||
      null
    );
  };

  const getBeybladeName = (entry) => {
    return (
      entry?.variant?.variant_name ||
      entry?.blade?.name ||
      'Beyblade'
    );
  };

  const getBeybladeImage = (entry) => {
    return (
      entry?.display_image ||
      entry?.variant?.display_image ||
      entry?.variant?.image ||
      entry?.variant?.image_url ||
      entry?.blade?.image ||
      entry?.blade?.image_url ||
      null
    );
  };

  const getLibraryTitle = (entry) => {
    return (
      entry?.item?.title ||
      'Item da biblioteca'
    );
  };

  const getLibraryImage = (entry) => {
    return (
      entry?.item?.cover_image ||
      entry?.item?.cover_url ||
      null
    );
  };

  const getConsoleName = (consoleItem) => {
    return (
      consoleItem?.name ||
      consoleItem?.platform?.name ||
      consoleItem?.console?.name ||
      'Console'
    );
  };

  const getConsoleImage = (consoleItem) => {
    return (
      consoleItem?.photo ||
      consoleItem?.image ||
      consoleItem?.platform_image ||
      consoleItem?.platform?.platform_image ||
      consoleItem?.console?.photo ||
      null
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!currentProfileUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMessage('');

        const [
          profileRes,
          gamesRes,
          boardRes,
          consoleRes,
          pokemonRes,
          beybladeRes,
          libraryRes,
        ] = await Promise.all([
          api.get(`profiles/${currentProfileUser}/`),
          api.get(`owned-games/?username=${currentProfileUser}`),
          api.get(`user-boardgames/?username=${currentProfileUser}&owned=true`),
          api.get(`consoles/?username=${currentProfileUser}`),
          api.get(`user-pokemon/?username=${currentProfileUser}`),
          api.get(`user-beyblades/?username=${currentProfileUser}`),
          api.get(`reading-library/?username=${currentProfileUser}&owned=true`),
        ]);

        const receivedProfile = profileRes.data || EMPTY_PROFILE;

        setProfileData(receivedProfile);
        setTempBio(receivedProfile.bio || '');

        setPortfolio({
          videoGames: extractList(gamesRes),
          boardGames: extractList(boardRes).filter((item) => item?.owned === true),
          consoles: extractList(consoleRes),
          pokemon: extractList(pokemonRes),
          beyblades: extractList(beybladeRes),
          library: extractList(libraryRes).filter((item) => item?.owned === true),
        });
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        setErrorMessage('Não foi possível carregar este perfil.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentProfileUser]);

  const handleProfileLike = async () => {
    if (isMyProfile || likeLoading) {
      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      alert('Entre na sua conta para curtir este perfil.');
      return;
    }

    try {
      setLikeLoading(true);

      const response = await api.post(
        `profiles/${encodeURIComponent(currentProfileUser)}/like/`
      );

      setProfileData((current) => ({
        ...current,
        liked_by_me: Boolean(response.data?.liked),
        profile_likes_count: Number(
          response.data?.profile_likes_count || 0
        ),
      }));
    } catch (error) {
      console.error('Erro ao curtir perfil:', error);

      alert(
        error?.response?.data?.error ||
          'Não foi possível atualizar a curtida do perfil.'
      );
    } finally {
      setLikeLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const handleSaveBio = async () => {
    try {
      setBioSaving(true);
      setErrorMessage('');

      await api.patch(`profiles/${currentProfileUser}/`, {
        bio: tempBio.trim(),
      });

      setProfileData((previous) => ({
        ...previous,
        bio: tempBio.trim(),
      }));

      setIsEditingBio(false);
    } catch (error) {
      console.error('Erro ao salvar bio:', error);
      setErrorMessage('Não foi possível salvar sua bio.');
    } finally {
      setBioSaving(false);
    }
  };

  const handleCancelBio = () => {
    setTempBio(profileData.bio || '');
    setIsEditingBio(false);
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Escolha um arquivo de imagem.');
      event.target.value = '';
      return;
    }

    try {
      setAvatarLoading(true);
      setErrorMessage('');

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.patch(
        `profiles/${currentProfileUser}/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setProfileData((previous) => ({
        ...previous,
        avatar: response.data?.avatar || previous.avatar,
      }));
    } catch (error) {
      console.error('Erro ao atualizar avatar:', error);
      setErrorMessage('Não foi possível atualizar sua foto de perfil.');
    } finally {
      setAvatarLoading(false);
      event.target.value = '';
    }
  };

  const totalItems =
    portfolio.videoGames.length +
    portfolio.boardGames.length +
    portfolio.consoles.length +
    portfolio.pokemon.length +
    portfolio.beyblades.length +
    portfolio.library.length;

  const overviewItems = useMemo(() => {
    return [
      ...portfolio.videoGames.slice(0, 4).map((item) => ({
        id: `game-${item.id}`,
        type: 'Jogo',
        title: getGameTitle(item),
        image: getGameImage(item),
      })),
      ...portfolio.boardGames.slice(0, 2).map((item) => ({
        id: `board-${item.id}`,
        type: 'Board game',
        title: getBoardGameName(item),
        image: getBoardGameImage(item),
      })),
      ...portfolio.consoles.slice(0, 2).map((item) => ({
        id: `console-${item.id}`,
        type: 'Console',
        title: getConsoleName(item),
        image: getConsoleImage(item),
      })),
      ...portfolio.pokemon.slice(0, 2).map((item) => ({
        id: `pokemon-${item.id}`,
        type: item.is_shiny ? 'Pokémon Shiny' : 'Pokémon',
        title: getPokemonName(item),
        image: getPokemonImage(item),
      })),
      ...portfolio.beyblades.slice(0, 2).map((item) => ({
        id: `beyblade-${item.id}`,
        type: 'Beyblade',
        title: getBeybladeName(item),
        image: getBeybladeImage(item),
      })),
      ...portfolio.library.slice(0, 2).map((item) => ({
        id: `library-${item.id}`,
        type: item?.item?.item_type_display || 'Biblioteca',
        title: getLibraryTitle(item),
        image: getLibraryImage(item),
      })),
    ].slice(0, 12);
  }, [portfolio]);

  if (loading) {
    return (
      <div className="profile-page">
        <Navbar />

        <main className="profile-loading">
          <div className="profile-loading-card">
            <div className="profile-loading-avatar" />
            <span>Carregando perfil...</span>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Navbar />

      <main className="profile-content">
        {errorMessage && (
          <div className="profile-alert">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage('')}
              aria-label="Fechar aviso"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <section className="profile-header">
          <div className="profile-avatar-column">
            <button
              type="button"
              className={`profile-avatar-button ${isMyProfile ? 'is-editable' : ''}`}
              onClick={() => {
                if (isMyProfile && !avatarLoading) {
                  fileInputRef.current?.click();
                }
              }}
              aria-label={isMyProfile ? 'Alterar foto de perfil' : 'Foto de perfil'}
            >
              <img
                src={getImageUrl(profileData.avatar, 'Avatar')}
                alt={`Avatar de ${profileData.username}`}
                className="profile-avatar"
              />

              {isMyProfile && (
                <span className="profile-avatar-overlay">
                  <Camera size={22} />
                  <strong>
                    {avatarLoading ? 'Enviando...' : 'Trocar foto'}
                  </strong>
                </span>
              )}
            </button>

            {isMyProfile && (
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="profile-file-input"
                onChange={handleAvatarChange}
              />
            )}
          </div>

          <div className="profile-main-info">
            <div className="profile-title-row">
              <div>
                <span className="profile-eyebrow">
                  {isMyProfile ? 'MEU PERFIL' : 'PERFIL DA COMUNIDADE'}
                </span>

                <h1>{profileData.username || currentProfileUser}</h1>
              </div>

              <div className="profile-title-actions">
                {!isMyProfile && (
                  <button
                    type="button"
                    className={`profile-like-button ${
                      profileData.liked_by_me ? 'is-liked' : ''
                    }`}
                    onClick={handleProfileLike}
                    disabled={likeLoading}
                    aria-pressed={profileData.liked_by_me}
                  >
                    <Heart
                      size={18}
                      fill={profileData.liked_by_me ? 'currentColor' : 'none'}
                    />
                    {likeLoading
                      ? 'Salvando...'
                      : profileData.liked_by_me
                        ? 'Curtido'
                        : 'Curtir perfil'}
                  </button>
                )}

                {isMyProfile && (
                  <button
                    type="button"
                    className="profile-logout-button"
                    onClick={handleLogout}
                  >
                    <LogOut size={17} />
                    Sair
                  </button>
                )}
              </div>
            </div>

            <div className="profile-bio">
              <div className="profile-section-heading">
                <span>Sobre</span>

                {isMyProfile && !isEditingBio && (
                  <button
                    type="button"
                    className="profile-icon-button"
                    onClick={() => setIsEditingBio(true)}
                    aria-label="Editar bio"
                  >
                    <Edit3 size={16} />
                  </button>
                )}
              </div>

              {isEditingBio ? (
                <div className="profile-bio-editor">
                  <textarea
                    value={tempBio}
                    maxLength={300}
                    placeholder="Conte um pouco sobre você e seu mundo geek..."
                    onChange={(event) => setTempBio(event.target.value)}
                  />

                  <div className="profile-bio-editor-footer">
                    <span>{tempBio.length} / 300</span>

                    <div className="profile-bio-actions">
                      <button
                        type="button"
                        className="profile-secondary-button"
                        onClick={handleCancelBio}
                        disabled={bioSaving}
                      >
                        <X size={16} />
                        Cancelar
                      </button>

                      <button
                        type="button"
                        className="profile-primary-button"
                        onClick={handleSaveBio}
                        disabled={bioSaving}
                      >
                        {bioSaving ? (
                          <>
                            <Save size={16} />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Check size={16} />
                            Salvar
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p>
                  {profileData.bio ||
                    (isMyProfile
                      ? 'Você ainda não escreveu uma bio. Clique no lápis para adicionar.'
                      : 'Este usuário ainda não escreveu uma bio.')}
                </p>
              )}
            </div>

            <div className="profile-stats">
              <article className="profile-stat-card">
                <Gamepad2 size={20} />
                <strong>{portfolio.videoGames.length}</strong>
                <span>Jogos</span>
              </article>

              <article className="profile-stat-card">
                <Dice5 size={20} />
                <strong>{portfolio.boardGames.length}</strong>
                <span>Board games</span>
              </article>

              <article className="profile-stat-card">
                <Monitor size={20} />
                <strong>{portfolio.consoles.length}</strong>
                <span>Consoles</span>
              </article>

              <article className="profile-stat-card">
                <Sparkles size={20} />
                <strong>{portfolio.pokemon.length}</strong>
                <span>Pokémon</span>
              </article>

              <article className="profile-stat-card">
                <Trophy size={20} />
                <strong>{portfolio.beyblades.length}</strong>
                <span>Beyblades</span>
              </article>

              <article className="profile-stat-card">
                <BookOpen size={20} />
                <strong>{portfolio.library.length}</strong>
                <span>Biblioteca</span>
              </article>

              <article className="profile-stat-card">
                <Heart size={20} />
                <strong>{profileData.profile_likes_count || 0}</strong>
                <span>Curtidas</span>
              </article>

              <article className="profile-stat-card">
                <Eye size={20} />
                <strong>{profileData.profile_views || 0}</strong>
                <span>Visualizações</span>
              </article>
            </div>
          </div>
        </section>

        <section className="profile-dashboard-strip">
          <div>
            <LayoutDashboard size={20} />
            <span>Itens registrados</span>
            <strong>{totalItems}</strong>
          </div>

          <p>
            {isMyProfile
              ? 'Seu espaço reúne um resumo do que já faz parte do seu acervo.'
              : `Veja um pouco do acervo de ${profileData.username || currentProfileUser}.`}
          </p>
        </section>

        <nav className="profile-tabs" aria-label="Seções do perfil">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={activeTab === 'overview' ? 'active' : ''}
          >
            <LayoutDashboard size={17} />
            Visão geral
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('games')}
            className={activeTab === 'games' ? 'active' : ''}
          >
            <Gamepad2 size={17} />
            Jogos
            <span>{portfolio.videoGames.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('boardgames')}
            className={activeTab === 'boardgames' ? 'active' : ''}
          >
            <Dice5 size={17} />
            Tabuleiro
            <span>{portfolio.boardGames.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('consoles')}
            className={activeTab === 'consoles' ? 'active' : ''}
          >
            <Monitor size={17} />
            Consoles
            <span>{portfolio.consoles.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pokemon')}
            className={activeTab === 'pokemon' ? 'active' : ''}
          >
            <Sparkles size={17} />
            Pokémon
            <span>{portfolio.pokemon.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('beyblades')}
            className={activeTab === 'beyblades' ? 'active' : ''}
          >
            <Trophy size={17} />
            Beyblades
            <span>{portfolio.beyblades.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={activeTab === 'library' ? 'active' : ''}
          >
            <BookOpen size={17} />
            Biblioteca
            <span>{portfolio.library.length}</span>
          </button>
        </nav>

        <section className="profile-tab-content">
          {activeTab === 'overview' && (
            <>
              <div className="profile-content-heading">
                <div>
                  <span>DESTAQUES</span>
                  <h2>Um pouco do acervo</h2>
                </div>

                <UserRound size={24} />
              </div>

              {overviewItems.length > 0 ? (
                <div className="profile-grid profile-grid-overview">
                  {overviewItems.map((item) => (
                    <article
                      key={item.id}
                      className="profile-card"
                    >
                      <img
                        src={getImageUrl(item.image, item.title)}
                        alt={item.title}
                      />

                      <div className="profile-card-overlay">
                        <span>{item.type}</span>
                        <h3>{item.title}</h3>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="profile-empty-state">
                  <LayoutDashboard size={34} />
                  <h3>Nada por aqui ainda</h3>
                  <p>
                    Quando itens forem adicionados ao acervo, eles aparecerão aqui.
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === 'games' && (
            <>
              <div className="profile-content-heading">
                <div>
                  <span>VIDEOGAMES</span>
                  <h2>Jogos do acervo</h2>
                </div>

                <Gamepad2 size={24} />
              </div>

              {portfolio.videoGames.length > 0 ? (
                <div className="profile-grid">
                  {portfolio.videoGames.map((game) => (
                    <article
                      key={game.id}
                      className="profile-card"
                    >
                      <img
                        src={getImageUrl(
                          getGameImage(game),
                          getGameTitle(game)
                        )}
                        alt={getGameTitle(game)}
                      />

                      <div className="profile-card-overlay">
                        <span>
                          {game.rating
                            ? `Nota ${game.rating}`
                            : 'Videogame'}
                        </span>

                        <h3>{getGameTitle(game)}</h3>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="profile-empty-state">
                  <Gamepad2 size={34} />
                  <h3>Nenhum jogo encontrado</h3>
                  <p>Os jogos adicionados ao acervo aparecerão aqui.</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'boardgames' && (
            <>
              <div className="profile-content-heading">
                <div>
                  <span>BOARD GAMES</span>
                  <h2>Jogos de tabuleiro</h2>
                </div>

                <Dice5 size={24} />
              </div>

              {portfolio.boardGames.length > 0 ? (
                <div className="profile-grid">
                  {portfolio.boardGames.map((boardGame) => (
                    <article
                      key={boardGame.id}
                      className="profile-card"
                    >
                      <img
                        src={getImageUrl(
                          getBoardGameImage(boardGame),
                          getBoardGameName(boardGame)
                        )}
                        alt={getBoardGameName(boardGame)}
                      />

                      <div className="profile-card-overlay">
                        <span>Board game</span>
                        <h3>{getBoardGameName(boardGame)}</h3>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="profile-empty-state">
                  <Dice5 size={34} />
                  <h3>Nenhum board game encontrado</h3>
                  <p>Seus jogos de tabuleiro aparecerão nesta área.</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'consoles' && (
            <>
              <div className="profile-content-heading">
                <div>
                  <span>HARDWARE</span>
                  <h2>Consoles do acervo</h2>
                </div>

                <Monitor size={24} />
              </div>

              {portfolio.consoles.length > 0 ? (
                <div className="profile-grid profile-console-grid">
                  {portfolio.consoles.map((consoleItem) => (
                    <article
                      key={consoleItem.id}
                      className="profile-card profile-console-card"
                    >
                      <img
                        src={getImageUrl(
                          getConsoleImage(consoleItem),
                          getConsoleName(consoleItem)
                        )}
                        alt={getConsoleName(consoleItem)}
                      />

                      <div className="profile-card-overlay">
                        <span>Console</span>
                        <h3>{getConsoleName(consoleItem)}</h3>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="profile-empty-state">
                  <Monitor size={34} />
                  <h3>Nenhum console encontrado</h3>
                  <p>Os consoles adicionados ao acervo aparecerão aqui.</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'pokemon' && (
            <>
              <div className="profile-content-heading">
                <div>
                  <span>POKÉDEX</span>
                  <h2>Pokémon da coleção</h2>
                </div>

                <Sparkles size={24} />
              </div>

              {portfolio.pokemon.length > 0 ? (
                <div className="profile-grid">
                  {portfolio.pokemon.map((entry) => (
                    <article key={entry.id} className="profile-card">
                      <img
                        src={getImageUrl(
                          getPokemonImage(entry),
                          getPokemonName(entry)
                        )}
                        alt={getPokemonName(entry)}
                      />

                      <div className="profile-card-overlay">
                        <span>{entry.is_shiny ? 'Shiny' : 'Capturado'}</span>
                        <h3>{getPokemonName(entry)}</h3>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="profile-empty-state">
                  <Sparkles size={34} />
                  <h3>Nenhum Pokémon encontrado</h3>
                  <p>Os Pokémon registrados na Pokédex aparecerão aqui.</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'beyblades' && (
            <>
              <div className="profile-content-heading">
                <div>
                  <span>BEYBLADE</span>
                  <h2>Beyblades do acervo</h2>
                </div>

                <Trophy size={24} />
              </div>

              {portfolio.beyblades.length > 0 ? (
                <div className="profile-grid">
                  {portfolio.beyblades.map((entry) => (
                    <article key={entry.id} className="profile-card">
                      <img
                        src={getImageUrl(
                          getBeybladeImage(entry),
                          getBeybladeName(entry)
                        )}
                        alt={getBeybladeName(entry)}
                      />

                      <div className="profile-card-overlay">
                        <span>
                          {entry.quantity > 1
                            ? `${entry.quantity} unidades`
                            : 'Beyblade'}
                        </span>
                        <h3>{getBeybladeName(entry)}</h3>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="profile-empty-state">
                  <Trophy size={34} />
                  <h3>Nenhuma Beyblade encontrada</h3>
                  <p>As Beyblades do acervo aparecerão aqui.</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'library' && (
            <>
              <div className="profile-content-heading">
                <div>
                  <span>BIBLIOTECA</span>
                  <h2>Livros, mangás e HQs do acervo</h2>
                </div>

                <BookOpen size={24} />
              </div>

              {portfolio.library.length > 0 ? (
                <div className="profile-grid">
                  {portfolio.library.map((entry) => (
                    <article key={entry.id} className="profile-card">
                      <img
                        src={getImageUrl(
                          getLibraryImage(entry),
                          getLibraryTitle(entry)
                        )}
                        alt={getLibraryTitle(entry)}
                      />

                      <div className="profile-card-overlay">
                        <span>
                          {entry?.item?.item_type_display || 'Biblioteca'}
                        </span>
                        <h3>{getLibraryTitle(entry)}</h3>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="profile-empty-state">
                  <BookOpen size={34} />
                  <h3>Nenhum item encontrado</h3>
                  <p>Os itens da biblioteca que fazem parte do acervo aparecerão aqui.</p>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default ProfilePage;