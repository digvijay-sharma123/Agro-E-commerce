import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SalesReport from './SalesReport';
import './SalesFunctionality.css';

const AdminReports = () => {
  const [salesData, setSalesData] = useState([]);
  const [weeklySales, setWeeklySales] = useState({});
  const [monthlySales, setMonthlySales] = useState({});
  const [annualSales, setAnnualSales] = useState({});
  const [totalSales, setTotalSales] = useState(0);
  const [filter, setFilter] = useState('weekly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrdered();
  }, []);

  const fetchOrdered = () => {
    setLoading(true);
    // setError(null); // Clear any previous error
    axios.get('http://localhost:3001/sales')
      .then((res) => {
        // Update state with the response data
        setSalesData(res.data.productsSold || []); // Ensure to provide a default value
        setWeeklySales(res.data.salesSummary.weekly || {}); // Default to an empty object
        setMonthlySales(res.data.salesSummary.monthly || {}); // Default to an empty object
        setAnnualSales(res.data.salesSummary.annual || {}); // Default to an empty object
        setTotalSales(res.data.totalSales || 0); // Default to 0
      })
      .catch((err) => {
        console.error('Error fetching sales data:', err);
        setError('Failed to load sales data. Please try again later.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (loading) {
    return <div>Loading sales data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="admin-reports">
      <header className="header">
        <h1>Sales Report</h1>
        <div className="filter-buttons">
          <button onClick={() => setFilter('weekly')}>Weekly</button>
          <button onClick={() => setFilter('monthly')}>Monthly</button>
          <button onClick={() => setFilter('annual')}>Annual</button>
        </div>
      </header>
      <SalesReport 
        salesData={salesData}
        filter={filter} 
        weeklySales={weeklySales}
        monthlySales={monthlySales}
        annualSales={annualSales}
        total={totalSales}
      />
    </div>
  );
};

export default AdminReports;
