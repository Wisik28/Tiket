import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ticketApi } from '../../api/ticketApi'
import useDebounce from '../../hooks/useDebounce'
import '../../style/DashboardPublisher.css'

const CATEGORIES = ['Belum Dibayar', 'Gagal', 'Mendatang', 'Selesai']
const CAT_COLORS = {
  Gagal: '',
  Mendatang: '',
  Selesai: ''
}

export default function RiwayatPembelian() {
  const navigate = useNavigate()
  const bottomRef = useRef(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('semua')
  const debouncedSearch = useDebounce(search, 500)
  const [filterCat, setFilterCat] = useState('All')

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['my-tickets'],
    queryFn: async ({ pageParam }) => {
      // consume API untuk mengambil data tiket yang pernah dibeli
      // request akan dikirim ke axiosInstance
      const res = await ticketApi.getMyTickets(pageParam)
      if (res?.success && Array.isArray(res?.data)) {
        return res
      }
      throw new Error(res?.message || 'Gagal mengambil riwayat pembelian')
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage?.pagination?.has_more) {
        return (lastPage.pagination.current_page || 1) + 1
      }
      return undefined
    }
  })

  const purchases = useMemo(() => {
    const rawPurchases = data?.pages.flatMap((page) => page.data) ?? []
    return rawPurchases.filter((purchase) => {
      // Filter Kata Kunci 
      const query = debouncedSearch.toLowerCase().trim()
      const titleMatch = purchase.event?.title?.toLowerCase().includes(query) ?? false
      const categoryMatch = purchase.event?.category?.toLowerCase().includes(query) ?? false
      const matchesSearch = !query || titleMatch || categoryMatch

      // tidak menampilkan result ketika pencarian tidak ada yang sesuai
      if (!matchesSearch) return false

      // logic untuk menentukan tampilan daftar event berdasarkan ketiga filter
      // Filter Status Kategori (Gagal / Mendatang / Selesai)
      if (filterCat === 'Gagal') {
        const isFailed = purchase.status === 'failed' || purchase.status === 'gagal' || purchase.status === 'expired'
        if (!isFailed) {
          return false
        }
      } else if (filterCat === 'Belum Dibayar') {
        const isUnpaid = purchase.status === 'pending'
        if (!isUnpaid) {
          return false
        }
      } else if (filterCat === 'Mendatang') {
        const isUpcoming = purchase.status === 'paid' && new Date(purchase.event?.date) >= new Date()
        if (!isUpcoming) {
          return false
        }
      } else if (filterCat === 'Selesai') {
        const isDone = purchase.status === 'paid' && new Date(purchase.event?.date) < new Date() || purchase.status === 'completed'
        if (!isDone) {
          return false
        }
      } else if (filterCat === 'Semua') {
        return true
      }

      // Filter Rentang Waktu 
      const purchaseDate = new Date(purchase.created_at || purchase.event?.date)
      const now = new Date()

      if (filter === 'hari') {
        return purchaseDate.toDateString() === now.toDateString()
      }
      if (filter === 'minggu') {
        const oneWeekAgo = new Date(now)
        oneWeekAgo.setDate(now.getDate() - 7)
        return purchaseDate >= oneWeekAgo
      }
      if (filter === 'bulan') {
        return (
          purchaseDate.getMonth() === now.getMonth() &&
          purchaseDate.getFullYear() === now.getFullYear()
        )
      }
      if (filter === 'tahun') {
        return purchaseDate.getFullYear() === now.getFullYear()
      }

      return true
    })
  }, [data, debouncedSearch, filter, filterCat])

  // auto fetch next page saat scroll ke bawah
  // digunakan untuk infinite pagination
  useEffect(() => {
    const el = bottomRef.current
    if (!el || !hasNextPage || isFetchingNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

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
      <div className="max-w-4xl mx-auto my-6 p-12 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-gray-500 text-sm font-medium">Memuat riwayat pembelian...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto my-6 p-8 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3">
        <p className="text-red-700 font-semibold text-sm">Terjadi Kesalahan</p>
        <p className="text-red-500 text-xs">{error.message || 'Gagal memuat data'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto my-6 space-y-6">      

      <div className="space-y-3">
        {/* Search bar & Filter Waktu */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Search bar */}
          <div className="relative flex-1 w-full flex items-center">              
            <span className="absolute left-4 flex items-center justify-center pointer-events-none text-gray-400">
              <img src="/assets/search.png" alt="Search" className="w-4 h-4 object-contain" />    
            </span>
            <input
              type="text"
              placeholder="Cari judul event..."
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />              
          </div>

          {/* Filter dropdown */}
          <div className="relative group w-full md:w-64">
 
          {/* Tooltip */}
          <div className="absolute -top-10 left-0 px-3 py-2 text-xs text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
            Pilih rentang waktu untuk memfilter event
          </div>

          <div className="relative flex items-center">
            <span className="absolute left-4 flex items-center justify-center pointer-events-none text-gray-400">
              <img
                src="/assets/filter.png"
                alt="Filter"
                className="w-4 h-4 object-contain"
              />
            </span>

            <select
              className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-200 cursor-pointer"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="semua">Semua Waktu</option>
              <option value="tahun">Tahun Ini</option>
              <option value="bulan">Bulan Ini</option>
              <option value="minggu">Minggu Ini</option>
              <option value="hari">Hari Ini</option>
            </select>

            <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </span>
          </div>
        </div>
        </div>

        {/* Filter Kategori Gagal - Mendatang - Selesai */}
        <div className="pd-filters flex flex-wrap gap-2 pt-1">
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
          <div>
            {purchases.map((purchase) => (
              <div
                key={purchase.id}
                // Jika diklik maka akan direct ke page Pembayaran selama status masih 'pending'
                // dan jika status sudah 'paid' atau 'failed' maka akan direct ke page detailRiwayat
                onClick={() => {
                  if (purchase.status === 'pending') {
                    navigate(`/user/pembayaran/${purchase.id}`, { state: { ticket: purchase } })
                  } else {
                    navigate(`/user/detailRiwayat/${purchase.id}`, { state: { purchase } })
                  }
                }}
                className="p-6 border-t border-gray-100 first:border-t-0 hover:bg-gray-50 hover:shadow-sm cursor-pointer transition-all duration-200 flex flex-col md:flex-row justify-between gap-4 md:items-center border-l-4 border-l-transparent hover:border-l-indigo-600"
              >
                <div className="flex items-start gap-4">                
                  {/* Gambar / Icon preview pada setiap daftar riwayat event yang pernah dibeli */}
                  {purchase.event?.image_url || purchase.event?.image ? (
                    <img
                      src={purchase.event.image_url || purchase.event.image}
                      alt={purchase.event?.title || 'Event'}
                      className="w-16 h-16 object-cover rounded-xl border border-gray-100 flex-shrink-0 shadow-sm"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        if (e.currentTarget.nextElementSibling) {
                          e.currentTarget.nextElementSibling.classList.remove('hidden')
                          e.currentTarget.nextElementSibling.classList.add('flex')
                        }
                      }}
                    />
                  ) : null}
                  <div
                    className={`p-3.5 bg-indigo-50 text-indigo-600 rounded-xl flex-shrink-0 ${
                      purchase.event?.image_url || purchase.event?.image ? 'hidden' : 'flex'
                    } items-center justify-center`}
                  >
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
                      <span>Transaksi: <strong className="font-mono text-xs">{formatDate(purchase.createdAt)}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Menampilkan status pada card */}
                <div className="flex md:flex-col justify-between items-end gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Total Pembelian ({purchase.quantity} Tiket)</p>
                    <p className="text-lg font-bold text-indigo-600 mt-0.5">{formatRupiah(purchase.total_price)}</p>
                  </div>
                  {purchase.status === 'paid' ? (
                    <span className="items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                      Berhasil
                    </span>
                  ) : purchase.status === 'failed' ? (
                    <span className="items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                      Gagal
                    </span>
                  ) : (
                    <span className="items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
                      Menunggu Pembayaran
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Sentinel element untuk trigger infinite scroll */}
            <div ref={bottomRef} className="h-1" />

            {/* Spinner saat load halaman berikutnya */}
            {isFetchingNextPage && (
              <div className="py-6 flex justify-center">
                <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            )}

            {/* Pesan ketika semua data sudah dimuat */}
            {!hasNextPage && purchases.length > 0 && (
              <div className="py-5 text-center text-sm text-gray-400">
                Semua riwayat pembelian telah dimuat
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
