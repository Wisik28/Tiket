import React from 'react'
import AppRouter from './routes/AppRouter'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <>
      <AppRouter />
      <Toaster position="top-right" />
    </>
  )
}

export default App
