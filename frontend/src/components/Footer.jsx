import React from 'react';
import { Instagram, Github, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="main-footer">
      
      <div className="footer-container">

        {/* BRAND */}
        <div className="footer-brand">
          <h2>GEEK'S JOURNEY</h2>
          <p>Seu hub de jogos, coleções e comunidade gamer.</p>
        </div>

        {/* NAVEGAÇÃO */}
        <div className="footer-links">
          <h4>Navegação</h4>
          <Link to="/home">Home</Link>
          <Link to="/consoles">Consoles</Link>
          <Link to="/boardgames">Tabuleiro</Link>
          <Link to="/sugestoes">Sugestões</Link>
        </div>

        {/* COMUNIDADE */}
        <div className="footer-links">
          <h4>Comunidade</h4>
          <Link to="/home">Top Jogadores</Link>
          <Link to="/home">Ranking</Link>
          <Link to="/home">Descobrir</Link>
        </div>

        {/* SOCIAL */}
        <div className="footer-social">
          <h4>Contato</h4>

          <div className="social-icons">
            <a href="https://www.instagram.com/lupalinta/" target="_blank" rel="noreferrer">
              <Instagram size={20} />
            </a>

            <a href="https://github.com/JPedro-lima-Neto" target="_blank" rel="noreferrer">
              <Github size={20} />
            </a>

            <a href="#" target="_blank" rel="noreferrer">
              <Linkedin size={20} />
            </a>
          </div>

          <p className="footer-email">pedrinho.jpln@gumail.com</p>
        </div>

      </div>

      {/* LINHA FINAL */}
      <div className="footer-bottom">
        <p>© 2025 Geek's Journey — Todos os direitos reservados</p>
      </div>

    </footer>
  );
}

export default Footer;