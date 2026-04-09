import { useMemo } from 'react'
import { useBrand } from '../../context/BrandContext'
import { generatePalette } from '../../utils/colors'
import { generateRevenueChart, generateTrafficChart, generateCategoryBreakdown } from '../../utils/generateData'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const PIE_COLORS = ['#34d399', '#67e8f9', '#a78bfa', '#fb7185', '#fbbf24', '#9ca3af']

export default function Analytics() {
  const { brand } = useBrand()
  const palette = generatePalette(brand.primaryColor)
  const revenueData = useMemo(() => generateRevenueChart(), [])
  const trafficData = useMemo(() => generateTrafficChart(), [])
  const categoryData = useMemo(() => generateCategoryBreakdown(), [])

  return (
    <div className="tab-analytics">
      {/* Revenue Chart */}
      <div className="chart-card">
        <h3>Revenue & Orders (12 months)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Area yAxisId="left" type="monotone" dataKey="revenue" stroke={brand.primaryColor} fill={brand.primaryColor} fillOpacity={0.35} strokeWidth={3} name="Revenue ($)" />
            <Area yAxisId="right" type="monotone" dataKey="orders" stroke={palette.primaryDark} fill={palette.primaryDark} fillOpacity={0.15} strokeWidth={2} strokeDasharray="5 5" name="Orders" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="analytics-row">
        {/* Traffic Chart */}
        <div className="chart-card flex-2">
          <h3>Weekly Traffic</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={trafficData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="visitors" fill={brand.primaryColor} radius={[4, 4, 0, 0]} name="Visitors" />
              <Bar dataKey="pageViews" fill={palette.primaryLight} radius={[4, 4, 0, 0]} name="Page Views" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="chart-card flex-1">
          <h3>Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
