import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Beaker,
  BookOpen,
  ChevronRight,
  Dice5,
  Eye,
  Flame,
  Gamepad2,
  Newspaper,
  PackageOpen,
  Search,
  Sparkles,
  Star,
  Trophy,
  Users,
} from 'lucide-react';

import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

import './HomePage.css';

const CATEGORY_LABELS = {
  NEWS: 'Novidades',
  REVIEW: 'Review',
  RECOMMENDATION: 'Indicação',
  BEYBLADE: 'Beyblade Lab',
  POKEMON: 'Pokémon',
  BOARDGAME: 'Board Game',
  GUIDE: 'Guia',
  COLLECTION: 'Diário do Acervo',
  PROJECT: 'Projeto',
};

const CATEGORY_ICONS = {
  NEWS: Newspaper,
  REVIEW: Star,
  RECOMMENDATION: Sparkles,
  BEYBLADE: Beaker,
  POKEMON: Gamepad2,
  BOARDGAME: Dice5,
  GUIDE: BookOpen,
  COLLECTION: PackageOpen,
  PROJECT: Flame,
};

function HomePage() {
  const navigate = useNavigate();

  const [videoGames, setVideoGames] = useState([]);
  const [boardGames, setBoardGames] = useState([]);
  const [popularProfiles, setPopularProfiles] = useState([]);
  const [communityStats, setCommunityStats] = useState({
    users: 0,
    game_collectors: 0,
    games_in_collections: 0,
    boardgames_in_collections: 0,
  });
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const apiOrigin = useMemo(() => {
    const baseURL = api.defaults?.baseURL;

    if (!baseURL) {
      return 'http://127.0.0.1:8000';
    }

    return baseURL
      .replace(/\/api\/?$/i, '')
      .replace(/\/$/, '');
  }, []);

  const getImageUrl = (imagePath, fallbackText = 'Sem imagem') => {
    if (!imagePath) {
      return `https://placehold.co/900x600/17283c/f5f0d7?text=${encodeURIComponent(fallbackText)}`;
    }

    if (
      imagePath.startsWith('http://') ||
      imagePath.startsWith('https://')
    ) {
      return imagePath;
    }

    return `${apiOrigin}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  const extractList = (response) => {
    if (Array.isArray(response?.data)) {
      return response.data;
    }

    return response?.data?.results || [];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const results = await Promise.allSettled([
          api.get('home/'),
          api.get('posts/'),
        ]);

        const homeResult = results[0];
        const postsResult = results[1];

        if (homeResult.status === 'fulfilled') {
          const homeData = homeResult.value?.data || {};

          const formattedGames = (homeData.top_games || []).map((game) => ({
            id: game.id,
            title: game.title || 'Jogo sem título',
            image: game.cover_url || null,
            collectors: Number(game.collectors || 0),
            platform:
              game.platforms?.map((platform) => platform.name).filter(Boolean).join(', ') ||
              'Videogame',
          }));

          const formattedBoardGames = (homeData.top_boardgames || []).map((game) => ({
            id: game.id,
            title: game.name || game.original_name || 'Board game sem título',
            image:
              game.cover_image ||
              game.cover_url ||
              game.thumbnail_url ||
              null,
            collectors: Number(game.collectors || 0),
            year: game.year || null,
          }));

          setVideoGames(formattedGames);
          setBoardGames(formattedBoardGames);
          setPopularProfiles(homeData.featured_profiles || []);
          setCommunityStats({
            users: Number(homeData.stats?.users || 0),
            game_collectors: Number(homeData.stats?.game_collectors || 0),
            games_in_collections: Number(homeData.stats?.games_in_collections || 0),
            boardgames_in_collections: Number(homeData.stats?.boardgames_in_collections || 0),
          });
        } else {
          setVideoGames([]);
          setBoardGames([]);
          setPopularProfiles([]);
        }

        if (postsResult.status === 'fulfilled') {
          setPosts(extractList(postsResult.value));
        } else {
          setPosts([]);
        }
      } catch (error) {
        console.error('Erro ao carregar a home:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();

    if (searchQuery.trim()) {
      navigate(`/profile/${searchQuery.trim()}`);
    }
  };

  const publishedPosts = useMemo(() => {
    return posts.filter((post) => post.is_published !== false);
  }, [posts]);

  const featuredPost =
    publishedPosts.find((post) => post.is_featured) ||
    publishedPosts[0] ||
    null;

  const latestPosts = publishedPosts
    .filter((post) => post.id !== featuredPost?.id)
    .slice(0, 6);

  const top3Games = videoGames.slice(0, 3);
  const top3BoardGames = boardGames.slice(0, 3);

  const getPostCategory = (post) => {
    const category =
      post?.category?.name ||
      post?.category ||
      post?.category_code ||
      'NEWS';

    return String(category).toUpperCase();
  };

  const getPostCategoryLabel = (post) => {
    const category = getPostCategory(post);

    return (
      post?.category_display ||
      CATEGORY_LABELS[category] ||
      post?.category?.name ||
      'Publicação'
    );
  };

  const getPostImage = (post) => {
    return (
      post?.cover_image ||
      post?.image ||
      post?.cover_url ||
      null
    );
  };

  const getPostSummary = (post) => {
    return (
      post?.summary ||
      post?.excerpt ||
      post?.description ||
      'Confira esta publicação no Meu Acervo.'
    );
  };

  const getPostLink = (post) => {
    if (post?.slug) {
      return `/posts/${post.slug}`;
    }

    return `/posts/${post.id}`;
  };

  const categoryHighlights = [
    {
      key: 'REVIEW',
      title: 'Reviews',
      description:
        'Opiniões sobre jogos, consoles, board games e itens do universo geek.',
      icon: Star,
    },
    {
      key: 'RECOMMENDATION',
      title: 'Indicações',
      description:
        'Jogos, experiências e coisas geek que valem a pena conhecer.',
      icon: Sparkles,
    },
    {
      key: 'BEYBLADE',
      title: 'Beyblade Lab',
      description:
        'Combos, testes, peças, ideias fora do meta e resultados de batalha.',
      icon: Beaker,
    },
    {
      key: 'POKEMON',
      title: 'Pokémon',
      description:
        'Times, VGC, TCG, jornadas, coleções e conteúdo do mundo Pokémon.',
      icon: Gamepad2,
    },
    {
      key: 'COLLECTION',
      title: 'Diário do Acervo',
      description:
        'Novas aquisições, coleções da comunidade e descobertas que merecem destaque.',
      icon: PackageOpen,
    },
    {
      key: 'PROJECT',
      title: 'Projetos',
      description:
        'Novidades do próprio site, ferramentas, interfaces e experimentos criativos.',
      icon: Flame,
    },
  ];

  if (loading) {
    return (
      <div className="home-page">
        <Navbar />

        <main className="home-loading">
          <div className="home-loading-card">
            <Sparkles size={28} />
            <span>Carregando o universo geek...</span>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="home-page">
      <Navbar />

      <main>
        <section className="home-hero">
          <div className="home-hero-content">
            <span className="home-kicker">
              UNIVERSO GEEK
            </span>

            <h1>
              Seu universo geek,
              <br />
              reunido em um só lugar.
            </h1>

            <p>
              Descubra jogos, board games, Pokémon, Beyblade,
              publicações e coleções compartilhadas pela comunidade.
            </p>

            <form
              className="home-search"
              onSubmit={handleSearch}
            >
              <Search size={19} />

              <input
                type="text"
                placeholder="Buscar perfil..."
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
              />

              <button type="submit">
                Buscar
              </button>
            </form>

            <div className="home-hero-actions">
              <button
                type="button"
                className="home-primary-action"
                onClick={() => navigate('/games')}
              >
                <Gamepad2 size={18} />
                Explorar jogos
              </button>

              <a
                className="home-secondary-action"
                href="#publicacoes"
              >
                <Newspaper size={18} />
                Ver publicações
              </a>
            </div>
          </div>

          <div className="home-hero-panel">
            <span className="home-panel-label">
              A COMUNIDADE POR AQUI
            </span>

            <div className="home-panel-grid">
              <div>
                <Gamepad2 size={24} />
                <strong>{communityStats.games_in_collections}</strong>
                <span>Jogos nas coleções</span>
              </div>

              <div>
                <Newspaper size={24} />
                <strong>{publishedPosts.length}</strong>
                <span>Publicações</span>
              </div>

              <div>
                <Users size={24} />
                <strong>{communityStats.users}</strong>
                <span>Exploradores</span>
              </div>

              <div>
                <Trophy size={24} />
                <strong>{communityStats.boardgames_in_collections}</strong>
                <span>Board games</span>
              </div>
            </div>
          </div>
        </section>

        <div className="home-shell">
          <section
            className="home-editorial"
            id="publicacoes"
          >
            <div className="home-section-heading">
              <div>
                <span>CONTEÚDO EM DESTAQUE</span>
                <h2>Publicações em destaque</h2>
              </div>

              <Link
                to="/posts"
                className="home-view-all"
              >
                Ver tudo
                <ChevronRight size={18} />
              </Link>
            </div>

            {featuredPost ? (
              <div className="home-news-layout">
                <Link
                  to={getPostLink(featuredPost)}
                  className="home-featured-post"
                >
                  <img
                    src={getImageUrl(
                      getPostImage(featuredPost),
                      featuredPost.title
                    )}
                    alt={featuredPost.title}
                  />

                  <div className="home-featured-overlay">
                    <span>
                      {getPostCategoryLabel(featuredPost)}
                    </span>

                    <h2>{featuredPost.title}</h2>

                    <p>
                      {getPostSummary(featuredPost)}
                    </p>

                    <strong>
                      Ler publicação
                      <ArrowRight size={17} />
                    </strong>
                  </div>
                </Link>

                <div className="home-latest-posts">
                  {latestPosts.slice(0, 4).map((post) => (
                    <Link
                      to={getPostLink(post)}
                      className="home-small-post"
                      key={post.id}
                    >
                      <img
                        src={getImageUrl(
                          getPostImage(post),
                          post.title
                        )}
                        alt={post.title}
                      />

                      <div>
                        <span>
                          {getPostCategoryLabel(post)}
                        </span>

                        <h3>{post.title}</h3>

                        <p>
                          {getPostSummary(post)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="home-empty-editorial">
                <div className="home-empty-editorial-icon">
                  <Newspaper size={32} />
                </div>

                <div>
                  <span>ÁREA EDITORIAL</span>
                  <h3>
                    As próximas histórias do universo geek vão aparecer aqui.
                  </h3>

                  <p>
                    Reviews, indicações, Pokémon, Beyblade,
                    projetos e novidades do site serão publicados nesta área.
                  </p>
                </div>
              </div>
            )}
          </section>

          <section className="home-category-section">
            <div className="home-section-heading">
              <div>
                <span>EDITORIAS</span>
                <h2>Explore nossos conteúdos</h2>
              </div>
            </div>

            <div className="home-category-grid">
              {categoryHighlights.map((category) => {
                const Icon = category.icon;
                const count = publishedPosts.filter(
                  (post) =>
                    getPostCategory(post) === category.key
                ).length;

                return (
                  <article
                    className="home-category-card"
                    key={category.key}
                  >
                    <div className="home-category-icon">
                      <Icon size={24} />
                    </div>

                    <div>
                      <div className="home-category-title-row">
                        <h3>{category.title}</h3>

                        {count > 0 && (
                          <span>{count}</span>
                        )}
                      </div>

                      <p>{category.description}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {top3Games.length > 0 && (
            <section className="home-ranking-section">
              <div className="home-section-heading">
                <div>
                  <span>DESTAQUES DA COMUNIDADE</span>
                  <h2>Jogos mais colecionados</h2>
                </div>

                <Trophy size={25} />
              </div>

              <div className="home-ranking-grid">
                {top3Games.map((game, index) => (
                  <article
                    className={`home-ranking-card place-${index + 1}`}
                    key={game.id}
                  >
                    <div className="home-ranking-number">
                      #{index + 1}
                    </div>

                    <img
                      src={getImageUrl(game.image, game.title)}
                      alt={game.title}
                    />

                    <div className="home-ranking-content">
                      <span>{game.platform}</span>
                      <h3>{game.title}</h3>

                      <div>
                        <Users size={15} />
                        {game.collectors} {game.collectors === 1 ? 'colecionador' : 'colecionadores'}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {top3BoardGames.length > 0 && (
            <section className="home-ranking-section">
              <div className="home-section-heading">
                <div>
                  <span>DESTAQUES DA COMUNIDADE</span>
                  <h2>Board games mais colecionados</h2>
                </div>

                <Dice5 size={25} />
              </div>

              <div className="home-ranking-grid">
                {top3BoardGames.map((game, index) => (
                  <article
                    className={`home-ranking-card place-${index + 1}`}
                    key={game.id}
                  >
                    <div className="home-ranking-number">
                      #{index + 1}
                    </div>

                    <img
                      src={getImageUrl(game.image, game.title)}
                      alt={game.title}
                    />

                    <div className="home-ranking-content">
                      <span>
                        {game.year ? `Lançado em ${game.year}` : 'Board game'}
                      </span>

                      <h3>{game.title}</h3>

                      <div>
                        <Users size={15} />
                        {game.collectors} {game.collectors === 1 ? 'colecionador' : 'colecionadores'}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {popularProfiles.length > 0 && (
            <section className="home-community-section">
              <div className="home-section-heading">
                <div>
                  <span>COMUNIDADE</span>
                  <h2>Perfis em destaque</h2>
                </div>

                <Users size={25} />
              </div>

              <div className="home-community-grid">
                {popularProfiles.map((profile) => (
                  <Link
                    to={`/profile/${profile.username}`}
                    key={profile.username}
                    className="home-community-card"
                  >
                    <img
                      src={getImageUrl(
                        profile.avatar,
                        profile.username
                      )}
                      alt={profile.username}
                    />

                    <div>
                      <h3>{profile.username}</h3>

                      <span>
                        <Eye size={14} />
                        {profile.profile_views || 0} visualizações
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default HomePage;