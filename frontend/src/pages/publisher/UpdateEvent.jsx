import React, { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { eventApi } from '../../api/eventApi'
import axiosInstance from '../../api/axiosInstance'
import { toast } from 'react-hot-toast'
import '../../style/DashboardPublisher.css'

// Inline Icons
const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

const CATEGORIES = ['Musik', 'Seminar', 'Seni', 'Festival']

// Import gambar default jika publisher tidak mengisi gambar preview
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
  description: '', price: '', capacity: '',
  imageFile: null,      // Untuk menyimpan data file aslinya
  imagePreview: '',     // Untuk menampilkan preview sementara
}

const loadMock = () => { const s = localStorage.getItem('pub_events'); return s ? JSON.parse(s) : null }
const saveMock = (data) => localStorage.setItem('pub_events', JSON.stringify(data))

// Function membuat event baru
export default function CreateEvent() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const { id } = useParams()
  const { state } = useLocation()

  const [form, setForm] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [hasCenteredMap, setHasCenteredMap] = useState(false)

  // Query detail event
  const { data: initialEvent, isLoading: isFetching } = useQuery({
    queryKey: ['pub-event', id],
    queryFn: async () => {
      if (state?.event) return state.event
      const res = await axiosInstance.get(`/publisher/events/${id}`)
      return res.data?.data
    },
    initialData: state?.event,
  })

  useEffect(() => {
    if (!window.L) return

    // Fix leaflet default icon path in React/Vite
    delete window.L.Icon.Default.prototype._getIconUrl
    window.L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })

    // Default koordinat untuk leaflet
    const defaultLat = -7.7956
    const defaultLng = 110.3695

    const map = window.L.map('map').setView([defaultLat, defaultLng], 13)

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map)

    const marker = window.L.marker([defaultLat, defaultLng], { draggable: true }).addTo(map)

    const updateLocation = async (lat, lng) => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=id`)
        const data = await response.json()
        if (data && data.display_name) {
          setForm(p => ({ ...p, location: data.display_name }))
        }
      } catch (error) {
        console.error('Error reverse geocoding:', error)
      }
    }

    marker.on('dragend', function () {
      const position = marker.getLatLng()
      updateLocation(position.lat, position.lng)
    })

    map.on('click', function (e) {
      marker.setLatLng(e.latlng)
      updateLocation(e.latlng.lat, e.latlng.lng)
    })

    // If an initial location is loaded, geocode it to center the map on it
    if (initialEvent?.location && !hasCenteredMap) {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(initialEvent.location)}&limit=1`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat)
            const lon = parseFloat(data[0].lon)
            map.setView([lat, lon], 14)
            marker.setLatLng([lat, lon])
            setHasCenteredMap(true)
          }
        })
        .catch(err => console.error('Geocoding error:', err))
    }

    return () => {
      map.remove()
    }
  }, [initialEvent, hasCenteredMap])

  // Set form state when initialEvent is loaded
  useEffect(() => {
    if (initialEvent) {
      setForm({
        title: initialEvent.title || '',
        category: initialEvent.category || 'Musik',
        date: initialEvent.date ? initialEvent.date.substring(0, 16) : '',
        location: initialEvent.location || '',
        description: initialEvent.description || '',
        price: initialEvent.price || '',
        capacity: initialEvent.quota || initialEvent.capacity || '',
        imageFile: null,
        imagePreview: initialEvent.image_url || initialEvent.image || '',
      })
    }
  }, [initialEvent])

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      try {
        const formData = new FormData()
        formData.append('title', data.title)
        formData.append('category', data.category)
        formData.append('date', data.date)
        formData.append('location', data.location)
        formData.append('description', data.description)
        formData.append('price', data.price)
        formData.append('quota', data.quota)
        
        if (data.imageFile) {
          formData.append('image', data.imageFile)
        } else {
          formData.append('image_url', data.imagePreview)
        }

        const res = await eventApi.updateEvent(id, formData)
        if (res?.success) return res.data
        throw new Error()
      } catch (err) {
        const curr = loadMock() || []
        const fallbackImageUrl = data.imageFile ? URL.createObjectURL(data.imageFile) : data.imagePreview
        const updatedEvent = {
          title: data.title,
          category: data.category,
          date: data.date,
          location: data.location,
          description: data.description,
          price: data.price,
          quota: data.quota,
          id: id,
          sold: 0,
          status: 'published',
          createdAt: new Date().toISOString(),
          image_url: fallbackImageUrl,
        }
        saveMock(curr.map(e => e.id === id ? { ...e, ...updatedEvent } : e))
        throw err
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pub-events'] })
      toast.success('Event berhasil diperbarui')
      navigate('/publisher/dashboard')
    },
    onError: () => toast.error('Gagal memperbarui event')
  })

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }))

  // Function handler untuk upload gambar
  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Harap upload file berupa gambar.')
        return
      }

      setField('imageFile', file)
      // Buat URL sementara (blob) agar gambar bisa dipreview langsung
      setField('imagePreview', URL.createObjectURL(file))
    }
  }

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
      imageFile: form.imageFile,
      imagePreview: form.imagePreview,
    }
    updateMutation.mutate(payload)
  }

  const isSaving = updateMutation.isPending

  if (isFetching && !initialEvent) {
    return (
      <div className="pd-loading">
        <div className="pd-spinner" />
        <span>Memuat data event...</span>
      </div>
    )
  }

  return (
    <div className="pd-create-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>
      <header className="pd-create-header" style={{ marginBottom: '24px' }}>
        <h1 className="text-2xl font-bold text-gray-900">Ubah Event</h1>
        <p className="text-sm text-gray-500 mt-1">Perbarui informasi event dan kapasitas tiket.</p>
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
              
              <p className="text-xs text-gray-500 mt-2">
                Anda juga bisa mengklik pada peta atau menggeser marker untuk mencari dan mengisi nama lokasi secara otomatis:
              </p>
              <div 
                id="map" 
                style={{ 
                  height: '320px', 
                  borderRadius: '12px', 
                  border: '1px solid #cbd5e1', 
                  marginTop: '8px', 
                  zIndex: 1 
                }} 
              />
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
              <label className="pd-field__label">Upload Dokumen</label>              
              {/* Area kotak upload tiruan drag & drop */}
              <div 
                onClick={() => document.getElementById('f-image-upload').click()}
                style={{
                  border: '2px dashed #6366f1', 
                  borderRadius: '16px',
                  padding: '40px 24px',
                  textAlign: 'center',
                  backgroundColor: '#f8fafc',
                  cursor: 'pointer',
                  marginTop: '8px',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              >
                {/* Ikon Upload */}
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px' }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                
                <h4 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                  Upload Dokumen
                </h4>
                <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#64748b' }}>
                  Format: JPG, JPEG, PNG 
                </p>
                {/* <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#64748b' }}>
                  Drag & drop file di sini<br />atau
                </p>                 */}
                {/* Tombol palsu untuk visual */}
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#3b82f6', 
                  // backgroundImage: 'linear-gradient(to right, #6366f1, #06b6d)',
                  color: 'white', 
                  padding: '10px 20px', 
                  borderRadius: '8px', 
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                  Pilih File dari Komputer
                </span>
                {/* Input file asli yang disembunyikan */}
                <input
                  id="f-image-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
              </div>
            </div>
            {/* Preview Section */}
            {(form.imagePreview || DEFAULT_IMAGES[form.category]) && (
              <div className="pd-field pd-field--full">
                <p className="pd-field__label">Preview</p>
                <div className="pd-img-preview" style={{ marginTop: '8px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                  <img
                    src={form.imagePreview || DEFAULT_IMAGES[form.category]}
                    alt="preview"
                    style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', display: 'block' }}
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
              <><span className="pd-btn__icon"><EditIcon /></span> Simpan Perubahan</>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
