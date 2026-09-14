import React, { useState } from 'react';
import {
  Brain,
  Gamepad2,
  Lightbulb,
  MessageSquarePlus,
  Rocket,
  Send,
  Sparkles,
} from 'lucide-react';

import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

import './SuggestionsPage.css';

function SuggestionsPage() {
  const [category, setCategory] = useState('zerar');
  const [message, setMessage] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const maxCharacters = 600;

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      setErrorMessage('Digite uma sugestão antes de enviar.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      setFeedbackSent(false);

      await api.post('feedback/', {
        category,
        message: trimmedMessage,
      });

      setFeedbackSent(true);
      setMessage('');

      setTimeout(() => {
        setFeedbackSent(false);
      }, 3000);
    } catch (error) {
      console.error('Erro ao enviar sugestão:', error);

      const data = error?.response?.data;
      const firstValue = data ? Object.values(data)[0] : null;

      if (Array.isArray(firstValue) && firstValue.length > 0) {
        setErrorMessage(String(firstValue[0]));
      } else if (typeof firstValue === 'string') {
        setErrorMessage(firstValue);
      } else {
        setErrorMessage(
          'Não foi possível enviar sua sugestão. Tente novamente.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="suggestions-page">
      <Navbar />

      <main className="suggestions-wrapper">
        <section className="suggestions-hero">
          <div className="suggestions-hero-icon">
            <Lightbulb size={34} />
          </div>

          <div>
            <span className="suggestions-kicker">
              SUA IDEIA PODE ENTRAR NO PROJETO
            </span>

            <h1>Sugestões da Comunidade</h1>

            <p>
              Recomende jogos, novas funcionalidades, melhorias visuais ou
              qualquer ideia que possa deixar o Meu Acervo ainda melhor.
            </p>
          </div>
        </section>

        <section className="suggestions-content">
          <div className="suggestions-card">
            <div className="suggestions-card-heading">
              <MessageSquarePlus size={24} />

              <div>
                <span>ENVIAR SUGESTÃO</span>
                <h2>O que você gostaria de ver por aqui?</h2>
              </div>
            </div>

            <form
              className="suggestions-form"
              onSubmit={handleSubmit}
            >
              <label className="suggestions-field">
                <span>Categoria</span>

                <select
                  value={category}
                  onChange={(event) => {
                    setCategory(event.target.value);
                    setErrorMessage('');
                  }}
                >
                  <option value="zerar">
                    🎮 Jogos para zerar
                  </option>

                  <option value="boardgames">
                    🎲 Jogos de tabuleiro
                  </option>

                  <option value="site">
                    💻 Ideias para o site
                  </option>

                  <option value="outro">
                    🧠 Outros
                  </option>
                </select>
              </label>

              <label className="suggestions-field">
                <span>Sua sugestão</span>

                <textarea
                  placeholder="Ex.: Seria legal adicionar uma área para registrar..."
                  value={message}
                  maxLength={maxCharacters}
                  onChange={(event) => {
                    setMessage(event.target.value);
                    setErrorMessage('');
                  }}
                />

                <div className="suggestions-textarea-footer">
                  <small>
                    Conte sua ideia do jeito que preferir.
                  </small>

                  <small
                    className={
                      message.length >= maxCharacters
                        ? 'is-limit'
                        : ''
                    }
                  >
                    {message.length} / {maxCharacters}
                  </small>
                </div>
              </label>

              {errorMessage && (
                <div className="suggestions-message is-error">
                  {errorMessage}
                </div>
              )}

              {feedbackSent && (
                <div className="suggestions-message is-success">
                  ✔ Sugestão enviada com sucesso!
                </div>
              )}

              <button
                type="submit"
                className="suggestions-submit"
                disabled={loading || !message.trim()}
              >
                <Send size={18} />

                {loading
                  ? 'Enviando...'
                  : 'Enviar sugestão'}
              </button>
            </form>
          </div>

          <aside className="suggestions-side">
            <article className="suggestions-info-card">
              <div className="suggestions-info-icon">
                <Gamepad2 size={23} />
              </div>

              <div>
                <h3>O que sugerir?</h3>
                <p>
                  Jogos para conhecer, board games, melhorias no site
                  ou novas áreas para o acervo.
                </p>
              </div>
            </article>

            <article className="suggestions-info-card">
              <div className="suggestions-info-icon">
                <Rocket size={23} />
              </div>

              <div>
                <h3>Ideias podem virar features</h3>
                <p>
                  Uma boa sugestão pode se transformar em uma nova
                  funcionalidade do projeto.
                </p>
              </div>
            </article>

            <article className="suggestions-info-card">
              <div className="suggestions-info-icon">
                <Brain size={23} />
              </div>

              <div>
                <h3>Pode inventar</h3>
                <p>
                  Não precisa ficar preso ao que já existe. Ideias
                  diferentes são muito bem-vindas.
                </p>
              </div>
            </article>

            <article className="suggestions-info-card suggestions-info-highlight">
              <Sparkles size={25} />

              <p>
                As sugestões são uma forma de construir o Meu Acervo
                junto com quem usa o site.
              </p>
            </article>
          </aside>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default SuggestionsPage;