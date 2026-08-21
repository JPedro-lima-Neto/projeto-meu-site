import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  useParams,
  Link,
} from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  ArrowLeft,
  Dice5,
  Users,
  Clock3,
  CalendarDays,
  Building2,
  Baby,
  Star,
  PackageCheck,
  Eye,
  BookOpen,
  Puzzle,
  Tags,
} from 'lucide-react';
import './BoardGameDetailPage.css';

function BoardGameDetailPage() {
  const { id } = useParams();

  const [game, setGame] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  const getImageUrl = (
    imagePath
  ) => {
    if (!imagePath) {
      return null;
    }

    if (
      imagePath.startsWith(
        'http'
      )
    ) {
      return imagePath;
    }

    return `http://127.0.0.1:8000${imagePath}`;
  };

  useEffect(() => {
    const fetchGame =
      async () => {
        setLoading(true);
        setError(false);

        try {
          const response =
            await api.get(
              `boardgames/${id}/`
            );

          setGame(
            response.data
          );
        } catch (requestError) {
          console.error(
            'Erro ao buscar detalhes do jogo:',
            requestError
          );

          setError(true);
          setGame(null);
        } finally {
          setLoading(false);
        }
      };

    fetchGame();
  }, [id]);

  const gameCover =
    useMemo(() => {
      if (!game) {
        return null;
      }

      return getImageUrl(
        game.cover_image ||
        game.image_url
      );
    }, [game]);

  const rating =
    useMemo(() => {
      if (!game) {
        return null;
      }

      return (
        game.rating ??
        game.user_rating ??
        null
      );
    }, [game]);

  const owned =
    useMemo(() => {
      if (!game) {
        return false;
      }

      return (
        game.owned ??
        game.is_owned ??
        game.in_collection ??
        true
      );
    }, [game]);

  const played =
    useMemo(() => {
      if (!game) {
        return false;
      }

      return (
        game.played ??
        game.has_played ??
        true
      );
    }, [game]);

  const minPlayers =
    game?.min_players ?? null;

  const maxPlayers =
    game?.max_players ?? null;

  const playerText =
    minPlayers &&
    maxPlayers
      ? minPlayers ===
        maxPlayers
        ? `${minPlayers} jogadores`
        : `${minPlayers}–${maxPlayers} jogadores`
      : minPlayers
        ? `${minPlayers}+ jogadores`
        : 'Não informado';

  const playTime =
    game?.play_time ||
    (
      game?.min_play_time &&
      game?.max_play_time
        ? `${game.min_play_time}–${game.max_play_time} min`
        : game?.min_play_time
          ? `${game.min_play_time} min`
          : game?.max_play_time
            ? `${game.max_play_time} min`
            : 'Não informado'
    );

  const age =
    game?.age ||
    (
      game?.min_age
        ? `${game.min_age}+`
        : 'Não informado'
    );

  const categories =
    game?.categories ||
    game?.category ||
    null;

  const mechanics =
    game?.mechanics ||
    null;

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="boardgame-detail-page">

          <div className="boardgame-detail-loading">

            <div className="boardgame-detail-loader">
            </div>

            <p>
              Carregando informações...
            </p>

          </div>

        </main>

        <Footer />
      </>
    );
  }

  if (
    error ||
    !game
  ) {
    return (
      <>
        <Navbar />

        <main className="boardgame-detail-page">

          <div className="boardgame-detail-error">

            <Dice5 size={48} />

            <h1>
              Jogo não encontrado
            </h1>

            <p>
              Não foi possível carregar
              as informações deste jogo.
            </p>

            <Link
              to="/boardgames"
              className="boardgame-error-back"
            >
              <ArrowLeft size={18} />

              Voltar para a coleção
            </Link>

          </div>

        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="boardgame-detail-page">

        <div className="boardgame-detail-ambient">
        </div>

        <div className="boardgame-detail-container">

          <Link
            to="/boardgames"
            className="boardgame-back"
          >
            <span className="boardgame-back-icon">

              <ArrowLeft
                size={18}
              />

            </span>

            <span>
              Voltar para a coleção
            </span>
          </Link>

          <section className="boardgame-hero">

            <div className="boardgame-cover-column">

              <div className="boardgame-cover-glow">
              </div>

              <div className="boardgame-cover-frame">

                {gameCover ? (
                  <img
                    src={gameCover}
                    alt={game.name}
                    className="boardgame-cover-image"
                  />
                ) : (
                  <div className="boardgame-no-cover">

                    <Dice5
                      size={72}
                    />

                    <span>
                      Sem capa
                    </span>

                  </div>
                )}

              </div>

            </div>

            <div className="boardgame-main-info">

              <div className="boardgame-eyebrow">

                <Dice5
                  size={16}
                />

                JOGO DE TABULEIRO

              </div>

              <h1>
                {game.name}
              </h1>

              <div className="boardgame-status-row">

                {owned ? (
                  <div className="boardgame-status boardgame-status-owned">

                    <PackageCheck
                      size={16}
                    />

                    Na coleção

                  </div>
                ) : played ? (
                  <div className="boardgame-status boardgame-status-played">

                    <Eye
                      size={16}
                    />

                    Já joguei

                  </div>
                ) : null}

                <div className="boardgame-rating">

                  <Star
                    size={18}
                  />

                  <strong>
                    {rating !==
                      null &&
                    rating !==
                      undefined
                      ? Number(
                          rating
                        ).toFixed(
                          1
                        )
                      : '—'}
                  </strong>

                  <span>
                    / 10
                  </span>

                </div>

              </div>

              <p className="boardgame-description">

                {game.description ||
                  'Sem descrição cadastrada para este jogo.'}

              </p>

              <div className="boardgame-meta-grid">

                <article className="boardgame-meta-card">

                  <div className="boardgame-meta-icon">

                    <Users
                      size={20}
                    />

                  </div>

                  <div>

                    <span>
                      Jogadores
                    </span>

                    <strong>
                      {playerText}
                    </strong>

                  </div>

                </article>

                <article className="boardgame-meta-card">

                  <div className="boardgame-meta-icon">

                    <Clock3
                      size={20}
                    />

                  </div>

                  <div>

                    <span>
                      Duração
                    </span>

                    <strong>
                      {playTime}
                    </strong>

                  </div>

                </article>

                <article className="boardgame-meta-card">

                  <div className="boardgame-meta-icon">

                    <CalendarDays
                      size={20}
                    />

                  </div>

                  <div>

                    <span>
                      Ano
                    </span>

                    <strong>
                      {game.year ??
                        'Não informado'}
                    </strong>

                  </div>

                </article>

                <article className="boardgame-meta-card">

                  <div className="boardgame-meta-icon">

                    <Building2
                      size={20}
                    />

                  </div>

                  <div>

                    <span>
                      Editora
                    </span>

                    <strong>
                      {game.publisher ||
                        'Não informado'}
                    </strong>

                  </div>

                </article>

                <article className="boardgame-meta-card">

                  <div className="boardgame-meta-icon">

                    <Baby
                      size={20}
                    />

                  </div>

                  <div>

                    <span>
                      Idade mínima
                    </span>

                    <strong>
                      {age}
                    </strong>

                  </div>

                </article>

              </div>

            </div>

          </section>

          {(categories ||
            mechanics) && (
            <section className="boardgame-extra-section">

              <div className="boardgame-section-heading">

                <div>

                  <span>
                    DETALHES
                  </span>

                  <h2>
                    Como esse jogo funciona
                  </h2>

                </div>

                <div className="boardgame-heading-line">
                </div>

              </div>

              <div className="boardgame-extra-grid">

                {categories && (
                  <article className="boardgame-extra-card">

                    <div className="boardgame-extra-icon">

                      <Tags
                        size={22}
                      />

                    </div>

                    <div>

                      <span>
                        Categorias
                      </span>

                      <p>
                        {categories}
                      </p>

                    </div>

                  </article>
                )}

                {mechanics && (
                  <article className="boardgame-extra-card">

                    <div className="boardgame-extra-icon">

                      <Puzzle
                        size={22}
                      />

                    </div>

                    <div>

                      <span>
                        Mecânicas
                      </span>

                      <p>
                        {mechanics}
                      </p>

                    </div>

                  </article>
                )}

              </div>

            </section>
          )}

          <section className="boardgame-rules-section">

            <div className="boardgame-section-heading">

              <div>

                <span>
                  MANUAL
                </span>

                <h2>
                  Regras
                </h2>

              </div>

              <div className="boardgame-heading-line">
              </div>

            </div>

            <div className="boardgame-rules-card">

              <div className="boardgame-rules-icon">

                <BookOpen
                  size={24}
                />

              </div>

              <div className="boardgame-rules-content">

                {game.rules ? (
                  <p>
                    {game.rules}
                  </p>
                ) : (
                  <p className="boardgame-rules-empty">
                    Nenhuma regra cadastrada
                    para este jogo.
                  </p>
                )}

              </div>

            </div>

          </section>

        </div>

      </main>

      <Footer />
    </>
  );
}

export default BoardGameDetailPage;