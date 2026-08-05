import { useState, useMemo, useRef, useEffect } from 'react'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { eventApi } from '../../api/eventApi'
import { toast } from 'react-hot-toast'
import useDebounce from '../../hooks/useDebounce'
import '../../style/DashboardUser.css'

// ===== Icons =====
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14M5 12h14" />
  </svg>
)

const EditIcon = () => (
  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

const TrashIcon = () => (
  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
)

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const MapPinIcon = () => (
  <svg viewBox='0 0 24 24' fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
)

const TicketIcon = () => (
  <svg viewBox='0 0 24 24' fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 12v1a2 2 0 0 0-2-2V10a2 2 0 0 0 2-2zm12-6H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z" /><polyline points="7 10 9 12 17 4" />
  </svg>
)

const UsersIcon = () => (
  <svg viewBox='0 0 24 24' fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 12v1a2 2 0 0 0-2-2V10a2 2 0 0 0 2-2zm12-6H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z" /><polyline points="7 10 9 12 17 4" />
  </svg>
)

const RevenueIcon = () => (
  <svg viewBox='0 0 24 24' fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 12v1a2 2 0 0 0-2-2V10a2 2 0 0 0 2-2zm12-6H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z" /><polyline points="7 10 9 12 17 4" />
  </svg>
)

const StockIcon = () => (
  <svg viewBox='0 0 24 24' fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 12v1a2 2 0 0 0-2-2V10a2 2 0 0 0 2-2zm12-6H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z" /><polyline points="7 10 9 12 17 4" />
  </svg>
)

const SearchIcon = () => (
  <svg viewBox='0 0 24 24' fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 12v1a2 2 0 0 0-2-2V10a2 2 0 0 0 2-2zm12-6H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z" /><polyline points="7 10 9 12 17 4" />
  </svg>
)

const CloseIcon = () => (
  <svg viewBox='0 0 24 24' fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 12v1a2 2 0 0 0-2-2V10a2 2 0 0 0 2-2zm12-6H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z" /><polyline points="7 10 9 12 17 4" />
  </svg>
)

const AlertIcon = () => (
  <svg viewBox='0 0 24 24' fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 12v1a2 2 0 0 0-2-2V10a2 2 0 0 0 2-2zm12-6H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z" /><polyline points="7 10 9 12 17 4" />
  </svg>
)

const CATEGORIES = ['Musik', 'Seminar', 'Seni', 'Festival']
const CAT_COLORS = {
  Music: '', Musik: '',
  Conference: '', Seminar: '',
  Workshop: '',
  Sports: '',
  Art: '', Seni: '',
  Festival: '',
  Other: ''
}

const CAT_EMOJI = {
  Music: '', Musik: '',
  Conference: '', Seminar: '',
  Workshop: '',
  Sports: '',
  Art: '', Seni: '',
  Festival: '',
  Other: ''
}

const DEFAULT_IMAGES = {
  Music: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=900&auto=format&fit=crop',
  Musik: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=900&auto=format&fit=crop',
  Conference: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&auto=format&fit=crop',
  Seminar: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&auto=format&fit=crop',
  Workshop: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=900&auto=format&fit=crop',
  Sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=900&auto=format&fit=crop',
  Art: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=900&auto=format&fit=crop',
  Seni: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=900&auto=format&fit=crop',
  Festival: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&auto=format&fit=crop',
  Other: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&auto=format&fit=crop',
}

const EMPTY_FORM = {
  title: '', category: 'Musik', date: '', location: '',
  description: '', image: '', price: '', capacity: '',
}

const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0)
const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
const formatTime = (d) => new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
const loadMock = () => { const s = localStorage.getItem('pub_events'); return s ? JSON.parse(s) : null }
const saveMock = (data) => localStorage.setItem('pub_events', JSON.stringify(data))


// Function Utama
export default function UserDashboard() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500) // setting timer debounce
  const [filterCat, setFilterCat] = useState('All')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const bottomRef = useRef(null)

  const {
    data: eventsData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['user-events'],
    queryFn: async ({ pageParam }) => {
      try {
        const res = await eventApi.getUserEvents(pageParam)
        if (res?.success && Array.isArray(res?.data)) return res
        throw new Error('Data tidak valid')
      } catch (err) {
        if (pageParam === 1) {
          const local = loadMock()
          if (!local) {
            saveMock(MOCK_EVENTS)
            return { data: MOCK_EVENTS, pagination: { has_more: false } }
          }
          return { data: local, pagination: { has_more: false } }
        }
        throw err
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage?.pagination?.has_more) {
        return (lastPage.pagination.current_page || 1) + 1
      }
      return undefined
    },
    staleTime: 30000,
  })

  const events = useMemo(
    () => eventsData?.pages.flatMap((page) => page.data ?? []) ?? [],
    [eventsData]
  )

  // auto-fetch halaman berikutnya saat scroll ke bawah
  // IntersectionObserver infinit pagination
  useEffect(() => {
    const el = bottomRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // Filter untuk debounce dan menghilangkan event expired & sold out dari tampilan
  // Ketika user melakukan search (debounce) maka event expired & sold out akan tampil
  const filtered = useMemo(() => events.filter(e => {
    const q = debouncedSearch.trim().toLowerCase()

    const matchQ = !q || e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q)
    const matchC = filterCat === 'All' || e.category === filterCat

    // EXPIRED
    // mengecek apakah event expired dengan memanggil flag is_expired dari service backend
    const today = new Date().toISOString().split('T')[0]
    const isExpired = e.is_expired !== undefined
      ? e.is_expired
      : (e.date ? e.date.substring(0, 10) < today : false)

    // SOLD OUT 
    // mengecek apakah event sold out (tiket habis terjual)
    const sold = Number(e.sold || 0)
    const cap = Number(e.capacity || 0)
    const quota = Number(e.quota ?? 0)
    const isSoldOut = (cap > 0 && sold >= cap) || (e.quota !== undefined && quota <= 0)

    // Jika user tidak melakukan pencarian di search bar (!q), sembunyikan event yang sudah expired atau sold out
    // Jika debounce digunakan (user melakukan pencarian) maka program menampilkan event yang sudah expired / sold out
    if (!q && (isExpired || isSoldOut)) {
      return false
    }

    return matchQ && matchC
  }), [events, debouncedSearch, filterCat])


  // Page utama HTML
  return (
    <div className="pd">

      {/* Toolbar filter dan search bar */}
      <div className="pd-toolbar">
        <div className="pd-search">
          <span className="pd-search__icon">
            <img src="/assets/search.png" alt="Search" />
          </span>
          <input
            id="event-search"
            type="text"
            className="pd-search__input"
            placeholder="Cari nama event atau lokasi…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="pd-filters">
          {['All', ...CATEGORIES].map(cat => (
            <button
              key={cat}
              className={`pd-filter-btn ${filterCat === cat ? 'pd-filter-btn--active' : ''}`}
              onClick={() => setFilterCat(cat)}
            >
              {cat !== 'All' && <span className="pd-filter-btn__dot" style={{ background: CAT_COLORS[cat] }} />}
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tampilan Daftar Event */}
      {isLoading ? (
        <div className="pd-loading">
          <div className="pd-spinner" />
          <span>Memuat data event</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="pd-empty">
          <div className="pd-empty__icon">
            <img src="/assets/no-results.png" alt="Empty" />
          </div>
          <h3>Data tidak ditemukan</h3>
          <p>
            {search || filterCat !== 'All'
              ? 'Silahkan ubah filter pencarian Anda'
              : ''}
          </p>
        </div>
      ) : (
        <div className="pd-event-grid">
          {filtered.map(event => {
            const sold = Number(event.sold || 0)
            const cap = Number(event.capacity || event.quota || 0)
            const pct = cap > 0 ? Math.min((sold / cap) * 100, 100) : 0
            const isFull = (cap > 0 && sold >= cap) || (event.quota !== undefined && Number(event.quota) <= 0)            
            const catClr = CAT_COLORS[event.category] || '#64748b'

            // Mengambil tanggal hari ini
            const today = new Date().toISOString().split('T')[0]
            const isExpired = event.is_expired !== undefined
              ? event.is_expired
              : (event.date ? event.date.substring(0, 10) < today : false) // Jiika tgl event sudah melewati hari ini maka set false

            return (
              <article className="pd-card" key={event.id}>
                {/* Banner */}
                <div className="pd-card__banner">
                  <img
                    src={event.image_url || event.image || DEFAULT_IMAGES[event.category] || DEFAULT_IMAGES.Other}
                    alt={event.title}
                    className="pd-card__img"
                    onError={e => { e.target.src = DEFAULT_IMAGES.Other }}
                  />
                  <div className="pd-card__banner-overlay" />

                  {/* Setting background agar blur ketika event expired atau sold out */}
                  {(isExpired || isFull) && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      zIndex: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(0, 0, 0, 0.45)',
                      backdropFilter: 'blur(1px)'
                    }} />
                  )}

                  {/* Top row badges */}
                  <div className="pd-card__top">
                    <span className="pd-badge pd-badge--cat" style={{ '--cat-clr': catClr }}>
                      {CAT_EMOJI[event.category]} {event.category}
                    </span>
                  </div>
                  {/* Title overlay */}
                  <div className="pd-card__banner-footer">
                    <h3 className="pd-card__title">{event.title}</h3>
                  </div>
                </div>

                {/* Body */}
                <div className="pd-card__body">
                  <p className="pd-card__desc">{event.description || '—'}</p>

                  <div className="pd-card__metas">
                    <div className="pd-card__meta">
                      <span className="pd-card__meta-icon pd-card__meta-icon--indigo"><CalendarIcon /></span>
                      <span>{formatDate(event.date)} · {formatTime(event.date)}</span>
                    </div>
                    <div className="pd-card__meta">
                      <span className="pd-card__meta-icon pd-card__meta-icon--rose"><MapPinIcon /></span>
                      <span className="pd-card__meta-loc">{event.location}</span>
                    </div>
                  </div>

                  {/* harga dan kapasitas */}
                  <div className="pd-card__kpiuser-row">
                    <div className="pd-card__kpiuser">
                      <span className="pd-card__kpiuser-lbl">Harga Tiket</span>
                      <span className="pd-card__kpiuser-val pd-card__kpiuser-val--price">{formatRupiah(event.price)}</span>
                    </div>
                    <div className="pd-card__kpiuser">
                      <span className="pd-card__kpiuser-lbl">Tersedia</span>
                      <span className="pd-card__kpiuser-val">{Number(event.quota).toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  {/* setting tombol jika event kadaluarsa atau sold out */}
                  {isExpired ? (
                    <button
                      type="button"
                      disabled
                      className="pd-purchase-btn-centered"
                      style={{
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        borderColor: '#dc2626',
                        color: '#ffffff',
                        cursor: 'not-allowed',
                        opacity: 0.9
                      }}
                    >
                      Event Kadaluarsa
                    </button>

                    // setting tombol jika event sudah penuh
                  ) : isFull ? (
                    <button
                      type="button"
                      disabled
                      className="pd-purchase-btn-centered"
                      style={{
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        borderColor: '#dc2626',
                        color: '#ffffff',
                        cursor: 'not-allowed',
                        opacity: 0.9
                      }}
                    >
                      Event Habis
                    </button>
                    // Jika event belum kadaluarsa dan belum penuh maka tampilkan tombol beli tiket
                    // kemudian direct ke pembelian
                  ) : (
                    <Link
                      to={`/user/pembelian/${event.id}`}
                      state={{ event }}
                      className="pd-purchase-btn-centered"
                      title="Beli Tiket"
                      id={`btn-purchase-${event.id}`}
                    >
                      <img src="/assets/cart.png" alt="Cart" className="pd-purchase-btn-icon" />
                      Beli Tiket
                    </Link>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* Sentinel element untuk trigger infinite scroll */}
      <div ref={bottomRef} className="h-1" />

      {/* Spinner saat load halaman berikutnya */}
      {isFetchingNextPage && (
        <div className="pd-loading">
          <div className="pd-spinner" />
          <span>Memuat event lainnya...</span>
        </div>
      )}

      {/* Pesan ketika semua event sudah dimuat */}
      {!hasNextPage && events.length > 0 && (
        <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#94a3b8', fontSize: '0.875rem' }}>
          Semua event telah dimuat
        </div>
      )}


      {/* Konfirmasi ketika publisher ingin menghapus event */}
      {deleteTarget && (
        <div className="pd-overlay">
          <div className="pd-modal pd-modal--sm" role="dialog">
            <div className="pd-confirm">
              <div className="pd-confirm__icon">
                <AlertIcon />
              </div>
              <h3 className="pd-confirm__title">Hapus Event?</h3>
              <p className="pd-confirm__msg">
                Event <strong>"{deleteTarget.title}"</strong> akan dihapus secara permanen.
                Semua data penjualan tiket terkait juga akan hilang. Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="pd-confirm__actions">
                <button
                  className="pd-btn pd-btn--ghost"
                  onClick={() => setDeleteTarget(null)}
                  id="btn-cancel-delete"
                >
                  Batal
                </button>
                <button
                  className="pd-btn pd-btn--danger"
                  onClick={() => deleteMutation.mutate(deleteTarget.id)}
                  disabled={deleteMutation.isPending}
                  id="btn-confirm-delete"
                >
                  {deleteMutation.isPending
                    ? <><span className="pd-btn__spinner" /> Menghapus…</>
                    : <><span className="pd-btn__icon"><TrashIcon /></span> Ya, Hapus</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

