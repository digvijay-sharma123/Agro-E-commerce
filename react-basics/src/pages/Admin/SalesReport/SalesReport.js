import React from 'react';
import { Table } from 'react-bootstrap';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { format, getWeekOfMonth } from "date-fns";
import './SalesReport.css';

const SalesReport = ({ salesData, filter, weeklySales, monthlySales, annualSales, total }) => {
  const totalSales = total;

  // Determine the correct sales data based on the filter
  const dateSales = 
    filter === "weekly" ? weeklySales : 
    filter === "monthly" ? monthlySales : 
    filter === "annual" ? annualSales : null;

  // Prepare data for the line chart
  const chartData = Object.keys(dateSales || {}).map(saleKey => ({
    product: saleKey,
    amount: dateSales[saleKey] ?? 0, // Default to 0 if undefined
  }));

  // Prepare data for the pie chart
  const pieData = salesData.map(sale => ({
    name: sale.name,
    value: sale.totalIncome ?? 0 // Default to 0 if undefined
  }));

  const COLORS = ['#0A6847', '#F3CA52', '#7ABA78', '#F6E9B2', '#004d40', '#ffd54f', '#81c784', '#ffee58'];

  return (
    <div className="sales-report">
      <h2>Sales Summary ({filter.charAt(0).toUpperCase() + filter.slice(1)})</h2>

      <div className="chart">
        <h3>Sales Line Chart</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="product" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="amount" stroke="#0A6847" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {filter === 'weekly' && (
        <div className="summary-table">
          <h3>Weekly Summary</h3>
          <Table striped bordered hover variant="light" className="centralized-table">
            <thead>
              <tr>
                <th>Week</th>
                <th>Total Sales (₱)</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(weeklySales || {}).map(key => {
                const salesAmount = weeklySales[key] ?? 0; // Default to 0 if undefined
                if (salesAmount > 0) {
                  let week = getWeekOfMonth(new Date(key));
                  week = `${week}${week === 1 ? "st" : week === 2 ? "nd" : week === 3 ? "rd" : "th"}`;
                  return (
                    <tr key={key}>
                      <td>{`${week} week of ${format(new Date(key), "MMMM")}`}</td> 
                      <td>₱{salesAmount.toFixed(2)}</td>
                    </tr>
                  );
                }
                return null; // Ensure consistent return
              })}
            </tbody>
          </Table>
        </div>
      )}

      {filter === 'monthly' && (
        <div className="summary-table">
          <h3>Monthly Summary</h3>
          <Table striped bordered hover variant="light" className="centralized-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Total Sales (₱)</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(monthlySales || {}).map(key => {
                const salesAmount = monthlySales[key] ?? 0; // Default to 0 if undefined
                if (salesAmount > 0) {
                  return (
                    <tr key={key}>
                      <td>{format(new Date(key), "MMMM")}</td>
                      <td>₱{salesAmount.toFixed(2)}</td>
                    </tr>
                  );
                }
                return null; // Ensure consistent return
              })}
            </tbody>
          </Table>
        </div>
      )}

      {filter === 'annual' && (
        <div className="summary-table">
          <h3>Annual Summary</h3>
          <Table striped bordered hover variant="light" className="centralized-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Total Sales (₱)</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(annualSales || {}).map(key => {
                const salesAmount = annualSales[key] ?? 0; // Default to 0 if undefined
                if (salesAmount > 0) {
                  return (
                    <tr key={key}>
                      <td>{key}</td>
                      <td>₱{salesAmount.toFixed(2)}</td>
                    </tr>
                  );
                }
                return null; // Ensure consistent return
              })}
            </tbody>
          </Table>
        </div>
      )}

      <div className="chart">
        <h3>Sales Pie Chart</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`} 
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="table-container">
        <h3>Product Sales</h3>
        <Table striped bordered hover variant="light" className="centralized-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Amount (₱)</th>
              <th>Total Products Sold</th>
            </tr>
          </thead>
          <tbody> 
            {salesData.map(sale => (
              <tr key={sale.product_id}>
                <td>{sale.name}</td>
                <td>₱{(sale.totalIncome ?? 0).toFixed(2)}</td>
                <td>{sale.total_qty}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <div className="total-sales">
        <h3>Total Sales: ₱{totalSales.toFixed(2)}</h3>
      </div>
    </div>
  );
};

export default SalesReport;
