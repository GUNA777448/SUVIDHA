const GasBill = require("../models/GasBill");
const GasConnection = require("../models/GasConnection");
const { createBillSchema, updateBillStatusSchema } = require("../validations");

// Get all bills for a user
const getUserBills = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;

    const query = {
      userId: req.user.id,
      isActive: true,
    };

    if (status) {
      query.status = status;
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const bills = await GasBill.find(query)
      .populate("connectionId", "consumerNumber gasAgency")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await GasBill.countDocuments(query);

    res.status(200).json({
      success: true,
      data: bills,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get bill by ID
const getBillById = async (req, res) => {
  try {
    const bill = await GasBill.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isActive: true,
    }).populate("connectionId");

    if (!bill) {
      return res.status(404).json({
        success: false,
        error: "Bill not found",
      });
    }

    res.status(200).json({
      success: true,
      data: bill,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get bills by consumer number
const getBillsByConsumerNumber = async (req, res) => {
  try {
    const { consumerNumber } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const query = {
      consumerNumber,
      isActive: true,
    };

    if (status) {
      query.status = status;
    }

    const bills = await GasBill.find(query)
      .populate("connectionId", "consumerNumber gasAgency")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    if (bills.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No bills found for this consumer number",
      });
    }

    // Verify user owns at least one of these bills
    if (
      bills[0].userId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    const total = await GasBill.countDocuments(query);

    res.status(200).json({
      success: true,
      data: bills,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Generate new bill (Admin only)
const generateBill = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Access denied. Admin privileges required.",
      });
    }

    const { error } = createBillSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    // Verify connection exists
    const connection = await GasConnection.findById(req.body.connectionId);
    if (!connection) {
      return res.status(404).json({
        success: false,
        error: "Connection not found",
      });
    }

    // Check for duplicate bill in the same period
    const existingBill = await GasBill.findOne({
      connectionId: req.body.connectionId,
      billType: req.body.billType,
      "billingPeriod.from": req.body.billingPeriod.from,
      "billingPeriod.to": req.body.billingPeriod.to,
      isActive: true,
    });

    if (existingBill) {
      return res.status(400).json({
        success: false,
        error: "Bill already exists for this period",
      });
    }

    const billData = {
      ...req.body,
      userId: connection.userId,
      consumerNumber: connection.consumerNumber,
    };

    const bill = new GasBill(billData);
    await bill.save();

    await bill.populate("connectionId", "consumerNumber gasAgency");

    res.status(201).json({
      success: true,
      data: bill,
      message: "Bill generated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update bill status (for payments)
const updateBillStatus = async (req, res) => {
  try {
    const { error } = updateBillStatusSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const bill = await GasBill.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        error: "Bill not found",
      });
    }

    // Verify user owns this bill or is admin
    if (bill.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    // Update bill status and payment details
    if (req.body.status === "PAID" && req.body.paymentDetails) {
      bill.paymentDetails = {
        ...bill.paymentDetails,
        ...req.body.paymentDetails,
        paidDate: new Date(),
      };
    }

    bill.status = req.body.status;
    await bill.save();

    res.status(200).json({
      success: true,
      data: bill,
      message: `Bill status updated to ${req.body.status}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get pending bills for a connection
const getPendingBills = async (req, res) => {
  try {
    const { connectionId } = req.params;

    // Verify user owns this connection
    const connection = await GasConnection.findOne({
      _id: connectionId,
      userId: req.user.id,
      isActive: true,
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        error: "Connection not found",
      });
    }

    const pendingBills = await GasBill.find({
      connectionId,
      status: { $in: ["PENDING", "OVERDUE"] },
      isActive: true,
    }).sort({ dueDate: 1 });

    const totalPendingAmount = pendingBills.reduce((sum, bill) => {
      return sum + bill.charges.amountAfterSubsidy;
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        bills: pendingBills,
        totalPendingAmount,
        count: pendingBills.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get bill payment history
const getPaymentHistory = async (req, res) => {
  try {
    const { consumerNumber } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const paidBills = await GasBill.find({
      consumerNumber,
      status: "PAID",
      isActive: true,
    })
      .populate("connectionId", "consumerNumber gasAgency")
      .sort({ "paymentDetails.paidDate": -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    if (paidBills.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No payment history found",
      });
    }

    // Verify user owns these bills
    if (
      paidBills[0].userId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    const total = await GasBill.countDocuments({
      consumerNumber,
      status: "PAID",
      isActive: true,
    });

    res.status(200).json({
      success: true,
      data: paidBills,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  getUserBills,
  getBillById,
  getBillsByConsumerNumber,
  generateBill,
  updateBillStatus,
  getPendingBills,
  getPaymentHistory,
};
