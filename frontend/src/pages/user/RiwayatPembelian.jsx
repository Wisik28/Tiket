import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ticketApi } from '../../api/ticketApi'

export default function RiwayatPembelian() {
  const navigate = useNavigate()
  const { data: purchases = [], isLoading, error } = useQuery({
    queryKey: ['my-tickets'],
    queryFn: async () => {
      const res = await ticketApi.getMyTickets()
      if (res?.success && Array.isArray(res?.data)) {
        return res.data
      }
      throw new Error(res?.message || 'Gagal mengambil riwayat pembelian')
    }
  })

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

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto my-6 p-12 text-center">
        <div className="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Memuat riwayat pembelian...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto my-6 p-12 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Gagal memuat data</h3>
        <p className="text-gray-500 text-sm mt-1">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto my-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Riwayat Pembelian</h1>
          <p className="text-gray-500 text-sm mt-1">Daftar transaksi dan tiket acara yang telah Anda beli.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {purchases.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Belum ada transaksi</h3>
            <p className="text-gray-500 text-sm mt-1">Tiket yang Anda beli akan muncul di sini.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {purchases.map((purchase) => (
              <div
                key={purchase.id}
                onClick={() => navigate(`/user/detailRiwayat/${purchase.id}`, { state: { purchase } })}
                className="p-6 hover:bg-gray-50/50 hover:shadow-sm cursor-pointer transition-all duration-200 flex flex-col md:flex-row justify-between gap-4 md:items-center border-l-4 border-l-transparent hover:border-l-indigo-600"
              >
                <div className="flex items-start gap-4">
                  {/* Category Indicator Icon */}
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 mb-2">
                      {purchase.event?.category || 'Kategori'}
                    </span>
                    <h3 className="text-base font-bold text-gray-900 leading-snug">{purchase.event?.title || 'Event tidak ditemukan'}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-1.5">
                      <span>Tanggal Acara: <strong>{formatDate(purchase.event?.date)} · {formatTime(purchase.event?.date)}</strong></span>
                      <span className="hidden md:inline text-gray-300">•</span>
                      <span>ID Transaksi: <strong className="font-mono text-xs">{purchase.id}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col justify-between items-end gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Total Pembayaran ({purchase.quantity} Tiket)</p>
                    <p className="text-lg font-bold text-indigo-600 mt-0.5">{formatRupiah(purchase.total_price)}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                    Berhasil
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
