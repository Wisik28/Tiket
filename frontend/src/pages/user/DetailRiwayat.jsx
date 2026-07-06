import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import './Dashboard.css'

export default function DetailRiwayat() {
  const location = useLocation()
  const navigate = useNavigate()
  const purchase = location.state?.purchase
  const event = purchase?.event

  // Redirect ke riwayat pembelian jika data tidak ditemukan
  React.useEffect(() => {
    if (!purchase || !event) {
      toast.error('Data transaksi tidak ditemukan')
      navigate('/user/riwayatPembelian')
    }
  }, [purchase, event, navigate])

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
      weekday: 'long',
      day: 'numeric',
      month: 'long',
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

  const handlePrint = () => {
    window.print()
  }

  if (!purchase || !event) return null

  return (
    <div className="max-w-2xl mx-auto my-6 px-4 print:my-0 print:px-0">
      {/* Header */}
      <header className="mb-6 flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">E-Tiket & Detail Transaksi</h1>
          <p className="text-sm text-gray-500 mt-1">Simpan e-tiket ini untuk digunakan saat masuk ke lokasi acara.</p>
        </div>     
      </header>

      {/* Ticket Wrapper */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden relative print:shadow-none print:border-none">
        
        {/* Event Section */}
        <div className="relative bg-gray-900 h-64 text-white">
          <img
            src={event.image_url || event.image || DEFAULT_BANNER}
            alt={event.title}
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white mb-2 shadow-sm uppercase tracking-wider">
              {event.category}
            </span>
            <h2 className="text-2xl font-extrabold text-shadow-md">{event.title}</h2>
          </div>
        </div>

        {/* Info Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-dashed border-gray-200 relative">

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Hari & Tanggal</p>
                <p className="text-sm font-bold text-gray-800 mt-1">{formatDate(event.date)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Waktu Acara</p>
                <p className="text-sm font-bold text-gray-800 mt-1">{formatTime(event.date)} WIB</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Lokasi / Venue</p>
                <p className="text-sm font-bold text-gray-800 mt-1 leading-relaxed">{event.location}</p>
              </div>             
            </div>

            {event.company_name && (
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Penyelenggara</p>
                  <p className="text-sm font-bold text-gray-800 mt-1">{event.company_name}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Transaction Summary & QR Section */}
        <div className="p-6 md:p-8 bg-gray-50/50 flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="space-y-4 w-full md:w-auto flex-1">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">Rincian Transaksi</h3>
            
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <p className="text-gray-400 font-medium">ID Transaksi</p>
                <p className="font-mono font-bold text-gray-800 mt-0.5">{purchase.id}</p>
              </div>
              <div>
                {/* nanti harus dirubah sehingga dia manggil variabel saja (lunas/gagal)
                hal ini nanti diperbaiki setelah payment gateway selesai dibuat */}
                <p className="text-gray-400 font-medium">Status Pembayaran</p>
                <span className="items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                  Lunas
                </span>
              </div>
              <div>
                <p className="text-gray-400 font-medium">Jumlah Tiket</p>
                <p className="font-bold text-gray-800 mt-0.5">{purchase.quantity} Tiket</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">Total Harga</p>
                <p className="font-bold text-indigo-600 mt-0.5">{formatRupiah(purchase.total_price)}</p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Control Buttons */}
      <div className="mt-6 flex gap-4 print:hidden">
        <button
          onClick={handlePrint}
          className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-3a2 2 0 00-2-2H9a2 2 0 00-2 2v3a2 2 0 002 2zm0-9V9a4 4 0 014-4h4a4 4 0 014 4v2" />
          </svg>
          Cetak E-Tiket (PDF)
        </button>

        <button
          onClick={() => navigate('/user/riwayatPembelian')}
          className="py-3 px-6 rounded-xl bg-white border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
        >
          Kembali
        </button>
      </div>
    </div>
  )
}
