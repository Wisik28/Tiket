import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { z } from 'zod'
import { ticketApi } from '../../api/ticketApi'
import { eventApi } from '../../api/eventApi'
import useAuth from '../../hooks/useAuth'
import { toast } from 'react-hot-toast'
import '../../style/DashboardUser.css'

const createEmptyHolder = () => ({
  nik: '',
  name: '',
  tglLahir: '',
  phone: '',
  email: '',
  address: '',
})

// Function untuk pembelian
export default function TempPembelian() {
  const { id: eventId } = useParams()
  const location = useLocation()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [useProfileData, setUseProfileData] = useState(false)
  const [holders, setHolders] = useState([createEmptyHolder()])
  const [holderErrors, setHolderErrors] = useState([{}])

  const { data: eventData } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const res = await eventApi.getEventById(eventId)
      if (res?.success) return res.data
      return res
    },
    enabled: !!eventId
  })

  const event = location.state?.event || eventData

//   function untuk memproses pembayaran, navigate ke page riwayat pembelian ketika payment sukses
  const purchaseMutation = useMutation({
    mutationFn: async (payload) => {
      return await ticketApi.purchaseTicket(payload)
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['user-events'] })
      qc.invalidateQueries({ queryKey: ['my-tickets'] })
      
      if (res?.data?.id) {
        localStorage.setItem(
          `ticket_holders_${res.data.id}`,
          JSON.stringify(holders.map(h => h.name))
        )
      }
      
      toast.success('Pemesanan tiket berhasil, silakan lakukan pembayaran!')
      navigate(`/user/pembayaran/${res.data.id}`, { state: { ticket: res.data } })
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Gagal memproses pembayaran'
      toast.error(message)
    }
  })

  // Handler toggle button untuk input data user otomatis (sesuai dengan data registrasi)
  const handleToggleProfileData = (checked) => {
    setUseProfileData(checked)
    if (checked && user) {
      setHolders(prev => {
        const updated = [...prev]
        updated[0] = {
          nik: user.nik || '',
          name: user.name || '',
          tglLahir: user.tglLahir || '',
          phone: user.mobile || '',
          email: user.email || '',
          address: user.address || '',
        }
        return updated
      })
      setHolderErrors(prev => {
        const updated = [...prev]
        updated[0] = {}
        return updated
      })
    } else {
      setHolders(prev => {
        const updated = [...prev]
        updated[0] = {
          nik: '',
          name: '',
          tglLahir: '',
          phone: '',
          email: '',
          address: '',
        }
        return updated
      })
    }
  }

  // Handler ketika user merubah field secara manual
  const handleFieldChange = (index, field, value) => {
    setHolders(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
    
    // Matikan toggle jika data orang pertama diedit secara manual
    if (index === 0) {
      setUseProfileData(false)
    }
  }

  // Handler button tambah untuk orang kedua dan seterusnya
  const handleAddHolder = () => {
    setHolders(p => [...p, createEmptyHolder()])
    setHolderErrors(p => [...p, {}])
  }

  // Handler untuk button remove data orang kedua dan seterusnya
  const handleRemoveHolder = (index) => {
    setHolders(p => p.filter((_, i) => i !== index))
    setHolderErrors(p => p.filter((_, i) => i !== index))
  }

  const formatRupiah = (n) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(n || 0)
  }

  const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatTime = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

// Schema validasi pengunjung menggunakan Zod
const ticketHolderSchema = z.object({
  nik: z.string().length(16, 'NIK harus 16 digit angka'),
  name: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
  phone: z.string().min(12, 'Nomor handphone harus 12 digit'),
  email: z.string().email('Format email tidak valid'),
  address: z.string().min(5, 'Alamat tinggal wajib diisi'),
})

// Validasi input pengunjung menggunakan Zod safeParse
// Memanggil schema validasi pengunjung di atas
  const validate = () => {
    let isValid = true
    const newErrors = holders.map(holder => {
      const result = ticketHolderSchema.safeParse(holder)
      if (!result.success) {
        isValid = false
        const errors = {}
        result.error.issues.forEach(issue => {
          if (issue.path[0]) {
            errors[issue.path[0]] = issue.message
          }
        })
        return errors
      }
      return {}
    })
    
    setHolderErrors(newErrors)
    if (!isValid) {
      toast.error('Input tidak valid! Harap periksa kembali formulir pembelian.')
    }
    return isValid
  }

  // Handler button submit
  const handleSubmit = (ev) => {
    ev.preventDefault()
    if (!validate()) return
    
    const payload = {
      event_id: eventId,
      quantity: holders.length
    }
    purchaseMutation.mutate(payload)
  }

  const isSaving = purchaseMutation.isPending

  return (
    <div className="pd-create-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>
      <header className="pd-create-header" style={{ marginBottom: '24px' }}>
        <h1 className="text-2xl font-bold text-gray-900">Form Registrasi Acara</h1>
        <p className="text-sm text-gray-500 mt-1">Lengkapi seluruh data di bawah ini.</p>
      </header>

      {/* Event Summary Section */}
      {event && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          {/* Banner */}
          <div className="h-48 sm:h-64 relative bg-gray-950">
            <img 
              src={event.image_url || event.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&auto=format&fit=crop'} 
              alt={event.title}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-6 right-6">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white mb-2 shadow-sm uppercase tracking-wider">
                {event.category}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white text-shadow-md">{event.title}</h2>
            </div>
          </div>

          {/* Event Details */}
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xxs text-gray-400 font-bold uppercase tracking-wider">Tanggal & Waktu</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{formatDate(event.date)} · {formatTime(event.date)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <p className="text-xxs text-gray-400 font-bold uppercase tracking-wider">Lokasi / Venue</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate max-w-[250px]" title={event.location}>{event.location}</p>
              </div>
            </div>
          </div>

          {event.description && (
            <div className="p-6 bg-gray-50/30">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Deskripsi Acara</h4>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{event.description}</p>
            </div>
          )}
        </div>
      )}

      <form className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" onSubmit={handleSubmit} noValidate>
        {holders.map((holder, index) => (
          <section key={index} className="pd-form-section border-b border-gray-100 last:border-b-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                {/* <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </span> */}
                Data Pengunjung {index + 1}
              </h3>
              
              {index === 0 ? (
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-semibold text-gray-500">Gunakan data akun saya</span>
                  <button
                    type="button"
                    onClick={() => handleToggleProfileData(!useProfileData)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                      useProfileData ? 'bg-indigo-900' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                        useProfileData ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ) : (
                holders.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveHolder(index)}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Hapus
                  </button>
                )
              )}
            </div>

            <div className="pd-form-grid">
              {/* NIK */}
              <div className={`pd-field pd-field--full ${holderErrors[index]?.nik ? 'pd-field--error' : ''}`}>
                <label className="pd-field__label" htmlFor={`f-nik-${index}`}>NIK <span className="pd-req">*</span></label>
                <input
                  id={`f-nik-${index}`}
                  className="pd-field__input"
                  type="text"
                  placeholder="Contoh: 1234567890123456"
                  value={holder.nik}
                  onChange={e => handleFieldChange(index, 'nik', e.target.value)}
                />
                {holderErrors[index]?.nik && <p className="pd-field__err">{holderErrors[index].nik}</p>}
              </div>
              
              {/* Nama Lengkap */}
              <div className={`pd-field pd-field--full ${holderErrors[index]?.name ? 'pd-field--error' : ''}`}>
                <label className="pd-field__label" htmlFor={`f-name-${index}`}>Nama Lengkap <span className="pd-req">*</span></label>
                <input
                  id={`f-name-${index}`}
                  className="pd-field__input"
                  type="text"
                  placeholder="Contoh: Budi Sugiyono"
                  value={holder.name}
                  onChange={e => handleFieldChange(index, 'name', e.target.value)}
                />
                {holderErrors[index]?.name && <p className="pd-field__err">{holderErrors[index].name}</p>}
              </div>

              {/* Nomor Handphone */}
              <div className={`pd-field pd-field--full ${holderErrors[index]?.phone ? 'pd-field--error' : ''}`}>
                <label className="pd-field__label" htmlFor={`f-phone-${index}`}>Nomor Handphone <span className="pd-req">*</span></label>
                <input
                  id={`f-phone-${index}`}
                  className="pd-field__input"
                  type="tel"
                  placeholder="Contoh: 081234567890"
                  value={holder.phone}
                  onChange={e => handleFieldChange(index, 'phone', e.target.value)}
                />
                {holderErrors[index]?.phone && <p className="pd-field__err">{holderErrors[index].phone}</p>}
              </div>

              {/* Alamat Email */}
              <div className={`pd-field pd-field--full ${holderErrors[index]?.email ? 'pd-field--error' : ''}`}>
                <label className="pd-field__label" htmlFor={`f-email-${index}`}>Alamat Email <span className="pd-req">*</span></label>
                <input
                  id={`f-email-${index}`}
                  className="pd-field__input"
                  type="email"
                  placeholder="Contoh: budi@gmail.com"
                  value={holder.email}
                  onChange={e => handleFieldChange(index, 'email', e.target.value)}
                />
                {holderErrors[index]?.email && <p className="pd-field__err">{holderErrors[index].email}</p>}
              </div>

              {/* Alamat Tinggal */}
              <div className={`pd-field pd-field--full ${holderErrors[index]?.address ? 'pd-field--error' : ''}`}>
                <label className="pd-field__label" htmlFor={`f-address-${index}`}>Alamat Tinggal <span className="pd-req">*</span></label>
                <textarea
                  id={`f-address-${index}`}
                  className="pd-field__input pd-field__input--textarea"
                  placeholder="Masukkan alamat lengkap Anda"
                  rows="2"
                  value={holder.address}
                  onChange={e => handleFieldChange(index, 'address', e.target.value)}
                />
                {holderErrors[index]?.address && <p className="pd-field__err">{holderErrors[index].address}</p>}
              </div>
            </div>
          </section>
        ))}

        {/* Section: Button Tambah Pengunjung */}
        <section className="pd-form-section bg-gray-50/50 border-t border-gray-100">
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleAddHolder}
              className="py-3 px-6 rounded-xl bg-white hover:bg-gray-100 text-indigo-600 font-bold transition-all duration-200 border border-gray-200 flex items-center justify-center gap-2 hover:shadow-sm active:scale-95 cursor-pointer"
            >
              <svg className="w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Tambah Pengunjung
            </button>
          </div>
        </section>

        {/* Price Summary Section */}
        {event && (
          <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
              <div>
                <span className="text-gray-800 font-bold">Harga Satuan:</span>{' '}
                <strong className="text-indigo-600 font-bold">{formatRupiah(event.price)}</strong>
              </div>
              <div>
                <span className="text-gray-800 font-bold">Jumlah Tiket:</span>{' '}
                <strong className="text-indigo-600 font-bold">{holders.length}x</strong>
              </div>
            </div>
            
            <div className="text-right flex justify-between sm:block border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100">
              <span className="text-sm font-bold text-gray-800 mr-2 sm:mr-0 sm:block">Total Harga:</span>
              <strong className="text-xl font-extrabold text-indigo-600 leading-none">
                {formatRupiah(Number(event.price || 0) * holders.length)}
              </strong>
            </div>
          </div>
        )}

        {/* Form footer */}
        <div className="pd-modal__footer border-t border-gray-100">
          <button type="button" className="pd-btn pd-btn--ghost" onClick={() => navigate('/user/dashboard')} id="btn-cancel-form">
            Batal
          </button>
          <button type="submit" className="pd-btn pd-btn--primary" disabled={isSaving} id="btn-submit-form">
            {isSaving ? (
              <><span className="pd-btn__spinner" /> Memproses…</>
            ) : (
              <>Bayar Sekarang</>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
