const orderModel = require("../../models/orderModel");
const path = require("path");
const ejs = require("ejs");
const puppeteer = require("puppeteer");
const ExcelJS = require("exceljs");
const xlsx = require("xlsx");
const productModel = require("../../models/productModel");
const categoryModel = require("../../models/categoryModel");

let orders;
const getSales = async (req, res) => {
  try {
    let message = "showing all sales reports";
    const filterValue = req.query.filter;

    const startDate = req.query.start;

    const endDate = req.query.end;

    const today = new Date();

    orders = await orderModel.find({ orderStatus: "delivered" });

    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999);

    if (startDate) {
      orders = await orderModel.aggregate([
        {
          $match: {
            orderStatus: "delivered",
            orderDate: { $gte: new Date(startDate), $lte: endDateTime },
          },
        },
      ]);

      message = `showing ${startDate} to ${endDate} sales reports.`;
    } else if (filterValue) {
      message = `showing ${filterValue} sales reports.`;

      const filter = {};

      switch (filterValue) {
        case "weekly":
          const sevenDaysAgo = new Date(
            today.getTime() - 7 * 24 * 60 * 60 * 1000
          );
          filter.orderDate = { $gte: sevenDaysAgo, $lt: today };
          break;
        case "monthly":
          const oneMonthAgo = new Date(
            today.getFullYear(),
            today.getMonth() - 1,
            1
          );
          filter.orderDate = { $gte: oneMonthAgo, $lt: today };
          break;
        case "yearly":
          const oneYearAgo = new Date(today.getFullYear(), 0, 1);
          filter.orderDate = { $gte: oneYearAgo, $lt: today };
          break;
        default:
      }

      if (Object.keys(filter).length > 0) {
        orders = await orderModel.find({ orderStatus: "delivered", ...filter });
        console.log(orders);
      }
    }

    res.render("admin/sales", { orders, message });
  } catch (error) {
    console.log(error.message);
  }
};

const salesReport = async (req, res) => {
  try {
    const products = await productModel.find({});
    const categories = await categoryModel.find({});

    const revenue = await orderModel.aggregate([
      { $match: { orderStatus: "delivered" } },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$totalPrice" },
        },
      },
    ]);

    const ejsPagePath = path.resolve(__dirname, "../../views/admin/report.ejs");

    if(!ejsPagePath) {
      console.log(' no ejs page path')
    }
    const ejsPage = await ejs.renderFile(ejsPagePath, {
      orders,
      products,
      categories,
      revenue,
    });

    if(!ejsPage) {
      console.log('no ejs page')
    }
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-gpu",
      ],
    });

    if(!browser) {
      console.log('no puppeteer launch, browser')
    }
    const page = await browser.newPage();

    if(!page) console.log('no page')
    await page.setContent(ejsPage, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });
    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");
    res.end(pdfBuffer);
  } catch (error) {
    console.log(error.message);
  }
};

const salesReportExel = async (req, res) => {
  try {
    const totalOrders = await orderModel.countDocuments({
      orderStatus: "delivered",
    });
    const totalProducts = await orderModel.countDocuments({
      orderStatus: "delivered",
    });

    const revenue = await orderModel.aggregate([
      { $match: { orderStatus: "delivered" } },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$totalPrice" },
        },
      },
    ]);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sales Report");

    worksheet.addRow(["Billing Name", "Date", "Total", "Payment Method"]);
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFF00" },
    };
    worksheet.getRow(1).border = { bottom: { style: "thin" } };

    orders.forEach((order) => {
      worksheet.addRow([
        order.deliveryAddress.fullName,
        order.orderDate.toLocaleDateString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        order.totalPrice,
        order.payment,
      ]);
    });

    worksheet.addRow([]);

    worksheet.mergeCells("D2", "D2");
    worksheet.addRow(["Total Orders:", totalOrders]);
    worksheet.getRow(3).getCell("A").font = { bold: true };
    worksheet.getRow(3).getCell("D").alignment = { horizontal: "right" };
    worksheet.getRow(3).getCell("D").numberFormat = "#,##0";

    worksheet.mergeCells("D3", "D3");
    worksheet.addRow(["Total Products:", totalProducts]);
    worksheet.getRow(4).getCell("A").font = { bold: true };
    worksheet.getRow(4).getCell("D").alignment = { horizontal: "right" };
    worksheet.getRow(4).getCell("D").numberFormat = "#,##0";

    worksheet.mergeCells("D4", "D4");
    worksheet.addRow(["Total Revenue:", revenue[0] ? revenue[0].revenue : 0]);
    worksheet.getRow(5).getCell("A").font = { bold: true };
    worksheet.getRow(5).getCell("D").alignment = { horizontal: "right" };
    worksheet.getRow(5).getCell("D").numberFormat = "#,##0.00";

    const minimalWidth = 12;
    worksheet.columns.forEach((column) => {
      let maxColumnLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const cellValue = cell.value ? cell.value.toString().length : 0;
        maxColumnLength = Math.max(maxColumnLength, minimalWidth, cellValue);
      });
      column.width = maxColumnLength + 2;
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=sales_report.xlsx"
    );

    res.send(buffer);
  } catch (error) {
    console.log(error.message);
  }
};

const salesChart = async (req, res) => {
  try {
    const monthlyOrders = await orderModel.aggregate([
      {
        $match: {
          orderStatus: "delivered",
        },
      },
      {
        $group: {
          _id: { $month: "$orderDate" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(monthlyOrders);
  } catch (error) {}
};

module.exports = {
  getSales,
  salesReport,
  salesReportExel,
  salesChart,
};
