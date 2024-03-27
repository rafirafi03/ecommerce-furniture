const orderModel = require('../../models/orderModel');
const path = require('path');
const ejs = require('ejs');
const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');
const productModel = require('../../models/productModel');
const categoryModel = require('../../models/categoryModel');
const { order } = require('../user/checkoutController');


let orders;
const getSales = async (req,res)=> {
    
    try {


        const filterValue = req.query.filter;

        const startDate = req.query.start;

        const endDate = req.query.end;

        const today = new Date();

        orders = await orderModel.find({ orderStatus: 'delivered' });


        if (startDate) {
          orders = await orderModel.aggregate([
            {
              $match:{
                orderStatus:'delivered',
                orderDate:{$gte:new Date(startDate),$lte:new Date(endDate)}
              }
            },
            
          ])

          console.log(orders,"ordrrrrrrrrrrsssssss");
          
        }else if (filterValue) {
        const filter = {}; 


        switch (filterValue) {
            case 'week':
            const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000); 
            filter.orderDate = { $gte: sevenDaysAgo, $lt: today }; 
            break;
            case 'month':
            const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, 1); 
            filter.orderDate = { $gte: oneMonthAgo, $lt: today }; 
            break;
            case 'year':
            const oneYearAgo = new Date(today.getFullYear(), 0, 1); 
            filter.orderDate = { $gte: oneYearAgo, $lt: today }; 
            break;
            default:


            
        }
        console.log(filter)


        if (Object.keys(filter).length > 0) { 
            console.log('uytytruytr');
            orders = await orderModel.find({ orderStatus: 'delivered', ...filter });
            console.log(orders);
        }
        }

        res.render('admin/sales',{orders})
    } catch (error) {
        console.log(error.message)
    }
}

const salesReport = async (req,res)=> {
    try {

        const products = await productModel.find({});
        const categories = await categoryModel.find({})

        const revenue = await orderModel.aggregate([
            {
              $group: {
                _id: null,
                revenue: { $sum: "$totalPrice" }
              }
            }
          ]);
        
        const ejsPagePath = path.join(__dirname, '../../views/admin/report.ejs');
        const ejsPage = await ejs.renderFile(ejsPagePath,{orders,products,categories,revenue});
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(ejsPage);
        const pdfBuffer = await page.pdf();
        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
        res.send(pdfBuffer);

    } catch (error) {
        console.log(error.message)
    }
}

const salesReportExel = async (req, res) => {
    try {
      console.log('heloooooooooo');
      const totalOrders = await orderModel.countDocuments();
      const totalProducts = await productModel.countDocuments();
  
      const revenue = await orderModel.aggregate([
        {
          $group: {
            _id: null,
            revenue: { $sum: "$totalPrice" }
          }
        }
      ]);
  
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sales Report');
  
      worksheet.addRow(['Order ID', 'Billing Name', 'Date', 'Total', 'Payment Method']);
  
      orders.forEach(order => {
        worksheet.addRow([
          order._id,
          order.deliveryAddress.fullName,
          order.orderDate,
          order.totalPrice,
          order.payment
        ]);
      });
  
      worksheet.addRow(['', '', '', 'Total Orders:', totalOrders]);
      worksheet.addRow(['', '', '', 'Total Products:', totalProducts]);
      worksheet.addRow(['', '', '', 'Total Revenue:', revenue[0] ? revenue[0].revenue : 0]);
  
      const buffer = await workbook.xlsx.writeBuffer();
  
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=sales_report.xlsx');
  
      res.send(buffer);
  
    } catch (error) {
      console.log(error.message);
    }
  };

  const salesChart = async (req,res) => {

    try {
      
      const monthlyOrders = await orderModel.aggregate([
        {
            $match: {
                orderStatus: 'delivered'
            }
        },
        {
            $group: {
                _id: { $month: "$orderDate" },
                count: { $sum: 1 }
            }
        }
    ]);

    res.json(monthlyOrders);


    } catch (error) {
      
    }
  }

module.exports = {
    getSales,
    salesReport,
    salesReportExel,
    salesChart
}