import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { ticketApi } from '../../api/ticketApi'
import useDebounce from '../../hooks/useDebounce'

export default function DaftarPesanan() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const [filter, setFilter] = useState('semua')
  const bottomRef = useRef(null)

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['publisher-tickets', debouncedSearch, filter],
    queryFn: async ({ pageParam }) => {
      const res = await ticketApi.getPublisherTickets(pageParam, debouncedSearch, filter === 'semua' ? '' : filter)
      if (res?.success && Array.isArray(res?.data)) {
        return res
      }
      throw new Error(res?.message || 'Gagal mengambil data pesanan')
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage?.pagination?.has_more) {
        return (lastPage.pagination.current_page || 1) + 1
      }
      return undefined
    }
  })

  const orders = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  )

  const totalOrders = data?.pages[0]?.pagination?.total || 0

  // IntersectionObserver: auto-fetch next page saat scroll ke bawah
  useEffect(() => {
    const el = bottomRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const formatDate = (dateString) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number || 0)
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto my-6 p-12 text-center bg-white rounded-3xl shadow-sm border border-gray-100">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Gagal memuat data pesanan</h3>
        <p className="text-gray-500 text-sm mt-1">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto my-4 px-2">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 rounded-2xl flex items-center justify-center">
                <img src="/assets/history.png" alt="Riwayat" className="w-7 h-7 object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Riwayat Pesanan</h1>
                <p className="text-gray-500 text-sm">{isLoading ? 'Memuat...' : `${totalOrders} pesanan total`}</p>
              </div>            
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search bar */}
            <div className="relative flex-1 w-full flex items-center">              
              <span className="absolute left-4 flex items-center justify-center pointer-events-none text-gray-400">
                <img src="/assets/search.png" alt="Search" className="w-4 h-4 object-contain" />    
              </span>
              <input
                type="text"
                placeholder="Cari judul event atau nama pembeli..."
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />              
            </div>

            {/* Filter dropdown */}
            <div className="relative w-full md:w-64 flex items-center">
              <span className="absolute left-4 flex items-center justify-center pointer-events-none text-gray-400">
                <img src="/assets/filter.png" alt="Filter" className="w-4 h-4 object-contain" />    
              </span>
              <select
                className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-200 cursor-pointer"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="semua">Semua Waktu</option>
                <option value="hari">Hari Ini</option>
                <option value="minggu">Minggu Ini</option>
                <option value="bulan">Bulan Ini</option>
                <option value="tahun">Tahun Ini</option>
              </select>
              <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </span>
            </div>
          </div>
        </div>

        {/* Separator Line */}
        <hr className="border-gray-100" />

        {/* Table Section */}
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Memuat data pesanan...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Belum ada pesanan</h3>
            <p className="text-gray-500 text-sm mt-1">Pesanan tiket yang dibeli oleh user akan muncul di sini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-4 text-xxs font-bold text-gray-1000 uppercase">No</th>
                  <th className="px-6 py-4 text-xxs font-bold text-gray-1000 uppercase">Judul Event</th>
                  <th className="px-6 py-4 text-xxs font-bold text-gray-1000 uppercase">Pembeli</th>
                  <th className="px-6 py-4 text-xxs font-bold text-gray-1000 uppercase">Tanggal</th>
                  <th className="px-6 py-4 text-xxs font-bold text-gray-1000 uppercase">Jumlah</th>
                  {/* <th className="px-6 py-4 text-xxs font-bold text-gray-1000 uppercase text-center">Status</th> */}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order, idx) => (
                  <tr key={order.id} className="hover:bg-gray-50/30 transition duration-150">
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">{idx + 1}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 text-sm line-clamp-1">{order.event?.title || 'Event Tidak Ditemukan'}</div>
                      <div className="text-xs text-gray-400 mt-0.5 uppercase tracking-wider">{order.event?.category}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-800">{order.buyer?.name || '—'}</div>
                      <div className="text-xs text-gray-400">{order.buyer?.email || '—'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-800 font-medium">{formatDate(order.createdAt)}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{formatTime(order.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">{order.quantity} Tiket</div>
                      <div className="text-xs text-indigo-600 font-semibold mt-0.5">{formatRupiah(order.total_price)}</div>
                    </td>
                    {/* <td className="px-6 py-4 text-center">
                      {order.status === 'paid' ? (
                        <span className="items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                          Berhasil
                        </span>
                      ) : order.status === 'failed' ? (
                        <span className="items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                          Gagal
                        </span>
                      ) : (
                        <span className="items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
                          Pending
                        </span>
                      )}
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Sentinel for Infinite Scroll */}
        <div ref={bottomRef} className="h-1" />

        {/* Loading Spinner */}
        {isFetchingNextPage && (
          <div className="py-6 flex justify-center border-t border-gray-50">
            <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        )}

        {/* End of results message */}
        {!hasNextPage && orders.length > 0 && (
          <div className="py-6 text-center text-sm text-gray-400 border-t border-gray-50">
            Semua riwayat pesanan telah dimuat
          </div>
        )}
      </div>
    </div>
  )
}