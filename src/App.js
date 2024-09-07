import {Router, Route, Routes, useSearchParams} from 'react-router-dom'
import Weather from './components/Weather'
import Table from './components/Table'
import './App.css'

const App = props => {
  const [searchParams, setSearchParams] = useSearchParams()
  const city = searchParams.get('city')

  return (
    <Routes>
      <Route exact path="/" element={<Table />} />
      <Route path="/weather/:id" element={<Weather city={city} />} />
    </Routes>
  )
}

export default App
