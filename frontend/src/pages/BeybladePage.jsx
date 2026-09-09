import React, { useEffect, useMemo, useState } from 'react';

import {
  Bolt,
  Check,
  CircleDot,
  Crosshair,
  Disc3,
  Gauge,
  Layers3,
  LoaderCircle,
  Plus,
  Search,
  Shield,
  Sparkles,
  Swords,
  Target,
  Trophy,
  X,
  Zap,
} from 'lucide-react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import './BeybladePage.css';

const TYPE_CONFIG = {
  BLADE: {
    label: 'Blades',
    singular: 'Blade',
    icon: Disc3,
    baseKey: 'blade',
    variantKey: 'blade_variant',
  },
  MAIN_BLADE: {
    label: 'Main Blades',
    singular: 'Main Blade',
    icon: Swords,
    baseKey: 'blade',
    variantKey: 'blade_variant',
  },
  RATCHET: {
    label: 'Ratchets',
    singular: 'Ratchet',
    icon: Gauge,
    baseKey: 'ratchet',
    variantKey: 'ratchet_variant',
  },
  BIT: {
    label: 'Bits',
    singular: 'Bit',
    icon: CircleDot,
    baseKey: 'bit',
    variantKey: 'bit_variant',
  },
  ASSIST_BLADE: {
    label: 'Assist Blades',
    singular: 'Assist Blade',
    icon: Swords,
    baseKey: 'assist_blade',
    variantKey: 'assist_blade_variant',
  },
  LOCK_CHIP: {
    label: 'Lock Chips',
    singular: 'Lock Chip',
    icon: Shield,
    baseKey: 'lock_chip',
    variantKey: 'lock_chip_variant',
  },
};

function BeybladePage() {
  const [viewMode, setViewMode] = useState('COLLECTION');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('TODOS');
  const [catalogCategory, setCatalogCategory] = useState('BLADE');
  const [loading, setLoading] = useState(true);

  const [catalogReleases, setCatalogReleases] = useState([]);
  const [catalogBlades, setCatalogBlades] = useState([]);
  const [catalogRatchets, setCatalogRatchets] = useState([]);
  const [catalogBits, setCatalogBits] = useState([]);
  const [catalogAssistBlades, setCatalogAssistBlades] = useState([]);
  const [catalogLockChips, setCatalogLockChips] = useState([]);

  const [ownedBlades, setOwnedBlades] = useState([]);
  const [ownedRatchets, setOwnedRatchets] = useState([]);
  const [ownedBits, setOwnedBits] = useState([]);
  const [ownedAssistBlades, setOwnedAssistBlades] = useState([]);
  const [ownedLockChips, setOwnedLockChips] = useState([]);
  const [builds, setBuilds] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showBuildModal, setShowBuildModal] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);

  const [selectedItemType, setSelectedItemType] = useState('BLADE');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCatalogItem, setSelectedCatalogItem] = useState('');

  const [selectedCatalogGroup, setSelectedCatalogGroup] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState('');

  const [selectedBlade, setSelectedBlade] = useState('');
  const [selectedRatchet, setSelectedRatchet] = useState('');
  const [selectedBit, setSelectedBit] = useState('');
  const [buildName, setBuildName] = useState('');
  const [favorite, setFavorite] = useState(false);

  const [saving, setSaving] = useState(false);
  const [savingKey, setSavingKey] = useState('');
  const [message, setMessage] = useState('');

  const username = localStorage.getItem('username');

  const unwrapResponse = (response) => {
    const data = response?.data;
    if (data && Array.isArray(data.results)) return data.results;
    return Array.isArray(data) ? data : [];
  };

  const getImage = (item) => {
    if (!item) return null;

    return (
      item.display_image ||
      item.variant?.display_image ||
      item.variant?.image ||
      item.variant?.image_url ||
      item.image ||
      item.image_url ||
      null
    );
  };

  const safeGet = async (url, params = {}) => {
    try {
      return await api.get(url, { params });
    } catch (error) {
      if (error.response?.status === 404) {
        return { data: [] };
      }
      throw error;
    }
  };

  const fetchBeybladeData = async () => {
    setLoading(true);

    const userParams = username ? { username } : {};

    try {
      const [
        releasesResponse,
        bladesResponse,
        ratchetsResponse,
        bitsResponse,
        assistBladesResponse,
        lockChipsResponse,
        ownedBladesResponse,
        ownedRatchetsResponse,
        ownedBitsResponse,
        ownedAssistResponse,
        ownedLockResponse,
        buildsResponse,
      ] = await Promise.all([
        safeGet('beyblade-releases/'),
        safeGet('beyblades/'),
        safeGet('bey-ratchets/'),
        safeGet('bey-bits/'),
        safeGet('bey-assist-blades/'),
        safeGet('bey-lock-chips/'),
        safeGet('user-beyblades/', userParams),
        safeGet('user-bey-ratchets/', userParams),
        safeGet('user-bey-bits/', userParams),
        safeGet('user-bey-assist-blades/', userParams),
        safeGet('user-bey-lock-chips/', userParams),
        safeGet('beyblade-builds/', userParams),
      ]);

      setCatalogReleases(unwrapResponse(releasesResponse));
      setCatalogBlades(unwrapResponse(bladesResponse));
      setCatalogRatchets(unwrapResponse(ratchetsResponse));
      setCatalogBits(unwrapResponse(bitsResponse));
      setCatalogAssistBlades(unwrapResponse(assistBladesResponse));
      setCatalogLockChips(unwrapResponse(lockChipsResponse));

      setOwnedBlades(unwrapResponse(ownedBladesResponse));
      setOwnedRatchets(unwrapResponse(ownedRatchetsResponse));
      setOwnedBits(unwrapResponse(ownedBitsResponse));
      setOwnedAssistBlades(unwrapResponse(ownedAssistResponse));
      setOwnedLockChips(unwrapResponse(ownedLockResponse));
      setBuilds(unwrapResponse(buildsResponse));
    } catch (error) {
      console.error('Erro ao carregar dados de Beyblade:', error);
      setMessage('Não foi possível carregar os dados de Beyblade.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeybladeData();
  }, []);

  const collectionFilters = [
    { id: 'TODOS', label: 'Tudo', icon: Layers3 },
    { id: 'BUILD', label: 'Builds', icon: Bolt },
    { id: 'BLADE', label: 'Blades', icon: Disc3 },
    { id: 'MAIN_BLADE', label: 'Main Blades', icon: Swords },
    { id: 'RATCHET', label: 'Ratchets', icon: Gauge },
    { id: 'BIT', label: 'Bits', icon: CircleDot },
    { id: 'ASSIST_BLADE', label: 'Assist Blades', icon: Swords },
    { id: 'LOCK_CHIP', label: 'Lock Chips', icon: Shield },
  ];

  const catalogFilters = Object.entries(TYPE_CONFIG).map(([id, config]) => ({
    id,
    label: config.label,
    icon: config.icon,
  }));

  const itemTypes = Object.entries(TYPE_CONFIG).map(([id, config]) => ({
    id,
    label: config.singular,
  }));

  const modularBladeIds = useMemo(() => {
    const ids = new Set();

    catalogReleases.forEach((release) => {
      const bladeId = release?.blade?.id;

      if (
        bladeId &&
        (
          release?.assist_blade ||
          release?.lock_chip
        )
      ) {
        ids.add(Number(bladeId));
      }
    });

    return ids;
  }, [catalogReleases]);

  const traditionalCatalogBlades = useMemo(
    () =>
      catalogBlades.filter(
        (blade) =>
          !modularBladeIds.has(
            Number(blade?.id)
          )
      ),
    [
      catalogBlades,
      modularBladeIds,
    ]
  );

  const mainCatalogBlades = useMemo(
    () =>
      catalogBlades.filter(
        (blade) =>
          modularBladeIds.has(
            Number(blade?.id)
          )
      ),
    [
      catalogBlades,
      modularBladeIds,
    ]
  );

  const catalogByType = useMemo(
    () => ({
      BLADE: traditionalCatalogBlades,
      MAIN_BLADE: mainCatalogBlades,
      RATCHET: catalogRatchets,
      BIT: catalogBits,
      ASSIST_BLADE: catalogAssistBlades,
      LOCK_CHIP: catalogLockChips,
    }),
    [
      traditionalCatalogBlades,
      mainCatalogBlades,
      catalogRatchets,
      catalogBits,
      catalogAssistBlades,
      catalogLockChips,
    ]
  );

  const buildVariantGroups = (type) => {
    const config = TYPE_CONFIG[type];
    if (!config) return [];

    const baseItems = catalogByType[type] || [];
    const groups = new Map();

    baseItems.forEach((base) => {
      if (!base?.id) return;

      groups.set(String(base.id), {
        id: base.id,
        type,
        item: base,
        name: base.name || config.singular,
        variants: [],
      });
    });

    catalogReleases.forEach((release) => {
      const base = release?.[config.baseKey];
      const variant = release?.[config.variantKey];

      if (!base?.id) return;

      if (
        type === 'BLADE' &&
        modularBladeIds.has(
          Number(base.id)
        )
      ) {
        return;
      }

      if (
        type === 'MAIN_BLADE' &&
        !modularBladeIds.has(
          Number(base.id)
        )
      ) {
        return;
      }

      const key = String(base.id);

      if (!groups.has(key)) {
        groups.set(key, {
          id: base.id,
          type,
          item: base,
          name: base.name || config.singular,
          variants: [],
        });
      }

      if (!variant?.id) return;

      const group = groups.get(key);

      const alreadyExists = group.variants.some(
        (entry) => Number(entry.variant?.id) === Number(variant.id)
      );

      if (!alreadyExists) {
        group.variants.push({
          id: variant.id,
          variant,
          release,
          image:
            getImage(variant) ||
            getImage(release) ||
            getImage(base),
        });
      }
    });

    return Array.from(groups.values())
      .map((group) => {
        const fallbackImage = getImage(group.item);

        const variants = [...group.variants].sort((a, b) => {
          const aCode = a.release?.code || '';
          const bCode = b.release?.code || '';
          return aCode.localeCompare(bCode, undefined, {
            numeric: true,
          });
        });

        return {
          ...group,
          variants,
          image:
            variants.find((entry) => entry.image)?.image ||
            fallbackImage,
        };
      })
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, {
          numeric: true,
        })
      );
  };

  const catalogGroups = useMemo(
    () => buildVariantGroups(catalogCategory),
    [
      catalogCategory,
      catalogByType,
      catalogReleases,
      modularBladeIds,
    ]
  );

  const filteredCatalogGroups = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return catalogGroups;

    return catalogGroups.filter((group) => {
      const config = TYPE_CONFIG[group.type];

      const text = [
        group.name,
        group.item?.abbreviation,
        group.item?.bey_type_display,
        group.item?.bey_type,
        group.item?.bit_type_display,
        group.item?.bit_type,
        config?.label,
        ...group.variants.flatMap((entry) => [
          entry.release?.code,
          entry.release?.system,
          entry.release?.name,
          entry.variant?.source_code,
          entry.variant?.edition_name,
          entry.variant?.variant_name,
        ]),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return text.includes(search);
    });
  }, [catalogGroups, searchTerm]);

  const normalizedBuilds = useMemo(
    () =>
      builds.map((build) => {
        const blade = build.blade || {};
        const ratchet = build.ratchet || {};
        const bit = build.bit || {};

        return {
          id: `build-${build.id}`,
          originalId: build.id,
          category: 'BUILD',
          categoryDisplay: 'Build',
          name:
            build.name ||
            build.build_name ||
            blade.name ||
            'Build',
          subtitle: [
            blade.name,
            ratchet.name,
            bit.abbreviation || bit.name,
          ]
            .filter(Boolean)
            .join(' • '),
          image:
            getImage(build) ||
            getImage(build.blade_variant) ||
            getImage(blade),
          favorite: Boolean(build.favorite),
          blade: blade.name,
          ratchet: ratchet.name,
          bit: bit.abbreviation || bit.name,
          currentBuild: true,
        };
      }),
    [builds]
  );

  const normalizeOwned = (entries, type) => {
    const config = TYPE_CONFIG[type];

    return entries.map((entry) => {
      const base =
        entry[config.baseKey] ||
        (type === 'ASSIST_BLADE' ? entry.assistBlade : null) ||
        (type === 'LOCK_CHIP' ? entry.lockChip : null) ||
        {};

      const extra =
        (
          type === 'BLADE' ||
          type === 'MAIN_BLADE'
        )
          ? base.bey_type_display ||
            base.bey_type ||
            (
              type === 'MAIN_BLADE'
                ? 'Main Blade'
                : 'Blade'
            )
          : type === 'BIT'
            ? [
                base.abbreviation,
                base.bit_type_display || base.bit_type,
              ]
                .filter(Boolean)
                .join(' • ') || 'Bit'
            : config.singular;

      return {
        id: `${type.toLowerCase()}-${entry.id}`,
        originalId: entry.id,
        category: type,
        categoryDisplay: config.singular,
        name: base.name || config.singular,
        subtitle: [
          entry.variant?.source_code ||
            entry.variant?.edition_name ||
            entry.variant?.variant_name,
          extra,
        ]
          .filter(Boolean)
          .join(' • '),
        image:
          getImage(entry) ||
          getImage(entry.variant) ||
          getImage(base),
        quantity: entry.quantity || 1,
        item: base,
      };
    });
  };

  const traditionalOwnedBlades = useMemo(
    () =>
      ownedBlades.filter((entry) => {
        const blade = entry?.blade;

        return !modularBladeIds.has(
          Number(blade?.id)
        );
      }),
    [
      ownedBlades,
      modularBladeIds,
    ]
  );

  const mainOwnedBlades = useMemo(
    () =>
      ownedBlades.filter((entry) => {
        const blade = entry?.blade;

        return modularBladeIds.has(
          Number(blade?.id)
        );
      }),
    [
      ownedBlades,
      modularBladeIds,
    ]
  );

  const normalizedBlades = useMemo(
    () =>
      normalizeOwned(
        traditionalOwnedBlades,
        'BLADE'
      ),
    [traditionalOwnedBlades]
  );

  const normalizedMainBlades = useMemo(
    () =>
      normalizeOwned(
        mainOwnedBlades,
        'MAIN_BLADE'
      ),
    [mainOwnedBlades]
  );

  const normalizedRatchets = useMemo(
    () => normalizeOwned(ownedRatchets, 'RATCHET'),
    [ownedRatchets]
  );

  const normalizedBits = useMemo(
    () => normalizeOwned(ownedBits, 'BIT'),
    [ownedBits]
  );

  const normalizedAssistBlades = useMemo(
    () => normalizeOwned(ownedAssistBlades, 'ASSIST_BLADE'),
    [ownedAssistBlades]
  );

  const normalizedLockChips = useMemo(
    () => normalizeOwned(ownedLockChips, 'LOCK_CHIP'),
    [ownedLockChips]
  );

  const collectionItems = useMemo(
    () => [
      ...normalizedBuilds,
      ...normalizedBlades,
      ...normalizedMainBlades,
      ...normalizedRatchets,
      ...normalizedBits,
      ...normalizedAssistBlades,
      ...normalizedLockChips,
    ],
    [
      normalizedBuilds,
      normalizedBlades,
      normalizedMainBlades,
      normalizedRatchets,
      normalizedBits,
      normalizedAssistBlades,
      normalizedLockChips,
    ]
  );

  const filteredCollectionItems = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return collectionItems.filter((item) => {
      const matchesCategory =
        activeFilter === 'TODOS' ||
        item.category === activeFilter;

      const searchableText = [
        item.name,
        item.subtitle,
        item.blade,
        item.ratchet,
        item.bit,
        item.categoryDisplay,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return (
        matchesCategory &&
        (!search || searchableText.includes(search))
      );
    });
  }, [collectionItems, activeFilter, searchTerm]);

  const modalCatalog = catalogByType[selectedItemType] || [];

  const filteredModalCatalog = useMemo(() => {
    const search = catalogSearch.trim().toLowerCase();

    if (!search) return modalCatalog;

    return modalCatalog.filter((item) => {
      const text = [
        item.name,
        item.code,
        item.abbreviation,
        item.bey_type_display,
        item.bit_type_display,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return text.includes(search);
    });
  }, [modalCatalog, catalogSearch]);

  const totalBlades = useMemo(
    () =>
      ownedBlades.reduce(
        (total, entry) =>
          total + (Number(entry.quantity) || 0),
        0
      ),
    [ownedBlades]
  );

  const totalPieces = useMemo(() => {
    const lists = [
      ownedBlades,
      ownedRatchets,
      ownedBits,
      ownedAssistBlades,
      ownedLockChips,
    ];

    return lists.reduce(
      (grandTotal, list) =>
        grandTotal +
        list.reduce(
          (total, entry) =>
            total + (Number(entry.quantity) || 0),
          0
        ),
      0
    );
  }, [
    ownedBlades,
    ownedRatchets,
    ownedBits,
    ownedAssistBlades,
    ownedLockChips,
  ]);

  const totalBuilds = builds.length;

  const totalCatalogPieces = useMemo(
    () =>
      Object.keys(TYPE_CONFIG).reduce(
        (total, type) =>
          total + buildVariantGroups(type).length,
        0
      ),
    [catalogByType, catalogReleases]
  );

  const getOwnedConfiguration = (type) => {
    switch (type) {
      case 'BLADE':
        return {
          list: ownedBlades,
          endpoint: 'user-beyblades/',
          relation: 'blade',
          idField: 'blade_id',
          variantRelation: 'variant',
          variantIdField: 'variant_id',
        };

      case 'MAIN_BLADE':
        return {
          list: ownedBlades,
          endpoint: 'user-beyblades/',
          relation: 'blade',
          idField: 'blade_id',
          variantRelation: 'variant',
          variantIdField: 'variant_id',
        };

      case 'RATCHET':
        return {
          list: ownedRatchets,
          endpoint: 'user-bey-ratchets/',
          relation: 'ratchet',
          idField: 'ratchet_id',
          variantRelation: 'variant',
          variantIdField: 'variant_id',
        };

      case 'BIT':
        return {
          list: ownedBits,
          endpoint: 'user-bey-bits/',
          relation: 'bit',
          idField: 'bit_id',
          variantRelation: 'variant',
          variantIdField: 'variant_id',
        };

      case 'ASSIST_BLADE':
        return {
          list: ownedAssistBlades,
          endpoint: 'user-bey-assist-blades/',
          relation: 'assist_blade',
          idField: 'assist_blade_id',
          variantRelation: 'variant',
          variantIdField: 'variant_id',
        };

      case 'LOCK_CHIP':
        return {
          list: ownedLockChips,
          endpoint: 'user-bey-lock-chips/',
          relation: 'lock_chip',
          idField: 'lock_chip_id',
          variantRelation: 'variant',
          variantIdField: 'variant_id',
        };

      default:
        return null;
    }
  };

  const addCatalogPiece = async (
    item,
    type,
    variant = null
  ) => {
    if (!item?.id) return;

    const configuration =
      getOwnedConfiguration(type);

    if (!configuration) return;

    const variantId = variant?.id
      ? Number(variant.id)
      : null;

    const existing = configuration.list.find(
      (entry) => {
        const relation =
          entry[configuration.relation];

        const entryVariant =
          entry[configuration.variantRelation];

        const sameBase =
          Number(relation?.id) === Number(item.id);

        const sameVariant = variantId
          ? Number(entryVariant?.id) === variantId
          : !entryVariant;

        return sameBase && sameVariant;
      }
    );

    if (existing) {
      await api.patch(
        `${configuration.endpoint}${existing.id}/`,
        {
          quantity:
            (Number(existing.quantity) || 1) + 1,
        }
      );
      return;
    }

    const payload = {
      [configuration.idField]: Number(item.id),
      quantity: 1,
    };

    if (variantId) {
      payload[configuration.variantIdField] =
        variantId;
    }

    await api.post(
      configuration.endpoint,
      payload
    );
  };

  const getVariantLabel = (entry, index) => {
    return (
      entry?.variant?.edition_name ||
      entry?.variant?.source_code ||
      entry?.release?.code ||
      `Variante ${index + 1}`
    );
  };

  const openVariantModal = (group) => {
    setSelectedCatalogGroup(group);

    const firstVariant =
      group.variants.find((entry) => entry.image) ||
      group.variants[0] ||
      null;

    setSelectedVariantId(
      firstVariant?.variant?.id
        ? String(firstVariant.variant.id)
        : ''
    );

    setMessage('');
    setShowVariantModal(true);
  };

  const closeVariantModal = () => {
    if (saving) return;

    setShowVariantModal(false);
    setSelectedCatalogGroup(null);
    setSelectedVariantId('');
    setMessage('');
  };

  const selectedVariantEntry = useMemo(() => {
    if (!selectedCatalogGroup) return null;

    return (
      selectedCatalogGroup.variants.find(
        (entry) =>
          String(entry.variant?.id) ===
          String(selectedVariantId)
      ) ||
      selectedCatalogGroup.variants[0] ||
      null
    );
  }, [
    selectedCatalogGroup,
    selectedVariantId,
  ]);

  const selectedVariantImage =
    selectedVariantEntry?.image ||
    selectedCatalogGroup?.image ||
    getImage(selectedCatalogGroup?.item);

  const handleAddSelectedVariant = async () => {
    if (!selectedCatalogGroup?.item?.id) return;

    setSaving(true);
    setMessage('');

    try {
      await addCatalogPiece(
        selectedCatalogGroup.item,
        selectedCatalogGroup.type,
        selectedVariantEntry?.variant || null
      );

      await fetchBeybladeData();

      setMessage(
        `${selectedCatalogGroup.name} adicionada à sua coleção!`
      );

      setTimeout(() => {
        setShowVariantModal(false);
        setSelectedCatalogGroup(null);
        setSelectedVariantId('');
        setMessage('');
      }, 650);
    } catch (error) {
      console.error(
        'Erro ao adicionar variante:',
        error
      );

      setMessage(
        error.response?.data?.detail ||
        error.response?.data?.error ||
        'Não foi possível adicionar essa variante.'
      );
    } finally {
      setSaving(false);
    }
  };

  const resetAddForm = () => {
    setSelectedItemType('BLADE');
    setCatalogSearch('');
    setSelectedCatalogItem('');
    setMessage('');
    setSaving(false);
  };

  const openAddModal = () => {
    resetAddForm();
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    resetAddForm();
  };

  const handleAddItem = async (event) => {
    event.preventDefault();

    if (!selectedCatalogItem) {
      setMessage('Selecione uma peça.');
      return;
    }

    const groups = buildVariantGroups(
      selectedItemType
    );

    const group = groups.find(
      (entry) =>
        Number(entry.id) ===
        Number(selectedCatalogItem)
    );

    if (!group) {
      setMessage('Peça não encontrada.');
      return;
    }

    setShowAddModal(false);
    openVariantModal(group);
  };

  const resetBuildForm = () => {
    setSelectedBlade('');
    setSelectedRatchet('');
    setSelectedBit('');
    setBuildName('');
    setFavorite(false);
    setMessage('');
    setSaving(false);
  };

  const openBuildModal = () => {
    resetBuildForm();
    setShowBuildModal(true);
  };

  const closeBuildModal = () => {
    setShowBuildModal(false);
    resetBuildForm();
  };

  const uniqueOwnedOptions = (
    entries,
    relation
  ) => {
    const map = new Map();

    entries.forEach((entry) => {
      const item = entry?.[relation];

      if (item?.id && !map.has(item.id)) {
        map.set(item.id, item);
      }
    });

    return Array.from(map.values());
  };

  const ownedBladeOptions = useMemo(
    () =>
      uniqueOwnedOptions(
        ownedBlades,
        'blade'
      ),
    [ownedBlades]
  );

  const ownedRatchetOptions = useMemo(
    () =>
      uniqueOwnedOptions(
        ownedRatchets,
        'ratchet'
      ),
    [ownedRatchets]
  );

  const ownedBitOptions = useMemo(
    () =>
      uniqueOwnedOptions(
        ownedBits,
        'bit'
      ),
    [ownedBits]
  );

  const handleCreateBuild = async (event) => {
    event.preventDefault();

    if (
      !selectedBlade ||
      !selectedRatchet ||
      !selectedBit
    ) {
      setMessage(
        'Escolha Blade, Ratchet e Bit.'
      );
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      await api.post('beyblade-builds/', {
        name: buildName.trim() || null,
        blade_id: Number(selectedBlade),
        ratchet_id: Number(selectedRatchet),
        bit_id: Number(selectedBit),
        favorite,
      });

      await fetchBeybladeData();

      setMessage(
        'Build criada com sucesso!'
      );

      setTimeout(() => {
        closeBuildModal();
      }, 650);
    } catch (error) {
      console.error(
        'Erro ao criar build:',
        error
      );

      setMessage(
        error.response?.data?.detail ||
        error.response?.data?.error ||
        'Não foi possível criar a build.'
      );
    } finally {
      setSaving(false);
    }
  };

  const renderCatalogCard = (group) => {
    const config = TYPE_CONFIG[group.type];
    const image = group.image;
    const hasVariants =
      group.variants.length > 0;

    const subtitle =
      (
        group.type === 'BLADE' ||
        group.type === 'MAIN_BLADE'
      )
        ? (
            group.item?.bey_type_display ||
            group.item?.bey_type ||
            config.singular
          )
        : group.type === 'BIT'
          ? [
              group.item?.abbreviation,
              group.item?.bit_type_display ||
                group.item?.bit_type,
            ]
              .filter(Boolean)
              .join(' • ') ||
            config.singular
          : config.singular;

    return (
      <article
        key={`${group.type}-${group.id}`}
        className="beyblade-card beyblade-catalog-piece-card"
        onClick={() => openVariantModal(group)}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (
            event.key === 'Enter' ||
            event.key === ' '
          ) {
            event.preventDefault();
            openVariantModal(group);
          }
        }}
      >
        <div className="beyblade-card-top">
          <span className="beyblade-card-type">
            {config.singular}
          </span>

          {hasVariants && (
            <span className="beyblade-card-spin">
              {group.variants.length}{' '}
              {group.variants.length === 1
                ? 'cor'
                : 'cores'}
            </span>
          )}
        </div>

        <div className="beyblade-card-image">
          {image ? (
            <img
              src={image}
              alt={group.name}
            />
          ) : (
            <div className="beyblade-card-placeholder">
              <Crosshair
                size={70}
                strokeWidth={0.8}
              />
            </div>
          )}
        </div>

        <div className="beyblade-card-info">
          <span>BEYBLADE X</span>

          <strong>
            {group.name}
          </strong>

          <span>
            {subtitle}
          </span>

          <button
            type="button"
            className="beyblade-empty-button"
            onClick={(event) => {
              event.stopPropagation();
              openVariantModal(group);
            }}
          >
            <Sparkles size={17} />
            Ver variantes
          </button>
        </div>
      </article>
    );
  };

  return (
    <div className="beyblade-page">
      <Navbar />

      <main className="beyblade-main">
        <div className="beyblade-container">
          <section className="beyblade-hero">
            <div className="beyblade-hero-grid" />
            <div className="beyblade-speed-line beyblade-speed-line-one" />
            <div className="beyblade-speed-line beyblade-speed-line-two" />
            <div className="beyblade-speed-line beyblade-speed-line-three" />

            <div className="beyblade-hero-orbit">
              <div className="beyblade-hero-orbit-ring" />
              <div className="beyblade-hero-orbit-ring second" />
              <div className="beyblade-hero-core">
                <Crosshair
                  size={72}
                  strokeWidth={1}
                />
              </div>
            </div>

            <div className="beyblade-hero-content">
              <div className="beyblade-eyebrow">
                <Zap size={15} />
                BATTLE COLLECTION
              </div>

              <h1>
                <span className="beyblade-title-small">
                  BEYBLADE
                </span>

                <span className="beyblade-title-x">
                  X
                </span>
              </h1>

              <p>
                Explore cada peça separadamente,
                escolha a cor/variante e organize
                sua coleção.
              </p>

              <div className="beyblade-hero-actions">
                <button
                  type="button"
                  className={
                    viewMode === 'COLLECTION'
                      ? 'beyblade-primary-button'
                      : 'beyblade-secondary-button'
                  }
                  onClick={() => {
                    setViewMode('COLLECTION');
                    setSearchTerm('');
                  }}
                >
                  <Trophy size={18} />
                  Minha coleção
                </button>

                <button
                  type="button"
                  className={
                    viewMode === 'CATALOG'
                      ? 'beyblade-primary-button'
                      : 'beyblade-secondary-button'
                  }
                  onClick={() => {
                    setViewMode('CATALOG');
                    setCatalogCategory('BLADE');
                    setSearchTerm('');
                  }}
                >
                  <Layers3 size={18} />
                  Catálogo completo
                </button>

                {viewMode === 'COLLECTION' && (
                  <button
                    type="button"
                    className="beyblade-secondary-button"
                    onClick={openAddModal}
                  >
                    <Plus size={18} />
                    Adicionar item
                  </button>
                )}

                <button
                  type="button"
                  className="beyblade-secondary-button"
                  onClick={openBuildModal}
                >
                  <Bolt size={18} />
                  Montar Build
                </button>
              </div>
            </div>

            <div className="beyblade-hero-label">
              <span>XTREME</span>
              <strong>ZONE</strong>
            </div>
          </section>

          <section className="beyblade-stats">
            <div className="beyblade-stat-card">
              <div className="beyblade-stat-icon">
                <Disc3 size={21} />
              </div>
              <div>
                <span>BLADES</span>
                <strong>{totalBlades}</strong>
                <small>na coleção</small>
              </div>
            </div>

            <div className="beyblade-stat-card">
              <div className="beyblade-stat-icon">
                <Layers3 size={21} />
              </div>
              <div>
                <span>PEÇAS</span>
                <strong>{totalPieces}</strong>
                <small>no inventário</small>
              </div>
            </div>

            <div className="beyblade-stat-card">
              <div className="beyblade-stat-icon">
                <Bolt size={21} />
              </div>
              <div>
                <span>BUILDS</span>
                <strong>{totalBuilds}</strong>
                <small>montadas</small>
              </div>
            </div>

            <div className="beyblade-stat-card">
              <div className="beyblade-stat-icon">
                <Crosshair size={21} />
              </div>
              <div>
                <span>CATÁLOGO</span>
                <strong>{totalCatalogPieces}</strong>
                <small>peças únicas</small>
              </div>
            </div>
          </section>

          <section className="beyblade-dashboard">
            <aside className="beyblade-sidebar">
              <div className="beyblade-sidebar-header">
                <Target size={20} />
                <div>
                  <span>
                    {viewMode === 'COLLECTION'
                      ? 'INVENTORY'
                      : 'DATABASE'}
                  </span>
                  <strong>Categorias</strong>
                </div>
              </div>

              <div className="beyblade-filters">
                {(viewMode === 'COLLECTION'
                  ? collectionFilters
                  : catalogFilters
                ).map((filter) => {
                  const Icon = filter.icon;

                  const active =
                    viewMode === 'COLLECTION'
                      ? activeFilter === filter.id
                      : catalogCategory === filter.id;

                  return (
                    <button
                      type="button"
                      key={filter.id}
                      className={
                        active
                          ? 'beyblade-filter active'
                          : 'beyblade-filter'
                      }
                      onClick={() => {
                        if (
                          viewMode ===
                          'COLLECTION'
                        ) {
                          setActiveFilter(
                            filter.id
                          );
                        } else {
                          setCatalogCategory(
                            filter.id
                          );
                        }

                        setSearchTerm('');
                      }}
                    >
                      <span className="beyblade-filter-icon">
                        <Icon size={17} />
                      </span>
                      <span>
                        {filter.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="beyblade-sidebar-card">
                <Sparkles size={22} />
                <div>
                  <strong>
                    {viewMode === 'COLLECTION'
                      ? 'Seu inventário'
                      : 'Catálogo por peça'}
                  </strong>

                  <p>
                    {viewMode === 'COLLECTION'
                      ? 'Aqui aparecem somente as peças que você possui.'
                      : 'Blades inteiras e Main Blades ficam separadas. Assist Blades, Lock Chips, Ratchets e Bits aparecem cada um em sua própria categoria.'}
                  </p>
                </div>
              </div>
            </aside>

            <div className="beyblade-content">
              <div className="beyblade-content-header">
                <div>
                  <span>
                    {viewMode === 'COLLECTION'
                      ? 'COLLECTION SELECT'
                      : 'PARTS DATABASE'}
                  </span>

                  <h2>
                    {viewMode === 'COLLECTION'
                      ? 'Meu arsenal'
                      : TYPE_CONFIG[
                          catalogCategory
                        ]?.label ||
                        'Catálogo completo'}
                  </h2>
                </div>

                <label className="beyblade-search">
                  <Search size={18} />
                  <input
                    type="text"
                    value={searchTerm}
                    placeholder={
                      viewMode === 'COLLECTION'
                        ? 'Buscar na minha coleção...'
                        : `Buscar ${
                            TYPE_CONFIG[
                              catalogCategory
                            ]?.singular ||
                            'peça'
                          }...`
                    }
                    onChange={(event) =>
                      setSearchTerm(
                        event.target.value
                      )
                    }
                  />
                </label>
              </div>

              {message &&
                !showVariantModal &&
                !showAddModal &&
                !showBuildModal && (
                  <p className="beyblade-modal-message">
                    {message}
                  </p>
                )}

              {loading ? (
                <div className="beyblade-empty">
                  <div className="beyblade-empty-arena">
                    <LoaderCircle size={62} />
                  </div>
                  <div className="beyblade-empty-content">
                    <span>LOADING</span>
                    <h3>Preparando a arena</h3>
                    <p>Carregando dados.</p>
                  </div>
                </div>
              ) : viewMode === 'COLLECTION' ? (
                filteredCollectionItems.length >
                0 ? (
                  <div className="beyblade-grid">
                    {filteredCollectionItems.map(
                      (item) => (
                        <article
                          key={item.id}
                          className="beyblade-card"
                        >
                          <div className="beyblade-card-top">
                            <span className="beyblade-card-type">
                              {
                                item.categoryDisplay
                              }
                            </span>

                            {item.quantity && (
                              <span className="beyblade-card-spin">
                                x{item.quantity}
                              </span>
                            )}

                            {item.favorite && (
                              <span className="beyblade-card-spin">
                                ★
                              </span>
                            )}
                          </div>

                          <div className="beyblade-card-image">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                              />
                            ) : (
                              <div className="beyblade-card-placeholder">
                                <Crosshair
                                  size={70}
                                  strokeWidth={
                                    0.8
                                  }
                                />
                              </div>
                            )}
                          </div>

                          <div className="beyblade-card-info">
                            <span>
                              BEYBLADE X
                            </span>
                            <strong>
                              {item.name}
                            </strong>
                            <span>
                              {item.subtitle}
                            </span>

                            {item.currentBuild && (
                              <div className="beyblade-build">
                                <span>
                                  {item.blade}
                                </span>
                                <b>
                                  {item.ratchet}
                                </b>
                                <b>
                                  {item.bit}
                                </b>
                              </div>
                            )}
                          </div>
                        </article>
                      )
                    )}
                  </div>
                ) : (
                  <div className="beyblade-empty">
                    <div className="beyblade-empty-arena">
                      <Crosshair
                        size={62}
                        strokeWidth={0.8}
                      />
                    </div>
                    <div className="beyblade-empty-content">
                      <span>READY?</span>
                      <h3>Nenhum item aqui</h3>
                      <p>
                        Adicione peças do catálogo
                        à sua coleção.
                      </p>
                      <button
                        type="button"
                        className="beyblade-empty-button"
                        onClick={openAddModal}
                      >
                        <Plus size={18} />
                        Adicionar item
                      </button>
                    </div>
                  </div>
                )
              ) : filteredCatalogGroups.length >
                0 ? (
                <div className="beyblade-grid">
                  {filteredCatalogGroups.map(
                    renderCatalogCard
                  )}
                </div>
              ) : (
                <div className="beyblade-empty">
                  <div className="beyblade-empty-arena">
                    <Search size={52} />
                  </div>
                  <div className="beyblade-empty-content">
                    <span>DATABASE</span>
                    <h3>Nenhum resultado</h3>
                    <p>
                      Tente outro nome ou peça.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="beyblade-bottom-banner">
            <div>
              <span>NEXT BATTLE</span>
              <strong>
                Monte sua combinação.
              </strong>
            </div>

            <div className="beyblade-bottom-symbol">
              <Zap size={28} />
              X
            </div>
          </section>
        </div>
      </main>

      <Footer />

      {showVariantModal &&
        selectedCatalogGroup && (
          <div
            className="beyblade-modal-backdrop"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeVariantModal();
              }
            }}
          >
            <div className="beyblade-modal beyblade-variant-modal">
              <div className="beyblade-modal-header">
                <div>
                  <span>
                    {
                      TYPE_CONFIG[
                        selectedCatalogGroup.type
                      ]?.singular
                    }{' '}
                    • VARIANTES
                  </span>

                  <h2>
                    {
                      selectedCatalogGroup.name
                    }
                  </h2>
                </div>

                <button
                  type="button"
                  className="beyblade-modal-close"
                  onClick={
                    closeVariantModal
                  }
                  disabled={saving}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="beyblade-variant-layout">
                <div className="beyblade-variant-preview">
                  <div className="beyblade-variant-preview-image">
                    {selectedVariantImage ? (
                      <img
                        src={
                          selectedVariantImage
                        }
                        alt={
                          selectedCatalogGroup.name
                        }
                      />
                    ) : (
                      <div className="beyblade-card-placeholder">
                        <Crosshair
                          size={90}
                          strokeWidth={0.8}
                        />
                      </div>
                    )}
                  </div>

                  <span className="beyblade-variant-preview-kicker">
                    VARIANTE SELECIONADA
                  </span>

                  <strong>
                    {selectedVariantEntry
                      ? getVariantLabel(
                          selectedVariantEntry,
                          selectedCatalogGroup.variants.indexOf(
                            selectedVariantEntry
                          )
                        )
                      : 'Padrão'}
                  </strong>

                  {selectedVariantEntry
                    ?.release?.system && (
                    <small>
                      {
                        selectedVariantEntry
                          .release.system
                      }
                    </small>
                  )}
                </div>

                <div className="beyblade-variant-picker">
                  <div className="beyblade-variant-picker-header">
                    <div>
                      <span>
                        VARIANT SELECT
                      </span>
                      <strong>
                        Escolha a variante
                      </strong>
                    </div>

                    <span className="beyblade-variant-count">
                      {
                        selectedCatalogGroup
                          .variants.length
                      }{' '}
                      opções
                    </span>
                  </div>

                  {selectedCatalogGroup
                    .variants.length > 0 ? (
                    <div className="beyblade-variant-grid">
                      {selectedCatalogGroup.variants.map(
                        (entry, index) => {
                          const active =
                            String(
                              entry.variant?.id
                            ) ===
                            String(
                              selectedVariantId
                            );

                          return (
                            <button
                              key={
                                entry.variant
                                  ?.id ||
                                `${entry.release?.id}-${index}`
                              }
                              type="button"
                              className={
                                active
                                  ? 'beyblade-variant-option active'
                                  : 'beyblade-variant-option'
                              }
                              onClick={() =>
                                setSelectedVariantId(
                                  String(
                                    entry
                                      .variant
                                      ?.id ||
                                      ''
                                  )
                                )
                              }
                            >
                              <div className="beyblade-variant-thumb">
                                {entry.image ? (
                                  <img
                                    src={
                                      entry.image
                                    }
                                    alt={
                                      getVariantLabel(
                                        entry,
                                        index
                                      )
                                    }
                                  />
                                ) : (
                                  <Crosshair
                                    size={28}
                                  />
                                )}
                              </div>

                              <div className="beyblade-variant-option-info">
                                <strong>
                                  {getVariantLabel(
                                    entry,
                                    index
                                  )}
                                </strong>

                                <span>
                                  {[
                                    entry
                                      .release
                                      ?.code,
                                    entry
                                      .release
                                      ?.system,
                                  ]
                                    .filter(
                                      Boolean
                                    )
                                    .join(
                                      ' • '
                                    )}
                                </span>
                              </div>

                              {active && (
                                <Check
                                  size={18}
                                />
                              )}
                            </button>
                          );
                        }
                      )}
                    </div>
                  ) : (
                    <p className="beyblade-modal-message">
                      Essa peça ainda não
                      possui variantes
                      cadastradas.
                    </p>
                  )}

                  {message && (
                    <p className="beyblade-modal-message">
                      {message}
                    </p>
                  )}

                  <button
                    type="button"
                    className="beyblade-modal-submit"
                    onClick={
                      handleAddSelectedVariant
                    }
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <LoaderCircle
                          size={18}
                        />
                        Adicionando...
                      </>
                    ) : (
                      <>
                        <Plus size={18} />
                        Adicionar esta
                        variante
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {showAddModal && (
        <div className="beyblade-modal-backdrop">
          <div className="beyblade-modal">
            <div className="beyblade-modal-header">
              <div>
                <span>
                  COLLECTION ITEM
                </span>
                <h2>Adicionar item</h2>
              </div>

              <button
                type="button"
                className="beyblade-modal-close"
                onClick={closeAddModal}
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="beyblade-modal-form"
              onSubmit={handleAddItem}
            >
              <div className="beyblade-modal-field">
                <label>Tipo de peça</label>
                <select
                  value={selectedItemType}
                  onChange={(event) => {
                    setSelectedItemType(
                      event.target.value
                    );
                    setSelectedCatalogItem('');
                    setCatalogSearch('');
                    setMessage('');
                  }}
                >
                  {itemTypes.map((type) => (
                    <option
                      key={type.id}
                      value={type.id}
                    >
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="beyblade-modal-field">
                <label>
                  Buscar no catálogo
                </label>

                <div className="beyblade-modal-search-input">
                  <Search size={17} />
                  <input
                    type="text"
                    value={catalogSearch}
                    placeholder="Digite o nome da peça..."
                    onChange={(event) =>
                      setCatalogSearch(
                        event.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="beyblade-modal-field">
                <label>Resultado</label>

                <select
                  value={selectedCatalogItem}
                  onChange={(event) =>
                    setSelectedCatalogItem(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Selecione um item
                  </option>

                  {filteredModalCatalog.map(
                    (item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.name}
                        {item.abbreviation
                          ? ` (${item.abbreviation})`
                          : ''}
                      </option>
                    )
                  )}
                </select>
              </div>

              {filteredModalCatalog.length ===
                0 && (
                <p className="beyblade-modal-message">
                  Nenhum item desse tipo foi
                  encontrado no catálogo.
                </p>
              )}

              {message && (
                <p className="beyblade-modal-message">
                  {message}
                </p>
              )}

              <button
                type="submit"
                className="beyblade-modal-submit"
              >
                <Sparkles size={18} />
                Escolher variante
              </button>
            </form>
          </div>
        </div>
      )}

      {showBuildModal && (
        <div className="beyblade-modal-backdrop">
          <div className="beyblade-modal">
            <div className="beyblade-modal-header">
              <div>
                <span>BATTLE BUILD</span>
                <h2>Montar Build</h2>
              </div>

              <button
                type="button"
                className="beyblade-modal-close"
                onClick={closeBuildModal}
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="beyblade-modal-form"
              onSubmit={handleCreateBuild}
            >
              <div className="beyblade-modal-field">
                <label>
                  Nome da build
                </label>
                <input
                  type="text"
                  value={buildName}
                  placeholder="Ex.: Garuda Torneio"
                  onChange={(event) =>
                    setBuildName(
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="beyblade-modal-field">
                <label>Blade</label>
                <select
                  value={selectedBlade}
                  onChange={(event) =>
                    setSelectedBlade(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Selecione
                  </option>
                  {ownedBladeOptions.map(
                    (blade) => (
                      <option
                        key={blade.id}
                        value={blade.id}
                      >
                        {blade.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="beyblade-modal-field">
                <label>Ratchet</label>
                <select
                  value={selectedRatchet}
                  onChange={(event) =>
                    setSelectedRatchet(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Selecione
                  </option>
                  {ownedRatchetOptions.map(
                    (ratchet) => (
                      <option
                        key={ratchet.id}
                        value={ratchet.id}
                      >
                        {ratchet.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="beyblade-modal-field">
                <label>Bit</label>
                <select
                  value={selectedBit}
                  onChange={(event) =>
                    setSelectedBit(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Selecione
                  </option>
                  {ownedBitOptions.map(
                    (bit) => (
                      <option
                        key={bit.id}
                        value={bit.id}
                      >
                        {bit.name}
                        {bit.abbreviation
                          ? ` (${bit.abbreviation})`
                          : ''}
                      </option>
                    )
                  )}
                </select>
              </div>

              <label className="beyblade-modal-checkbox">
                <input
                  type="checkbox"
                  checked={favorite}
                  onChange={(event) =>
                    setFavorite(
                      event.target.checked
                    )
                  }
                />
                <span>
                  Marcar como favorita
                </span>
              </label>

              {message && (
                <p className="beyblade-modal-message">
                  {message}
                </p>
              )}

              <button
                type="submit"
                className="beyblade-modal-submit"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <LoaderCircle
                      size={18}
                    />
                    Montando...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Criar Build
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BeybladePage;