import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { eventApi } from '../../api/eventApi'
import { toast } from 'react-hot-toast'
import useDebounce from '../../hooks/useDebounce'
import '../../style/DashboardPublisher.css'

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
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z" />
    <path d="M13 5v14" strokeDasharray="3 3" />
  </svg>
)

const UsersIcon = () => (
  <svg viewBox='0 0 24 24' fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const RevenueIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="2" />
    <path d="M6 12h.01M18 12h.01" />
  </svg>
)

const StockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4h14a2 2 0 0 1 2 2v2a3 3 0 0 0 0 6v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a3 3 0 0 0 0-6V6a2 2 0 0 1 2-2z" opacity="0.4" />
    <path d="M3 8h14a2 2 0 0 1 2 2v2a3 3 0 0 0 0 6v2a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-2a3 3 0 0 0 0-6V10a2 2 0 0 1 2-2z" />
    <path d="M11 8v10" strokeDasharray="2 2" />
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

const MOCK_EVENTS = [
  {
    id: 'mock-1',
    title: 'Coldplay – Music of the Spheres World Tour Jakarta',
    category: 'Music',
    description: 'Nonton Coldplay secara langsung di Gelora Bung Karno! Rasakan pengalaman konser tak terlupakan bersama ribuan penonton.',
    date: '2026-11-15T20:00',
    location: 'GBK Main Stadium, Jakarta',
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=900&auto=format&fit=crop',
    price: 2500000,
    capacity: 60000,
    sold: 41500,
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mock-2',
    title: 'Indonesia Tech Summit 2026',
    category: 'Conference',
    description: 'Konferensi teknologi terbesar di Asia Tenggara. Bergabunglah bersama para pemimpin industri, inovator, dan developer terbaik.',
    date: '2026-08-20T09:00',
    location: 'Jakarta Convention Center, Senayan',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&auto=format&fit=crop',
    price: 750000,
    capacity: 5000,
    sold: 3810,
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  // {
  //   id: 'mock-3',
  //   title: 'Java Jazz Festival 2026',
  //   category: 'Music',
  //   description: 'Festival jazz internasional yang menghadirkan musisi kelas dunia di Kota Jakarta.',
  //   date: '2026-10-03T17:00',
  //   location: 'Jakarta International Expo, Kemayoran',
  //   image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=900&auto=format&fit=crop',
  //   price: 550000,
  //   capacity: 20000,
  //   sold: 12800,
  //   status: 'published',
  //   createdAt: new Date().toISOString(),
  // },
]

const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0)
const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
const formatTime = (d) => new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
const loadMock = () => { const s = localStorage.getItem('pub_events'); return s ? JSON.parse(s) : null }
const saveMock = (data) => localStorage.setItem('pub_events', JSON.stringify(data))


// Function Utama
export default function PublisherDashboard() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500) // Setting timer debounce
  const [filterCat, setFilterCat] = useState('All')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['pub-events'],
    queryFn: async () => {
      try {
        const res = await eventApi.getPublisherEvents()
        if (res?.success && Array.isArray(res?.data)) return res.data
        throw new Error('Data tidak valid')
      } catch (err) {
        const local = loadMock()
        if (!local) {
          saveMock(MOCK_EVENTS);
          return MOCK_EVENTS
        }
        return local;
      }
    },
    staleTime: 30000,
  })

  // Stats
  const stats = useMemo(() => ({
    total: events.length,
    sold: events.reduce((s, e) => s + Number(e.sold || 0), 0),
    revenue: events.reduce((s, e) => s + Number(e.sold || 0) * Number(e.price || 0), 0),
    stock: events.reduce((s, e) => s + Math.max(0, Number(e.capacity || e.quota || 0) - Number(e.sold || 0)), 0),
  }), [events])

  // Filtered
  const filtered = useMemo(() => events.filter(e => {
    const q = debouncedSearch.toLowerCase()
    const matchQ = !q || e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q)
    const matchC = filterCat === 'All' || e.category === filterCat
    return matchQ && matchC
  }), [events, debouncedSearch, filterCat])



  // Function untuk hapus
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      try {
        const res = await eventApi.deleteEvent(id)
        if (res?.success) return true
        throw new Error()
      } catch {
        const curr = loadMock() || []
        saveMock(curr.filter(e => e.id !== id))
        return true
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pub-events'] })
      setDeleteTarget(null)
      toast.success('Event berhasil dihapus.')
    },
    onError: () => toast.error('Gagal menghapus event.'),
  })

  // Page utama HTML
  return (
    <div className="pd">

      {/* Header */}
      <header className="pd-header">
        <div className="pd-header__left">
          {/* <p className="pd-header__eyebrow">Dashboard Publisher</p> */}
          <h1 className="pd-header__title">Kelola Event &amp; Tiket</h1>
          <p className="pd-header__sub">Publikasikan event, atur tiket, dan pantau penjualan secara real-time.</p>
        </div>
        {/* <Link to="/publisher/events/create" className="pd-btn pd-btn--primary pd-btn--lg">
          Buat Acara Baru
        </Link> */}
      </header>


      {/* Ringkasan statistik */}
      <div className="pd-stats">
        <div className="pd-stat">
          <div className="pd-stat__icon"><CalendarIcon /></div>
          <div className="pd-stat__info">
            <span className="pd-stat__num">{stats.total}</span>
            <span className="pd-stat__lbl">Total Event</span>
          </div>
        </div>
        <div className="pd-stat">
          <div className="pd-stat__icon"><TicketIcon /></div>
          <div className="pd-stat__info">
            <span className="pd-stat__num">{stats.sold.toLocaleString('id-ID')}</span>
            <span className="pd-stat__lbl">Tiket Terjual</span>
          </div>
        </div>
        <div className="pd-stat">
          <div className="pd-stat__icon"><RevenueIcon /></div>
          <div className="pd-stat__info">
            <span className="pd-stat__num pd-stat__num--sm">{formatRupiah(stats.revenue)}</span>
            <span className="pd-stat__lbl">Total Pendapatan</span>
          </div>
        </div>
        <div className="pd-stat">
          <div className="pd-stat__icon"><StockIcon /></div>
          <div className="pd-stat__info">
            <span className="pd-stat__num">{stats.stock.toLocaleString('id-ID')}</span>
            <span className="pd-stat__lbl">Total Sisa Kuota</span>
          </div>
        </div>
      </div>


      {/* Toolbar */}
      <div className="pd-toolbar">
        <div className="pd-search">
          <span className="pd-search__icon">
            <img src="/assets/search.png" alt ="Search" />    
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
              : 'Klik "Tambah Event" untuk memulai membuat dan menjual tiket'}
          </p>
          {!search && filterCat === 'All' && (
            <Link to="/publisher/events/create" className="pd-btn pd-btn--primary">
              <span className="pd-btn__icon"><PlusIcon /></span>
              Tambah Event Pertama
            </Link>
          )}
        </div>
      ) : (
        <div className="pd-event-grid">
          {filtered.map(event => {
            const sold = Number(event.sold || 0)
            const cap = Number(event.capacity || event.quota || 0)
            const pct = cap > 0 ? Math.min((sold / cap) * 100, 100) : 0
            const isFull = cap > 0 && sold >= cap
            const isHot = pct >= 75 && !isFull
            const catClr = CAT_COLORS[event.category] || '#64748b'

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
                  {/* Top row badges */}
                  <div className="pd-card__top">
                    <span className="pd-badge pd-badge--cat" style={{ '--cat-clr': catClr }}>
                      {CAT_EMOJI[event.category]} {event.category}
                    </span>
                    <div className="pd-card__top-right">
                      {isFull && <span className="pd-badge pd-badge--full">SOLD OUT</span>}
                      {isHot && <span className="pd-badge pd-badge--hot">HOT</span>}
                    </div>
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

                  {/* Price + Capacity row */}
                  <div className="pd-card__kpi-row">
                    <div className="pd-card__kpi">
                      <span className="pd-card__kpi-lbl">Harga Tiket</span>
                      <span className="pd-card__kpi-val pd-card__kpi-val--price">{formatRupiah(event.price)}</span>
                    </div>
                    <div className="pd-card__kpi">
                      <span className="pd-card__kpi-lbl">Tersedia</span>
                      {/* Variabel .quota menampilkan sisa tiket yang tersedia */}
                      <span className="pd-card__kpi-val">{Number(event.quota).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="pd-card__kpi">
                      <span className="pd-card__kpi-lbl">Terjual</span>
                      <span className="pd-card__kpi-val pd-card__kpi-val--sold">{sold.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="pd-card__progress">
                    <div className="pd-card__progress-head">
                      <span>Progress Penjualan</span>
                      <span className="pd-card__progress-pct">{Math.round(pct)}%</span>
                    </div>
                    <div className="pd-card__progress-track">
                      <div
                        className={`pd-card__progress-fill ${isHot ? 'pd-card__progress-fill--hot' : ''} ${isFull ? 'pd-card__progress-fill--full' : ''}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="pd-card__progress-lbl">
                      {/* Variabel cap menampilkan seluruh kapasitas tiket dari awal dibuat oleh publisher */}
                      {sold.toLocaleString('id-ID')} dari {Number(cap).toLocaleString('id-ID')} tiket
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="pd-card__footer">
                  {/* <span className={`pd-status-badge pd-status-badge--${event.status || 'published'}`}>
                    {event.status === 'draft' ? 'Draft' : 'Dipublikasikan'}
                  </span> */}
                  <div className="pd-card__actions">
                    <Link
                      to={`/publisher/events/update/${event.id}`}
                      state={{ event }}
                      className="pd-icon-btn pd-icon-btn--edit"
                      title="Edit Event"
                      id={`btn-edit-${event.id}`}
                    >
                      <EditIcon /> Edit
                    </Link>
                    <button
                      className="pd-icon-btn pd-icon-btn--del"
                      onClick={() => setDeleteTarget(event)}
                      title="Hapus Event"
                      id={`btn-delete-${event.id}`}
                    >
                      <TrashIcon /> Hapus
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
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

