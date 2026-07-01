import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventApi } from '../../api/eventApi'
import { toast } from 'react-hot-toast'
import './Dashboard.css'

/* ─── Inline SVG Icons ─────────────────────────────────────── */
const PlusIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" /><path d="M12 5v14" />
    </svg>
)
const EditIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
)
const TrashIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
)
const CalendarIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
)
const MapPinIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
)
const TicketIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" /><path d="M13 5v14" />
    </svg>
)
const UsersIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
)
const RevenueIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
)
const StockIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
)
const SearchIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
)
const CloseIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
)
const AlertIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <triangle points="10.29 3.86 1.82 18 22.18 18" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
)

/* ─── Constants ────────────────────────────────────────────── */
const CATEGORIES = ['Music', 'Conference', 'Workshop', 'Sports', 'Art', 'Festival', 'Other']
const CAT_COLORS = {
    Music: '#7c3aed', Conference: '#0284c7', Workshop: '#0891b2',
    Sports: '#16a34a', Art: '#db2777', Festival: '#ea580c', Other: '#64748b'
}
const CAT_EMOJI = {
    Music: '🎵', Conference: '💼', Workshop: '🔧',
    Sports: '⚽', Art: '🎨', Festival: '🎪', Other: '✨'
}
const DEFAULT_IMAGES = {
    Music: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=900&auto=format&fit=crop',
    Conference: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&auto=format&fit=crop',
    Workshop: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=900&auto=format&fit=crop',
    Sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=900&auto=format&fit=crop',
    Art: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=900&auto=format&fit=crop',
    Festival: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&auto=format&fit=crop',
    Other: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&auto=format&fit=crop',
}

const EMPTY_FORM = {
    title: '', category: 'Music', date: '', location: '',
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
    {
        id: 'mock-3',
        title: 'Java Jazz Festival 2026',
        category: 'Music',
        description: 'Festival jazz internasional yang menghadirkan musisi kelas dunia di Kota Jakarta.',
        date: '2026-10-03T17:00',
        location: 'Jakarta International Expo, Kemayoran',
        image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=900&auto=format&fit=crop',
        price: 550000,
        capacity: 20000,
        sold: 12800,
        status: 'published',
        createdAt: new Date().toISOString(),
    },
]

/* ─── Helpers ─────────────────────────────────────────────── */
const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0)
const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
const formatTime = (d) => new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
const loadMock = () => { const s = localStorage.getItem('pub_events'); return s ? JSON.parse(s) : null }
const saveMock = (data) => localStorage.setItem('pub_events', JSON.stringify(data))

/* ═══════════════════════════════════════════════════════════ */
export default function PublisherDashboard() {
    const qc = useQueryClient()

    /* State */
    const [search, setSearch] = useState('')
    const [filterCat, setFilterCat] = useState('All')
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editTarget, setEditTarget] = useState(null)   // null = create mode
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [formErrors, setFormErrors] = useState({})

    /* ── Fetch ── */
    const { data: events = [], isLoading } = useQuery({
        queryKey: ['pub-events'],
        queryFn: async () => {
            try {
                const res = await eventApi.getPublisherEvents()
                if (res?.success && Array.isArray(res.data)) return res.data
                throw new Error('bad response')
            } catch {
                const local = loadMock()
                if (!local) { saveMock(MOCK_EVENTS); return MOCK_EVENTS }
                return local
            }
        },
        staleTime: 30000,
    })

    /* ── Stats ── */
    const stats = useMemo(() => ({
        total: events.length,
        sold: events.reduce((s, e) => s + Number(e.sold || 0), 0),
        revenue: events.reduce((s, e) => s + Number(e.sold || 0) * Number(e.price || 0), 0),
        stock: events.reduce((s, e) => s + Math.max(0, Number(e.capacity || 0) - Number(e.sold || 0)), 0),
    }), [events])

    /* ── Filtered ── */
    const filtered = useMemo(() => events.filter(e => {
        const q = search.toLowerCase()
        const matchQ = !q || e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q)
        const matchC = filterCat === 'All' || e.category === filterCat
        return matchQ && matchC
    }), [events, search, filterCat])

    /* ── Create ── */
    const createMutation = useMutation({
        mutationFn: async (data) => {
            try {
                const res = await eventApi.createEvent(data)
                if (res?.success) return res.data
                throw new Error()
            } catch {
                const curr = loadMock() || []
                const newEvent = { ...data, id: 'loc-' + Date.now(), sold: 0, status: 'published', createdAt: new Date().toISOString() }
                saveMock([newEvent, ...curr])
                return newEvent
            }
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['pub-events'] })
            closeForm()
            toast.success('✅ Event berhasil dipublikasikan!')
        },
        onError: () => toast.error('Gagal membuat event.'),
    })

    /* ── Update ── */
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            try {
                const res = await eventApi.updateEvent(id, data)
                if (res?.success) return res.data
                throw new Error()
            } catch {
                const curr = loadMock() || []
                saveMock(curr.map(e => e.id === id ? { ...e, ...data } : e))
                return { ...data, id }
            }
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['pub-events'] })
            closeForm()
            toast.success('✅ Event berhasil diperbarui!')
        },
        onError: () => toast.error('Gagal memperbarui event.'),
    })

    /* ── Delete ── */
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

    /* ── Form helpers ── */
    const openCreate = () => {
        setEditTarget(null)
        setForm(EMPTY_FORM)
        setFormErrors({})
        setIsFormOpen(true)
    }

    const openEdit = (event) => {
        setEditTarget(event)
        setForm({
            title: event.title || '',
            category: event.category || 'Music',
            date: event.date ? event.date.substring(0, 16) : '',
            location: event.location || '',
            description: event.description || '',
            image: event.image || '',
            price: event.price || '',
            capacity: event.capacity || '',
        })
        setFormErrors({})
        setIsFormOpen(true)
    }

    const closeForm = () => {
        setIsFormOpen(false)
        setEditTarget(null)
        setForm(EMPTY_FORM)
        setFormErrors({})
    }

    const setField = (k, v) => setForm(p => ({ ...p, [k]: v }))

    const validate = () => {
        const e = {}
        if (!form.title.trim()) e.title = 'Nama event wajib diisi.'
        if (!form.date) e.date = 'Tanggal & waktu wajib diisi.'
        if (!form.location.trim()) e.location = 'Lokasi wajib diisi.'
        if (!form.price || Number(form.price) < 0) e.price = 'Harga tiket tidak valid.'
        if (!form.capacity || Number(form.capacity) < 1) e.capacity = 'Kapasitas minimal 1.'
        setFormErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = (ev) => {
        ev.preventDefault()
        if (!validate()) return
        const payload = {
            ...form,
            price: Number(form.price),
            capacity: Number(form.capacity),
            image: form.image.trim() || DEFAULT_IMAGES[form.category] || DEFAULT_IMAGES.Other,
        }
        if (editTarget) {
            updateMutation.mutate({ id: editTarget.id, data: payload })
        } else {
            createMutation.mutate(payload)
        }
    }

    const isSaving = createMutation.isPending || updateMutation.isPending

    /* ─────────────────────────────────────────────────────────── */
    return (
        <div className="pd">

            {/* ══ PAGE HEADER ══════════════════════════════════════════ */}
            <header className="pd-header">
                <div className="pd-header__left">
                    <p className="pd-header__eyebrow">Publisher Dashboard</p>
                    <h1 className="pd-header__title">Kelola Event &amp; Tiket</h1>
                    <p className="pd-header__sub">Publikasikan event, atur tiket, dan pantau penjualan secara real-time.</p>
                </div>
                <button className="pd-btn pd-btn--primary pd-btn--lg" onClick={openCreate} id="btn-create-event">
                    <span className="pd-btn__icon"><PlusIcon /></span>
                    Tambah Event
                </button>
            </header>

            {/* ══ STATS STRIP ══════════════════════════════════════════ */}
            <div className="pd-stats">
                <div className="pd-stat pd-stat--blue">
                    <div className="pd-stat__icon"><CalendarIcon /></div>
                    <div className="pd-stat__info">
                        <span className="pd-stat__num">{stats.total}</span>
                        <span className="pd-stat__lbl">Total Event</span>
                    </div>
                </div>
                <div className="pd-stat pd-stat--green">
                    <div className="pd-stat__icon"><UsersIcon /></div>
                    <div className="pd-stat__info">
                        <span className="pd-stat__num">{stats.sold.toLocaleString('id-ID')}</span>
                        <span className="pd-stat__lbl">Tiket Terjual</span>
                    </div>
                </div>
                <div className="pd-stat pd-stat--amber">
                    <div className="pd-stat__icon"><RevenueIcon /></div>
                    <div className="pd-stat__info">
                        <span className="pd-stat__num pd-stat__num--sm">{formatRupiah(stats.revenue)}</span>
                        <span className="pd-stat__lbl">Total Pendapatan</span>
                    </div>
                </div>
                <div className="pd-stat pd-stat--violet">
                    <div className="pd-stat__icon"><StockIcon /></div>
                    <div className="pd-stat__info">
                        <span className="pd-stat__num">{stats.stock.toLocaleString('id-ID')}</span>
                        <span className="pd-stat__lbl">Sisa Stok</span>
                    </div>
                </div>
            </div>

            {/* ══ TOOLBAR ══════════════════════════════════════════════ */}
            <div className="pd-toolbar">
                <div className="pd-search">
                    <span className="pd-search__icon"><SearchIcon /></span>
                    <input
                        id="event-search"
                        type="text"
                        className="pd-search__input"
                        placeholder="Cari nama event atau lokasi…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className="pd-search__clear" onClick={() => setSearch('')}>
                            <CloseIcon />
                        </button>
                    )}
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
            {/* dfdfddddddddddddddddd */}
            {/* ══ EVENT LISTING ═══════════════════════════════════════ */}
            {isLoading ? (
                <div className="pd-loading">
                    <div className="pd-spinner" />
                    <span>Memuat data event…</span>
                </div>
            ) : filtered.length === 0 ? (
                <div className="pd-empty">
                    <div className="pd-empty__icon"><TicketIcon /></div>
                    <h3>Tidak ada event ditemukan</h3>
                    <p>
                        {search || filterCat !== 'All'
                            ? 'Coba ubah filter pencarian Anda.'
                            : 'Klik "Tambah Event" untuk mulai membuat dan menjual tiket event Anda.'}
                    </p>
                    {!search && filterCat === 'All' && (
                        <button className="pd-btn pd-btn--primary" onClick={openCreate}>
                            <span className="pd-btn__icon"><PlusIcon /></span>
                            Tambah Event Pertama
                        </button>
                    )}
                </div>
            ) : (
                <div className="pd-event-grid">
                    {filtered.map(event => {
                        const sold = Number(event.sold || 0)
                        const cap = Number(event.capacity || 0)
                        const pct = cap > 0 ? Math.min((sold / cap) * 100, 100) : 0
                        const isFull = cap > 0 && sold >= cap
                        const isHot = pct >= 75 && !isFull
                        const catClr = CAT_COLORS[event.category] || '#64748b'

                        return (
                            <article className="pd-card" key={event.id}>
                                {/* Banner */}
                                <div className="pd-card__banner">
                                    <img
                                        src={event.image || DEFAULT_IMAGES[event.category] || DEFAULT_IMAGES.Other}
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
                                            {isHot && <span className="pd-badge pd-badge--hot">🔥 HOT</span>}
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
                                            <span className="pd-card__kpi-lbl">Kapasitas</span>
                                            <span className="pd-card__kpi-val">{Number(event.capacity).toLocaleString('id-ID')}</span>
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
                                            {sold.toLocaleString('id-ID')} dari {Number(cap).toLocaleString('id-ID')} tiket
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="pd-card__footer">
                                    <span className={`pd-status-badge pd-status-badge--${event.status || 'published'}`}>
                                        {event.status === 'draft' ? '📝 Draft' : '✅ Dipublikasikan'}
                                    </span>
                                    <div className="pd-card__actions">
                                        <button
                                            className="pd-icon-btn pd-icon-btn--edit"
                                            onClick={() => openEdit(event)}
                                            title="Edit Event"
                                            id={`btn-edit-${event.id}`}
                                        >
                                            <EditIcon /> Edit
                                        </button>
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

            {/* ══ CREATE / EDIT MODAL ══════════════════════════════════ */}
            {isFormOpen && (
                <div className="pd-overlay" onClick={e => e.target === e.currentTarget && closeForm()}>
                    <div className="pd-modal" role="dialog" aria-modal="true">
                        {/* Modal header */}
                        <div className="pd-modal__header">
                            <div className="pd-modal__header-left">
                                <div className="pd-modal__header-icon">
                                    {editTarget ? <EditIcon /> : <PlusIcon />}
                                </div>
                                <div>
                                    <h2 className="pd-modal__title">
                                        {editTarget ? 'Edit Event' : 'Tambah Event Baru'}
                                    </h2>
                                    <p className="pd-modal__sub">
                                        {editTarget
                                            ? 'Perbarui informasi event yang sudah dipublikasikan.'
                                            : 'Isi seluruh informasi event dan harga tiket untuk mulai berjualan.'}
                                    </p>
                                </div>
                            </div>
                            <button className="pd-modal__close" onClick={closeForm} id="btn-close-modal">
                                <CloseIcon />
                            </button>
                        </div>

                        {/* Modal form body */}
                        <form className="pd-modal__body" onSubmit={handleSubmit} noValidate>
                            {/* Section: Info Dasar */}
                            <section className="pd-form-section">
                                <h3 className="pd-form-section__title">
                                    <span className="pd-form-section__num">1</span>
                                    Informasi Dasar
                                </h3>
                                <div className="pd-form-grid">
                                    {/* Nama Event */}
                                    <div className={`pd-field pd-field--full ${formErrors.title ? 'pd-field--error' : ''}`}>
                                        <label className="pd-field__label" htmlFor="f-title">Nama Event <span className="pd-req">*</span></label>
                                        <input
                                            id="f-title"
                                            className="pd-field__input"
                                            type="text"
                                            placeholder="Contoh: Jazz & Coffee Night 2026"
                                            value={form.title}
                                            onChange={e => setField('title', e.target.value)}
                                        />
                                        {formErrors.title && <p className="pd-field__err">{formErrors.title}</p>}
                                    </div>

                                    {/* Kategori */}
                                    <div className="pd-field">
                                        <label className="pd-field__label" htmlFor="f-category">Kategori <span className="pd-req">*</span></label>
                                        <select
                                            id="f-category"
                                            className="pd-field__input pd-field__input--select"
                                            value={form.category}
                                            onChange={e => setField('category', e.target.value)}
                                        >
                                            {CATEGORIES.map(c => <option key={c} value={c}>{CAT_EMOJI[c]} {c}</option>)}
                                        </select>
                                    </div>

                                    {/* Tanggal */}
                                    <div className={`pd-field ${formErrors.date ? 'pd-field--error' : ''}`}>
                                        <label className="pd-field__label" htmlFor="f-date">Tanggal &amp; Waktu <span className="pd-req">*</span></label>
                                        <input
                                            id="f-date"
                                            className="pd-field__input"
                                            type="datetime-local"
                                            value={form.date}
                                            onChange={e => setField('date', e.target.value)}
                                        />
                                        {formErrors.date && <p className="pd-field__err">{formErrors.date}</p>}
                                    </div>

                                    {/* Lokasi */}
                                    <div className={`pd-field pd-field--full ${formErrors.location ? 'pd-field--error' : ''}`}>
                                        <label className="pd-field__label" htmlFor="f-location">Lokasi / Venue <span className="pd-req">*</span></label>
                                        <input
                                            id="f-location"
                                            className="pd-field__input"
                                            type="text"
                                            placeholder="Contoh: Istora Senayan, Jakarta Pusat"
                                            value={form.location}
                                            onChange={e => setField('location', e.target.value)}
                                        />
                                        {formErrors.location && <p className="pd-field__err">{formErrors.location}</p>}
                                    </div>

                                    {/* Deskripsi */}
                                    <div className="pd-field pd-field--full">
                                        <label className="pd-field__label" htmlFor="f-desc">Deskripsi Event</label>
                                        <textarea
                                            id="f-desc"
                                            className="pd-field__input pd-field__input--textarea"
                                            placeholder="Deskripsikan detail event, pengisi acara, dan informasi penting lainnya…"
                                            rows="4"
                                            value={form.description}
                                            onChange={e => setField('description', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Section: Tiket & Harga */}
                            <section className="pd-form-section">
                                <h3 className="pd-form-section__title">
                                    <span className="pd-form-section__num">2</span>
                                    Tiket &amp; Kapasitas
                                </h3>
                                <div className="pd-form-grid">
                                    <div className={`pd-field ${formErrors.price ? 'pd-field--error' : ''}`}>
                                        <label className="pd-field__label" htmlFor="f-price">Harga Tiket (IDR) <span className="pd-req">*</span></label>
                                        <div className="pd-field__prefix-wrap">
                                            <span className="pd-field__prefix">Rp</span>
                                            <input
                                                id="f-price"
                                                className="pd-field__input pd-field__input--prefix"
                                                type="number"
                                                min="0"
                                                placeholder="0"
                                                value={form.price}
                                                onChange={e => setField('price', e.target.value)}
                                            />
                                        </div>
                                        {formErrors.price && <p className="pd-field__err">{formErrors.price}</p>}
                                    </div>

                                    <div className={`pd-field ${formErrors.capacity ? 'pd-field--error' : ''}`}>
                                        <label className="pd-field__label" htmlFor="f-capacity">Kapasitas Total <span className="pd-req">*</span></label>
                                        <input
                                            id="f-capacity"
                                            className="pd-field__input"
                                            type="number"
                                            min="1"
                                            placeholder="Contoh: 5000"
                                            value={form.capacity}
                                            onChange={e => setField('capacity', e.target.value)}
                                        />
                                        {formErrors.capacity && <p className="pd-field__err">{formErrors.capacity}</p>}
                                    </div>
                                </div>
                            </section>

                            {/* Section: Gambar */}
                            <section className="pd-form-section">
                                <h3 className="pd-form-section__title">
                                    <span className="pd-form-section__num">3</span>
                                    Gambar Banner <span className="pd-form-section__opt">(opsional)</span>
                                </h3>
                                <div className="pd-form-grid">
                                    <div className="pd-field pd-field--full">
                                        <label className="pd-field__label" htmlFor="f-image">URL Gambar</label>
                                        <input
                                            id="f-image"
                                            className="pd-field__input"
                                            type="url"
                                            placeholder="https://images.unsplash.com/photo-… (kosongkan untuk gambar default)"
                                            value={form.image}
                                            onChange={e => setField('image', e.target.value)}
                                        />
                                        <p className="pd-field__hint">Kosongkan untuk menggunakan gambar default sesuai kategori.</p>
                                    </div>
                                    {(form.image || DEFAULT_IMAGES[form.category]) && (
                                        <div className="pd-field pd-field--full">
                                            <p className="pd-field__label">Preview</p>
                                            <div className="pd-img-preview">
                                                <img
                                                    src={form.image || DEFAULT_IMAGES[form.category]}
                                                    alt="preview"
                                                    onError={e => { e.target.src = DEFAULT_IMAGES.Other }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Modal footer */}
                            <div className="pd-modal__footer">
                                <button type="button" className="pd-btn pd-btn--ghost" onClick={closeForm} id="btn-cancel-form">
                                    Batal
                                </button>
                                <button type="submit" className="pd-btn pd-btn--primary" disabled={isSaving} id="btn-submit-form">
                                    {isSaving ? (
                                        <><span className="pd-btn__spinner" /> Menyimpan…</>
                                    ) : editTarget ? (
                                        <><span className="pd-btn__icon"><EditIcon /></span> Simpan Perubahan</>
                                    ) : (
                                        <><span className="pd-btn__icon"><PlusIcon /></span> Publikasikan Event</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ══ DELETE CONFIRMATION MODAL ════════════════════════════ */}
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
