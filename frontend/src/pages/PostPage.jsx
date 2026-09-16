import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Newspaper,
  Sparkles,
  User,
} from 'lucide-react';

import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

import './PostPage.css';

const CATEGORY_LABELS = {
  NEWS: 'Notícias / Novidades',
  REVIEW: 'Review',
  RECOMMENDATION: 'Indicação',
  BEYBLADE: 'Beyblade Lab',
  POKEMON: 'Pokémon',
  BOARDGAME: 'Board Game',
  GUIDE: 'Guia',
  COLLECTION: 'Diário do Acervo',
  PROJECT: 'Projeto',
};

function PostPage() {
  const { slug } = useParams();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const apiOrigin = useMemo(() => {
    const baseURL = api.defaults?.baseURL;

    if (!baseURL) {
      return 'http://127.0.0.1:8000';
    }

    return baseURL
      .replace(/\/api\/?$/i, '')
      .replace(/\/$/, '');
  }, []);

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return null;
    }

    if (
      imagePath.startsWith('http://') ||
      imagePath.startsWith('https://')
    ) {
      return imagePath;
    }

    return `${apiOrigin}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  useEffect(() => {
    let active = true;

    const fetchPost = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get(
          `posts/${encodeURIComponent(slug)}/`
        );

        if (active) {
          setPost(response.data);
        }
      } catch (requestError) {
        console.error(
          'Erro ao carregar publicação:',
          requestError
        );

        if (active) {
          setPost(null);
          setError(
            'Não foi possível encontrar esta publicação.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchPost();

    return () => {
      active = false;
    };
  }, [slug]);

  const categoryCode = String(
    post?.category || 'NEWS'
  ).toUpperCase();

  const categoryLabel =
    post?.category_display ||
    CATEGORY_LABELS[categoryCode] ||
    'Publicação';

  const coverImage = getImageUrl(
    post?.cover_image ||
    post?.cover_url ||
    null
  );

  const publishedDate =
    post?.published_at ||
    post?.created_at ||
    null;

  const formattedDate = publishedDate
    ? new Intl.DateTimeFormat(
        'pt-BR',
        {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }
      ).format(new Date(publishedDate))
    : '';

  const readingTime = useMemo(() => {
    const content = post?.content || '';
    const words = content
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .length;

    return Math.max(
      1,
      Math.ceil(words / 220)
    );
  }, [post?.content]);

  if (loading) {
    return (
      <div className="post-page">
        <Navbar />

        <main className="post-state">
          <div className="post-state-card">
            <Sparkles size={28} />
            <span>Carregando publicação...</span>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="post-page">
        <Navbar />

        <main className="post-state">
          <div className="post-state-card post-state-error">
            <Newspaper size={34} />

            <h1>Publicação não encontrada</h1>

            <p>
              {error ||
                'Essa publicação não está disponível.'}
            </p>

            <Link to="/home">
              <ArrowLeft size={18} />
              Voltar para a Home
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="post-page">
      <Navbar />

      <main className="post-main">
        <article className="post-article">
          <Link
            to="/home"
            className="post-back"
          >
            <ArrowLeft size={18} />
            Voltar para a Home
          </Link>

          <header className="post-header">
            <span className="post-category">
              {categoryLabel}
            </span>

            <h1>{post.title}</h1>

            {post.excerpt && (
              <p className="post-excerpt">
                {post.excerpt}
              </p>
            )}

            <div className="post-meta">
              <span>
                <User size={16} />
                {post.author_username ||
                  'Meu Acervo Geek'}
              </span>

              {formattedDate && (
                <span>
                  <CalendarDays size={16} />
                  {formattedDate}
                </span>
              )}

              <span>
                <Clock3 size={16} />
                {readingTime} min de leitura
              </span>
            </div>
          </header>

          {coverImage && (
            <div className="post-cover">
              <img
                src={coverImage}
                alt={post.title}
              />
            </div>
          )}

          <div className="post-content">
            {(post.content || '')
              .split(/\n{2,}/)
              .map((paragraph, index) => {
                const text = paragraph.trim();

                if (!text) {
                  return null;
                }

                return (
                  <p key={`${post.id}-${index}`}>
                    {text}
                  </p>
                );
              })}
          </div>

          <footer className="post-article-footer">
            <div>
              <Newspaper size={21} />

              <span>
                Publicado no Meu Acervo Geek
              </span>
            </div>

            <Link to="/home#publicacoes">
              Ver outras publicações
            </Link>
          </footer>
        </article>
      </main>

      <Footer />
    </div>
  );
}

export default PostPage;