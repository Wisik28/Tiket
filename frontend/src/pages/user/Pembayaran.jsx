import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { ticketApi } from '../../api/ticketApi'
import { toast } from 'react-hot-toast'
import './Dashboard.css'

export default function Pembayaran() {
  const { id: ticketId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  
  const { data: ticketsData, isLoading } = useQuery({
    queryKey: ['my-tickets-list'], // Untuk mengambil data tiket dan supaya terisolasi dari cache infinity
    queryFn: async () => {
      const res = await ticketApi.getMyTickets()
      if (res?.success && Array.isArray(res?.data)) {
        return res.data
      }
      return []
    },    
    refetchInterval: (query) => { // Selalu melakukan refetch setiap 3 detik selama status masih 'pending' setelah status berubah maka berhenti refetch
      const data = query.state.data
      const currentTicket = Array.isArray(data) && data.find(t => t.id === ticketId)
      return currentTicket && currentTicket.status === 'pending' ? 3000 : false
    }
  })

  // Memprioritaskan data terbaru dari API, kemudian fallback ke location state
  const ticket = (Array.isArray(ticketsData) && ticketsData.find(t => t.id === ticketId)) || location.state?.ticket
  const event = ticket?.event

  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    if (!ticket) return

    if (ticket.status !== 'pending') {
      setTimeLeft('')
      return
    }

    const expiryTime = ticket.payment_expiry 
      ? new Date(ticket.payment_expiry).getTime()
      : new Date(ticket.createdAt).getTime() + 10 * 60 * 1000

    const updateTimer = () => {
      const now = new Date().getTime()
      const diff = expiryTime - now

      if (diff <= 0) {
        setTimeLeft('EXPIRED')
        clearInterval(timer)
        return
      }

      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      const formattedMinutes = String(minutes).padStart(2, '0')
      const formattedSeconds = String(seconds).padStart(2, '0')

      setTimeLeft(`${formattedMinutes}:${formattedSeconds}`)
    }

    updateTimer()
    const timer = setInterval(updateTimer, 1000)

    return () => clearInterval(timer)
  }, [ticket])

  const formatRupiah = (n) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(n || 0)
  }

  const handleCopyVA = () => {
    if (!ticket?.va_number) return
    navigator.clipboard.writeText(ticket.va_number)
    toast.success('Nomor Virtual Account disalin!')
  }

  if (isLoading && !ticket) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 text-center bg-white rounded-3xl shadow-lg border border-gray-100 animate-pulse">
        <div className="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Memuat detail pembayaran...</p>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 text-center bg-white rounded-3xl shadow-lg border border-gray-100">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Transaksi Tidak Ditemukan</h3>
        <button onClick={() => navigate('/user/dashboard')} className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition">
          Kembali ke Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto my-8 px-4">
      {/* Card untuk alert: batas waktu, gagal, dan berhasil */}
      {ticket.status === 'pending' && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-100 rounded-xl text-red-600 animate-pulse">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-red-500 font-medium">Batas Waktu Pembayaran</p>
              <p className="text-sm font-bold text-red-700">Bayar dalam 10 menit</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1.5 rounded-xl font-mono text-base font-bold bg-white text-red-600 border border-red-200/50 shadow-sm ${timeLeft === 'EXPIRED' ? 'text-gray-400 border-gray-200' : ''}`}>
              {timeLeft}
            </span>
          </div>
        </div>
      )}

      {ticket.status === 'paid' && (
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-6 flex items-center gap-3 shadow-sm animate-fade-in">
          <div className="p-2.5 bg-green-100 rounded-xl text-green-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15L15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-green-600 font-bold uppercase tracking-wider">Status Pembayaran</p>
            <p className="text-sm font-bold text-green-700">Pembayaran Berhasil! E-Tiket Anda telah terbit.</p>
          </div>
        </div>
      )}

      {ticket.status === 'failed' && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6 flex items-center gap-3 shadow-sm animate-fade-in">
          <div className="p-2.5 bg-red-100 rounded-xl text-red-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-red-600 font-bold uppercase tracking-wider">Status Pembayaran</p>
            <p className="text-sm font-bold text-red-700">Pembayaran Sudah Kadaluwarsa.</p>
          </div>
        </div>
      )}

      {/* Main Payment Details Card */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-indigo-50/50 via-white to-white">
          <h2 className="text-lg font-extrabold text-gray-900">Instruksi Pembayaran</h2>
          <p className="text-xs text-gray-500 mt-1">Silakan transfer ke rekening virtual account berikut.</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Total Price */}
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Pembayaran</p>
            <p className="text-2xl font-black text-indigo-600 mt-1">{formatRupiah(ticket.total_price)}</p>
          </div>

          {/* Bank & VA Info */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Bank Transfer</p>
                <p className="text-sm font-extrabold text-gray-800 uppercase mt-0.5">{ticket.va_bank || 'BNI'}</p>
              </div>
              <span className="px-2.5 py-1 text-xxs font-extrabold bg-indigo-50 text-indigo-600 rounded-lg tracking-wider border border-indigo-100/50 uppercase">
                Virtual Account
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 pt-3 border-t border-gray-200/50">
              <div className="flex-1">
                <p className="text-xxs text-gray-400 font-semibold uppercase tracking-wider">Nomor Virtual Account</p>
                <p className="text-lg font-mono font-bold text-gray-800 tracking-wider select-all mt-0.5">
                  {ticket.va_number}
                </p>
              </div>
              {ticket.va_number && (
                <button
                  onClick={handleCopyVA}
                  className="p-2.5 text-black hover:bg-gray-100 text-indigo-600 border border-gray-200 shadow-sm rounded-xl transition duration-200 flex items-center justify-center cursor-pointer active:scale-95"
                  title="Salin No VA"
                >
                  <img src="/assets/copy.png" alt="Copy" className="w-5 h-5 object-contain" />
                </button>
              )}
            </div>
          </div>

          {/* Event Details Preview */}
          {event && (
            <div className="border-t border-gray-100 pt-4 flex gap-4 items-center">
              {event.image_url && (
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-16 h-16 rounded-xl object-cover border border-gray-100"
                />
              )}
              <div className="flex-1 min-w-0">
                <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xxs font-bold uppercase tracking-wider">
                  {event.title}
                </span>
                <h4 className="text-sm font-bold text-gray-800 truncate mt-1">{event.category}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{ticket.quantity} Tiket</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={() => {
            // toast.success('Memeriksa status pembayaran...')
            navigate('/user/riwayatPembelian')
          }}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:from-indigo-700 hover:to-purple-700 transition duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
           Saya Sudah Bayar </button>

        <button
          onClick={() => navigate('/user/dashboard')}
          className="w-full py-3 px-4 rounded-xl bg-white border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition cursor-pointer text-center"
        > Kembali ke Dashboard </button>
      </div>
    </div>
  )
}
