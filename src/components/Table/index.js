import React from 'react'
import { Link } from 'react-router-dom'
import './index.css'

const API_URL =
  'https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/geonames-all-cities-with-a-population-1000/records'

class Table extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      tableData: [],
      filteredData: [],
      error: '',
      searchQuery: '',
      page: 1,
      hasMore: true,
      loading: false,
    }
    this.handleSearchChange = this.handleSearchChange.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
    this.handleReload = this.handleReload.bind(this)
    this.isContentBlank = this.isContentBlank.bind(this)
    this.fetchData = this.fetchData.bind(this)
    this.filterData = this.filterData.bind(this) // Bind filterData method
  }

  componentDidMount() {
    this.fetchData()
    window.addEventListener('scroll', this.handleScroll)
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  }

  handleSearchChange(event) {
    const searchQuery = event.target.value
    this.setState(prevState => {
      const filtered = this.filterData(prevState.tableData)
      return { searchQuery, filteredData: filtered }
    }, () => {
      console.log("Search query updated: ", searchQuery) // Debugging statement
    })
  }

  handleScroll() {
    const { loading, hasMore } = this.state
    if (loading || !hasMore) return

    const scrollTop = window.scrollY || document.documentElement.scrollTop
    const windowHeight =
      window.innerHeight || document.documentElement.clientHeight
    const documentHeight = document.documentElement.scrollHeight

    if (scrollTop + windowHeight >= documentHeight - 5) {
      this.fetchData()
    }
  }

  handleReload() {
    this.setState(prevState => ({
      tableData: [],
      filteredData: [],
      page: 1,
      hasMore: true,
    }), () => {
      this.fetchData()
    })
  }

  async fetchData() {
    const { page, loading, hasMore } = this.state
    if (loading || !hasMore) return

    this.setState({ loading: true })
    try {
      const response = await fetch(
        `${API_URL}?limit=100&offset=${(page - 1) * 100}`,
      )
      if (response.ok) {
        const resultData = await response.json()
        const convertData = resultData.results.map(each => ({
          id: each.geoname_id,
          countryName: each.cou_name_en,
          countryCode: each.country_code,
          population: each.population,
          timeZone: each.timezone,
          city: each.name,
          weather: 'weather',
        }))
        this.setState(prevState => ({
          tableData: [...prevState.tableData, ...convertData],
          filteredData: this.filterData([...prevState.tableData, ...convertData]),
          hasMore: resultData.results.length > 0,
          page: prevState.page + 1,
          error: '',
        }), () => console.log("Data fetched and state updated"))
      } else {
        this.setState({ error: 'Something went wrong, please try again...' })
      }
    } catch (err) {
      this.setState({ error: 'Something went wrong, please try again...' })
    } finally {
      this.setState({ loading: false })
    }
  }

  filterData(data) {
    const { searchQuery } = this.state
    const query = searchQuery.toLowerCase()
    const filtered = data.filter(
      item =>
        item.countryName.toLowerCase().includes(query) ||
        item.city.toLowerCase().includes(query),
    )
    console.log("Filtering data: ", filtered) // Debugging statement
    return filtered
  }

  isContentBlank() {
    const { filteredData, loading, error } = this.state
    return filteredData.length === 0 && !loading && !error
  }

  render() {
    const { filteredData, searchQuery, loading, hasMore, error } = this.state

    return (
      <div className="app-container">
        <h1 className="title">Cities Data</h1>
        <input
          type="text"
          placeholder="Search by city or country name"
          value={searchQuery}
          onChange={this.handleSearchChange}
          className="search-input"
        />
        <button onClick={this.handleReload} className="reload-btn">
          Reload Data
        </button>
        <table className="my-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>City</th>
              <th>CountryName</th>
              <th>CountryCode</th>
              <th>Population</th>
              <th>Timezone</th>
              <th>Weather</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.city}</td>
                  <td>{item.countryName}</td>
                  <td>{item.countryCode}</td>
                  <td>{item.population}</td>
                  <td>{item.timeZone}</td>
                  <td>
                    <Link to={`/weather/${item.id}`} target="_blank">
                      {item.weather}
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No results found</td>
              </tr>
            )}
          </tbody>
        </table>
        {loading && <p className="loading">Loading...</p>}
        {!hasMore && !loading && (
          <p className="no-more">No more data to load</p>
        )}
        {error && <p className="error-msg">{error}</p>}
        {this.isContentBlank() && !error && (
          <p className="blank-msg">
            The page is currently blank. Trying to reload...
          </p>
        )}
      </div>
    )
  }
}

export default Table
