import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  BookOpen,
  BookMarked,
  Library,
  Search,
  Plus,
  Bookmark,
  Glasses,
  Clock3,
  CheckCircle2,
  ChevronRight,
  X,
  ArrowLeft,
  LoaderCircle,
  Check,
} from 'lucide-react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

import api from '../services/api';

import './LibraryPage.css';


function LibraryPage() {
  const [searchTerm, setSearchTerm] =
    useState('');

  const [activeSection, setActiveSection] =
    useState('TODOS');

  const [books, setBooks] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [
    catalogSearchTerm,
    setCatalogSearchTerm,
  ] = useState('');

  const [
    catalogSearchResults,
    setCatalogSearchResults,
  ] = useState([]);

  const [
    searchingCatalog,
    setSearchingCatalog,
  ] = useState(false);

  const [
    selectedCatalogItem,
    setSelectedCatalogItem,
  ] = useState(null);

  const [
    selectedItemType,
    setSelectedItemType,
  ] = useState('LIVRO');

  const [owned, setOwned] =
    useState(true);

  const [
    ownershipType,
    setOwnershipType,
  ] = useState('FISICO');

  const [
    readingStatus,
    setReadingStatus,
  ] = useState('NAO_LIDO');

  const [rating, setRating] =
    useState('');

  const [notes, setNotes] =
    useState('');

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState('');


  const username =
    localStorage.getItem(
      'username'
    );


  const normalizeLibraryEntry =
    (entry) => {
      const item =
        entry?.item || {};

      const authors =
        Array.isArray(
          item.authors
        )
          ? item.authors
          : [];

      const publishers =
        Array.isArray(
          item.publishers
        )
          ? item.publishers
          : [];

      const isbn =
        Array.isArray(
          item.isbn
        )
          ? item.isbn
          : [];

      return {
        id:
          entry.id,

        itemId:
          item.id,

        source:
          item.source,

        sourceId:
          item.source_id,

        sourceDisplay:
          item.source_display,

        title:
          item.title ||
          'Obra sem título',

        subtitle:
          item.subtitle ||
          '',

        seriesName:
          item.series_name ||
          '',

        issueNumber:
          item.issue_number ||
          '',

        country:
          item.country ||
          '',

        author:
          authors.join(', '),

        authors,

        publishers,

        isbn,

        type:
          item.item_type ||
          'LIVRO',

        typeDisplay:
          item.item_type_display,

        coverUrl:
          item.cover_image ||
          item.cover_url ||
          null,

        description:
          item.description ||
          '',

        firstPublishYear:
          item.first_publish_year,

        publicationYear:
          item.publication_year,

        pageCount:
          item.page_count,

        subjects:
          Array.isArray(
            item.subjects
          )
            ? item.subjects
            : [],

        languages:
          Array.isArray(
            item.languages
          )
            ? item.languages
            : [],

        openlibraryKey:
          item.openlibrary_key,

        editionKey:
          item.edition_key,

        owned:
          Boolean(
            entry.owned
          ),

        ownershipType:
          entry.ownership_type,

        ownershipTypeDisplay:
          entry
            .ownership_type_display,

        readingStatus:
          entry.reading_status,

        readingStatusDisplay:
          entry
            .reading_status_display,

        rating:
          entry.rating,

        acquiredAt:
          entry.acquired_at,

        notes:
          entry.notes ||
          '',
      };
    };


  const fetchLibrary =
    async () => {
      setLoading(true);

      try {
        const response =
          await api.get(
            'reading-library/',
            {
              params:
                username
                  ? {
                      username,
                    }
                  : {},
            }
          );

        const data =
          response.data.results ||
          response.data;

        const normalized =
          Array.isArray(
            data
          )
            ? data.map(
                normalizeLibraryEntry
              )
            : [];

        setBooks(
          normalized
        );

      } catch (error) {
        console.error(
          'Erro ao carregar biblioteca:',
          error
        );

        setBooks([]);

      } finally {
        setLoading(false);
      }
    };


  useEffect(() => {
    fetchLibrary();
  }, []);


  const filteredBooks =
    useMemo(() => {
      const normalizedSearch =
        searchTerm
          .trim()
          .toLowerCase();

      return books.filter(
        (book) => {
          const matchesSearch =
            !normalizedSearch ||
            book.title
              ?.toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            book.seriesName
              ?.toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            book.author
              ?.toLowerCase()
              .includes(
                normalizedSearch
              );

          const matchesSection =
            activeSection ===
              'TODOS' ||
            book.readingStatus ===
              activeSection;

          return (
            matchesSearch &&
            matchesSection
          );
        }
      );
    }, [
      books,
      searchTerm,
      activeSection,
    ]);


  const ownedBooks =
    useMemo(() => {
      return books.filter(
        (book) =>
          book.owned
      );
    }, [books]);


  const readingBooks =
    useMemo(() => {
      return books.filter(
        (book) =>
          book.readingStatus ===
          'LENDO'
      );
    }, [books]);


  const readBooks =
    useMemo(() => {
      return books.filter(
        (book) =>
          book.readingStatus ===
          'LIDO'
      );
    }, [books]);


  const unreadBooks =
    useMemo(() => {
      return books.filter(
        (book) =>
          book.owned &&
          book.readingStatus ===
            'NAO_LIDO'
      );
    }, [books]);


  const sections = [
    {
      id: 'TODOS',
      label: 'Minha estante',
      icon: Library,
      count: ownedBooks.length,
    },
    {
      id: 'LENDO',
      label: 'Lendo agora',
      icon: Glasses,
      count: readingBooks.length,
    },
    {
      id: 'LIDO',
      label: 'Já li',
      icon: CheckCircle2,
      count: readBooks.length,
    },
    {
      id: 'NAO_LIDO',
      label: 'Ainda não li',
      icon: Clock3,
      count: unreadBooks.length,
    },
  ];


  const getStatusLabel =
    (status) => {
      const labels = {
        NAO_LIDO:
          'Não lido',

        LENDO:
          'Lendo',

        LIDO:
          'Lido',

        PAUSADO:
          'Pausado',

        QUERO_LER:
          'Quero ler',
      };

      return (
        labels[status] ||
        status
      );
    };


  const getBookTypeLabel =
    (type) => {
      const labels = {
        LIVRO:
          'Livro',

        MANGA:
          'Mangá',

        HQ:
          'HQ',

        REVISTA:
          'Revista',

        OUTRO:
          'Outro',
      };

      return (
        labels[type] ||
        type
      );
    };


  const getSourceLabel =
    (source) => {
      const labels = {
        OPEN_LIBRARY:
          'Open Library',

        GCD:
          'Grand Comics Database',

        COMIC_VINE:
          'Comic Vine',

        GOOGLE_BOOKS:
          'Google Books',

        MANUAL:
          'Cadastro manual',
      };

      return (
        labels[source] ||
        source ||
        'Catálogo'
      );
    };


  const resetAddModal =
    () => {
      setShowAddModal(false);

      setCatalogSearchTerm('');

      setCatalogSearchResults([]);

      setSelectedCatalogItem(null);

      setSelectedItemType(
        'LIVRO'
      );

      setOwned(true);

      setOwnershipType(
        'FISICO'
      );

      setReadingStatus(
        'NAO_LIDO'
      );

      setRating('');

      setNotes('');

      setMessage('');

      setSaving(false);
    };


  const searchCatalog =
    async (event) => {
      event.preventDefault();

      const query =
        catalogSearchTerm
          .trim();

      if (!query) {
        setMessage(
          'Digite um título, autor, ISBN ou número da edição.'
        );

        return;
      }

      setSearchingCatalog(true);

      setMessage('');

      setSelectedCatalogItem(null);

      setCatalogSearchResults([]);

      try {
        const response =
          await api.get(
            'library-catalog/search/',
            {
              params: {
                q: query,
              },
            }
          );

        const data =
          response.data?.items ||
          response.data?.results ||
          response.data;

        setCatalogSearchResults(
          Array.isArray(
            data
          )
            ? data
            : []
        );

        const errors =
          response.data?.errors;

        if (
          Array.isArray(errors) &&
          errors.length > 0 &&
          (
            !Array.isArray(data) ||
            data.length === 0
          )
        ) {
          const errorText =
            errors
              .map(
                (item) =>
                  `${getSourceLabel(
                    item.source
                  )}: ${
                    item.error ||
                    'erro na pesquisa'
                  }`
              )
              .join(' | ');

          setMessage(
            errorText
          );
        }

      } catch (error) {
        console.error(
          'Erro ao pesquisar catálogo:',
          error
        );

        setCatalogSearchResults([]);

        setMessage(
          error.response
            ?.data
            ?.error ||
          'Não foi possível pesquisar os catálogos.'
        );

      } finally {
        setSearchingCatalog(false);
      }
    };


  const selectCatalogItem =
    (item) => {
      setSelectedCatalogItem(
        item
      );

      setSelectedItemType(
        item.item_type ||
        (
          item.source ===
          'GCD'
            ? 'HQ'
            : 'LIVRO'
        )
      );

      setOwned(true);

      setOwnershipType(
        'FISICO'
      );

      setReadingStatus(
        'NAO_LIDO'
      );

      setRating('');

      setNotes('');

      setMessage('');
    };


  const saveLibraryItem =
    async () => {
      if (
        !selectedCatalogItem
      ) {
        return;
      }

      const source =
        selectedCatalogItem.source ||
        (
          selectedCatalogItem
            .openlibrary_key
            ? 'OPEN_LIBRARY'
            : null
        );

      if (!source) {
        setMessage(
          'Essa obra não possui uma fonte válida.'
        );

        return;
      }

      setSaving(true);

      setMessage('');

      const commonData = {
        item_type:
          selectedItemType,

        owned,

        ownership_type:
          owned
            ? ownershipType
            : null,

        reading_status:
          readingStatus,

        rating:
          rating !== ''
            ? Number(
                rating
              )
            : null,

        notes:
          notes.trim() ||
          null,
      };

      try {
        if (
          source ===
          'GCD'
        ) {
          const sourceId =
            selectedCatalogItem
              .source_id ||
            selectedCatalogItem
              .gcd_id;

          if (!sourceId) {
            setMessage(
              'Essa HQ não possui uma identificação válida do GCD.'
            );

            setSaving(false);

            return;
          }

          await api.post(
            'library-catalog/import-gcd/',
            {
              source_id:
                sourceId,

              ...commonData,
            }
          );

        } else if (
          source ===
          'OPEN_LIBRARY'
        ) {
          if (
            !selectedCatalogItem
              .openlibrary_key
          ) {
            setMessage(
              'Essa obra não possui uma identificação válida da Open Library.'
            );

            setSaving(false);

            return;
          }

          await api.post(
            'library-catalog/import-open-library/',
            {
              openlibrary_key:
                selectedCatalogItem
                  .openlibrary_key,

              edition_key:
                selectedCatalogItem
                  .edition_key ||
                null,

              ...commonData,
            }
          );

        } else {
          setMessage(
            `A importação pela fonte ${getSourceLabel(
              source
            )} ainda não está configurada.`
          );

          setSaving(false);

          return;
        }

        setMessage(
          'Obra salva com sucesso!'
        );

        await fetchLibrary();

        setTimeout(() => {
          resetAddModal();
        }, 700);

      } catch (error) {
        console.error(
          'Erro ao salvar obra:',
          error
        );

        const responseData =
          error.response?.data;

        let errorMessage =
          responseData?.error ||
          'Não foi possível salvar a obra.';

        if (
          !responseData?.error &&
          responseData &&
          typeof responseData ===
            'object'
        ) {
          const firstValue =
            Object.values(
              responseData
            )[0];

          if (
            Array.isArray(
              firstValue
            )
          ) {
            errorMessage =
              firstValue[0];

          } else if (
            typeof firstValue ===
            'string'
          ) {
            errorMessage =
              firstValue;
          }
        }

        setMessage(
          errorMessage
        );

      } finally {
        setSaving(false);
      }
    };


  return (
    <div className="library-page">

      <Navbar />


      <main className="library-main">

        <div className="library-container">


          <header className="library-hero">

            <div className="library-hero-decoration">

              <BookOpen
                size={160}
                strokeWidth={0.7}
              />

            </div>


            <div className="library-hero-content">

              <div className="library-eyebrow">

                <BookMarked
                  size={15}
                />

                ACERVO PESSOAL

              </div>


              <h1>
                Minha
                <span>
                  Biblioteca
                </span>
              </h1>


              <p>
                Livros, quadrinhos,
                mangás e histórias que
                fazem parte da minha
                coleção.
              </p>

            </div>


            <button
              type="button"
              className="library-add-button"
              onClick={() =>
                setShowAddModal(
                  true
                )
              }
            >

              <Plus
                size={18}
              />

              Adicionar obra

            </button>

          </header>


          <section className="library-counter-strip">

            <div className="library-counter">

              <span>
                ACERVO
              </span>

              <strong>
                {
                  ownedBooks.length
                }
              </strong>

              <small>
                obras na coleção
              </small>

            </div>


            <div className="library-counter">

              <span>
                LEITURA
              </span>

              <strong>
                {
                  readingBooks.length
                }
              </strong>

              <small>
                lendo atualmente
              </small>

            </div>


            <div className="library-counter">

              <span>
                CONCLUÍDOS
              </span>

              <strong>
                {
                  readBooks.length
                }
              </strong>

              <small>
                obras lidas
              </small>

            </div>


            <div className="library-counter">

              <span>
                NA ESTANTE
              </span>

              <strong>
                {
                  unreadBooks.length
                }
              </strong>

              <small>
                aguardando leitura
              </small>

            </div>

          </section>


          <section className="library-room">


            <aside className="library-catalog">

              <div className="library-catalog-title">

                <Library
                  size={18}
                />

                <div>

                  <span>
                    CATÁLOGO
                  </span>

                  <strong>
                    Seções
                  </strong>

                </div>

              </div>


              <nav className="library-catalog-nav">

                {sections.map(
                  (section) => {
                    const Icon =
                      section.icon;

                    return (
                      <button
                        type="button"
                        key={
                          section.id
                        }
                        className={
                          activeSection ===
                          section.id
                            ? 'library-catalog-item active'
                            : 'library-catalog-item'
                        }
                        onClick={() =>
                          setActiveSection(
                            section.id
                          )
                        }
                      >

                        <span className="library-catalog-icon">

                          <Icon
                            size={17}
                          />

                        </span>


                        <span className="library-catalog-label">

                          {
                            section.label
                          }

                        </span>


                        <span className="library-catalog-count">

                          {
                            section.count
                          }

                        </span>


                        <ChevronRight
                          size={14}
                          className="library-catalog-arrow"
                        />

                      </button>
                    );
                  }
                )}

              </nav>


              <div className="library-catalog-note">

                <Bookmark
                  size={18}
                />

                <p>
                  Ter uma obra na
                  coleção não significa
                  que ela já foi lida.
                </p>

              </div>

            </aside>


            <div className="library-shelves-area">


              <div className="library-shelves-header">

                <div>

                  <span>
                    {
                      sections.find(
                        (section) =>
                          section.id ===
                          activeSection
                      )?.label
                    }
                  </span>

                  <h2>
                    Estante
                  </h2>

                </div>


                <label className="library-search">

                  <Search
                    size={17}
                  />

                  <input
                    type="text"
                    value={
                      searchTerm
                    }
                    placeholder="Procurar título ou autor..."
                    onChange={(
                      event
                    ) =>
                      setSearchTerm(
                        event
                          .target
                          .value
                      )
                    }
                  />

                </label>

              </div>


              {loading ? (
                <div className="library-empty-shelf">

                  <div className="library-empty-message">

                    <LoaderCircle
                      size={30}
                    />

                    <div>

                      <strong>
                        Carregando estante
                      </strong>

                      <p>
                        Buscando suas obras...
                      </p>

                    </div>

                  </div>


                  <div className="library-shelf-board">
                  </div>

                  <div className="library-shelf-shadow">
                  </div>

                </div>
              ) : filteredBooks.length >
              0 ? (
                <div className="library-shelf">


                  <div className="library-books">

                    {filteredBooks.map(
                      (book) => (
                        <button
                          type="button"
                          key={
                            book.id
                          }
                          className="library-book"
                        >

                          <span className="library-book-cover">

                            {book.coverUrl ? (
                              <img
                                src={
                                  book.coverUrl
                                }
                                alt={
                                  book.title
                                }
                              />
                            ) : (
                              <span className="library-book-placeholder">

                                <BookOpen
                                  size={38}
                                />

                              </span>
                            )}


                            <span className="library-book-status">

                              {
                                getStatusLabel(
                                  book
                                    .readingStatus
                                )
                              }

                            </span>

                          </span>


                          <span className="library-book-info">

                            <small>
                              {
                                getBookTypeLabel(
                                  book.type
                                )
                              }
                            </small>

                            <strong>
                              {
                                book.issueNumber
                                  ? `${book.title} #${book.issueNumber}`
                                  : book.title
                              }
                            </strong>

                            <span>
                              {
                                book.author ||
                                book.publisher ||
                                'Autor não informado'
                              }
                            </span>

                          </span>

                        </button>
                      )
                    )}

                  </div>


                  <div className="library-shelf-board">
                  </div>

                  <div className="library-shelf-shadow">
                  </div>

                </div>
              ) : (
                <div className="library-empty-shelf">


                  <div className="library-empty-books">

                    <span>
                    </span>

                    <span>
                    </span>

                    <span>
                    </span>

                    <span>
                    </span>

                    <span>
                    </span>

                  </div>


                  <div className="library-empty-message">

                    <BookOpen
                      size={30}
                    />

                    <div>

                      <strong>
                        Esta estante está
                        vazia
                      </strong>

                      <p>
                        As obras
                        cadastradas vão
                        aparecer aqui.
                      </p>

                    </div>

                  </div>


                  <div className="library-shelf-board">
                  </div>

                  <div className="library-shelf-shadow">
                  </div>

                </div>
              )}

            </div>

          </section>

        </div>

      </main>


      <Footer />


      {showAddModal && (
        <div className="library-modal-backdrop">

          <div className="library-modal">


            <div className="library-modal-header">

              <div>

                <span>
                  CATÁLOGO DE OBRAS
                </span>

                <h2>
                  Adicionar obra
                </h2>

              </div>


              <button
                type="button"
                className="library-modal-close"
                onClick={
                  resetAddModal
                }
                aria-label="Fechar"
              >

                <X
                  size={20}
                />

              </button>

            </div>


            {!selectedCatalogItem ? (
              <>

                <form
                  className="library-modal-search"
                  onSubmit={
                    searchCatalog
                  }
                >

                  <Search
                    size={18}
                  />

                  <input
                    type="text"
                    value={
                      catalogSearchTerm
                    }
                    placeholder="Título, autor, ISBN ou edição..."
                    onChange={(
                      event
                    ) =>
                      setCatalogSearchTerm(
                        event
                          .target
                          .value
                      )
                    }
                  />


                  <button
                    type="submit"
                    disabled={
                      searchingCatalog
                    }
                  >

                    {searchingCatalog ? (
                      <>
                        <LoaderCircle
                          size={17}
                        />

                        Buscando
                      </>
                    ) : (
                      'Buscar'
                    )}

                  </button>

                </form>


                {searchingCatalog ? (
                  <div className="library-modal-loading">

                    <LoaderCircle
                      size={26}
                    />

                    <span>
                      Pesquisando nos
                      catálogos...
                    </span>

                  </div>
                ) : (
                  <div className="library-modal-results">

                    {catalogSearchResults.map(
                      (
                        item,
                        index
                      ) => (
                        <button
                          type="button"
                          key={
                            `${
                              item.source ||
                              'UNKNOWN'
                            }-${
                              item.source_id ||
                              item.openlibrary_key ||
                              item.edition_key ||
                              index
                            }`
                          }
                          className="library-modal-result"
                          onClick={() =>
                            selectCatalogItem(
                              item
                            )
                          }
                        >

                          <span className="library-modal-result-cover">

                            {item.cover_url ? (
                              <img
                                src={
                                  item.cover_url
                                }
                                alt={
                                  item.title
                                }
                              />
                            ) : (
                              <span className="library-modal-no-cover">

                                <BookOpen
                                  size={42}
                                />

                              </span>
                            )}

                          </span>


                          <span className="library-modal-result-info">

                            <small>
                              {
                                getSourceLabel(
                                  item.source
                                )
                              }
                            </small>

                            <strong>
                              {
                                item.issue_number
                                  ? `${item.title} #${item.issue_number}`
                                  : item.title
                              }
                            </strong>

                            <span>
                              {
                                Array.isArray(
                                  item.authors
                                ) &&
                                item.authors
                                  .length >
                                  0
                                  ? item.authors
                                      .join(
                                        ', '
                                      )
                                  : item.series_name ||
                                    'Autor não informado'
                              }
                            </span>

                            <small>
                              {
                                item.publication_year ||
                                item.first_publish_year ||
                                'Ano desconhecido'
                              }

                              {
                                item.country
                                  ? ` • ${item.country}`
                                  : ''
                              }
                            </small>

                          </span>

                        </button>
                      )
                    )}

                  </div>
                )}


                {!searchingCatalog &&
                  catalogSearchTerm &&
                  catalogSearchResults.length ===
                    0 &&
                  !message && (
                    <div className="library-modal-empty">

                      <BookOpen
                        size={28}
                      />

                      <span>
                        Nenhuma obra
                        encontrada.
                      </span>

                    </div>
                  )}


                {message && (
                  <p className="library-modal-message">

                    {message}

                  </p>
                )}

              </>
            ) : (
              <>

                <button
                  type="button"
                  className="library-modal-back"
                  onClick={() => {
                    setSelectedCatalogItem(
                      null
                    );

                    setMessage('');
                  }}
                >

                  <ArrowLeft
                    size={17}
                  />

                  Voltar para resultados

                </button>


                <div className="library-modal-selected">


                  <div className="library-modal-selected-cover">

                    {selectedCatalogItem
                      .cover_url ? (
                      <img
                        src={
                          selectedCatalogItem
                            .cover_url
                        }
                        alt={
                          selectedCatalogItem
                            .title
                        }
                      />
                    ) : (
                      <div className="library-modal-no-cover">

                        <BookOpen
                          size={60}
                        />

                      </div>
                    )}

                  </div>


                  <div className="library-modal-selected-info">

                    <span className="library-modal-year">
                      {
                        getSourceLabel(
                          selectedCatalogItem
                            .source
                        )
                      }
                      {' • '}
                      {
                        selectedCatalogItem
                          .publication_year ||
                        selectedCatalogItem
                          .first_publish_year ||
                        'ANO DESCONHECIDO'
                      }
                    </span>


                    <h2>
                      {
                        selectedCatalogItem
                          .issue_number
                          ? `${
                              selectedCatalogItem
                                .title
                            } #${
                              selectedCatalogItem
                                .issue_number
                            }`
                          : selectedCatalogItem
                              .title
                      }
                    </h2>


                    <p className="library-modal-author">
                      {
                        Array.isArray(
                          selectedCatalogItem
                            .authors
                        ) &&
                        selectedCatalogItem
                          .authors
                          .length >
                          0
                          ? selectedCatalogItem
                              .authors
                              .join(
                                ', '
                              )
                          : selectedCatalogItem
                              .series_name ||
                            'Autor não informado'
                      }
                    </p>


                    <div className="library-modal-field">

                      <label>
                        Tipo da obra
                      </label>

                      <select
                        value={
                          selectedItemType
                        }
                        onChange={(
                          event
                        ) =>
                          setSelectedItemType(
                            event
                              .target
                              .value
                          )
                        }
                      >

                        <option value="LIVRO">
                          Livro
                        </option>

                        <option value="MANGA">
                          Mangá
                        </option>

                        <option value="HQ">
                          HQ
                        </option>

                        <option value="REVISTA">
                          Revista
                        </option>

                        <option value="OUTRO">
                          Outro
                        </option>

                      </select>

                    </div>


                    <label className="library-modal-checkbox">

                      <input
                        type="checkbox"
                        checked={
                          owned
                        }
                        onChange={(
                          event
                        ) =>
                          setOwned(
                            event
                              .target
                              .checked
                          )
                        }
                      />

                      <span>
                        Tenho essa obra
                      </span>

                    </label>


                    {owned && (
                      <div className="library-modal-field">

                        <label>
                          Formato
                        </label>

                        <select
                          value={
                            ownershipType
                          }
                          onChange={(
                            event
                          ) =>
                            setOwnershipType(
                              event
                                .target
                                .value
                            )
                          }
                        >

                          <option value="FISICO">
                            Físico
                          </option>

                          <option value="DIGITAL">
                            Digital
                          </option>

                        </select>

                      </div>
                    )}


                    <div className="library-modal-field">

                      <label>
                        Status de leitura
                      </label>

                      <select
                        value={
                          readingStatus
                        }
                        onChange={(
                          event
                        ) =>
                          setReadingStatus(
                            event
                              .target
                              .value
                          )
                        }
                      >

                        <option value="NAO_LIDO">
                          Não lido
                        </option>

                        <option value="LENDO">
                          Lendo
                        </option>

                        <option value="LIDO">
                          Lido
                        </option>

                        <option value="PAUSADO">
                          Pausado
                        </option>

                        <option value="QUERO_LER">
                          Quero ler
                        </option>

                      </select>

                    </div>


                    <div className="library-modal-field">

                      <label>
                        Minha nota
                      </label>

                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={
                          rating
                        }
                        placeholder="0 a 10"
                        onChange={(
                          event
                        ) =>
                          setRating(
                            event
                              .target
                              .value
                          )
                        }
                      />

                    </div>


                    <div className="library-modal-field">

                      <label>
                        Anotações
                      </label>

                      <textarea
                        value={
                          notes
                        }
                        placeholder="Alguma observação sobre esta obra..."
                        onChange={(
                          event
                        ) =>
                          setNotes(
                            event
                              .target
                              .value
                          )
                        }
                      />

                    </div>


                    <button
                      type="button"
                      className="library-modal-save"
                      onClick={
                        saveLibraryItem
                      }
                      disabled={
                        saving
                      }
                    >

                      {saving ? (
                        <>

                          <LoaderCircle
                            size={18}
                          />

                          Salvando...

                        </>
                      ) : (
                        <>

                          <Check
                            size={18}
                          />

                          Salvar obra

                        </>
                      )}

                    </button>


                    {message && (
                      <p className="library-modal-message">

                        {message}

                      </p>
                    )}

                  </div>

                </div>

              </>
            )}

          </div>

        </div>
      )}

    </div>
  );
}


export default LibraryPage;