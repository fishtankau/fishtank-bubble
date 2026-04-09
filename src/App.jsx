import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { BrandProvider } from './context/BrandContext'
import Welcome from './pages/Welcome'
import Config from './pages/Config'
import Output from './pages/Output'

export default function App() {
  return (
    <BrandProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/config" element={<Config />} />
          <Route path="/output" element={<Output />} />
        </Routes>
      </BrowserRouter>
    </BrandProvider>
  )
}
