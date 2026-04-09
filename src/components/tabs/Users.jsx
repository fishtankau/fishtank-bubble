import { useMemo, useState } from 'react'
import { useBrand } from '../../context/BrandContext'
import { generateUsers } from '../../utils/generateData'
import { Search, ArrowUpDown } from 'lucide-react'

const statusStyles = {
  Active: { bg: '#dcfce7', color: '#166534' },
  Pending: { bg: '#fef3c7', color: '#92400e' },
  Suspended: { bg: '#fee2e2', color: '#991b1b' },
  Trial: { bg: '#dbeafe', color: '#1e40af' },
  Churned: { bg: '#f3f4f6', color: '#6b7280' },
}

export default function UsersTab() {
  const { brand } = useBrand()
  const users = useMemo(() => generateUsers(), [])
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState('name')
  const [sortDir, setSortDir] = useState('asc')

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const filtered = users
    .filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const valA = a[sortField], valB = b[sortField]
      const cmp = typeof valA === 'number' ? valA - valB : String(valA).localeCompare(String(valB))
      return sortDir === 'asc' ? cmp : -cmp
    })

  const totalSpent = users.reduce((sum, u) => sum + u.spent, 0)
  const activeCount = users.filter(u => u.status === 'Active').length

  return (
    <div className="tab-users">
      <div className="users-summary">
        <div className="summary-stat">
          <span className="summary-number" style={{ color: brand.primaryColor }}>{users.length}</span>
          <span className="summary-label">Total Users</span>
        </div>
        <div className="summary-stat">
          <span className="summary-number" style={{ color: brand.primaryColor }}>{activeCount}</span>
          <span className="summary-label">Active</span>
        </div>
        <div className="summary-stat">
          <span className="summary-number" style={{ color: brand.primaryColor }}>${totalSpent.toFixed(0)}</span>
          <span className="summary-label">Total Revenue</span>
        </div>
      </div>

      <div className="inventory-toolbar">
        <div className="inventory-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <span className="inventory-count">{filtered.length} users</span>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {['name', 'email', 'country', 'status', 'orders', 'spent', 'joined'].map(field => (
                <th key={field} onClick={() => toggleSort(field)}>
                  <span>{field.charAt(0).toUpperCase() + field.slice(1)}</span>
                  <ArrowUpDown size={12} style={{ opacity: sortField === field ? 1 : 0.3 }} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => {
              const ss = statusStyles[user.status] || statusStyles.Churned
              return (
                <tr key={user.id}>
                  <td className="cell-bold">{user.name}</td>
                  <td className="cell-mono cell-small">{user.email}</td>
                  <td>{user.country}</td>
                  <td>
                    <span className="status-badge" style={{ background: ss.bg, color: ss.color }}>
                      {user.status}
                    </span>
                  </td>
                  <td>{user.orders}</td>
                  <td>${user.spent.toFixed(2)}</td>
                  <td className="cell-small">{user.joined}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
