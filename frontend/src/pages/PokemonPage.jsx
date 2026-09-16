import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  BookOpen,
  Camera,
  Clock3,
  Gamepad2,
  Home,
  Map,
  Plus,
  Printer,
  Save,
  Search,
  Sparkles,
  Star,
  Swords,
  Trophy,
  UserRound,
  X,
} from 'lucide-react';

import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

import cidadePokemon from '../assets/cidade.png';
import hallOfFameSprite from '../assets/halloffame.png';
import ginasioSprite from '../assets/ginasio.png';
import laboratorioSprite from '../assets/laboratorio.png';
import centroPokemonSprite from '../assets/centropokemon.png';
import casaSprite from '../assets/casa.png';
import colecaoSprite from '../assets/coleção.png';
import gameCenterSprite from '../assets/game.png';
import professorCedro from '../assets/professor.png';
import liderDragao from '../assets/lider.png';
import nik from '../assets/nik.png';
import campeaoKael from '../assets/campeao.png';
import mia from '../assets/mia.png';
import flora from '../assets/flora.png';
import mercadoSprite from '../assets/mercado.png';

import './PokemonPage.css';
import './PokemonLab.css';
import './PokemonGym.css';
import './PokemonGameCenter.css';
import './PokemonVGC.css';

const VGC_NATURES = [
  ['HARDY', 'Hardy'],
  ['LONELY', 'Lonely'],
  ['BRAVE', 'Brave'],
  ['ADAMANT', 'Adamant'],
  ['NAUGHTY', 'Naughty'],
  ['BOLD', 'Bold'],
  ['DOCILE', 'Docile'],
  ['RELAXED', 'Relaxed'],
  ['IMPISH', 'Impish'],
  ['LAX', 'Lax'],
  ['TIMID', 'Timid'],
  ['HASTY', 'Hasty'],
  ['SERIOUS', 'Serious'],
  ['JOLLY', 'Jolly'],
  ['NAIVE', 'Naive'],
  ['MODEST', 'Modest'],
  ['MILD', 'Mild'],
  ['QUIET', 'Quiet'],
  ['BASHFUL', 'Bashful'],
  ['RASH', 'Rash'],
  ['CALM', 'Calm'],
  ['GENTLE', 'Gentle'],
  ['SASSY', 'Sassy'],
  ['CAREFUL', 'Careful'],
  ['QUIRKY', 'Quirky'],
];

const VGC_TERA_TYPES = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
];

const VGC_STAT_CONFIG = [
  { key: 'hp', label: 'HP', base: 'base_hp' },
  { key: 'attack', label: 'Atk', base: 'base_attack' },
  { key: 'defense', label: 'Def', base: 'base_defense' },
  {
    key: 'special_attack',
    label: 'SpA',
    base: 'base_special_attack',
  },
  {
    key: 'special_defense',
    label: 'SpD',
    base: 'base_special_defense',
  },
  { key: 'speed', label: 'Spe', base: 'base_speed' },
];

const VGC_NATURE_EFFECTS = {
  LONELY: ['attack', 'defense'],
  BRAVE: ['attack', 'speed'],
  ADAMANT: ['attack', 'special_attack'],
  NAUGHTY: ['attack', 'special_defense'],
  BOLD: ['defense', 'attack'],
  RELAXED: ['defense', 'speed'],
  IMPISH: ['defense', 'special_attack'],
  LAX: ['defense', 'special_defense'],
  TIMID: ['speed', 'attack'],
  HASTY: ['speed', 'defense'],
  JOLLY: ['speed', 'special_attack'],
  NAIVE: ['speed', 'special_defense'],
  MODEST: ['special_attack', 'attack'],
  MILD: ['special_attack', 'defense'],
  QUIET: ['special_attack', 'speed'],
  RASH: ['special_attack', 'special_defense'],
  CALM: ['special_defense', 'attack'],
  GENTLE: ['special_defense', 'defense'],
  SASSY: ['special_defense', 'speed'],
  CAREFUL: ['special_defense', 'special_attack'],
};

const createEmptyVgcSlot = () => ({
  pokemon: null,
  shiny: false,
  level: 50,
  nature: 'SERIOUS',
  ability: null,
  item: null,
  teraType: '',
  ivs: {
    hp: 31,
    attack: 31,
    defense: 31,
    special_attack: 31,
    special_defense: 31,
    speed: 31,
  },
  evs: {
    hp: 0,
    attack: 0,
    defense: 0,
    special_attack: 0,
    special_defense: 0,
    speed: 0,
  },
  moves: [null, null, null, null],
  legalMoveNames: [],
  legalAbilityNames: [],
  optionsLoaded: false,
});

const calculateVgcStats = (slot) => {
  if (!slot?.pokemon) {
    return null;
  }

  const level = Number(slot.level) || 50;
  const pokemon = slot.pokemon;
  const natureEffect = VGC_NATURE_EFFECTS[slot.nature] || [];
  const increased = natureEffect[0];
  const decreased = natureEffect[1];
  const result = {};

  VGC_STAT_CONFIG.forEach((stat) => {
    const base = Number(pokemon[stat.base]);
    const iv = Number(slot.ivs?.[stat.key] ?? 31);
    const ev = Number(slot.evs?.[stat.key] ?? 0);

    if (!Number.isFinite(base)) {
      result[stat.key] = null;
      return;
    }

    if (stat.key === 'hp') {
      if ((pokemon.name || '').toLowerCase() === 'shedinja') {
        result.hp = 1;
        return;
      }

      result.hp =
        Math.floor(
          ((2 * base + iv + Math.floor(ev / 4)) * level) / 100
        ) +
        level +
        10;
      return;
    }

    let value =
      Math.floor(
        ((2 * base + iv + Math.floor(ev / 4)) * level) / 100
      ) + 5;

    if (stat.key === increased) {
      value = Math.floor(value * 1.1);
    } else if (stat.key === decreased) {
      value = Math.floor(value * 0.9);
    }

    result[stat.key] = value;
  });

  return result;
};

const getVgcNatureLabel = (nature) => {
  const effect = VGC_NATURE_EFFECTS[nature];
  const name =
    VGC_NATURES.find(([value]) => value === nature)?.[1] || nature;

  if (!effect) {
    return name;
  }

  const labels = {
    attack: 'Atk',
    defense: 'Def',
    special_attack: 'SpA',
    special_defense: 'SpD',
    speed: 'Spe',
  };

  return `${name} (+${labels[effect[0]]} / -${labels[effect[1]]})`;
};

function PokemonPage() {
  const [activeSection, setActiveSection] = useState('city');
  const [activeGeneration, setActiveGeneration] = useState(1);
  const [labMode, setLabMode] = useState('pokedex');

  const [pokemonGames, setPokemonGames] = useState([]);
  const [pokemonCatalog, setPokemonCatalog] = useState([]);
  const [pokedex, setPokedex] = useState([]);

  const [myCapturedIds, setMyCapturedIds] = useState(new Set());
  const [myShinyIds, setMyShinyIds] = useState(new Set());
  const [userPokemonEntries, setUserPokemonEntries] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [trainerProfile, setTrainerProfile] = useState(null);
  const [trainerPhotoSaving, setTrainerPhotoSaving] =
    useState(false);
  const [trainerPhotoError, setTrainerPhotoError] =
    useState('');
  const [trainerProfileSaving, setTrainerProfileSaving] =
    useState(false);
  const [trainerProfileMessage, setTrainerProfileMessage] =
    useState('');
  const [trainerFavoriteSlot, setTrainerFavoriteSlot] =
    useState(null);
  const [trainerFavoriteSearch, setTrainerFavoriteSearch] =
    useState('');
  const [trainerPromptCopied, setTrainerPromptCopied] =
    useState(false);

  const [vgcTeams, setVgcTeams] = useState([]);
  const [vgcSelectedTeam, setVgcSelectedTeam] = useState(null);
  const [vgcEditorOpen, setVgcEditorOpen] = useState(false);
  const [vgcPokemonSearch, setVgcPokemonSearch] = useState('');
  const [vgcActiveSlot, setVgcActiveSlot] = useState(null);
  const [vgcBuildSlot, setVgcBuildSlot] = useState(null);
  const [vgcTeamName, setVgcTeamName] = useState('');
  const [vgcMoves, setVgcMoves] = useState([]);
  const [vgcAbilities, setVgcAbilities] = useState([]);
  const [vgcItems, setVgcItems] = useState([]);
  const [vgcLoading, setVgcLoading] = useState(false);
  const [vgcSaving, setVgcSaving] = useState(false);
  const [vgcOptionsLoading, setVgcOptionsLoading] = useState(false);
  const [vgcMessage, setVgcMessage] = useState('');
  const [vgcTeamSlots, setVgcTeamSlots] = useState(
    Array.from({ length: 6 }, createEmptyVgcSlot)
  );

  const trainerPhotoInputRef = useRef(null);

  const [showJourneyForm, setShowJourneyForm] = useState(false);
  const [journeySaving, setJourneySaving] = useState(false);
  const [journeyError, setJourneyError] = useState('');
  const [journeySuccess, setJourneySuccess] = useState('');

  const [hallEntry, setHallEntry] = useState(null);
  const [hallSaving, setHallSaving] = useState(false);
  const [hallError, setHallError] = useState('');
  const [hallSearch, setHallSearch] = useState('');
  const [hallActiveSlot, setHallActiveSlot] = useState(null);
  const [hallTeam, setHallTeam] = useState(
    Array.from({ length: 6 }, () => ({
      pokemon: null,
      shiny: false,
    }))
  );

  const [journeyForm, setJourneyForm] = useState({
    game_catalog_id: '',
    status: 'JOGANDO',
    play_time: '',
    rating: '',
    review: '',
  });

  const generationLimits = {
    1: { name: 'Kanto', start: 1, end: 151 },
    2: { name: 'Johto', start: 152, end: 251 },
    3: { name: 'Hoenn', start: 252, end: 386 },
    4: { name: 'Sinnoh', start: 387, end: 493 },
    5: { name: 'Unova', start: 494, end: 649 },
    6: { name: 'Kalos', start: 650, end: 721 },
    7: { name: 'Alola', start: 722, end: 809 },
    8: { name: 'Galar', start: 810, end: 905 },
    9: { name: 'Paldea', start: 906, end: 1025 },
  };

  const totalGenerations = Object.keys(generationLimits).map(Number);

const regionDefinitions = [
  {
    key: 'kanto',
    name: 'Kanto',
    symbol: 'K',
    games: [
      'red',
      'blue',
      'yellow',
      'firered',
      'leafgreen',
      'lets go pikachu',
      'lets go eevee',
    ],
  },
  {
    key: 'johto',
    name: 'Johto',
    symbol: 'J',
    games: [
      'gold',
      'silver',
      'crystal',
      'heartgold',
      'soulsilver',
    ],
  },
  {
    key: 'hoenn',
    name: 'Hoenn',
    symbol: 'H',
    games: [
      'ruby',
      'sapphire',
      'emerald',
      'omega ruby',
      'alpha sapphire',
    ],
  },
  {
    key: 'sinnoh',
    name: 'Sinnoh',
    symbol: 'S',
    games: [
      'diamond',
      'pearl',
      'platinum',
      'brilliant diamond',
      'shining pearl',
    ],
  },
  {
    key: 'unova',
    name: 'Unova',
    symbol: 'U',
    games: [
      'black',
      'white',
      'black 2',
      'white 2',
    ],
  },
  {
    key: 'kalos',
    name: 'Kalos',
    symbol: 'X',
    games: [
      'pokemon x',
      'pokemon y',
    ],
  },
  {
    key: 'alola',
    name: 'Alola',
    symbol: 'A',
    games: [
      'sun',
      'moon',
      'ultra sun',
      'ultra moon',
    ],
  },
  {
    key: 'galar',
    name: 'Galar',
    symbol: 'G',
    games: [
      'sword',
      'shield',
    ],
  },
  {
    key: 'paldea',
    name: 'Paldea',
    symbol: 'P',
    games: [
      'scarlet',
      'violet',
    ],
  },
];

const normalizeGameTitle = (title = '') => {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/pokémon/g, 'pokemon')
    .replace(/version/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const getRegionForGame = (title) => {
  const normalized =
    normalizeGameTitle(title);

  for (const region of regionDefinitions) {
    const match =
      region.games.some((gameName) => {
        const normalizedGameName =
          normalizeGameTitle(gameName);

        return normalized.includes(
          normalizedGameName
        );
      });

    if (match) {
      return region.key;
    }
  }

  return null;
};

  const getImageUrl = (img) => {
    if (!img) {
      return 'https://via.placeholder.com/300x200?text=Sem+Imagem';
    }

    if (img.startsWith('http')) {
      return img;
    }

    return `http://127.0.0.1:8000/${img}`;
  };

  const isPokemonGame = (game) => {
    const title = game?.title || '';
    const normalizedTitle = title.toLowerCase();

    return (
      normalizedTitle.includes('pokemon') ||
      normalizedTitle.includes('pokémon')
    );
  };

  const filterPokemonLibrary = (data) => {
    return data.filter((entry) => {
      const game =
        entry.game_catalog ||
        entry.game;

      return isPokemonGame(game);
    });
  };

  const filterPokemonCatalog = (data) => {
    return data.filter((game) => {
      return isPokemonGame(game);
    });
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

const username =
  localStorage.getItem('username');

        const [
          gamesRes,
          catalogRes,
          dexRes,
          userRes,
          profileRes,
        ] = await Promise.all([
          api.get('library/'),
          api.get('catalog/'),
          api.get('pokedex/'),
          api.get('user-pokemon/'),

          username
            ? api.get(
                `profiles/${username}/`
              )
            : Promise.resolve({
                data: null,
              }),
        ]);

        const gamesData =
          gamesRes.data.results ||
          gamesRes.data;

        const catalogData =
          catalogRes.data.results ||
          catalogRes.data;

        const dexData =
          dexRes.data.results ||
          dexRes.data;

        const userData =
          userRes.data.results ||
          userRes.data;

        setPokemonGames(
          filterPokemonLibrary(gamesData)
        );

        setPokemonCatalog(
          filterPokemonCatalog(catalogData)
        );

        setPokedex(dexData);

        setTrainerProfile(
          profileRes.data
        );

        const captured = new Set();
        const shiny = new Set();

        userData.forEach((u) => {
          const id =
            u.pokemon?.pokedex_id ||
            u.pokemon;

          if (u.is_shiny) {
            shiny.add(id);
          } else {
            captured.add(id);
          }
        });

        setMyCapturedIds(captured);
        setMyShinyIds(shiny);
        setUserPokemonEntries(userData);
      } catch (error) {
        console.error(
          'Erro ao carregar dados Pokémon:',
          error
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const refreshPokemonGames = async () => {
    const response = await api.get('library/');

    const data =
      response.data.results ||
      response.data;

    setPokemonGames(
      filterPokemonLibrary(data)
    );
  };

  const toggleCapture = async (id, isShinyMode) => {
    const pokemonId = Number(id);

    const getEntryPokemonId = (entry) => {
      return Number(
        entry?.pokemon?.pokedex_id ??
        entry?.pokemon
      );
    };

    const updateCaughtSet = (shouldAdd) => {
      const setter = isShinyMode
        ? setMyShinyIds
        : setMyCapturedIds;

      setter((prev) => {
        const next = new Set(prev);

        if (shouldAdd) {
          next.add(pokemonId);
        } else {
          next.delete(pokemonId);
        }

        return next;
      });
    };

    const targetSet = isShinyMode
      ? myShinyIds
      : myCapturedIds;

    try {
      if (targetSet.has(pokemonId)) {
        let currentEntries = userPokemonEntries;

        let existingEntry = currentEntries.find(
          (entry) =>
            getEntryPokemonId(entry) === pokemonId &&
            Boolean(entry.is_shiny) === Boolean(isShinyMode)
        );

        if (!existingEntry) {
          const response = await api.get('user-pokemon/');

          currentEntries =
            response.data.results ||
            response.data;

          setUserPokemonEntries(currentEntries);

          existingEntry = currentEntries.find(
            (entry) =>
              getEntryPokemonId(entry) === pokemonId &&
              Boolean(entry.is_shiny) === Boolean(isShinyMode)
          );
        }

        if (!existingEntry?.id) {
          throw new Error(
            'Registro do Pokémon não encontrado.'
          );
        }

        await api.delete(
          `user-pokemon/${existingEntry.id}/`
        );

        setUserPokemonEntries((prev) =>
          prev.filter(
            (entry) =>
              entry.id !== existingEntry.id
          )
        );

        updateCaughtSet(false);
        return;
      }

      const response = await api.post(
        'user-pokemon/',
        {
          pokemon_id: pokemonId,
          is_shiny: isShinyMode,
        }
      );

      setUserPokemonEntries((prev) => [
        ...prev,
        response.data,
      ]);

      updateCaughtSet(true);
    } catch (error) {
      console.error(
        'Erro ao atualizar Pokémon na Dex:',
        error
      );
    }
  };

  const currentGenInfo =
    generationLimits[activeGeneration];

  const filteredDex = useMemo(() => {
    return pokedex.filter((pokemon) => {
      const name = pokemon.name || '';
      const id = pokemon.pokedex_id;

      const matchesSearch =
        name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        String(id).includes(searchTerm);

      const matchesGeneration =
        id >= currentGenInfo.start &&
        id <= currentGenInfo.end;

      return (
        matchesSearch &&
        matchesGeneration
      );
    });
  }, [
    pokedex,
    searchTerm,
    currentGenInfo.start,
    currentGenInfo.end,
  ]);

  const registeredPokemonGameIds = useMemo(() => {
    return new Set(
      pokemonGames
        .map((entry) => {
          const game =
            entry.game_catalog ||
            entry.game;

          return Number(game?.id);
        })
        .filter(Boolean)
    );
  }, [pokemonGames]);

  const availablePokemonGames = useMemo(() => {
    return pokemonCatalog
      .filter((game) => {
        return !registeredPokemonGameIds.has(
          Number(game.id)
        );
      })
      .sort((a, b) => {
        return (a.title || '').localeCompare(
          b.title || '',
          'pt-BR',
          {
            numeric: true,
          }
        );
      });
  }, [
    pokemonCatalog,
    registeredPokemonGameIds,
  ]);

  const capturedCount = myCapturedIds.size;
  const shinyCount = myShinyIds.size;

  const registeredSpeciesCount = useMemo(() => {
    return new Set([
      ...myCapturedIds,
      ...myShinyIds,
    ]).size;
  }, [
    myCapturedIds,
    myShinyIds,
  ]);

  const gymRegionAchievements = useMemo(() => {
    return totalGenerations.map((generation) => {
      const info = generationLimits[generation];
      const total = info.end - info.start + 1;

      const captured = pokedex.filter((pokemon) => {
        const id = Number(pokemon.pokedex_id);
        return (
          id >= info.start &&
          id <= info.end &&
          myCapturedIds.has(id)
        );
      }).length;

      const shiny = pokedex.filter((pokemon) => {
        const id = Number(pokemon.pokedex_id);
        return (
          id >= info.start &&
          id <= info.end &&
          myShinyIds.has(id)
        );
      }).length;

      return {
        generation,
        name: info.name,
        total,
        captured,
        shiny,
        pokedexComplete: captured === total && total > 0,
        shinyComplete: shiny === total && total > 0,
      };
    });
  }, [
    pokedex,
    myCapturedIds,
    myShinyIds,
  ]);

  const gymGeneralAchievements = useMemo(() => {
    const totalPokemon = pokedex.length || 1025;
    const allRegionalDexComplete =
      gymRegionAchievements.length > 0 &&
      gymRegionAchievements.every(
        (achievement) => achievement.pokedexComplete
      );
    const allRegionalShinyComplete =
      gymRegionAchievements.length > 0 &&
      gymRegionAchievements.every(
        (achievement) => achievement.shinyComplete
      );

    return [
      {
        key: 'first-register',
        title: 'Primeiro Registro',
        description: 'Registre seu primeiro Pokémon na Pokédex.',
        current: registeredSpeciesCount,
        target: 1,
        unlocked: registeredSpeciesCount >= 1,
      },
      {
        key: 'hundred-registers',
        title: 'Pesquisador Dedicado',
        description: 'Registre 100 espécies diferentes.',
        current: registeredSpeciesCount,
        target: 100,
        unlocked: registeredSpeciesCount >= 100,
      },
      {
        key: 'five-hundred-registers',
        title: 'Mestre da Pesquisa',
        description: 'Registre 500 espécies diferentes.',
        current: registeredSpeciesCount,
        target: 500,
        unlocked: registeredSpeciesCount >= 500,
      },
      {
        key: 'national-dex',
        title: 'Pokédex Nacional',
        description: 'Registre todas as espécies disponíveis.',
        current: registeredSpeciesCount,
        target: totalPokemon,
        unlocked:
          totalPokemon > 0 &&
          registeredSpeciesCount >= totalPokemon,
      },
      {
        key: 'first-shiny',
        title: 'Brilho Raro',
        description: 'Registre seu primeiro Pokémon shiny.',
        current: shinyCount,
        target: 1,
        unlocked: shinyCount >= 1,
      },
      {
        key: 'ten-shiny',
        title: 'Caçador de Shinies',
        description: 'Registre 10 Pokémon shiny.',
        current: shinyCount,
        target: 10,
        unlocked: shinyCount >= 10,
      },
      {
        key: 'hundred-shiny',
        title: 'Especialista Shiny',
        description: 'Registre 100 Pokémon shiny.',
        current: shinyCount,
        target: 100,
        unlocked: shinyCount >= 100,
      },
      {
        key: 'regional-master',
        title: 'Mestre das Regiões',
        description: 'Complete a Pokédex de todas as regiões.',
        current: gymRegionAchievements.filter(
          (achievement) => achievement.pokedexComplete
        ).length,
        target: gymRegionAchievements.length,
        unlocked: allRegionalDexComplete,
      },
      {
        key: 'shiny-master',
        title: 'Lenda Shiny',
        description: 'Complete a Shiny Dex de todas as regiões.',
        current: gymRegionAchievements.filter(
          (achievement) => achievement.shinyComplete
        ).length,
        target: gymRegionAchievements.length,
        unlocked: allRegionalShinyComplete,
      },
    ];
  }, [
    pokedex.length,
    registeredSpeciesCount,
    shinyCount,
    gymRegionAchievements,
  ]);

  const completedGames = pokemonGames.filter((entry) => {
    const game =
      entry.game_catalog ||
      entry.game;

    return (
      game?.hall_of_fame_entry ||
      entry?.hall_of_fame_entry ||
      entry?.hall_of_fame
    );
  }).length;

const completedRegions = useMemo(() => {
  const regions = new Set();

  pokemonGames.forEach((entry) => {
    if (
      ![
        'ZEREI',
        'PLATINEI',
      ].includes(entry.status)
    ) {
      return;
    }

    const game =
      entry.game_catalog ||
      entry.game;

    const regionKey =
      getRegionForGame(
        game?.title || ''
      );

    if (regionKey) {
      regions.add(regionKey);
    }
  });

  return regions;
}, [pokemonGames]);


const startedRegions = useMemo(() => {
  const regions = new Set();

  pokemonGames.forEach((entry) => {
    if (
      ![
        'JOGANDO',
        'JOGUEI',
        'PAUSADO',
        'ZEREI',
        'PLATINEI',
      ].includes(entry.status)
    ) {
      return;
    }

    const game =
      entry.game_catalog ||
      entry.game;

    const regionKey =
      getRegionForGame(
        game?.title || ''
      );

    if (regionKey) {
      regions.add(regionKey);
    }
  });

  return regions;
}, [pokemonGames]);

const startedOnlyRegions = useMemo(() => {
  return new Set(
    [...startedRegions].filter(
      (regionKey) =>
        !completedRegions.has(regionKey)
    )
  );
}, [
  startedRegions,
  completedRegions,
]);

const trainerFavoritePokemon = useMemo(() => {
  if (!trainerProfile) {
    return Array(6).fill(null);
  }

  return Array.from(
    { length: 6 },
    (_, index) => {
      const field =
        `pokemon_favorite_${index + 1}`;

      const rawValue =
        trainerProfile[field];

      if (!rawValue) {
        return null;
      }

      const pokemonId =
        typeof rawValue === 'object'
          ? rawValue.pokedex_id
          : rawValue;

      return (
        pokedex.find(
          (pokemon) =>
            Number(pokemon.pokedex_id) ===
            Number(pokemonId)
        ) || null
      );
    }
  );
}, [
  trainerProfile,
  pokedex,
]);

const filteredTrainerFavoritePokemon = useMemo(() => {
  const term =
    trainerFavoriteSearch
      .trim()
      .toLowerCase();

  if (!term) {
    return pokedex.slice(0, 50);
  }

  return pokedex
    .filter((pokemon) => {
      return (
        (pokemon.name || '')
          .toLowerCase()
          .includes(term) ||
        String(
          pokemon.pokedex_id
        ).includes(term)
      );
    })
    .slice(0, 50);
}, [
  pokedex,
  trainerFavoriteSearch,
]);

const trainerImagePrompt = `Transforme a pessoa da foto de referência em um treinador de criaturas em pixel art 32-bit, preservando suas principais características reconhecíveis, como cabelo, formato do rosto, tom de pele, barba, óculos e outros traços visuais presentes na referência.

Mostre o personagem sozinho, do peito ou da cintura para cima, olhando levemente para a câmera, como um retrato oficial de identificação de treinador.

Use pixel art nítida e detalhada, pixels bem definidos, contornos claros e estética de RPG portátil clássico da era 32-bit. A roupa deve ter design original de treinador aventureiro, sem copiar personagens existentes.

Mantenha o personagem centralizado e com espaço ao redor para funcionar bem dentro de um retrato vertical.

Fundo transparente.

Não inclua texto, moldura, card, interface, estatísticas, emblemas, criaturas, cenário ou objetos ao redor. Gere somente o treinador isolado.

A imagem será utilizada como foto em um Trainer Card de um site, portanto o enquadramento deve funcionar bem com object-fit: cover.

Evite aparência 3D moderna, pintura digital suave e realismo fotográfico. O resultado deve parecer um portrait de personagem de um RPG portátil clássico, com design totalmente original.`;

const handleTrainerPhotoSelect =
  async (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const username =
      trainerProfile?.username ||
      localStorage.getItem(
        'username'
      );

    if (!username) {
      setTrainerPhotoError(
        'Não foi possível identificar o treinador logado.'
      );

      return;
    }

    try {
      setTrainerPhotoSaving(true);
      setTrainerPhotoError('');

      const formData =
        new FormData();

      formData.append(
        'pokemon_trainer_photo',
        file
      );

      const response =
        await api.patch(
          `profiles/${username}/`,
          formData
        );

      setTrainerProfile(
        response.data
      );
    } catch (error) {
      console.error(
        'Erro ao atualizar foto do Trainer Card:',
        error
      );

      setTrainerPhotoError(
        'Não foi possível atualizar a foto do Trainer Card.'
      );
    } finally {
      setTrainerPhotoSaving(false);

      if (
        trainerPhotoInputRef.current
      ) {
        trainerPhotoInputRef.current.value =
          '';
      }
    }
  };

const handlePrintTrainerCard = () => {
  window.print();
};

const updateTrainerProfile = async (payload) => {
  const username =
    trainerProfile?.username ||
    localStorage.getItem('username');

  if (!username) {
    setTrainerProfileMessage(
      'Não foi possível identificar o treinador logado.'
    );
    return false;
  }

  try {
    setTrainerProfileSaving(true);
    setTrainerProfileMessage('');

    const response =
      await api.patch(
        `profiles/${username}/`,
        payload
      );

    setTrainerProfile(
      response.data
    );

    setTrainerProfileMessage(
      'Trainer Card atualizado!'
    );

    return true;
  } catch (error) {
    console.error(
      'Erro ao atualizar Trainer Card:',
      error
    );

    setTrainerProfileMessage(
      'Não foi possível salvar as alterações.'
    );

    return false;
  } finally {
    setTrainerProfileSaving(false);
  }
};

const handleTrainerFieldChange = async (
  field,
  value
) => {
  await updateTrainerProfile({
    [field]: value || null,
  });
};

const selectTrainerFavoritePokemon = async (
  pokemon
) => {
  if (trainerFavoriteSlot === null) {
    return;
  }

  const field =
    `pokemon_favorite_${trainerFavoriteSlot + 1}`;

  const saved =
    await updateTrainerProfile({
      [field]: pokemon.pokedex_id,
    });

  if (saved) {
    setTrainerFavoriteSlot(null);
    setTrainerFavoriteSearch('');
  }
};

const removeTrainerFavoritePokemon = async (
  index
) => {
  const field =
    `pokemon_favorite_${index + 1}`;

  await updateTrainerProfile({
    [field]: null,
  });
};

const handleCopyTrainerPrompt = async () => {
  try {
    await navigator.clipboard.writeText(
      trainerImagePrompt
    );

    setTrainerPromptCopied(true);

    setTimeout(() => {
      setTrainerPromptCopied(false);
    }, 1800);
  } catch (error) {
    console.error(
      'Erro ao copiar prompt:',
      error
    );

    setTrainerProfileMessage(
      'Não foi possível copiar o prompt automaticamente.'
    );
  }
};

  const openSection = (section) => {
    setActiveSection(section);
    setSearchTerm('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const openLab = (mode = 'pokedex') => {
    setLabMode(mode);
    setActiveSection('lab');
    setSearchTerm('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const resetJourneyForm = () => {
    setJourneyForm({
      game_catalog_id: '',
      status: 'JOGANDO',
      play_time: '',
      rating: '',
      review: '',
    });

    setJourneyError('');
    setJourneySuccess('');
  };

  const openJourneyForm = () => {
    resetJourneyForm();
    setShowJourneyForm(true);
  };

  const closeJourneyForm = () => {
    resetJourneyForm();
    setShowJourneyForm(false);
  };

  const handleJourneyChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setJourneyForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleJourneySubmit = async (event) => {
    event.preventDefault();

    if (!journeyForm.game_catalog_id) {
      setJourneyError(
        'Escolha um jogo Pokémon.'
      );

      return;
    }

    if (journeyForm.rating !== '') {
      const rating = Number(
        journeyForm.rating
      );

      if (
        Number.isNaN(rating) ||
        rating < 0 ||
        rating > 10
      ) {
        setJourneyError(
          'A nota deve estar entre 0 e 10.'
        );

        return;
      }

      if (
        rating * 2 !==
        Math.round(rating * 2)
      ) {
        setJourneyError(
          'A nota deve variar de 0,5 em 0,5.'
        );

        return;
      }
    }

    try {
      setJourneySaving(true);
      setJourneyError('');
      setJourneySuccess('');

      const payload = {
        game_catalog_id:
          Number(
            journeyForm.game_catalog_id
          ),

        status:
          journeyForm.status,
      };

      if (
        journeyForm.play_time.trim()
      ) {
        payload.play_time =
          journeyForm.play_time.trim();
      }

      if (
        journeyForm.review.trim()
      ) {
        payload.review =
          journeyForm.review.trim();
      }

      if (
        journeyForm.rating !== ''
      ) {
        payload.rating =
          Number(
            journeyForm.rating
          );
      }

      await api.post(
        'library/',
        payload
      );

      await refreshPokemonGames();

      setJourneySuccess(
        'Jornada registrada com sucesso!'
      );

      setJourneyForm({
        game_catalog_id: '',
        status: 'JOGANDO',
        play_time: '',
        rating: '',
        review: '',
      });

      setTimeout(() => {
        setShowJourneyForm(false);
        setJourneySuccess('');
      }, 800);
    } catch (error) {
      console.error(
        'Erro ao registrar jornada:',
        error
      );

      const data =
        error?.response?.data;

      if (data) {
        const firstValue =
          Object.values(data)[0];

        if (
          Array.isArray(firstValue) &&
          firstValue.length > 0
        ) {
          setJourneyError(
            String(firstValue[0])
          );
        } else if (
          typeof firstValue ===
          'string'
        ) {
          setJourneyError(
            firstValue
          );
        } else {
          setJourneyError(
            'Não foi possível registrar a jornada.'
          );
        }
      } else {
        setJourneyError(
          'Não foi possível registrar a jornada.'
        );
      }
    } finally {
      setJourneySaving(false);
    }
  };

  const resetHallForm = () => {
    setHallEntry(null);
    setHallError('');
    setHallSearch('');
    setHallActiveSlot(null);
    setHallTeam(
      Array.from({ length: 6 }, () => ({
        pokemon: null,
        shiny: false,
      }))
    );
  };

  const openHallForm = (entry) => {
    resetHallForm();
    setHallEntry(entry);
  };

  const closeHallForm = () => {
    resetHallForm();
  };

  const selectHallPokemon = (pokemon) => {
    if (hallActiveSlot === null) {
      return;
    }

    setHallTeam((prev) => {
      const next = [...prev];

      next[hallActiveSlot] = {
        ...next[hallActiveSlot],
        pokemon,
      };

      return next;
    });

    setHallSearch('');
    setHallActiveSlot(null);
  };

  const removeHallPokemon = (index) => {
    setHallTeam((prev) => {
      const next = [...prev];

      next[index] = {
        pokemon: null,
        shiny: false,
      };

      return next;
    });
  };

  const toggleHallShiny = (index) => {
    setHallTeam((prev) => {
      const next = [...prev];

      if (!next[index].pokemon) {
        return prev;
      }

      next[index] = {
        ...next[index],
        shiny: !next[index].shiny,
      };

      return next;
    });
  };

  const filteredHallPokemon = useMemo(() => {
    const term = hallSearch.trim().toLowerCase();

    if (!term) {
      return pokedex.slice(0, 40);
    }

    return pokedex
      .filter((pokemon) => {
        return (
          (pokemon.name || '')
            .toLowerCase()
            .includes(term) ||
          String(pokemon.pokedex_id).includes(term)
        );
      })
      .slice(0, 40);
  }, [pokedex, hallSearch]);

  const handleHallSubmit = async (event) => {
    event.preventDefault();

    if (!hallEntry) {
      return;
    }

    const selected = hallTeam.filter(
      (slot) => slot.pokemon
    );

    if (selected.length === 0) {
      setHallError(
        'Escolha pelo menos um Pokémon para o Hall da Fama.'
      );

      return;
    }

    const game =
      hallEntry.game_catalog ||
      hallEntry.game;

    try {
      setHallSaving(true);
      setHallError('');

      const payload = {
        game_name:
          game?.title ||
          'Jornada Pokémon',
      };

      hallTeam.forEach((slot, index) => {
        const number = index + 1;

        if (slot.pokemon) {
          payload[`pokemon_${number}_id`] =
            slot.pokemon.pokedex_id;

          payload[`pokemon_${number}_shiny`] =
            slot.shiny;
        }
      });

      const hallResponse = await api.post(
        'hall-of-fame/',
        payload
      );

      await api.patch(
        `library/${hallEntry.id}/`,
        {
          hall_of_fame: hallResponse.data.id,
        }
      );

      await refreshPokemonGames();
      resetHallForm();
    } catch (error) {
      console.error(
        'Erro ao registrar Hall da Fama:',
        error
      );

      const data = error?.response?.data;

      if (data) {
        const firstValue = Object.values(data)[0];

        if (
          Array.isArray(firstValue) &&
          firstValue.length > 0
        ) {
          setHallError(String(firstValue[0]));
        } else if (
          typeof firstValue === 'string'
        ) {
          setHallError(firstValue);
        } else {
          setHallError(
            'Não foi possível registrar o Hall da Fama.'
          );
        }
      } else {
        setHallError(
          'Não foi possível registrar o Hall da Fama.'
        );
      }
    } finally {
      setHallSaving(false);
    }
  };

  const getJourneyStatusLabel = (entry) => {
    if (entry.status_display) {
      return entry.status_display;
    }

    const labels = {
      JOGANDO: 'Jogando',
      ZEREI: 'Zerei',
      JOGUEI: 'Joguei',
      PAUSADO: 'Pausado',
      QUERO: 'Quero Jogar',
      PLATINEI: 'Platinei',
    };

    return (
      labels[entry.status] ||
      entry.status ||
      'Jornada'
    );
  };

  const getJourneyStatusClass = (status) => {
    return (
      status
        ?.toLowerCase()
        .replaceAll('_', '-') ||
      'jornada'
    );
  };

  const renderCity = () => {
    return (
      <main className="pokemon-city-section">
        <section className="pokemon-world-section">
          <div className="pokemon-world">
            <img
              src={cidadePokemon}
              alt="Cidade Pokémon"
              className="pokemon-world-map"
              draggable="false"
            />

            <img
              src={hallOfFameSprite}
              alt=""
              className="map-building-sprite halloffame-building-sprite"
              draggable="false"
            />

            <img
              src={ginasioSprite}
              alt=""
              className="map-building-sprite ginasio-building-sprite"
              draggable="false"
            />

            <img
              src={laboratorioSprite}
              alt=""
              className="map-building-sprite laboratorio-building-sprite"
              draggable="false"
            />

            <img
              src={centroPokemonSprite}
              alt=""
              className="map-building-sprite centropokemon-building-sprite"
              draggable="false"
            />

            <img
              src={casaSprite}
              alt=""
              className="map-building-sprite casa-building-sprite"
              draggable="false"
            />

            <img
              src={gameCenterSprite}
              alt=""
              className="map-building-sprite gamecenter-building-sprite"
              draggable="false"
            />

            <img
              src={colecaoSprite}
              alt=""
              className="map-building-sprite centrocolecao-building-sprite"
              draggable="false"
            />

            <img
              src={mercadoSprite}
              alt=""
              className="map-building-sprite mercado-building-sprite"
              draggable="false"
            />

            <div className="pokemon-world-hud">
              <div className="world-hud-title">
                <Map size={18} />
                <span>
                  MINHA JORNADA
                </span>
              </div>

              <div className="world-hud-stats">
                <div>
                  <strong>
                    {capturedCount}
                  </strong>
                  <span>
                    Pokédex
                  </span>
                </div>

                <div>
                  <strong>
                    {shinyCount}
                  </strong>
                  <span>
                    Shinies
                  </span>
                </div>

                <div>
                  <strong>
                    {completedGames}
                  </strong>
                  <span>
                    Hall da Fama
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="map-hotspot hotspot-lab"
              onClick={() =>
                openLab('pokedex')
              }
              aria-label="Entrar no Laboratório"
            >
              <span>
                Laboratório
              </span>
            </button>

            <button
              type="button"
              className="map-hotspot hotspot-gym"
              onClick={() =>
                openSection('gym')
              }
              aria-label="Entrar no Ginásio"
            >
              <span>
                Ginásio
              </span>
            </button>

            <button
              type="button"
              className="map-hotspot hotspot-game-center"
              onClick={() =>
                openSection('games')
              }
              aria-label="Entrar no Game Center"
            >
              <span>
                Game Center
              </span>
            </button>

            <button
              type="button"
              className="map-hotspot hotspot-trainer-house"
              onClick={() =>
                openSection('trainer')
              }
              aria-label="Entrar na Casa do Treinador"
            >
              <span>
                Casa do Treinador
              </span>
            </button>

            <button
              type="button"
              className="map-hotspot hotspot-pokemon-center"
              onClick={() =>
                openSection(
                  'pokemon-center'
                )
              }
              aria-label="Entrar no Centro Pokémon"
            >
              <span>
                Centro Pokémon
              </span>
            </button>

            <button
              type="button"
              className="map-hotspot hotspot-pc"
              onClick={() =>
                openSection('favorites')
              }
              aria-label="Entrar no Centro VGC"
            >
              <span>
                Centro VGC
              </span>
            </button>

            <button
              type="button"
              className="map-hotspot hotspot-market"
              onClick={() =>
                openSection('tcg')
              }
              aria-label="Entrar na Central TCG"
            >
              <span>
                Central TCG
              </span>
            </button>

            <Link
              to="/pokemon/hall-of-fame"
              className="map-hotspot hotspot-hall-of-fame"
              aria-label="Entrar no Hall da Fama"
            >
              <span>
                Hall da Fama
              </span>
            </Link>

            <div className="trainer-map-character">
              <div className="trainer-map-sprite">
                <UserRound size={25} />
              </div>

              <span>
                Você
              </span>
            </div>
          </div>
        </section>

        <section className="pokemon-map-help">
          <div>
            <span className="pixel-label">
              MAPA
            </span>

            <h1>
              Explore sua cidade
            </h1>

            <p>
              Clique em um dos locais da cidade para acessar
              sua jornada Pokémon.
            </p>
          </div>

          <div className="trainer-summary">
            <div>
              <strong>
                {capturedCount}
              </strong>
              <span>
                Pokémon
              </span>
            </div>

            <div>
              <strong>
                {shinyCount}
              </strong>
              <span>
                Shinies
              </span>
            </div>

            <div>
              <strong>
                {completedGames}
              </strong>
              <span>
                Hall of Fame
              </span>
            </div>
          </div>
        </section>

        <section className="quick-access">
          <div className="section-title">
            <span>
              ACESSO RÁPIDO
            </span>

            <h2>
              Onde deseja ir?
            </h2>

            <p>
              Você também pode navegar sem usar o mapa.
            </p>
          </div>

          <div className="quick-grid">
            <button
              type="button"
              onClick={() =>
                openSection('trainer')
              }
            >
              <Home size={22} />
              Trainer Card
            </button>

            <button
              type="button"
              onClick={() =>
                openLab('pokedex')
              }
            >
              <BookOpen size={22} />
              Pokédex
            </button>

            <button
              type="button"
              onClick={() =>
                openLab('shiny')
              }
            >
              <Sparkles size={22} />
              Shiny Dex
            </button>

            <button
              type="button"
              onClick={() =>
                openSection('games')
              }
            >
              <Gamepad2 size={22} />
              Jogos
            </button>

            <button
              type="button"
              onClick={() =>
                openSection('gym')
              }
            >
              <Award size={22} />
              Ginásio
            </button>

            <button
              type="button"
              onClick={() =>
                openSection('favorites')
              }
            >
              <Swords size={22} />
              Centro VGC
            </button>

            <button
              type="button"
              onClick={() =>
                openSection('tcg')
              }
            >
              <Star size={22} />
              Central TCG
            </button>

            <Link to="/pokemon/hall-of-fame">
              <Trophy size={22} />
              Hall da Fama
            </Link>
          </div>
        </section>
      </main>
    );
  };

  const renderBackButton = () => {
    return (
      <button
        type="button"
        className="pokemon-back-button"
        onClick={() =>
          openSection('city')
        }
      >
        ← Voltar para a cidade
      </button>
    );
  };

    const renderTrainer = () => {
      const trainerName =
        trainerProfile?.username ||
        localStorage.getItem(
          'username'
        ) ||
        'Treinador';

      const trainerPhoto =
        trainerProfile
          ?.pokemon_trainer_photo;

      const trainerPhotoPosition =
        trainerProfile
          ?.pokemon_trainer_photo_position ||
        '50% 50%';

      const favoriteMechanic =
        trainerProfile
          ?.pokemon_favorite_mechanic ||
        '';

      const tcgLeagueId =
        trainerProfile
          ?.pokemon_tcg_league_id ||
        '';

      const mechanicLabels = {
        MEGA_EVOLUTION: 'Mega Evolução',
        Z_MOVE: 'Z-Move',
        DYNAMAX_GIGANTAMAX:
          'Dynamax / Gigantamax',
        TERASTAL: 'Terastal',
      };

      const conqueredRegionList =
        regionDefinitions.filter(
          (region) =>
            completedRegions.has(
              region.key
            )
        );

      const startedRegionList =
        regionDefinitions.filter(
          (region) =>
            startedOnlyRegions.has(
              region.key
            )
        );

      return (
        <main className="pokemon-content-section trainer-print-page">
          <div className="trainer-screen-only">
            {renderBackButton()}
          </div>

          <section className="trainer-page">
            <div className="section-title trainer-screen-only">
              <span>CASA DO TREINADOR</span>
              <h1>Trainer Card</h1>
              <p>
                Monte sua identidade de treinador,
                escolha seus favoritos e imprima seu card.
              </p>
            </div>

            <div className="trainer-card-print-area">
              <div className="trainer-card-preview">
                <div className="trainer-card-photo-column">
                  <div className="trainer-card-photo">
                    {trainerPhoto ? (
                      <img
                        src={getImageUrl(trainerPhoto)}
                        alt={`Foto de ${trainerName}`}
                        style={{
                          objectPosition:
                            trainerPhotoPosition,
                        }}
                      />
                    ) : (
                      <div className="trainer-card-photo-placeholder">
                        <UserRound size={90} />
                        <span>Foto do treinador</span>
                      </div>
                    )}
                  </div>

                  <div className="trainer-card-photo-actions trainer-screen-only">
                    <input
                      ref={trainerPhotoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleTrainerPhotoSelect}
                      className="trainer-card-file-input"
                    />

                    <button
                      type="button"
                      className="trainer-card-photo-button"
                      onClick={() =>
                        trainerPhotoInputRef.current?.click()
                      }
                      disabled={trainerPhotoSaving}
                    >
                      <Camera size={18} />
                      {trainerPhotoSaving
                        ? 'Salvando...'
                        : trainerPhoto
                          ? 'Alterar foto'
                          : 'Adicionar foto'}
                    </button>
                  </div>
                </div>

                <div className="trainer-card-data">
                  <div className="trainer-card-heading">
                    <span className="trainer-card-label">
                      TRAINER CARD
                    </span>
                  </div>

                  <div className="trainer-card-identity-row">
                    <div className="trainer-card-name-block">
                      <h2>{trainerName}</h2>
                      <p>TREINADOR POKÉMON</p>
                    </div>

                    <div className="trainer-card-main-info">
                      <div className="trainer-card-pokedex-progress">
                        <span>POKÉDEX</span>
                        <strong>
                          {registeredSpeciesCount}
                          {' / '}
                          {pokedex.length || 1025}
                        </strong>
                        <small>
                          Espécies capturadas
                        </small>
                      </div>

                      <div className="trainer-card-info-block">
                        <span>ID DA LIGA TCG</span>
                        <strong>
                          {tcgLeagueId ||
                            'Não informado'}
                        </strong>
                      </div>

                      <div className="trainer-card-info-block">
                        <span>MECÂNICA FAVORITA</span>
                        <strong>
                          {mechanicLabels[
                            favoriteMechanic
                          ] || 'Não informada'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {(conqueredRegionList.length > 0 ||
                    startedRegionList.length > 0) && (
                    <div className="trainer-region-section">
                      {conqueredRegionList.length > 0 && (
                        <div className="trainer-region-group">
                          <div className="trainer-region-heading">
                            <span>
                              REGIÕES CONQUISTADAS
                            </span>
                          </div>

                          <div className="trainer-region-grid">
                            {conqueredRegionList.map(
                              (region) => (
                                <div
                                  key={region.key}
                                  className={[
                                    'trainer-region-seal',
                                    'is-complete',
                                    `trainer-region-${region.key}`,
                                  ].join(' ')}
                                  title={`${region.name} conquistada`}
                                >
                                  <div className="trainer-region-symbol">
                                    {region.symbol}
                                  </div>
                                  <span>
                                    {region.name}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {startedRegionList.length > 0 && (
                        <div className="trainer-region-group trainer-region-group-started">
                          <div className="trainer-region-heading">
                            <span>
                              REGIÕES INICIADAS
                            </span>
                          </div>

                          <div className="trainer-region-grid">
                            {startedRegionList.map(
                              (region) => (
                                <div
                                  key={region.key}
                                  className={[
                                    'trainer-region-seal',
                                    'is-started',
                                    `trainer-region-${region.key}`,
                                  ].join(' ')}
                                  title={`${region.name} iniciada`}
                                >
                                  <div className="trainer-region-symbol">
                                    {region.symbol}
                                  </div>
                                  <span>
                                    {region.name}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="trainer-favorites-section">
                    <div className="trainer-favorites-heading">
                      <span>6 POKÉMON FAVORITOS</span>
                    </div>

                    <div className="trainer-favorites-grid">
                      {trainerFavoritePokemon.map(
                        (pokemon, index) => (
                          <div
                            className="trainer-favorite-slot"
                            key={index}
                          >
                            {pokemon ? (
                              <>
                                <button
                                  type="button"
                                  className="trainer-favorite-pokemon trainer-screen-only"
                                  onClick={() => {
                                    setTrainerFavoriteSlot(index);
                                    setTrainerFavoriteSearch('');
                                  }}
                                >
                                  <img
                                    src={pokemon.sprite_url}
                                    alt={pokemon.name}
                                  />
                                  <span>
                                    {pokemon.name}
                                  </span>
                                </button>

                                <div className="trainer-favorite-print">
                                  <img
                                    src={pokemon.sprite_url}
                                    alt={pokemon.name}
                                  />
                                  <span>
                                    {pokemon.name}
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  className="trainer-favorite-remove trainer-screen-only"
                                  onClick={() =>
                                    removeTrainerFavoritePokemon(
                                      index
                                    )
                                  }
                                  aria-label={`Remover ${pokemon.name}`}
                                >
                                  <X size={14} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className="trainer-favorite-empty trainer-screen-only"
                                  onClick={() => {
                                    setTrainerFavoriteSlot(index);
                                    setTrainerFavoriteSearch('');
                                  }}
                                >
                                  <Plus size={18} />
                                  <span>
                                    Favorito {index + 1}
                                  </span>
                                </button>

                                <div className="trainer-favorite-print trainer-favorite-print-empty">
                                  <span>—</span>
                                </div>
                              </>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {trainerPhotoError && (
              <div className="trainer-card-message trainer-screen-only">
                {trainerPhotoError}
              </div>
            )}

            {trainerProfileMessage && (
              <div className="trainer-card-message trainer-screen-only">
                {trainerProfileMessage}
              </div>
            )}

            <div className="trainer-card-editor trainer-screen-only">
              <div className="trainer-card-editor-heading">
                <span>EDITAR TRAINER CARD</span>
                <h2>Seus dados de treinador</h2>
              </div>

              <div className="trainer-card-editor-grid">
                <label className="trainer-card-editor-field">
                  <span>
                    ID da Liga Pokémon TCG
                  </span>

                  <input
                    type="text"
                    maxLength={50}
                    defaultValue={tcgLeagueId}
                    placeholder="Digite seu ID da Liga"
                    onBlur={(event) =>
                      handleTrainerFieldChange(
                        'pokemon_tcg_league_id',
                        event.target.value.trim()
                      )
                    }
                  />
                </label>

                <label className="trainer-card-editor-field">
                  <span>
                    Mecânica favorita
                  </span>

                  <select
                    value={favoriteMechanic}
                    onChange={(event) =>
                      handleTrainerFieldChange(
                        'pokemon_favorite_mechanic',
                        event.target.value
                      )
                    }
                    disabled={trainerProfileSaving}
                  >
                    <option value="">
                      Selecione
                    </option>
                    <option value="MEGA_EVOLUTION">
                      Mega Evolução
                    </option>
                    <option value="Z_MOVE">
                      Z-Move
                    </option>
                    <option value="DYNAMAX_GIGANTAMAX">
                      Dynamax / Gigantamax
                    </option>
                    <option value="TERASTAL">
                      Terastal
                    </option>
                  </select>
                </label>
              </div>

              <p className="trainer-card-editor-help">
                Clique em um dos seis espaços de Pokémon
                favoritos no card para escolher ou trocar
                um Pokémon.
              </p>
            </div>

            {trainerFavoriteSlot !== null && (
              <div className="trainer-favorite-picker trainer-screen-only">
                <div className="trainer-favorite-picker-heading">
                  <div>
                    <span>
                      FAVORITO {trainerFavoriteSlot + 1}
                    </span>
                    <strong>
                      Escolha um Pokémon
                    </strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setTrainerFavoriteSlot(null);
                      setTrainerFavoriteSearch('');
                    }}
                    aria-label="Fechar seleção de favorito"
                  >
                    <X size={19} />
                  </button>
                </div>

                <div className="trainer-favorite-picker-search">
                  <Search size={19} />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou número..."
                    value={trainerFavoriteSearch}
                    onChange={(event) =>
                      setTrainerFavoriteSearch(
                        event.target.value
                      )
                    }
                    autoFocus
                  />
                </div>

                <div className="trainer-favorite-picker-grid">
                  {filteredTrainerFavoritePokemon.map(
                    (pokemon) => (
                      <button
                        type="button"
                        key={pokemon.pokedex_id}
                        onClick={() =>
                          selectTrainerFavoritePokemon(
                            pokemon
                          )
                        }
                        disabled={trainerProfileSaving}
                      >
                        <img
                          src={pokemon.sprite_url}
                          alt={pokemon.name}
                        />
                        <span>
                          {pokemon.name}
                        </span>
                        <small>
                          #{String(
                            pokemon.pokedex_id
                          ).padStart(4, '0')}
                        </small>
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            <div className="trainer-image-prompt-panel trainer-screen-only">
              <div className="trainer-image-prompt-heading">
                <div>
                  <span>FOTO DE TREINADOR</span>
                  <h2>
                    Crie sua foto em pixel art
                  </h2>
                </div>

                <button
                  type="button"
                  className="trainer-prompt-copy-button"
                  onClick={handleCopyTrainerPrompt}
                >
                  {trainerPromptCopied
                    ? 'Prompt copiado!'
                    : 'Copiar prompt'}
                </button>
              </div>

              <p>
                Use uma foto sua como referência junto
                com este prompt. Depois é só voltar e
                adicionar o resultado ao Trainer Card.
              </p>

              <textarea
                readOnly
                value={trainerImagePrompt}
                rows={12}
              />
            </div>

            <div className="trainer-card-actions trainer-screen-only">
              <button
                type="button"
                className="trainer-card-print-button"
                onClick={handlePrintTrainerCard}
              >
                <Printer size={19} />
                Imprimir Trainer Card
              </button>
            </div>
          </section>
        </main>
      );
    };

  const renderGames = () => {
    return (
      <main className="pokemon-content-section">
        {renderBackButton()}

        <section className="game-center-header">
          <div className="section-title">
            <span>
              GAME CENTER
            </span>

            <h1>
              Minhas Jornadas
            </h1>

            <p>
              Registre, acompanhe e guarde suas aventuras
              pelos jogos Pokémon.
            </p>
          </div>

          <button
            type="button"
            className="game-center-add-button"
            onClick={openJourneyForm}
            disabled={
              availablePokemonGames.length === 0
            }
          >
            <Plus size={20} />
            Registrar Jornada
          </button>
        </section>

        <section className="game-center-nik-intro">
          <div className="game-center-nik-character">
            <img
              src={nik}
              alt="Nik, responsável pelo Game Center"
              className="game-center-nik-image"
              draggable="false"
            />
          </div>

          <div className="game-center-nik-dialogue">
            <div className="game-center-nik-name">
              NIK
            </div>

            <div className="game-center-nik-message">
              <p>
                E aí, Treinador! Eu sou o Nik! Bem-vindo ao
                <strong> Game Center</strong>!
              </p>

              <p>
                É aqui que eu acompanho todas as suas jornadas.
                Começou um jogo novo? Registra aqui! Deu uma pausa?
                Sem problema. Voltou depois de meses? Eu não julgo...
                acontece comigo também!
              </p>

              <p>
                Mas se você zerar uma aventura, aí eu quero saber!
                Cada região conquistada é mais uma história para a
                sua coleção.
              </p>

              <p>
                E não esquece: terminou uma grande jornada? Passa no
                <strong> Hall da Fama</strong> e registra o time que
                chegou até o fim com você!
              </p>

              <p>
                Então... <strong>qual vai ser a próxima aventura?</strong>
              </p>
            </div>
          </div>
        </section>

        {pokemonCatalog.length > 0 &&
          availablePokemonGames.length === 0 && (
            <div className="game-center-info">
              Todos os jogos Pokémon disponíveis no catálogo
              já possuem uma jornada registrada.
            </div>
          )}

        {showJourneyForm && (
          <section className="journey-form-panel">
            <div className="journey-form-heading">
              <div>
                <span>
                  NOVA JORNADA
                </span>

                <h2>
                  Registrar aventura
                </h2>
              </div>

              <button
                type="button"
                className="journey-close-button"
                onClick={closeJourneyForm}
                aria-label="Fechar formulário"
              >
                <X size={22} />
              </button>
            </div>

            <form
              className="journey-form"
              onSubmit={handleJourneySubmit}
            >
              <div className="journey-form-field journey-form-full">
                <label htmlFor="game_catalog_id">
                  Jogo Pokémon
                </label>

                <select
                  id="game_catalog_id"
                  name="game_catalog_id"
                  value={
                    journeyForm.game_catalog_id
                  }
                  onChange={handleJourneyChange}
                  required
                >
                  <option value="">
                    Selecione um jogo
                  </option>

                  {availablePokemonGames.map((game) => (
                    <option
                      key={game.id}
                      value={game.id}
                    >
                      {game.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="journey-form-field">
                <label htmlFor="status">
                  Status
                </label>

                <select
                  id="status"
                  name="status"
                  value={journeyForm.status}
                  onChange={handleJourneyChange}
                >
                  <option value="JOGANDO">
                    Jogando
                  </option>

                  <option value="ZEREI">
                    Zerei
                  </option>

                  <option value="JOGUEI">
                    Joguei
                  </option>

                  <option value="PAUSADO">
                    Pausado
                  </option>

                  <option value="QUERO">
                    Quero Jogar
                  </option>

                  <option value="PLATINEI">
                    Platinei
                  </option>
                </select>
              </div>

              <div className="journey-form-field">
                <label htmlFor="play_time">
                  Tempo de jogo
                </label>

                <input
                  id="play_time"
                  name="play_time"
                  type="text"
                  maxLength={20}
                  placeholder="Ex: 35h 20min"
                  value={
                    journeyForm.play_time
                  }
                  onChange={handleJourneyChange}
                />
              </div>

              <div className="journey-form-field">
                <label htmlFor="rating">
                  Nota
                </label>

                <input
                  id="rating"
                  name="rating"
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  placeholder="0 a 10"
                  value={
                    journeyForm.rating
                  }
                  onChange={handleJourneyChange}
                />
              </div>

              <div className="journey-form-field journey-form-full">
                <label htmlFor="review">
                  Anotações da jornada
                </label>

                <textarea
                  id="review"
                  name="review"
                  rows={5}
                  placeholder="Conte alguma coisa sobre essa jornada..."
                  value={
                    journeyForm.review
                  }
                  onChange={handleJourneyChange}
                />
              </div>

              {journeyError && (
                <div className="journey-message journey-message-error">
                  {journeyError}
                </div>
              )}

              {journeySuccess && (
                <div className="journey-message journey-message-success">
                  {journeySuccess}
                </div>
              )}

              <div className="journey-form-actions">
                <button
                  type="button"
                  className="journey-cancel-button"
                  onClick={closeJourneyForm}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="journey-save-button"
                  disabled={journeySaving}
                >
                  <Save size={19} />

                  {journeySaving
                    ? 'Salvando...'
                    : 'Registrar Jornada'}
                </button>
              </div>
            </form>
          </section>
        )}

        {hallEntry && (
          <section className="journey-form-panel hall-form-panel">
            <div className="journey-form-heading">
              <div>
                <span>
                  HALL DA FAMA
                </span>

                <h2>
                  Registrar equipe campeã
                </h2>

                <p>
                  {(
                    hallEntry.game_catalog ||
                    hallEntry.game
                  )?.title}
                </p>
              </div>

              <button
                type="button"
                className="journey-close-button"
                onClick={closeHallForm}
                aria-label="Fechar Hall da Fama"
              >
                <X size={22} />
              </button>
            </div>

            <form
              className="hall-form"
              onSubmit={handleHallSubmit}
            >
              <div className="hall-team-editor">
                {hallTeam.map((slot, index) => {
                  const pokemon = slot.pokemon;
                  const sprite = pokemon
                    ? (
                        slot.shiny
                          ? pokemon.shiny_sprite_url
                          : pokemon.sprite_url
                      )
                    : null;

                  return (
                    <div
                      className="hall-team-slot"
                      key={index}
                    >
                      <span className="hall-slot-number">
                        {index + 1}
                      </span>

                      {pokemon ? (
                        <>
                          <button
                            type="button"
                            className="hall-selected-pokemon"
                            onClick={() => {
                              setHallActiveSlot(index);
                              setHallSearch('');
                            }}
                          >
                            <img
                              src={sprite}
                              alt={pokemon.name}
                            />

                            <strong>
                              {pokemon.name}
                            </strong>

                            <small>
                              #
                              {String(
                                pokemon.pokedex_id
                              ).padStart(4, '0')}
                            </small>
                          </button>

                          <label className="hall-shiny-toggle">
                            <input
                              type="checkbox"
                              checked={slot.shiny}
                              onChange={() =>
                                toggleHallShiny(index)
                              }
                            />

                            <Sparkles size={16} />
                            Shiny
                          </label>

                          <button
                            type="button"
                            className="hall-remove-pokemon"
                            onClick={() =>
                              removeHallPokemon(index)
                            }
                            aria-label={`Remover ${pokemon.name}`}
                          >
                            <X size={17} />
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="hall-empty-slot"
                          onClick={() => {
                            setHallActiveSlot(index);
                            setHallSearch('');
                          }}
                        >
                          <Plus size={24} />
                          Escolher Pokémon
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {hallActiveSlot !== null && (
                <div className="hall-picker">
                  <div className="hall-picker-heading">
                    <div>
                      <span>
                        SLOT {hallActiveSlot + 1}
                      </span>

                      <strong>
                        Escolha um Pokémon
                      </strong>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setHallActiveSlot(null);
                        setHallSearch('');
                      }}
                      aria-label="Fechar seleção"
                    >
                      <X size={19} />
                    </button>
                  </div>

                  <div className="hall-picker-search">
                    <Search size={19} />

                    <input
                      type="text"
                      placeholder="Buscar por nome ou número..."
                      value={hallSearch}
                      onChange={(event) =>
                        setHallSearch(
                          event.target.value
                        )
                      }
                      autoFocus
                    />
                  </div>

                  <div className="hall-picker-grid">
                    {filteredHallPokemon.map(
                      (pokemon) => (
                        <button
                          type="button"
                          key={pokemon.pokedex_id}
                          onClick={() =>
                            selectHallPokemon(pokemon)
                          }
                        >
                          <img
                            src={pokemon.sprite_url}
                            alt={pokemon.name}
                          />

                          <span>
                            {pokemon.name}
                          </span>

                          <small>
                            #
                            {String(
                              pokemon.pokedex_id
                            ).padStart(4, '0')}
                          </small>
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              {hallError && (
                <div className="journey-message journey-message-error">
                  {hallError}
                </div>
              )}

              <div className="journey-form-actions">
                <button
                  type="button"
                  className="journey-cancel-button"
                  onClick={closeHallForm}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="journey-save-button"
                  disabled={hallSaving}
                >
                  <Trophy size={19} />

                  {hallSaving
                    ? 'Registrando...'
                    : 'Registrar Hall da Fama'}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="journey-list-section">
          <div className="journey-list-header">
            <div>
              <span>
                ARQUIVO DE JORNADAS
              </span>

              <h2>
                Aventuras registradas
              </h2>
            </div>

            <strong>
              {pokemonGames.length}
            </strong>
          </div>

          {pokemonGames.length === 0 ? (
            <div className="game-center-empty">
              <Gamepad2 size={52} />

              <h3>
                Nenhuma jornada
              </h3>

              <p>
                Registre sua primeira aventura Pokémon
                no Game Center.
              </p>

              {availablePokemonGames.length > 0 && (
                <button
                  type="button"
                  onClick={openJourneyForm}
                >
                  <Plus size={18} />
                  Registrar Jornada
                </button>
              )}
            </div>
          ) : (
            <div className="pokemon-grid game-center-grid">
              {pokemonGames.map((entry) => {
                const game =
                  entry.game_catalog ||
                  entry.game;

                const hof =
                  game?.hall_of_fame_entry ||
                  entry?.hall_of_fame_entry ||
                  entry?.hall_of_fame;

                return (
                  <article
                    key={entry.id}
                    className="pokemon-card-game journey-game-card"
                  >
                    <div className="game-cover-wrapper">
                      <img
                        src={getImageUrl(
                          game?.cover_image ||
                          game?.cover_url
                        )}
                        alt={
                          game?.title ||
                          'Jogo Pokémon'
                        }
                      />

                      {hof && (
                        <span className="champion-badge">
                          CAMPEÃO
                        </span>
                      )}

                      <span
                        className={[
                          'journey-status-badge',
                          `journey-status-${getJourneyStatusClass(
                            entry.status
                          )}`,
                        ].join(' ')}
                      >
                        {getJourneyStatusLabel(entry)}
                      </span>
                    </div>

                    <div className="card-info journey-card-info">
                      <h3>
                        {game?.title}
                      </h3>

                      {(entry.play_time ||
                        entry.rating !== null &&
                        entry.rating !== undefined) && (
                        <div className="journey-card-data">
                          {entry.play_time && (
                            <div>
                              <Clock3 size={16} />

                              <span>
                                {entry.play_time}
                              </span>
                            </div>
                          )}

                          {entry.rating !== null &&
                            entry.rating !== undefined && (
                              <div>
                                <Star size={16} />

                                <span>
                                  {entry.rating}/10
                                </span>
                              </div>
                            )}
                        </div>
                      )}

                      {entry.review && (
                        <p className="journey-review">
                          {entry.review}
                        </p>
                      )}

                      <div className="journey-hall-status">
                        {hof ? (
                          <span className="journey-hall-complete">
                            <Trophy size={16} />
                            Hall da Fama registrado
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="journey-hall-register-button"
                            onClick={() =>
                              openHallForm(entry)
                            }
                          >
                            <Trophy size={16} />
                            Cadastrar Hall da Fama
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    );
  };

  const renderDex = (isShiny = false) => {
    const caughtSet = isShiny
      ? myShinyIds
      : myCapturedIds;

    return (
      <section className="dex-view">
        <div className="section-title dex-section-title">
          <span>
            {isShiny
              ? 'SHINY DEX'
              : 'POKÉDEX'}
          </span>

          <h2>
            {isShiny
              ? 'Shiny Dex'
              : 'Pokédex'}
          </h2>

          <p>
            {isShiny
              ? `${shinyCount} Pokémon shiny registrados.`
              : `${capturedCount} Pokémon registrados.`}
          </p>
        </div>

        <div className="dex-container">
          <div className="dex-toolbar">
            <div className="dex-search-wrapper">
              <Search size={20} />

              <input
                className="dex-search"
                placeholder="Nome ou número..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="dex-progress">
              <strong>
                {caughtSet.size}
              </strong>

              <span>
                {' / '}
                {pokedex.length || 1025}
              </span>
            </div>
          </div>

          <div className="gen-selector">
            {totalGenerations.map((gen) => (
              <button
                type="button"
                key={gen}
                className={
                  activeGeneration === gen
                    ? 'active-gen'
                    : ''
                }
                onClick={() =>
                  setActiveGeneration(gen)
                }
              >
                <strong>
                  Gen {gen}
                </strong>

                <span>
                  {
                    generationLimits[gen]
                      .name
                  }
                </span>
              </button>
            ))}
          </div>

          <div className="dex-region-title">
            <span>
              GERAÇÃO {activeGeneration}
            </span>

            <h2>
              {currentGenInfo.name}
            </h2>

            <p>
              #
              {String(
                currentGenInfo.start
              ).padStart(4, '0')}
              {' — '}
              #
              {String(
                currentGenInfo.end
              ).padStart(4, '0')}
            </p>
          </div>

          <div className="dex-grid">
            {filteredDex.map((poke) => {
              const isCaught =
                caughtSet.has(
                  poke.pokedex_id
                );

              const sprite =
                isShiny
                  ? poke.shiny_sprite_url
                  : poke.sprite_url;

              return (
                <button
                  type="button"
                  key={poke.pokedex_id}
                  className={[
                    'dex-card',
                    isCaught
                      ? 'caught'
                      : 'uncaptured',
                    isShiny
                      ? 'shiny'
                      : '',
                  ].join(' ')}
                  onClick={() =>
                    toggleCapture(
                      poke.pokedex_id,
                      isShiny
                    )
                  }
                  aria-label={
                    isCaught
                      ? `Remover ${poke.name} da ${
                          isShiny
                            ? 'Shiny Dex'
                            : 'Pokédex'
                        }`
                      : `Registrar ${poke.name} na ${
                          isShiny
                            ? 'Shiny Dex'
                            : 'Pokédex'
                        }`
                  }
                  title={
                    isCaught
                      ? 'Clique para remover da Dex'
                      : 'Clique para registrar na Dex'
                  }
                >
                  <div className="dex-card-number">
                    #
                    {String(
                      poke.pokedex_id
                    ).padStart(4, '0')}
                  </div>

                  <div className="dex-sprite-wrapper">
                    <img
                      src={sprite}
                      alt={poke.name}
                    />
                  </div>

                  <p>
                    {poke.name}
                  </p>

                  {isCaught ? (
                    <>
                      <div className="check">
                        ✓
                      </div>

                      <span className="register-label registered-label">
                        Registrado
                      </span>
                    </>
                  ) : (
                    <span className="register-label">
                      Clique para registrar
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>
    );
  };

  const renderLab = () => {
    return (
      <main className="pokemon-content-section">
        {renderBackButton()}

        <section className="section-title">
          <span>
            LABORATÓRIO POKÉMON
          </span>

          <h1>
            Laboratório
          </h1>

          <p>
            Consulte e registre seus Pokémon normais e shiny.
          </p>
        </section>

        <section className="professor-cedro-intro">
          <div className="professor-cedro-character">
            <img
              src={professorCedro}
              alt="Professor Cedro"
              className="professor-cedro-image"
              draggable="false"
            />
          </div>

          <div className="professor-cedro-dialogue">
            <div className="professor-cedro-name">
              PROF. CEDRO
            </div>

            <div className="professor-cedro-message">
              <p>
                Saudações, Treinador! Seja muito bem-vindo ao meu
                laboratório. Dedico minhas pesquisas ao estudo e
                registro das diferentes espécies encontradas durante
                as jornadas dos treinadores.
              </p>

              <p>
                Na <strong>Pokédex</strong>, basta selecionar uma
                espécie para registrá-la. Cada novo registro aumenta
                o progresso da sua pesquisa e também atualiza o
                progresso exibido no seu Trainer Card.
              </p>

              <p>
                Já a <strong>Shiny Dex</strong> mantém um registro
                separado das formas shiny que você encontrar. Esses
                registros são muito mais raros, então completá-la será
                um desafio ainda maior!
              </p>

              <p className="professor-cedro-final-line">
                Agora escolha uma das Dex abaixo e vamos começar
                nossa pesquisa!
              </p>
            </div>
          </div>
        </section>

        <div className="lab-dex-switcher">
          <button
            type="button"
            className={
              labMode === 'pokedex'
                ? 'active'
                : ''
            }
            onClick={() => {
              setLabMode('pokedex');
              setSearchTerm('');
            }}
          >
            <BookOpen size={20} />
            Pokédex
          </button>

          <button
            type="button"
            className={
              labMode === 'shiny'
                ? 'active'
                : ''
            }
            onClick={() => {
              setLabMode('shiny');
              setSearchTerm('');
            }}
          >
            <Sparkles size={20} />
            Shiny Dex
          </button>
        </div>

        {renderDex(
          labMode === 'shiny'
        )}
      </main>
    );
  };

  const renderPokemonCenter = () => {
    return (
      <main className="pokemon-content-section pokemon-npc-page pokemon-recovery-page">
        {renderBackButton()}

        <section className="section-title">
          <span>CENTRO POKÉMON</span>
          <h1>Centro de Recuperação</h1>
          <p>
            Um lugar de descanso, cuidado e hospitalidade para Pokémon e treinadores.
          </p>
        </section>

        <section className="pokemon-npc-intro pokemon-center-intro">
          <div className="pokemon-npc-character">
            <img
              src={flora}
              alt="Dona Flora, cuidadora do Centro de Recuperação"
              draggable="false"
            />
          </div>

          <div className="pokemon-npc-dialogue">
            <span className="pokemon-npc-name">DONA FLORA</span>
            <h2>Hospitalidade também é uma forma de cuidado.</h2>

            <p>
              Prontinho, querido. Seus Pokémon podem descansar por aqui.
              E nada de esquecer de descansar também, viu?
            </p>

            <p>
              Dona Flora cuida de Pokémon há décadas. Seu parceiro é Sinistcha,
              cuja habilidade Hospitality combina perfeitamente com a forma
              acolhedora com que os dois recebem cada treinador.
            </p>

            <div className="pokemon-npc-quote">
              “Deixe seus Pokémon comigo, querido. Sinistcha, coloque a água para
              esquentar. Nosso treinador também parece precisar recuperar um pouco de HP.”
            </div>
          </div>
        </section>

        <section className="pokemon-location-cards">
          <article>
            <Sparkles size={30} />
            <h3>Recuperação</h3>
            <p>O ponto de descanso da sua jornada Pokémon.</p>
          </article>

          <article>
            <BookOpen size={30} />
            <h3>Conselhos da Dona Flora</h3>
            <p>Um espaço acolhedor para dicas de cuidado e histórias da cidade.</p>
          </article>

          <article>
            <Star size={30} />
            <h3>Sinistcha</h3>
            <p>O parceiro de Dona Flora representa a hospitalidade do Centro.</p>
          </article>
        </section>
      </main>
    );
  };

  const renderTcg = () => {
    return (
      <main className="pokemon-content-section pokemon-npc-page tcg-page">
        {renderBackButton()}

        <section className="section-title">
          <span>CENTRAL TCG</span>
          <h1>Mercado TCG</h1>
          <p>
            Cartas, coleções, decks e aquele brilho no olho quando aparece uma carta especial.
          </p>
        </section>

        <section className="pokemon-npc-intro tcg-intro">
          <div className="pokemon-npc-character">
            <img
              src={mia}
              alt="Mia, especialista da Central TCG"
              draggable="false"
            />
          </div>

          <div className="pokemon-npc-dialogue">
            <span className="pokemon-npc-name">MIA</span>
            <h2>Todo Pokémon é o favorito de alguém!</h2>

            <p>
              O meu é o Ledyba! Você coleciona também? Espera só até eu pegar meu fichário!
            </p>

            <p>
              Mia é a pequena especialista da Central TCG. Ela entende de decks,
              raridades, estratégias e coleções, mas acredita que a melhor carta
              nem sempre é a mais cara ou a mais forte.
            </p>

            <p>
              Para Mia, cada fichário conta uma história e todo Pokémon pode ser especial para alguém.
            </p>

            <div className="pokemon-npc-quote">
              “Uma carta não precisa estar no meta para ser a sua favorita!”
            </div>
          </div>
        </section>

        <section className="pokemon-location-cards">
          <article>
            <BookOpen size={30} />
            <h3>Minha Coleção TCG</h3>
            <p>Espaço preparado para organizar suas cartas e acompanhar sua coleção.</p>
          </article>

          <article>
            <Swords size={30} />
            <h3>Decks</h3>
            <p>Área preparada para montar e guardar seus decks favoritos.</p>
          </article>

          <article>
            <Star size={30} />
            <h3>Favoritos da Mia</h3>
            <p>
              Cartas e Pokémon não precisam ser os mais populares para serem especiais para alguém.
            </p>
          </article>
        </section>
      </main>
    );
  };

  const renderGym = () => {
    const unlockedRegionalBadges =
      gymRegionAchievements.filter(
        (achievement) => achievement.pokedexComplete
      ).length;

    const unlockedShinyBadges =
      gymRegionAchievements.filter(
        (achievement) => achievement.shinyComplete
      ).length;

    const unlockedGeneralAchievements =
      gymGeneralAchievements.filter(
        (achievement) => achievement.unlocked
      ).length;

    return (
      <main className="pokemon-content-section gym-page">
        {renderBackButton()}

        <section className="section-title">
          <span>GINÁSIO</span>
          <h1>Ginásio das Conquistas</h1>
          <p>
            Complete desafios, conquiste insígnias e prove o
            quanto sua jornada evoluiu.
          </p>
        </section>

        <section className="gym-leader-intro">
          <div className="gym-leader-character">
            <img
              src={liderDragao}
              alt="Líder Íris, especialista em Pokémon do tipo Dragão"
              className="gym-leader-image"
            />
          </div>

          <div className="gym-leader-dialogue">
            <span className="gym-leader-name">
              LÍDER ÍRIS
            </span>

            <p>
              Saudações, Treinador! Eu sou Íris, Líder deste
              Ginásio e especialista em Pokémon do tipo Dragão.
            </p>

            <p>
              Também sou assistente do Professor Cedro. Enquanto
              ele acompanha suas pesquisas no Laboratório, eu fico
              responsável por transformar o seu progresso em
              desafios, títulos e insígnias.
            </p>

            <p>
              Complete a Pokédex de cada região para conquistar
              suas insígnias regionais. Se quiser um desafio digno
              de um verdadeiro mestre, complete também as versões
              da Shiny Dex.
            </p>

            <p>
              Suas conquistas são atualizadas automaticamente.
              Continue registrando Pokémon e volte aqui para ver
              até onde sua jornada chegou!
            </p>
          </div>
        </section>

        <section className="gym-summary-grid">
          <div className="gym-summary-card">
            <Award size={28} />
            <strong>
              {unlockedRegionalBadges} / {gymRegionAchievements.length}
            </strong>
            <span>Insígnias Regionais</span>
          </div>

          <div className="gym-summary-card gym-summary-card-shiny">
            <Sparkles size={28} />
            <strong>
              {unlockedShinyBadges} / {gymRegionAchievements.length}
            </strong>
            <span>Insígnias Shiny</span>
          </div>

          <div className="gym-summary-card">
            <Trophy size={28} />
            <strong>
              {unlockedGeneralAchievements} / {gymGeneralAchievements.length}
            </strong>
            <span>Conquistas Gerais</span>
          </div>
        </section>

        <section className="gym-achievement-section">
          <div className="gym-section-heading">
            <span>DESAFIO REGIONAL</span>
            <h2>Insígnias da Pokédex</h2>
            <p>
              Registre todas as espécies de uma região para
              desbloquear sua insígnia.
            </p>
          </div>

          <div className="gym-badge-grid">
            {gymRegionAchievements.map((achievement) => {
              const progress = Math.min(
                100,
                Math.round(
                  (achievement.captured / achievement.total) * 100
                )
              );

              return (
                <article
                  key={`dex-${achievement.generation}`}
                  className={`gym-badge-card ${
                    achievement.pokedexComplete
                      ? 'is-unlocked'
                      : 'is-locked'
                  }`}
                >
                  <div className="gym-badge-medal">
                    <Award size={34} />
                    <span>{achievement.generation}</span>
                  </div>

                  <span className="gym-badge-kicker">
                    INSÍGNIA DE {achievement.name.toUpperCase()}
                  </span>

                  <h3>Pokédex de {achievement.name}</h3>

                  <strong className="gym-badge-progress-number">
                    {achievement.captured} / {achievement.total}
                  </strong>

                  <div className="gym-progress-track">
                    <span style={{ width: `${progress}%` }} />
                  </div>

                  <span className="gym-badge-status">
                    {achievement.pokedexComplete
                      ? '✓ DESBLOQUEADA'
                      : `Faltam ${Math.max(
                          achievement.total - achievement.captured,
                          0
                        )} espécies`}
                  </span>
                </article>
              );
            })}
          </div>
        </section>

        <section className="gym-achievement-section gym-shiny-section">
          <div className="gym-section-heading">
            <span>DESAFIO ESPECIAL</span>
            <h2>Insígnias Shiny</h2>
            <p>
              O desafio máximo: registre todas as formas shiny de
              uma região para conquistar uma insígnia rara.
            </p>
          </div>

          <div className="gym-badge-grid">
            {gymRegionAchievements.map((achievement) => {
              const progress = Math.min(
                100,
                Math.round(
                  (achievement.shiny / achievement.total) * 100
                )
              );

              return (
                <article
                  key={`shiny-${achievement.generation}`}
                  className={`gym-badge-card gym-shiny-badge ${
                    achievement.shinyComplete
                      ? 'is-unlocked'
                      : 'is-locked'
                  }`}
                >
                  <div className="gym-badge-medal">
                    <Sparkles size={32} />
                    <span>{achievement.generation}</span>
                  </div>

                  <span className="gym-badge-kicker">
                    INSÍGNIA SHINY DE {achievement.name.toUpperCase()}
                  </span>

                  <h3>Shiny Dex de {achievement.name}</h3>

                  <strong className="gym-badge-progress-number">
                    {achievement.shiny} / {achievement.total}
                  </strong>

                  <div className="gym-progress-track">
                    <span style={{ width: `${progress}%` }} />
                  </div>

                  <span className="gym-badge-status">
                    {achievement.shinyComplete
                      ? '✦ DESBLOQUEADA'
                      : `Faltam ${Math.max(
                          achievement.total - achievement.shiny,
                          0
                        )} shinies`}
                  </span>
                </article>
              );
            })}
          </div>
        </section>

        <section className="gym-achievement-section">
          <div className="gym-section-heading">
            <span>CONQUISTAS GERAIS</span>
            <h2>Desafios de Treinador</h2>
            <p>
              Marcos especiais que acompanham o crescimento da sua
              coleção e da sua pesquisa.
            </p>
          </div>

          <div className="gym-general-grid">
            {gymGeneralAchievements.map((achievement) => {
              const progress = Math.min(
                100,
                Math.round(
                  (achievement.current / Math.max(achievement.target, 1)) *
                    100
                )
              );

              return (
                <article
                  key={achievement.key}
                  className={`gym-general-card ${
                    achievement.unlocked
                      ? 'is-unlocked'
                      : 'is-locked'
                  }`}
                >
                  <div className="gym-general-icon">
                    {achievement.key.includes('shiny') ? (
                      <Sparkles size={27} />
                    ) : achievement.key.includes('master') ||
                      achievement.key === 'national-dex' ? (
                      <Trophy size={27} />
                    ) : (
                      <Star size={27} />
                    )}
                  </div>

                  <div className="gym-general-content">
                    <span>
                      {achievement.unlocked
                        ? 'CONQUISTA DESBLOQUEADA'
                        : 'CONQUISTA EM PROGRESSO'}
                    </span>

                    <h3>{achievement.title}</h3>
                    <p>{achievement.description}</p>

                    <div className="gym-general-progress-row">
                      <strong>
                        {Math.min(
                          achievement.current,
                          achievement.target
                        )}{' '}
                        / {achievement.target}
                      </strong>
                      <small>{progress}%</small>
                    </div>

                    <div className="gym-progress-track">
                      <span style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    );
  };

  const normalizeVgcTeam = (team) => {
    const slots = Array.from({ length: 6 }, createEmptyVgcSlot);

    (team.pokemon_builds || []).forEach((build) => {
      const index = Number(build.slot) - 1;

      if (index < 0 || index > 5) {
        return;
      }

      slots[index] = {
        ...createEmptyVgcSlot(),
        pokemon: build.pokemon,
        shiny: Boolean(build.is_shiny),
        level: Number(build.level) || 50,
        nature: build.nature || 'SERIOUS',
        ability: build.ability || null,
        item: build.item || null,
        teraType: build.tera_type || '',
        ivs: {
          hp: Number(build.iv_hp ?? 31),
          attack: Number(build.iv_attack ?? 31),
          defense: Number(build.iv_defense ?? 31),
          special_attack: Number(build.iv_special_attack ?? 31),
          special_defense: Number(build.iv_special_defense ?? 31),
          speed: Number(build.iv_speed ?? 31),
        },
        evs: {
          hp: Number(build.ev_hp ?? 0),
          attack: Number(build.ev_attack ?? 0),
          defense: Number(build.ev_defense ?? 0),
          special_attack: Number(build.ev_special_attack ?? 0),
          special_defense: Number(build.ev_special_defense ?? 0),
          speed: Number(build.ev_speed ?? 0),
        },
        moves: [
          build.move_1 || null,
          build.move_2 || null,
          build.move_3 || null,
          build.move_4 || null,
        ],
        legalMoveNames: [],
        legalAbilityNames: [],
        optionsLoaded: false,
      };
    });

    return {
      ...team,
      slots,
    };
  };

  const loadVgcData = async () => {
    try {
      setVgcLoading(true);
      setVgcMessage('');

      const [teamsRes, movesRes, abilitiesRes, itemsRes] =
        await Promise.all([
          api.get('vgc-teams/'),
          api.get('vgc-moves/'),
          api.get('vgc-abilities/'),
          api.get('vgc-items/'),
        ]);

      const teamData = teamsRes.data.results || teamsRes.data || [];
      const moveData = movesRes.data.results || movesRes.data || [];
      const abilityData =
        abilitiesRes.data.results || abilitiesRes.data || [];
      const itemData = itemsRes.data.results || itemsRes.data || [];

      setVgcTeams(teamData.map(normalizeVgcTeam));
      setVgcMoves(moveData);
      setVgcAbilities(abilityData);
      setVgcItems(itemData);
    } catch (error) {
      console.error('Erro ao carregar Centro VGC:', error);
      setVgcMessage(
        'Não foi possível carregar os dados do Centro VGC.'
      );
    } finally {
      setVgcLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'favorites') {
      loadVgcData();
    }
  }, [activeSection]);

  const resetVgcEditor = () => {
    setVgcSelectedTeam(null);
    setVgcTeamName('');
    setVgcPokemonSearch('');
    setVgcActiveSlot(null);
    setVgcBuildSlot(null);
    setVgcMessage('');
    setVgcTeamSlots(
      Array.from({ length: 6 }, createEmptyVgcSlot)
    );
  };

  const openNewVgcTeam = () => {
    resetVgcEditor();
    setVgcEditorOpen(true);
  };

  const closeVgcEditor = () => {
    resetVgcEditor();
    setVgcEditorOpen(false);
  };

  const filteredVgcPokemon = useMemo(() => {
    const term = vgcPokemonSearch.trim().toLowerCase();

    if (!term) {
      return pokedex.slice(0, 50);
    }

    return pokedex
      .filter((pokemon) => {
        return (
          (pokemon.name || '').toLowerCase().includes(term) ||
          String(pokemon.pokedex_id).includes(term)
        );
      })
      .slice(0, 50);
  }, [pokedex, vgcPokemonSearch]);

  const loadVgcPokemonOptions = async (index) => {
    const slot = vgcTeamSlots[index];

    if (!slot?.pokemon || slot.optionsLoaded) {
      return;
    }

    try {
      setVgcOptionsLoading(true);

      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${slot.pokemon.pokedex_id}/`
      );

      if (!response.ok) {
        throw new Error('PokéAPI indisponível.');
      }

      const data = await response.json();
      const legalMoveNames = (data.moves || []).map(
        (entry) => entry.move?.name
      ).filter(Boolean);
      const legalAbilityNames = (data.abilities || []).map(
        (entry) => entry.ability?.name
      ).filter(Boolean);

      setVgcTeamSlots((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          legalMoveNames,
          legalAbilityNames,
          optionsLoaded: true,
        };
        return next;
      });
    } catch (error) {
      console.error(
        'Erro ao carregar golpes/habilidades do Pokémon:',
        error
      );
      setVgcTeamSlots((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          optionsLoaded: true,
        };
        return next;
      });
    } finally {
      setVgcOptionsLoading(false);
    }
  };

  const openVgcBuild = async (index) => {
    setVgcBuildSlot(index);
    await loadVgcPokemonOptions(index);
  };

  const selectVgcPokemon = async (pokemon) => {
    if (vgcActiveSlot === null) {
      return;
    }

    const selectedIndex = vgcActiveSlot;

    setVgcTeamSlots((prev) => {
      const next = [...prev];
      next[selectedIndex] = {
        ...createEmptyVgcSlot(),
        pokemon,
      };
      return next;
    });

    setVgcPokemonSearch('');
    setVgcActiveSlot(null);
    setVgcBuildSlot(selectedIndex);

    try {
      setVgcOptionsLoading(true);

      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${pokemon.pokedex_id}/`
      );

      if (!response.ok) {
        throw new Error('PokéAPI indisponível.');
      }

      const data = await response.json();
      const legalMoveNames = (data.moves || []).map(
        (entry) => entry.move?.name
      ).filter(Boolean);
      const legalAbilityNames = (data.abilities || []).map(
        (entry) => entry.ability?.name
      ).filter(Boolean);

      setVgcTeamSlots((prev) => {
        const next = [...prev];
        next[selectedIndex] = {
          ...next[selectedIndex],
          legalMoveNames,
          legalAbilityNames,
          optionsLoaded: true,
        };
        return next;
      });
    } catch (error) {
      console.error(
        'Erro ao carregar golpes/habilidades do Pokémon:',
        error
      );
      setVgcTeamSlots((prev) => {
        const next = [...prev];
        next[selectedIndex] = {
          ...next[selectedIndex],
          optionsLoaded: true,
        };
        return next;
      });
    } finally {
      setVgcOptionsLoading(false);
    }
  };

  const updateVgcSlot = (index, updater) => {
    setVgcTeamSlots((prev) => {
      const next = [...prev];
      const current = next[index];
      next[index] =
        typeof updater === 'function'
          ? updater(current)
          : { ...current, ...updater };
      return next;
    });
  };

  const updateVgcStat = (index, group, stat, rawValue) => {
    const max = group === 'ivs' ? 31 : 252;
    const numeric = Math.max(
      0,
      Math.min(max, Number(rawValue) || 0)
    );

    if (group === 'evs') {
      const slot = vgcTeamSlots[index];
      const currentValue = Number(slot.evs?.[stat] || 0);
      const currentTotal = Object.values(slot.evs || {}).reduce(
        (sum, value) => sum + Number(value || 0),
        0
      );
      const available = 510 - (currentTotal - currentValue);
      const safeValue = Math.min(numeric, Math.max(0, available));

      updateVgcSlot(index, (current) => ({
        ...current,
        evs: {
          ...current.evs,
          [stat]: safeValue,
        },
      }));
      return;
    }

    updateVgcSlot(index, (current) => ({
      ...current,
      ivs: {
        ...current.ivs,
        [stat]: numeric,
      },
    }));
  };

  const toggleVgcShiny = (index) => {
    updateVgcSlot(index, (slot) => ({
      ...slot,
      shiny: !slot.shiny,
    }));
  };

  const removeVgcPokemon = (index) => {
    setVgcTeamSlots((prev) => {
      const next = [...prev];
      next[index] = createEmptyVgcSlot();
      return next;
    });

    if (vgcBuildSlot === index) {
      setVgcBuildSlot(null);
    }
  };

  const getVgcSprite = (slot) => {
    if (!slot?.pokemon) {
      return '';
    }

    if (slot.shiny) {
      return (
        slot.pokemon.shiny_sprite_url ||
        slot.pokemon.sprite_shiny_url ||
        slot.pokemon.sprite_url
      );
    }

    return slot.pokemon.sprite_url;
  };

  const getVgcLegalMoves = (slot) => {
    if (!slot?.pokemon) {
      return [];
    }

    if (!slot.legalMoveNames?.length) {
      return vgcMoves;
    }

    const allowed = new Set(slot.legalMoveNames);
    return vgcMoves.filter((move) => allowed.has(move.name));
  };

  const getVgcLegalAbilities = (slot) => {
    if (!slot?.pokemon) {
      return [];
    }

    if (!slot.legalAbilityNames?.length) {
      return vgcAbilities;
    }

    const allowed = new Set(slot.legalAbilityNames);
    return vgcAbilities.filter((ability) => allowed.has(ability.name));
  };

  const saveVgcTeam = async () => {
    const selectedSlots = vgcTeamSlots
      .map((slot, index) => ({ slot, index }))
      .filter(({ slot }) => slot.pokemon);

    if (selectedSlots.length === 0) {
      setVgcMessage('Escolha pelo menos um Pokémon para a equipe.');
      return;
    }

    const payload = {
      name: vgcTeamName.trim() || 'Equipe sem nome',
      regulation: null,
      notes: null,
      pokemon_builds: selectedSlots.map(({ slot, index }) => ({
        pokemon_id: Number(slot.pokemon.pokedex_id),
        slot: index + 1,
        nickname: null,
        is_shiny: Boolean(slot.shiny),
        level: Number(slot.level) || 50,
        tera_type: slot.teraType || null,
        nature: slot.nature || 'SERIOUS',
        ability_id: slot.ability?.id || null,
        item_id: slot.item?.id || null,
        move_1_id: slot.moves?.[0]?.id || null,
        move_2_id: slot.moves?.[1]?.id || null,
        move_3_id: slot.moves?.[2]?.id || null,
        move_4_id: slot.moves?.[3]?.id || null,
        iv_hp: Number(slot.ivs.hp),
        iv_attack: Number(slot.ivs.attack),
        iv_defense: Number(slot.ivs.defense),
        iv_special_attack: Number(slot.ivs.special_attack),
        iv_special_defense: Number(slot.ivs.special_defense),
        iv_speed: Number(slot.ivs.speed),
        ev_hp: Number(slot.evs.hp),
        ev_attack: Number(slot.evs.attack),
        ev_defense: Number(slot.evs.defense),
        ev_special_attack: Number(slot.evs.special_attack),
        ev_special_defense: Number(slot.evs.special_defense),
        ev_speed: Number(slot.evs.speed),
      })),
    };

    try {
      setVgcSaving(true);
      setVgcMessage('');

      if (vgcSelectedTeam?.id) {
        await api.patch(
          `vgc-teams/${vgcSelectedTeam.id}/`,
          payload
        );
      } else {
        await api.post('vgc-teams/', payload);
      }

      await loadVgcData();
      closeVgcEditor();
    } catch (error) {
      console.error('Erro ao salvar equipe VGC:', error);
      const data = error?.response?.data;
      const firstValue = data ? Object.values(data)[0] : null;

      if (Array.isArray(firstValue) && firstValue.length > 0) {
        setVgcMessage(String(firstValue[0]));
      } else if (typeof firstValue === 'string') {
        setVgcMessage(firstValue);
      } else {
        setVgcMessage('Não foi possível salvar a equipe VGC.');
      }
    } finally {
      setVgcSaving(false);
    }
  };

  const editVgcTeam = (team) => {
    setVgcSelectedTeam(team);
    setVgcTeamName(team.name || '');
    setVgcTeamSlots(
      team.slots?.length === 6
        ? team.slots
        : Array.from({ length: 6 }, createEmptyVgcSlot)
    );
    setVgcPokemonSearch('');
    setVgcActiveSlot(null);
    setVgcBuildSlot(null);
    setVgcMessage('');
    setVgcEditorOpen(true);
  };

  const deleteVgcTeam = async (team) => {
    const confirmed = window.confirm(
      `Excluir a equipe "${team.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`vgc-teams/${team.id}/`);
      await loadVgcData();
    } catch (error) {
      console.error('Erro ao excluir equipe VGC:', error);
      setVgcMessage('Não foi possível excluir a equipe.');
    }
  };

  const renderVgcBuildModal = () => {
    if (vgcBuildSlot === null) {
      return null;
    }

    const slot = vgcTeamSlots[vgcBuildSlot];

    if (!slot?.pokemon) {
      return null;
    }

    const stats = calculateVgcStats(slot);
    const totalEvs = Object.values(slot.evs).reduce(
      (sum, value) => sum + Number(value || 0),
      0
    );
    const legalMoves = getVgcLegalMoves(slot);
    const legalAbilities = getVgcLegalAbilities(slot);

    return (
      <div
        className="pokemon-modal-backdrop vgc-build-backdrop"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            setVgcBuildSlot(null);
          }
        }}
      >
        <div className="vgc-build-modal">
          <div className="vgc-build-modal-header">
            <div className="vgc-build-identity">
              <img
                src={getVgcSprite(slot)}
                alt={slot.pokemon.name}
              />

              <div>
                <span>
                  SLOT {vgcBuildSlot + 1} · #{String(
                    slot.pokemon.pokedex_id
                  ).padStart(4, '0')}
                </span>
                <h2>{slot.pokemon.name}</h2>
                <small>
                  {slot.pokemon.type1}
                  {slot.pokemon.type2
                    ? ` / ${slot.pokemon.type2}`
                    : ''}
                </small>
              </div>
            </div>

            <button
              type="button"
              className="vgc-build-close"
              onClick={() => setVgcBuildSlot(null)}
              aria-label="Fechar build"
            >
              <X size={20} />
            </button>
          </div>

          <div className="vgc-build-top-grid">
            <label>
              <span>NÍVEL</span>
              <input
                type="number"
                min="1"
                max="100"
                value={slot.level}
                onChange={(event) =>
                  updateVgcSlot(vgcBuildSlot, {
                    level: Math.max(
                      1,
                      Math.min(100, Number(event.target.value) || 1)
                    ),
                  })
                }
              />
            </label>

            <label>
              <span>NATURE</span>
              <select
                value={slot.nature}
                onChange={(event) =>
                  updateVgcSlot(vgcBuildSlot, {
                    nature: event.target.value,
                  })
                }
              >
                {VGC_NATURES.map(([value, label]) => (
                  <option key={value} value={value}>
                    {getVgcNatureLabel(value) || label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>ABILITY</span>
              <select
                value={slot.ability?.id || ''}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  updateVgcSlot(vgcBuildSlot, {
                    ability:
                      legalAbilities.find(
                        (ability) => ability.id === value
                      ) || null,
                  });
                }}
              >
                <option value="">Escolher...</option>
                {legalAbilities.map((ability) => (
                  <option key={ability.id} value={ability.id}>
                    {ability.display_name || ability.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>HELD ITEM</span>
              <select
                value={slot.item?.id || ''}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  updateVgcSlot(vgcBuildSlot, {
                    item:
                      vgcItems.find((item) => item.id === value) ||
                      null,
                  });
                }}
              >
                <option value="">Sem item</option>
                {vgcItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.display_name || item.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>TERA TYPE</span>
              <select
                value={slot.teraType}
                onChange={(event) =>
                  updateVgcSlot(vgcBuildSlot, {
                    teraType: event.target.value,
                  })
                }
              >
                <option value="">Escolher...</option>
                {VGC_TERA_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </label>

            <div className="vgc-build-shiny-field">
              <span>VARIANTE</span>
              <button
                type="button"
                className={slot.shiny ? 'is-shiny' : ''}
                onClick={() => toggleVgcShiny(vgcBuildSlot)}
              >
                {slot.shiny ? (
                  <>
                    <Sparkles size={15} /> Shiny
                  </>
                ) : (
                  'Normal'
                )}
              </button>
            </div>
          </div>

          {vgcOptionsLoading && (
            <div className="vgc-build-loading">
              Carregando learnset e habilidades...
            </div>
          )}

          <section className="vgc-stats-panel">
            <div className="vgc-build-section-heading">
              <div>
                <span>ATRIBUTOS</span>
                <h3>Stats calculados</h3>
              </div>

              <strong>{totalEvs} / 510 EVs</strong>
            </div>

            <div className="vgc-stat-table">
              <div className="vgc-stat-row vgc-stat-head">
                <span>STAT</span>
                <span>BASE</span>
                <span>IV</span>
                <span>EV</span>
                <span>FINAL</span>
              </div>

              {VGC_STAT_CONFIG.map((stat) => (
                <div className="vgc-stat-row" key={stat.key}>
                  <strong>{stat.label}</strong>
                  <span>{slot.pokemon[stat.base] ?? '—'}</span>
                  <input
                    type="number"
                    min="0"
                    max="31"
                    value={slot.ivs[stat.key]}
                    onChange={(event) =>
                      updateVgcStat(
                        vgcBuildSlot,
                        'ivs',
                        stat.key,
                        event.target.value
                      )
                    }
                  />
                  <input
                    type="number"
                    min="0"
                    max="252"
                    value={slot.evs[stat.key]}
                    onChange={(event) =>
                      updateVgcStat(
                        vgcBuildSlot,
                        'evs',
                        stat.key,
                        event.target.value
                      )
                    }
                  />
                  <strong>{stats?.[stat.key] ?? '—'}</strong>
                </div>
              ))}
            </div>

            <div className="vgc-ev-track">
              <span style={{ width: `${Math.min(100, totalEvs / 5.1)}%` }} />
            </div>
          </section>

          <section className="vgc-moves-panel">
            <div className="vgc-build-section-heading">
              <div>
                <span>MOVESET</span>
                <h3>4 golpes</h3>
              </div>
              <strong>{legalMoves.length} disponíveis</strong>
            </div>

            <div className="vgc-moves-grid">
              {[0, 1, 2, 3].map((moveIndex) => {
                const selectedMove = slot.moves[moveIndex];

                return (
                  <div className="vgc-move-field" key={moveIndex}>
                    <label>
                      <span>GOLPE {moveIndex + 1}</span>
                      <select
                        value={selectedMove?.id || ''}
                        onChange={(event) => {
                          const value = Number(event.target.value);
                          updateVgcSlot(vgcBuildSlot, (current) => {
                            const moves = [...current.moves];
                            moves[moveIndex] =
                              legalMoves.find(
                                (move) => move.id === value
                              ) || null;
                            return {
                              ...current,
                              moves,
                            };
                          });
                        }}
                      >
                        <option value="">Escolher golpe...</option>
                        {legalMoves.map((move) => (
                          <option key={move.id} value={move.id}>
                            {move.display_name || move.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    {selectedMove && (
                      <div className="vgc-move-info">
                        <div>
                          <strong>
                            {selectedMove.display_name ||
                              selectedMove.name}
                          </strong>
                          <span>{selectedMove.move_type || '—'}</span>
                          <span>
                            {selectedMove.damage_class || 'status'}
                          </span>
                        </div>

                        <div className="vgc-move-numbers">
                          <span>
                            POW <strong>{selectedMove.power ?? '—'}</strong>
                          </span>
                          <span>
                            ACC{' '}
                            <strong>{selectedMove.accuracy ?? '—'}</strong>
                          </span>
                          <span>
                            PP <strong>{selectedMove.pp ?? '—'}</strong>
                          </span>
                        </div>

                        {selectedMove.effect && (
                          <p>{selectedMove.effect}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {(slot.ability?.effect || slot.item?.effect) && (
            <section className="vgc-effect-panel">
              {slot.ability?.effect && (
                <div>
                  <span>ABILITY</span>
                  <strong>
                    {slot.ability.display_name || slot.ability.name}
                  </strong>
                  <p>{slot.ability.effect}</p>
                </div>
              )}

              {slot.item?.effect && (
                <div>
                  <span>ITEM</span>
                  <strong>
                    {slot.item.display_name || slot.item.name}
                  </strong>
                  <p>{slot.item.effect}</p>
                </div>
              )}
            </section>
          )}

          <div className="vgc-build-modal-footer">
            <button
              type="button"
              className="vgc-primary-button"
              onClick={() => setVgcBuildSlot(null)}
            >
              <Save size={17} />
              Aplicar build
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderFavorites = () => {
    return (
      <main className="pokemon-content-section vgc-page">
        {renderBackButton()}

        <section className="section-title vgc-title">
          <span>PC POKÉMON</span>
          <h1>Centro VGC</h1>
          <p>
            Monte equipes competitivas, distribua IVs e EVs e veja
            os atributos finais no nível 50 em tempo real.
          </p>
        </section>

        <section className="vgc-champion-section">
          <div className="vgc-champion-portrait">
            <img src={campeaoKael} alt="Kael, Campeão da Região" />
          </div>

          <div className="vgc-champion-dialogue">
            <span>CAMPEÃO DA REGIÃO</span>
            <h2>Kael</h2>
            <blockquote>
              “Ter Pokémon fortes é só o começo. Uma verdadeira
              equipe nasce quando cada escolha tem um propósito.”
            </blockquote>
            <p>
              Nature, IVs, EVs, habilidades, itens e golpes podem
              transformar completamente uma batalha. Monte sua equipe,
              teste diferentes distribuições e encontre a estratégia
              que funciona nas suas mãos.
            </p>
          </div>
        </section>

        {vgcMessage && (
          <div className="vgc-message">{vgcMessage}</div>
        )}

        {!vgcEditorOpen ? (
          <>
            <section className="vgc-toolbar">
              <div>
                <span className="pixel-label">MEUS TIMES</span>
                <h2>Equipes VGC</h2>
                <p>
                  Suas equipes ficam salvas na sua conta.
                </p>
              </div>

              <button
                type="button"
                className="vgc-primary-button"
                onClick={openNewVgcTeam}
              >
                <Plus size={18} />
                Nova equipe
              </button>
            </section>

            {vgcLoading ? (
              <section className="vgc-empty">
                <Swords size={56} />
                <span>CENTRO VGC</span>
                <h2>Carregando equipes...</h2>
              </section>
            ) : vgcTeams.length === 0 ? (
              <section className="vgc-empty">
                <Swords size={64} />
                <span>PC VGC</span>
                <h2>Nenhuma equipe cadastrada</h2>
                <p>
                  Crie sua primeira equipe e configure cada Pokémon
                  com Nature, IVs, EVs, Ability, Item, Tera Type e
                  quatro golpes.
                </p>

                <button
                  type="button"
                  className="vgc-primary-button"
                  onClick={openNewVgcTeam}
                >
                  <Plus size={18} />
                  Criar primeira equipe
                </button>
              </section>
            ) : (
              <section className="vgc-team-list">
                {vgcTeams.map((team) => (
                  <article className="vgc-team-card" key={team.id}>
                    <div className="vgc-team-card-heading">
                      <div>
                        <span>VGC TEAM</span>
                        <h2>{team.name}</h2>
                      </div>

                      <div className="vgc-team-card-actions">
                        <button
                          type="button"
                          onClick={() => editVgcTeam(team)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteVgcTeam(team)}
                        >
                          Excluir
                        </button>
                      </div>
                    </div>

                    <div className="vgc-team-preview">
                      {team.slots.map((slot, index) => (
                        <div
                          className={`vgc-preview-slot ${
                            slot.pokemon ? 'filled' : 'empty'
                          } ${slot.shiny ? 'shiny' : ''}`}
                          key={index}
                        >
                          {slot.pokemon ? (
                            <>
                              <img
                                src={getVgcSprite(slot)}
                                alt={slot.pokemon.name}
                              />
                              <span>{slot.pokemon.name}</span>
                              <small>
                                Lv. {slot.level} · {slot.nature}
                              </small>
                              {slot.shiny && (
                                <Sparkles
                                  className="vgc-preview-shiny"
                                  size={16}
                                />
                              )}
                            </>
                          ) : (
                            <span>Slot {index + 1}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </section>
            )}
          </>
        ) : (
          <section className="vgc-editor">
            <div className="vgc-editor-heading">
              <div>
                <span className="pixel-label">
                  {vgcSelectedTeam ? 'EDITAR EQUIPE' : 'NOVA EQUIPE'}
                </span>
                <h2>Monte seu time</h2>
                <p>
                  Clique em Configurar build para ajustar Nature,
                  Ability, Item, Tera Type, IVs, EVs e os quatro golpes.
                </p>
              </div>

              <button
                type="button"
                className="vgc-secondary-button"
                onClick={closeVgcEditor}
              >
                <X size={18} />
                Fechar
              </button>
            </div>

            <label className="vgc-team-name-field">
              <span>NOME DA EQUIPE</span>
              <input
                type="text"
                maxLength={80}
                value={vgcTeamName}
                onChange={(event) =>
                  setVgcTeamName(event.target.value)
                }
                placeholder="Ex.: Rain Team"
              />
            </label>

            <div className="vgc-builder-grid">
              {vgcTeamSlots.map((slot, index) => {
                const stats = calculateVgcStats(slot);
                const totalEvs = slot.pokemon
                  ? Object.values(slot.evs).reduce(
                      (sum, value) => sum + Number(value || 0),
                      0
                    )
                  : 0;

                return (
                  <article
                    className={`vgc-builder-slot ${
                      slot.pokemon ? 'filled' : 'empty'
                    } ${slot.shiny ? 'shiny' : ''}`}
                    key={index}
                  >
                    <div className="vgc-slot-number">
                      SLOT {index + 1}
                    </div>

                    {slot.pokemon ? (
                      <>
                        <div className="vgc-slot-pokemon">
                          <img
                            src={getVgcSprite(slot)}
                            alt={slot.pokemon.name}
                          />

                          <strong>{slot.pokemon.name}</strong>

                          <span>
                            #{String(
                              slot.pokemon.pokedex_id
                            ).padStart(4, '0')}
                          </span>
                        </div>

                        <div className="vgc-variant-toggle">
                          <button
                            type="button"
                            className={!slot.shiny ? 'active' : ''}
                            onClick={() => {
                              if (slot.shiny) {
                                toggleVgcShiny(index);
                              }
                            }}
                          >
                            Normal
                          </button>

                          <button
                            type="button"
                            className={
                              slot.shiny ? 'active shiny' : ''
                            }
                            onClick={() => {
                              if (!slot.shiny) {
                                toggleVgcShiny(index);
                              }
                            }}
                          >
                            <Sparkles size={14} />
                            Shiny
                          </button>
                        </div>

                        <div className="vgc-card-build-summary">
                          <div>
                            <span>Lv.</span>
                            <strong>{slot.level}</strong>
                          </div>
                          <div>
                            <span>Nature</span>
                            <strong>{slot.nature}</strong>
                          </div>
                          <div>
                            <span>EVs</span>
                            <strong>{totalEvs}/510</strong>
                          </div>
                          <div>
                            <span>Spe</span>
                            <strong>{stats?.speed ?? '—'}</strong>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="vgc-configure-button"
                          onClick={() => openVgcBuild(index)}
                        >
                          <Swords size={16} />
                          Configurar build
                        </button>

                        <div className="vgc-slot-actions">
                          <button
                            type="button"
                            onClick={() => {
                              setVgcActiveSlot(index);
                              setVgcPokemonSearch('');
                            }}
                          >
                            Trocar
                          </button>

                          <button
                            type="button"
                            onClick={() => removeVgcPokemon(index)}
                          >
                            Remover
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="vgc-add-pokemon"
                        onClick={() => {
                          setVgcActiveSlot(index);
                          setVgcPokemonSearch('');
                        }}
                      >
                        <Plus size={26} />
                        <span>Escolher Pokémon</span>
                      </button>
                    )}
                  </article>
                );
              })}
            </div>

            <div className="vgc-editor-footer">
              <span>
                {
                  vgcTeamSlots.filter((slot) => slot.pokemon).length
                }{' '}
                / 6 Pokémon
              </span>

              <button
                type="button"
                className="vgc-primary-button"
                onClick={saveVgcTeam}
                disabled={
                  vgcSaving ||
                  vgcTeamSlots.every((slot) => !slot.pokemon)
                }
              >
                <Save size={18} />
                {vgcSaving ? 'Salvando...' : 'Salvar equipe'}
              </button>
            </div>
          </section>
        )}

        {vgcActiveSlot !== null && (
          <div
            className="pokemon-modal-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setVgcActiveSlot(null);
                setVgcPokemonSearch('');
              }
            }}
          >
            <div className="pokemon-modal vgc-pokemon-modal">
              <div className="pokemon-modal-header">
                <div>
                  <span>POKÉMON VGC</span>
                  <h2>
                    Escolher Pokémon para o slot{' '}
                    {vgcActiveSlot + 1}
                  </h2>
                </div>

                <button
                  type="button"
                  className="pokemon-modal-close"
                  onClick={() => {
                    setVgcActiveSlot(null);
                    setVgcPokemonSearch('');
                  }}
                  aria-label="Fechar"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="pokemon-modal-search">
                <Search size={18} />
                <input
                  type="text"
                  value={vgcPokemonSearch}
                  onChange={(event) =>
                    setVgcPokemonSearch(event.target.value)
                  }
                  placeholder="Buscar por nome ou número..."
                  autoFocus
                />
              </div>

              <div className="vgc-pokemon-results">
                {filteredVgcPokemon.map((pokemon) => (
                  <button
                    type="button"
                    className="vgc-pokemon-option"
                    key={pokemon.pokedex_id}
                    onClick={() => selectVgcPokemon(pokemon)}
                  >
                    <img
                      src={pokemon.sprite_url}
                      alt={pokemon.name}
                    />

                    <div>
                      <span>
                        #{String(
                          pokemon.pokedex_id
                        ).padStart(4, '0')}
                      </span>
                      <strong>{pokemon.name}</strong>
                      <small>
                        HP {pokemon.base_hp ?? '—'} · Atk{' '}
                        {pokemon.base_attack ?? '—'} · Spe{' '}
                        {pokemon.base_speed ?? '—'}
                      </small>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {renderVgcBuildModal()}
      </main>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'trainer':
        return renderTrainer();

      case 'games':
        return renderGames();

      case 'lab':
        return renderLab();

      case 'pokemon-center':
        return renderPokemonCenter();

      case 'tcg':
        return renderTcg();

      case 'gym':
        return renderGym();

      case 'favorites':
        return renderFavorites();

      case 'city':
      default:
        return renderCity();
    }
  };

  if (loading) {
    return (
      <div className="pokemon-page">
        <Navbar />

        <main className="pokemon-loading">
          <div className="pokeball-loader">
            <div />
          </div>

          <span>
            CARREGANDO...
          </span>

          <h2>
            Preparando sua jornada Pokémon
          </h2>
        </main>
      </div>
    );
  }

  return (
    <div className="pokemon-page">
      <Navbar />

      {renderContent()}

      <Footer />
    </div>
  );
}

export default PokemonPage;