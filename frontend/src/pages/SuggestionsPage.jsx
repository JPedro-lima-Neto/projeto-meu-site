import React, { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./SuggestionsPage.css";

function SuggestionsPage() {
  const [category, setCategory] = useState("zerar");
  const [message, setMessage] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    try {
      setLoading(true);

      await axios.post("http://127.0.0.1:8000/api/feedback/", {
        category,
        message,
      });

      setFeedbackSent(true);
      setMessage("");

      setTimeout(() => setFeedbackSent(false), 3000);
    } catch (error) {
      console.error("Erro ao enviar sugestão:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="suggestions-page">
      <Navbar />

      <div className="suggestions-wrapper">

        {/* HERO */}
        <div className="suggestions-hero">
          <h1>💡 Sugestões da Comunidade</h1>
          <p>
            Ajude a evoluir o projeto — recomende jogos, ideias ou melhorias
          </p>
        </div>

        {/* FORM CARD */}
        <div className="suggestions-card">
          <form className="suggestions-form" onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="zerar">🎮 Jogos para zerar</option>
                <option value="boardgames">🎲 Jogos de tabuleiro</option>
                <option value="site">💻 Ideias para o site</option>
                <option value="outro">🧠 Outros</option>
              </select>
            </div>

            <div className="form-group">
              <label>Sua sugestão</label>
              <textarea
                placeholder="Digite sua ideia..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Enviando..." : "Enviar Sugestão"}
            </button>

            {feedbackSent && (
              <div className="success-msg">
                ✔ Sugestão enviada com sucesso!
              </div>
            )}

          </form>
        </div>

        {/* EXTRA VISUAL */}
        <div className="suggestions-info">
          <div className="info-card">
            <h3>🎯 O que sugerir?</h3>
            <p>Jogos, melhorias visuais, novas funcionalidades ou ideias criativas.</p>
          </div>

          <div className="info-card">
            <h3>🚀 Impacto</h3>
            <p>Sugestões podem virar novas features no site.</p>
          </div>

          <div className="info-card">
            <h3>🧠 Criatividade</h3>
            <p>Quanto mais diferente, melhor.</p>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}

export default SuggestionsPage;