import { useMemo, useState } from 'react'
import { useBrand } from '../../context/BrandContext'
import { generateInventory } from '../../utils/generateData'
import { Search, ArrowUpDown } from 'lucide-react'

export default function Inventory() {
  const { brand } = useBrand()
  const items = useMemo(() => generateInventory(brand.products || []), [brand.products])
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState('name')
  const [sortDir, setSortDir] = useState('asc')

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const filtered = items
    .filter(item => item.name.toLowerCase().includes(search.toLowerCase()) || item.id.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const valA = a[sortField], valB = b[sortField]
      const cmp = typeof valA === 'number' ? valA - valB : String(valA).localeCompare(String(valB))
      return sortDir === 'asc' ? cmp : -cmp
    })

  return (
    <div className="tab-inventory">
      <div className="inventory-toolbar">
        <div className="inventory-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search inventory..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <span className="inventory-count">{filtered.length} items</span>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {['id', 'name', 'category', 'stock', 'price', 'status'].map(field => (
                <th key={field} onClick={() => toggleSort(field)}>
                  <span>{field === 'id' ? 'SKU' : field.charAt(0).toUpperCase() + field.slice(1)}</span>
                  <ArrowUpDown size={12} style={{ opacity: sortField === field ? 1 : 0.3 }} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id}>
                <td className="cell-mono">{item.id}</td>
                <td className="cell-bold">{item.name}</td>
                <td>{item.category}</td>
                <td>{item.stock}</td>
                <td>${item.price.toFixed(2)}</td>
                <td>
                  <span
                    className={`status-badge ${item.status === 'In Stock' ? 'status-good' : 'status-warn'}`}
                    style={item.status === 'In Stock' ? {} : { background: brand.primaryColor + '22', color: brand.primaryColor }}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
