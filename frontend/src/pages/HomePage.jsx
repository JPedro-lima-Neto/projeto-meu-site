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
  const [popularProfiles, setPopularProfiles] = useState([]);
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
          api.get('library/'),
          api.get('profiles/?ordering=-profile_views'),
          api.get('posts/?ordering=-published_at,-created_at'),
        ]);

        const gamesResult = results[0];
        const profilesResult = results[1];
        const postsResult = results[2];

        if (gamesResult.status === 'fulfilled') {
          const rawGames = extractList(gamesResult.value);

          const formattedGames = rawGames.map((entry) => {
            const gameData =
              entry.game_catalog ||
              entry.game ||
              {};

            return {
              id: entry.id,
              title: gameData.title || 'Jogo sem título',
              image:
                gameData.cover_image ||
                gameData.cover_url ||
                null,
              score: Number(entry.rating || 0),
              genre: gameData.genre || 'Games',
              platform:
                gameData.platform?.name ||
                gameData.platform ||
                entry.platform?.name ||
                'Videogame',
              description:
                gameData.description ||
                entry.review ||
                'Uma experiência que faz parte do meu acervo geek.',
            };
          });

          setVideoGames(formattedGames);
        }

        if (profilesResult.status === 'fulfilled') {
          setPopularProfiles(
            extractList(profilesResult.value).slice(0, 6)
          );
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
    return posts.filter((post) => {
      if (typeof post.published === 'boolean') {
        return post.published;
      }

      if (post.status) {
        return String(post.status).toUpperCase() !== 'DRAFT';
      }

      return true;
    });
  }, [posts]);

  const featuredPost =
    publishedPosts.find((post) => post.featured) ||
    publishedPosts[0] ||
    null;

  const latestPosts = publishedPosts
    .filter((post) => post.id !== featuredPost?.id)
    .slice(0, 6);

  const sortedGames = useMemo(() => {
    return [...videoGames]
      .filter((game) => game.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [videoGames]);

  const top3Games = sortedGames.slice(0, 3);

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
        'Opiniões sobre jogos, consoles, board games e itens que realmente fazem parte do acervo.',
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
        'Novas aquisições, itens que chegaram e mudanças importantes na coleção.',
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
            <span>Carregando seu universo geek...</span>
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
              MEU UNIVERSO GEEK
            </span>

            <h1>
              Um lugar para guardar,
              <br />
              jogar, testar e contar histórias.
            </h1>

            <p>
              Jogos, board games, Pokémon, Beyblade, coleções,
              reviews, ideias e projetos reunidos em um único espaço.
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
                Explorar acervo
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
              O QUE TEM POR AQUI?
            </span>

            <div className="home-panel-grid">
              <div>
                <Gamepad2 size={24} />
                <strong>{videoGames.length}</strong>
                <span>Jogos</span>
              </div>

              <div>
                <Newspaper size={24} />
                <strong>{publishedPosts.length}</strong>
                <span>Publicações</span>
              </div>

              <div>
                <Users size={24} />
                <strong>{popularProfiles.length}</strong>
                <span>Exploradores</span>
              </div>

              <div>
                <Trophy size={24} />
                <strong>{top3Games.length}</strong>
                <span>Destaques</span>
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
                <h2>Geek News & Publicações</h2>
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
                    As próximas histórias do acervo vão aparecer aqui.
                  </h3>

                  <p>
                    Reviews, indicações, combos de Beyblade,
                    conteúdo Pokémon, projetos e novidades do site
                    podem ser publicados nesta área.
                  </p>
                </div>
              </div>
            )}
          </section>

          <section className="home-category-section">
            <div className="home-section-heading">
              <div>
                <span>EDITORIAS</span>
                <h2>O que pode aparecer na Home</h2>
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
                  <span>RANKING PESSOAL</span>
                  <h2>Meu Top Games</h2>
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
                        <Star size={15} />
                        {game.score}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          <section className="home-ideas-section">
            <div className="home-section-heading">
              <div>
                <span>FORMATOS DE CONTEÚDO</span>
                <h2>Ideias para alimentar a Home</h2>
              </div>
            </div>

            <div className="home-ideas-grid">
              <article>
                <span>01</span>
                <h3>Review do acervo</h3>
                <p>
                  Avaliações de jogos, consoles, board games,
                  decks ou qualquer item que você realmente tenha usado.
                </p>
              </article>

              <article>
                <span>02</span>
                <h3>Combo da semana</h3>
                <p>
                  Uma build de Beyblade, por que ela funciona,
                  peças utilizadas e contra o que ela se sai melhor.
                </p>
              </article>

              <article>
                <span>03</span>
                <h3>Vale a pena?</h3>
                <p>
                  Conteúdos curtos sobre compras, lançamentos,
                  acessórios e itens que chamaram sua atenção.
                </p>
              </article>

              <article>
                <span>04</span>
                <h3>Diário de jornada</h3>
                <p>
                  Momentos de uma jogatina, time campeão,
                  progresso em Pokémon ou uma experiência marcante.
                </p>
              </article>

              <article>
                <span>05</span>
                <h3>Top listas</h3>
                <p>
                  Rankings pessoais: favoritos, surpresas,
                  decepções, melhores compras ou próximos objetivos.
                </p>
              </article>

              <article>
                <span>06</span>
                <h3>Dev Log</h3>
                <p>
                  Novas funções do Meu Acervo, bastidores,
                  mapas, pixel arts e evolução do próprio projeto.
                </p>
              </article>
            </div>
          </section>

          {popularProfiles.length > 0 && (
            <section className="home-community-section">
              <div className="home-section-heading">
                <div>
                  <span>COMUNIDADE</span>
                  <h2>Exploradores Geek</h2>
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
                        {profile.profile_views || 0} views
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