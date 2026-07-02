import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { eventApi } from '../../api/eventApi'
import { toast } from 'react-hot-toast'
import './Dashboard.css'

// Inline Icons
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" /><path d="M12 5v14" />
  </svg>
)

const CATEGORIES = ['Musik', 'Seminar', 'Seni', 'Festival']

// Import gambar default yang digunakan ketika publisher tidak mengisi gambar preview
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
const CAT_EMOJI = {
  Music: '', Musik: '',
  Conference: '', Seminar: '',
  Workshop: '',
  Sports: '',
  Art: '', Seni: '',
  Festival: '',
  Other: ''
}

const EMPTY_FORM = {
  title: '', category: 'Musik', date: '', location: '',
  description: '', image: '', price: '', capacity: '',
}

const loadMock = () => { const s = localStorage.getItem('pub_events'); return s ? JSON.parse(s) : null }
const saveMock = (data) => localStorage.setItem('pub_events', JSON.stringify(data))

// Function membuat event baru
export default function CreateEvent() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})

  const createMutation = useMutation({
    mutationFn: async (data) => {
      try {
        const res = await eventApi.createEvent(data)
        if (res?.success) return res.data
        throw new Error()
      } catch (err) {
        const curr = loadMock() || []
        const newEvent = { ...data, id: 'loc-' + Date.now(), sold: 0, status: 'published', createdAt: new Date().toISOString() }
        saveMock([newEvent, ...curr])
        throw err
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pub-events'] })
      toast.success('Event berhasil dibuat')
      navigate('/publisher/dashboard')
    },
    onError: () => toast.error('Gagal membuat event')
  })

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
      title: form.title,
      category: form.category,
      date: form.date,
      location: form.location,
      description: form.description,
      price: Number(form.price),
      quota: Number(form.capacity),
      image_url: form.image.trim() || DEFAULT_IMAGES[form.category] || DEFAULT_IMAGES.Other,
    }
    createMutation.mutate(payload)
  }

  const isSaving = createMutation.isPending

  return (
    <div className="pd-create-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>
      <header className="pd-create-header" style={{ marginBottom: '24px' }}>
        <h1 className="text-2xl font-bold text-gray-900">Tambah Event Baru</h1>
        <p className="text-sm text-gray-500 mt-1">Isi seluruh informasi event dan kapasitas tiket untuk mulai menjual.</p>
      </header>

      <form className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" onSubmit={handleSubmit} noValidate>
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
                placeholder="Contoh: Konser Jomlofest 2026"
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
                placeholder="Contoh: Stadion Mandala Krida, Yogyakarta"
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
                placeholder="Deskripsikan detail event, pengisi acara, dan informasi penting lainnya"
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

        {/* Form footer */}
        <div className="pd-modal__footer">
          <button type="button" className="pd-btn pd-btn--ghost" onClick={() => navigate('/publisher/dashboard')} id="btn-cancel-form">
            Batal
          </button>
          <button type="submit" className="pd-btn pd-btn--primary" disabled={isSaving} id="btn-submit-form">
            {isSaving ? (
              <><span className="pd-btn__spinner" /> Menyimpan…</>
            ) : (
              <><span className="pd-btn__icon"><PlusIcon /></span> Publikasikan Event</>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
