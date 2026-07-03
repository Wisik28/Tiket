import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ticketApi } from '../../api/ticketApi'
import { toast } from 'react-hot-toast'
import './Dashboard.css'

// Default Banner Image if not provided
const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&auto=format&fit=crop'

export default function Pembelian() {
  const location = useLocation()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const event = location.state?.event

  const [quantity, setQuantity] = useState(1)

// Direct ke dashboard lagi jika data tidak ditemukan
  React.useEffect(() => {
    if (!event) {
      toast.error('Data event tidak ditemukan')
      navigate('/user/dashboard')
    }
  }, [event, navigate])

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

//   Operasi pengurangan guna mengurangi jumlah stok ketika user membeli tiket
  const limitQuota = Number(event?.quota || event?.capacity || 0) - Number(event?.sold || 0)
  const isSoldOut = limitQuota <= 0

  const purchaseMutation = useMutation({
    mutationFn: async (payload) => {
      return await ticketApi.purchaseTicket(payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-events'] })
      qc.invalidateQueries({ queryKey: ['my-tickets'] })
      toast.success('Pembelian tiket berhasil!')
      navigate('/user/riwayatPembelian')
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Gagal memproses pembelian'
      toast.error(message)
    }
  })

//   Handle untuk mengurangi jumlah tiket pada button - yang diklik user
  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

//   handle untuk menambahkan jumlah tiket dibeli jika user klik button + 
//   Handle jika tiket yang dibeli melebihi kuota tersedia
  const handleIncrease = () => {
    if (quantity < limitQuota) {
      setQuantity(quantity + 1)
    } else {
      toast.error(`Mencapai batas kuota tiket yang tersedia (${limitQuota} tiket)`)
    }
  }

//   Handle jika tiket habis terjual
  const handlePayment = (e) => {
    e.preventDefault()
    if (isSoldOut) {
      toast.error('Tiket sudah habis terjual')
      return
    }
    
    const payload = {
      event_id: event.id || event._id,
      quantity: quantity
    }
    
    purchaseMutation.mutate(payload)
  }

  if (!event) return null

  const totalPrice = Number(event.price || 0) * quantity

  return (
    <div className="max-w-4xl mx-auto my-6 px-4">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Konfirmasi Pembelian Tiket</h1>
        <p className="text-sm text-gray-500 mt-1">Silakan periksa detail pesanan Anda sebelum melanjutkan pembayaran.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Detail Event Card (Left side, occupies 2 cols on large screen) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Banner */}
            <div className="h-56 relative bg-gray-950">
              <img 
                src={event.image_url || event.image || DEFAULT_BANNER} 
                alt={event.title}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-6 right-6">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white mb-2 shadow-sm">
                  {event.category}
                </span>
                <h2 className="text-xl font-bold text-white text-shadow-md">{event.title}</h2>
              </div>
            </div>

            {/* Event Description & Info */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Tanggal & Waktu</p>
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
                    <p className="text-xs text-gray-400 font-medium">Lokasi / Venue</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate max-w-[200px]" title={event.location}>{event.location}</p>
                  </div>
                </div>
              </div>

              {event.description && (
                <div className="border-t border-gray-100 pt-6">
                  <h4 className="text-sm font-bold text-gray-900 mb-2">Deskripsi Acara</h4>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{event.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ringkasan Pembayaran (Right side, occupies 1 col) */}
        <div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6 space-y-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Ringkasan Pesanan</h3>

            {/* Jumlah Tiket Selector */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 block">Jumlah Tiket</label>
              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-2 border border-gray-100">
                <button
                  type="button"
                  onClick={handleDecrease}
                  disabled={quantity <= 1 || isSoldOut}
                  className="w-10 h-10 rounded-lg bg-white shadow-sm border border-gray-100 text-gray-600 font-bold hover:bg-gray-100 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5" />
                  </svg>
                </button>
                
                <span className="text-lg font-extrabold text-gray-800 px-4">{quantity}</span>
                
                <button
                  type="button"
                  onClick={handleIncrease}
                  disabled={quantity >= limitQuota || isSoldOut}
                  className="w-10 h-10 rounded-lg bg-white shadow-sm border border-gray-100 text-gray-600 font-bold hover:bg-gray-100 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m5-7H7" />
                  </svg>
                </button>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Sisa Kuota:</span>
                <span className={`font-semibold ${isSoldOut ? 'text-red-500' : 'text-gray-700'}`}>
                  {isSoldOut ? 'Habis Terjual' : `${limitQuota} tiket`}
                </span>
              </div>
            </div>

            {/* Kalkulasi Rincian Harga */}
            <div className="space-y-3 pt-3 border-t border-gray-100 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Harga Satuan</span>
                <span className="font-medium text-gray-800">{formatRupiah(event.price)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Jumlah Tiket</span>
                <span className="font-medium text-gray-800">{quantity}x</span>
              </div>
              
              <div className="flex justify-between items-end pt-3 border-t border-gray-100">
                <span className="text-base font-bold text-gray-800">Total Harga</span>
                <span className="text-xl font-extrabold text-indigo-600 leading-none">{formatRupiah(totalPrice)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-3">
              <button
                type="button"
                onClick={handlePayment}
                disabled={isSoldOut || purchaseMutation.isPending}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {purchaseMutation.isPending ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memproses Pembayaran...
                  </>
                ) : (
                  'Bayar Sekarang'
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/user/dashboard')}
                disabled={purchaseMutation.isPending}
                className="w-full py-3 px-4 rounded-xl bg-white border border-gray-200 text-gray-500 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              > Batal </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
