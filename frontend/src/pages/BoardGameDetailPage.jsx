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
  Paintbrush,
  PenTool,
  Gauge,
} from 'lucide-react';

import './BoardGameDetailPage.css';


function BoardGameDetailPage() {
  const { id } = useParams();

  const [game, setGame] =
    useState(null);

  const [userGame, setUserGame] =
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
          const [
            catalogResponse,
            userGamesResponse,
          ] = await Promise.all([
            api.get(
              `boardgame-catalog/${id}/`
            ),

            api.get(
              'user-boardgames/'
            ),
          ]);

          const catalogGame =
            catalogResponse.data;

          const userGamesData =
            userGamesResponse
              .data
              .results ||
            userGamesResponse.data;

          const entries =
            Array.isArray(
              userGamesData
            )
              ? userGamesData
              : [];

          const matchingEntry =
            entries.find(
              (entry) =>
                Number(
                  entry.game?.id
                ) === Number(id)
            ) || null;

          setGame(
            catalogGame
          );

          setUserGame(
            matchingEntry
          );

        } catch (requestError) {
          console.error(
            'Erro ao buscar detalhes do jogo:',
            requestError
          );

          setError(true);
          setGame(null);
          setUserGame(null);

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
        game.cover_url ||
        game.thumbnail_url
      );
    }, [game]);


  const rating =
    userGame?.rating ??
    null;


  const owned =
    Boolean(
      userGame?.owned
    );


  const played =
    Boolean(
      userGame?.played
    );


  const minPlayers =
    game?.min_players ??
    null;


  const maxPlayers =
    game?.max_players ??
    null;


  const playerText =
    minPlayers &&
    maxPlayers
      ? (
          minPlayers ===
          maxPlayers
            ? `${minPlayers} jogadores`
            : `${minPlayers}–${maxPlayers} jogadores`
        )
      : minPlayers
        ? `${minPlayers}+ jogadores`
        : 'Não informado';


  const playTime =
    game?.play_time ||
    (
      game?.min_play_time &&
      game?.max_play_time
        ? (
            game.min_play_time ===
            game.max_play_time
              ? `${game.min_play_time} min`
              : `${game.min_play_time}–${game.max_play_time} min`
          )
        : game?.min_play_time
          ? `${game.min_play_time} min`
          : game?.max_play_time
            ? `${game.max_play_time} min`
            : 'Não informado'
    );


  const age =
    game?.min_age
      ? `${game.min_age}+`
      : 'Não informado';


  const categories =
    Array.isArray(
      game?.categories
    )
      ? game.categories
      : [];


  const mechanics =
    Array.isArray(
      game?.mechanics
    )
      ? game.mechanics
      : [];


  const designers =
    Array.isArray(
      game?.designers
    )
      ? game.designers
      : [];


  const artists =
    Array.isArray(
      game?.artists
    )
      ? game.artists
      : [];


  const formatList = (
    items
  ) => {
    if (
      !items ||
      items.length === 0
    ) {
      return 'Não informado';
    }

    return items.join(', ');
  };


  if (loading) {
    return (
      <div className="boardgame-detail-theme">

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

      </div>
    );
  }


  if (
    error ||
    !game
  ) {
    return (
      <div className="boardgame-detail-theme">

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

      </div>
    );
  }


  return (
    <div className="boardgame-detail-theme">

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

                {owned && (
                  <div className="boardgame-status boardgame-status-owned">

                    <PackageCheck
                      size={16}
                    />

                    Na coleção

                  </div>
                )}

                {!owned &&
                  played && (
                    <div className="boardgame-status boardgame-status-played">

                      <Eye
                        size={16}
                      />

                      Já joguei

                    </div>
                  )}


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
                        ).toFixed(1)
                      : '—'}
                  </strong>

                  <span>
                    / 10
                  </span>

                </div>

              </div>


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


                <article className="boardgame-meta-card">

                  <div className="boardgame-meta-icon">

                    <Gauge
                      size={20}
                    />

                  </div>

                  <div>

                    <span>
                      Complexidade BGG
                    </span>

                    <strong>
                      {game.bgg_weight
                        ? `${Number(
                            game.bgg_weight
                          ).toFixed(2)} / 5`
                        : 'Não informado'}
                    </strong>

                  </div>

                </article>

              </div>

            </div>

          </section>


          <section className="boardgame-description-section">

            <div className="boardgame-section-heading">

              <div>

                <span>
                  VISÃO GERAL
                </span>

                <h2>
                  Descrição
                </h2>

              </div>

              <div className="boardgame-heading-line">
              </div>

            </div>


            <div className="boardgame-description-card">

              <p>
                {game.description ||
                  'Sem descrição cadastrada para este jogo.'}
              </p>

            </div>

          </section>


          <section className="boardgame-extra-section">

            <div className="boardgame-section-heading">

              <div>

                <span>
                  DETALHES
                </span>

                <h2>
                  Sobre o jogo
                </h2>

              </div>

              <div className="boardgame-heading-line">
              </div>

            </div>


            <div className="boardgame-extra-grid">

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
                    {formatList(
                      categories
                    )}
                  </p>

                </div>

              </article>


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
                    {formatList(
                      mechanics
                    )}
                  </p>

                </div>

              </article>


              <article className="boardgame-extra-card">

                <div className="boardgame-extra-icon">

                  <PenTool
                    size={22}
                  />

                </div>

                <div>

                  <span>
                    Designers
                  </span>

                  <p>
                    {formatList(
                      designers
                    )}
                  </p>

                </div>

              </article>


              <article className="boardgame-extra-card">

                <div className="boardgame-extra-icon">

                  <Paintbrush
                    size={22}
                  />

                </div>

                <div>

                  <span>
                    Artistas
                  </span>

                  <p>
                    {formatList(
                      artists
                    )}
                  </p>

                </div>

              </article>

            </div>

          </section>


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

    </div>
  );
}

export default BoardGameDetailPage;