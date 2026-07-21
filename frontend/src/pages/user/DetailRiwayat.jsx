import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { QRCodeSVG } from 'qrcode.react'
import useAuth from '../../hooks/useAuth'
import '../../style/DashboardUser.css'

export default function DetailRiwayat() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const purchase = location.state?.purchase
  const event = purchase?.event

  const [showQR, setShowQR] = useState(false)
  const [currentTicketIndex, setCurrentTicketIndex] = useState(0)

  const handlePrevTicket = () => {
    setCurrentTicketIndex(prev => (prev === 0 ? purchase.quantity - 1 : prev - 1))
  }

  const handleNextTicket = () => {
    setCurrentTicketIndex(prev => (prev === purchase.quantity - 1 ? 0 : prev + 1))
  }

  const getAttendeeName = (index) => {
    if (!purchase) return ''
    const storedNames = JSON.parse(localStorage.getItem(`ticket_holders_${purchase.id}`)) || []
    if (storedNames[index]) return storedNames[index]
    if (index === 0) return user?.name || 'Pengunjung 1'
    return `Pengunjung ${index + 1}`
  }

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
            {/* Hanya menampilkan id transaksi ketika payment berhasil */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {purchase.status === 'paid' && (
                <div>
                  <p className="text-gray-400 font-medium">ID Transaksi</p>
                  <p className="font-mono font-bold text-gray-800 mt-0.5">{purchase.id}</p>
                </div>
              )}
              {/* Menampilkan status pembayaran berdasarkan purchase.status */}
              <div>                 
                <p className="text-gray-400 font-medium">Status Pembayaran</p>
                {purchase.status === 'paid' ? (
                  <span className="items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                    Berhasil
                  </span>
                ) : purchase.status === 'failed' ? (
                  <span className="items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-100 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                    Gagal
                  </span>
                ) : (
                  <span className="items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-100 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
                    Menunggu Pembayaran
                  </span>
                )}
              </div>

              <div>
                <p className="text-gray-400 font-medium">Jumlah Tiket</p>
                <p className="font-bold text-gray-800 mt-0.5">{purchase.quantity} Tiket</p>
              </div>

              <div>
                <p className="text-gray-400 font-medium">Tanggal Pembayaran</p>
                <p className="font-bold text-gray-800 mt-0.5">
                  {purchase.status === 'paid' && purchase.payment_date
                    ? `${formatDate(purchase.payment_date)} - ${formatTime(purchase.payment_date)}`
                    : '—'}
                </p>
              </div>

              <div>
                <p className="text-gray-400 font-medium">Total Harga</p>
                <p className="font-bold text-indigo-600 mt-0.5">{formatRupiah(purchase.total_price)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Button untuk mencetak QR Code */}
      <div className="mt-6 flex gap-4 print:hidden">
        {purchase.status === 'paid' && (
          <button
            onClick={() => setShowQR(true)}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 15h.008v.008H15V15zm0 2.25h.008v.008H15v-.008zm0 2.25h.008v.008H15v-.008zm2.25-2.25h.008v.008H17.25v-.008zm0 2.25h.008v.008H17.25v-.008zm2.25-2.25h.008v.008H19.5v-.008zm0 2.25h.008v.008H19.5v-.008zM17.25 15h.008v.008H17.25V15zm2.25-2.25h.008v.008H19.5v-.008z" />
            </svg>
            Tampilkan QR Code
          </button>
        )}
        <button
          onClick={() => navigate('/user/riwayatPembelian')}
          className={`py-3 px-6 rounded-xl bg-white border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors ${purchase.status !== 'paid' ? 'w-full' : ''}`}
        >
          Kembali
        </button>
      </div>

      {/* Tampilan QR Code */}
      {showQR && (
        <div className="pd-overlay animate-fade-in" onClick={() => setShowQR(false)}>
          <div className="pd-modal pd-modal--sm p-6 text-center max-w-sm" role="dialog" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-5">
              <h3 className="text-lg font-bold text-gray-900">QR Code E-Tiket</h3>
              <button 
                onClick={() => setShowQR(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {purchase.status === 'paid' ? (
              <div className="flex flex-col items-center justify-center py-4 w-full">
                <div className="flex items-center justify-between w-full mb-5 gap-3">
                  {purchase.quantity > 1 ? (
                    <button 
                      onClick={handlePrevTicket}
                      className="p-2 rounded-full hover:bg-gray-100 text-indigo-600 border border-gray-100 shadow-sm transition-all duration-200 active:scale-90 flex-shrink-0 cursor-pointer"
                      title="Sebelumnya"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  ) : (
                    <div className="w-9" />
                  )}

                  {/* isi QR code yang akan dicetak */}
                  <div className="flex flex-col items-center flex-1">
                    <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-md flex items-center justify-center">
                      <QRCodeSVG                   
                          // Menampilkan id - nama - status
                        value={`${purchase.id}-ticket-${currentTicketIndex + 1}-${getAttendeeName(currentTicketIndex)}-${purchase.status}`} 
                        size={180}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                    
                    <p className="mt-3 text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200/50 max-w-[200px] truncate animate-fade-in" key={currentTicketIndex} title={getAttendeeName(currentTicketIndex)}>
                      <span className="text-[10px] text-gray-400 font-normal mr-1">Peserta:</span>
                      {getAttendeeName(currentTicketIndex)}
                    </p>
                  </div>

                  {purchase.quantity > 1 ? (
                    <button 
                      onClick={handleNextTicket}
                      className="p-2 rounded-full hover:bg-gray-100 text-indigo-600 border border-gray-100 shadow-sm transition-all duration-200 active:scale-90 flex-shrink-0 cursor-pointer"
                      title="Berikutnya"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ) : (
                    <div className="w-9" />
                  )}
                </div>
                
                <h4 className="text-lg font-extrabold text-gray-900 mb-1 px-2 text-center">{event.title}</h4>
                <p className="text-sm text-indigo-600 font-semibold mb-4 text-center">
                  {purchase.quantity > 1 ? `${currentTicketIndex + 1} / ${purchase.quantity}` : purchase.quantity} Tiket
                </p>
                
                <div className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100 w-full mb-5 text-center">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">ID Transaksi</p>
                  <p className="text-xs font-mono font-bold text-gray-700 select-all mt-1">{purchase.id}</p>
                </div>
                
                <p className="text-xs text-gray-400 leading-relaxed px-2">
                  Tunjukkan QR Code ini kepada petugas di lokasi acara untuk proses verifikasi tiket.
                </p>
              </div>
            ) : (
              <div className="py-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">E-Tiket Belum Tersedia</h3>
                <p className="text-sm text-gray-500 mt-2 px-4 leading-relaxed">
                  E-Tiket dan QR Code hanya dapat diakses setelah Anda menyelesaikan pembayaran secara lunas.
                </p>
              </div>
            )}
            
            <div className="border-t border-gray-100 pt-4 mt-2">
              <button
                onClick={() => setShowQR(false)}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all text-sm shadow-md hover:shadow-lg"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
