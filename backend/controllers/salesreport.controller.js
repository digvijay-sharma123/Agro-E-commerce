import { models } from '../models/models.js'; // Adjust the path as necessary
const { Transaction, Product } = models;
import { startOfWeek, addWeeks, startOfMonth, endOfMonth, addMonths, format, startOfYear } from 'date-fns';

function getAllWeeksOfYear() {
    const now = new Date();
    const startOfYearDate = startOfYear(now); // get the first day of the current year
    const startDate = startOfWeek(startOfYearDate, { weekStartsOn: 1 }); // Assuming week starts on Monday
    const weeks = [];

    for (let i = 0; i < 52; i++) {
        const weekStart = addWeeks(startDate, i);
        const weekEnd = addWeeks(weekStart, 1);
        weeks.push({
            weekNumber: i + 1,
            start: format(weekStart, 'yyyy-MM-dd'),
            end: format(weekEnd, 'yyyy-MM-dd')
        });
    }

    return weeks;
}

function getAllMonthsOfYear() {
    const now = new Date();
    const startOfYearDate = startOfYear(now); // Get the first day of the current year
    const months = [];

    for (let i = 0; i < 12; i++) {
        const monthStart = addMonths(startOfYearDate, i);
        const monthEnd = endOfMonth(monthStart);
        months.push({
            monthNumber: i + 1,
            start: format(monthStart, 'yyyy-MM-dd'),
            end: format(monthEnd, 'yyyy-MM-dd')
        });
    }

    return months;
}

export const getSalesReport = async (req, res) => {
    try {
        const transactions = await Transaction.find({ "ordered_products.order_status": 1 });

        const productSales = {};
        let totalSales = 0;

        // Aggregate product sales and total sales
        transactions.forEach(transaction => {
            const orderedProducts = transaction.ordered_products;
            
            if (Array.isArray(orderedProducts)) {
                // Loop through orderedProducts if it's an array
                orderedProducts.forEach(product => {
                    const sumTotal = parseFloat(product.sum_total);
                    console.log(`Processing sum_total: ${sumTotal}`);
                    if (isNaN(sumTotal)) {
                        console.error(`Invalid sum_total for product_id ${product.product_id}: ${product.sum_total}`);
                    }
        
                    const productId = parseInt(product.product_id, 10); // Ensure product_id is treated as a number
                    const orderQty = product.order_qty;
                    if (!productSales[productId]) {
                        productSales[productId] = { total_qty: 0, totalIncome: 0 };
                    }
                    productSales[productId].total_qty += orderQty || 0;
                    productSales[productId].totalIncome += sumTotal || 0;
                });
            } else {
                console.error("ordered_products is not an array for transaction:", transaction._id);
            }
        });

        const arrayOfProductIds = Object.keys(productSales).map(id => parseInt(id, 10));
        
        // Get product details by aggregating
        const productDetails = await Product.aggregate([
            {
                $match: {
                    product_id: { $in: arrayOfProductIds },
                }
            }
        ]);

        const productsSold = productDetails.map(product => ({
            product_id: product.product_id,
            name: product.name,
            total_qty: productSales[product.product_id].total_qty,
            totalIncome: productSales[product.product_id].totalIncome
        }));

        const weeks = getAllWeeksOfYear();
        const months = getAllMonthsOfYear();

        // Aggregate sales summaries
        const weeklySales = aggregateSales(transactions, weeks, 'week');
        const monthlySales = aggregateSales(transactions, months, 'month');
        const annualSales = aggregateSales(transactions, [], 'year');

        res.status(200).json({
            productsSold,
            totalSales,
            salesSummary: {
                weekly: weeklySales,
                monthly: monthlySales,
                annual: annualSales
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
}

function aggregateSales(transactions, periods, periodType) {
    const sales = {};

    if (periodType === 'year') {
        transactions.forEach(transaction => {
            const date = new Date(transaction.order_date);
            const key = `${date.getFullYear()}`;

            if (!sales[key]) {
                sales[key] = 0;
            }

            // Check if ordered_products is an array before using reduce
            const sumTotal = Array.isArray(transaction.ordered_products)
                ? transaction.ordered_products.reduce((acc, product) => acc + (parseFloat(product.sum_total) || 0), 0)
                : 0;

            sales[key] += sumTotal;
        });
    } else { // for month and week periods
        periods.forEach(period => {
            sales[period.start] = 0; // initialize to zero for all periods

            transactions.forEach(transaction => {
                const date = new Date(transaction.order_date);
                const formattedDate = format(date, 'yyyy-MM-dd');

                // Calculate sumTotal if ordered_products is an array
                const sumTotal = Array.isArray(transaction.ordered_products)
                    ? transaction.ordered_products.reduce((acc, product) => acc + (parseFloat(product.sum_total) || 0), 0)
                    : 0;

                if (formattedDate >= period.start && formattedDate < period.end) { // if transaction is within the period
                    sales[period.start] += sumTotal;
                }
            });

            // Set to 0 if no sales for the period
            if (sales[period.start] === 0) {
                sales[period.start] = 0;
            }
        });
    }

    return sales;
}

