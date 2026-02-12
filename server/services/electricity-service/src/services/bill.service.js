const Bill = require("../models/Bill");
const { ApiError } = require("../../../../shared/common/utils/ApiError");

class BillService {
  async getBills(userId, options) {
    const { page, limit, status } = options;
    const skip = (page - 1) * limit;

    const query = { userId };
    if (status) query.status = status;

    const bills = await Bill.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("connectionId", "consumerNumber consumerName");

    const total = await Bill.countDocuments(query);

    return {
      bills,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    };
  }

  async getBillByNumber(billNumber) {
    const bill = await Bill.findOne({ billNumber })
      .populate("connectionId")
      .populate("userId", "username email phoneNumber");

    if (!bill) {
      throw new ApiError(404, "Bill not found");
    }

    return bill;
  }

  async getBillByConsumerNumber(consumerNumber) {
    const bills = await Bill.find({ consumerNumber })
      .sort({ createdAt: -1 })
      .populate("connectionId", "consumerNumber consumerName");

    return bills;
  }

  async generateBill(billData) {
    const {
      userId,
      connectionId,
      consumerNumber,
      billingPeriod,
      meterReading,
      charges,
    } = billData;

    // Generate unique bill number
    const billNumber = await this.generateBillNumber();

    // Calculate units consumed
    const unitsConsumed = meterReading.current - meterReading.previous;

    // Calculate total amount
    const totalAmount =
      charges.energyCharges +
      charges.fixedCharges +
      charges.tax +
      (charges.otherCharges || 0);

    const bill = await Bill.create({
      userId,
      connectionId,
      billNumber,
      consumerNumber,
      billingPeriod,
      meterReading: {
        ...meterReading,
        unitsConsumed,
      },
      charges: {
        ...charges,
        totalAmount,
      },
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      status: "pending",
    });

    return bill;
  }

  async updateBillStatus(billId, updateData) {
    const { status, paymentId, paidAmount } = updateData;

    const bill = await Bill.findById(billId);

    if (!bill) {
      throw new ApiError(404, "Bill not found");
    }

    bill.status = status;
    if (paymentId) bill.paymentId = paymentId;
    if (paidAmount) {
      bill.paidAmount = paidAmount;
      bill.paidDate = new Date();
    }

    await bill.save();

    return bill;
  }

  async generateBillNumber() {
    const prefix = "ELEC";
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `${prefix}${timestamp}${random}`;
  }
}

module.exports = new BillService();
