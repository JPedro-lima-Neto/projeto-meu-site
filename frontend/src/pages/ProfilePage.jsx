import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
    LogOut, Gamepad2, Dice5, Camera, 
    LayoutDashboard, Monitor, Trophy, Plus, Check, X
} from 'lucide-react';
import './ProfilePage.css';

function ProfilePage() {
    const { username } = useParams(); 
    const fileInputRef = useRef(null);
    const myUsername = localStorage.getItem('username');
    
    const isMyProfile = !username || username === myUsername;
    const currentProfileUser = isMyProfile ? myUsername : username;

    const [profileData, setProfileData] = useState({ 
        username: '', avatar: null, bio: '', profile_views: 0 
    });

    const [portfolio, setPortfolio] = useState({ videoGames: [], boardGames: [], consoles: [] });
    const [activeTab, setActiveTab] = useState('overview'); 
    const [loading, setLoading] = useState(true);

    const [isEditingBio, setIsEditingBio] = useState(false);
    const [tempBio, setTempBio] = useState("");

    const getImageUrl = (path) => { 
        if (!path) return "https://via.placeholder.com/300x400?text=Sem+Imagem"; 
        if (path.startsWith('http')) return path; 
        return `http://127.0.0.1:8000${path}`; 
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, gamesRes, boardRes, consoleRes] = await Promise.all([
                    api.get(`profiles/${currentProfileUser}/`),
                    api.get(`library/?username=${currentProfileUser}`),
                    api.get(`boardgames/?username=${currentProfileUser}`),
                    api.get(`consoles/?username=${currentProfileUser}`)
                ]);

                const extract = (res) => Array.isArray(res.data) ? res.data : (res.data.results || []);

                setProfileData(profileRes.data);
                setTempBio(profileRes.data.bio || "");

                setPortfolio({
                    videoGames: extract(gamesRes),
                    boardGames: extract(boardRes),
                    consoles: extract(consoleRes)
                });

            } catch (error) {
                console.error("Erro:", error);
            } finally {
                setLoading(false);
            }
        };

        if (currentProfileUser) fetchData();
    }, [currentProfileUser]);

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    if (loading) {
        return (
            <div className="profile-container">
                <Navbar />
                <div className="loading-state">Carregando perfil...</div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="profile-container">
            <Navbar />

            <div className="profile-content">

                {/* HEADER */}
                <div className="profile-header">
                    
                    <div 
                        className="profile-avatar-container"
                        onClick={() => isMyProfile && fileInputRef.current.click()}
                    >
                        <img 
                            src={getImageUrl(profileData.avatar)} 
                            alt="Avatar" 
                            className="profile-avatar" 
                        />
                        {isMyProfile && (
                            <div className="avatar-overlay">
                                <Camera size={22} />
                            </div>
                        )}
                    </div>

                    <div className="profile-main-info">
                        <h1>{profileData.username}</h1>

                        <div className="bio-section">
                            {isEditingBio ? (
                                <>
                                    <textarea
                                        value={tempBio}
                                        onChange={(e) => setTempBio(e.target.value)}
                                    />
                                    <button 
                                        onClick={async () => {
                                            await api.patch(`profiles/${currentProfileUser}/`, { bio: tempBio });
                                            setProfileData(prev => ({ ...prev, bio: tempBio }));
                                            setIsEditingBio(false);
                                        }}
                                        className="btn-primary"
                                    >
                                        <Check size={16}/> Salvar
                                    </button>
                                </>
                            ) : (
                                <p>{profileData.bio || "Sem bio ainda..."}</p>
                            )}
                        </div>

                        <div className="profile-stats">
                            <div className="stat-card">
                                <strong>{portfolio.videoGames.length}</strong>
                                <span>Jogos</span>
                            </div>
                            <div className="stat-card">
                                <strong>{portfolio.boardGames.length}</strong>
                                <span>Boardgames</span>
                            </div>
                            <div className="stat-card">
                                <strong>{portfolio.consoles.length}</strong>
                                <span>Consoles</span>
                            </div>
                            <div className="stat-card">
                                <strong>{profileData.profile_views}</strong>
                                <span>Views</span>
                            </div>
                        </div>

                    </div>

                    {isMyProfile && (
                        <button className="logout-btn" onClick={handleLogout}>
                            <LogOut size={18}/> Sair
                        </button>
                    )}
                </div>

                {/* TABS */}
                <div className="profile-tabs">
                    <button onClick={() => setActiveTab('games')} className={activeTab==='games'?'active':''}>
                        <Gamepad2 size={16}/> Jogos
                    </button>
                    <button onClick={() => setActiveTab('boardgames')} className={activeTab==='boardgames'?'active':''}>
                        <Dice5 size={16}/> Tabuleiro
                    </button>
                    <button onClick={() => setActiveTab('consoles')} className={activeTab==='consoles'?'active':''}>
                        <Monitor size={16}/> Consoles
                    </button>
                </div>

                {/* GRID */}
                <div className="profile-grid">

                    {activeTab === 'games' && portfolio.videoGames.map(game => (
                        <div key={game.id} className="profile-card">
                            <img src={getImageUrl(game.game_catalog?.cover_image)} alt="" />
                            <div className="overlay">
                                <h4>{game.game_catalog?.title}</h4>
                                <span>{game.rating || '-'}</span>
                            </div>
                        </div>
                    ))}

                    {activeTab === 'boardgames' && portfolio.boardGames.map(bg => (
                        <div key={bg.id} className="profile-card">
                            <img src={getImageUrl(bg.cover_image)} alt="" />
                            <div className="overlay">
                                <h4>{bg.name}</h4>
                            </div>
                        </div>
                    ))}

                    {activeTab === 'consoles' && portfolio.consoles.map(c => (
                        <div key={c.id} className="profile-card">
                            <img src={getImageUrl(c.photo)} alt="" />
                            <div className="overlay">
                                <h4>{c.name}</h4>
                            </div>
                        </div>
                    ))}

                </div>

            </div>

            <Footer />
        </div>
    );
}

export default ProfilePage;