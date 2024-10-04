import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { CifradoCesarPages } from "./pages/cifladoCesarPages.jsx";
import { CifradoEscitala } from "./pages/cifladoEscitala.jsx";
import { CifradoEscitala } from "./pages/.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<CifradoCesarPages />} />
        <Route path='/cifrado-escitala' element={<CifradoEscitala />} />
        <Route path='/cifrado-escitala' element={<CifradoEscitala />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
