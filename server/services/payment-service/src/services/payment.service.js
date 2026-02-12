const Payment = require("../models/Payment");
const axios = require("axios");
const { ApiError } = require("../../../../shared/common/utils/ApiError");

class PaymentService {
  async initiatePayment(paymentData) {
    const {
      userId,
      billType,
      billId,
      billNumber,
      amount,
      paymentMethod,
      paymentGateway,
    } = paymentData;

    // Generate unique transaction ID
    const transactionId = this.generateTransactionId();

    // Create payment record
    const payment = await Payment.create({
      userId,
      transactionId,
      billType,
      billId,
      billNumber,
      amount,
      paymentMethod,
      paymentGateway,
      status: "pending",
    });

    // Initialize payment with gateway (mock implementation)
    const gatewayResponse = await this.initializePaymentGateway(
      transactionId,
      amount,
      paymentGateway,
    );

    return {
      payment,
      gatewayUrl: gatewayResponse.paymentUrl,
      transactionId,
    };
  }

  async verifyPayment(transactionId) {
    const payment = await Payment.findOne({ transactionId });

    if (!payment) {
      throw new ApiError(404, "Payment not found");
    }

    // Verify with payment gateway (mock implementation)
    const gatewayStatus = await this.verifyPaymentGateway(
      payment.gatewayTransactionId,
    );

    // Update payment status
    payment.status = gatewayStatus.status;
    await payment.save();

    // Update bill status if payment is successful
    if (gatewayStatus.status === "success") {
      await this.updateBillStatus(payment);
    }

    return payment;
  }

  async getPayments(userId, options) {
    const { page, limit, status, billType } = options;
    const skip = (page - 1) * limit;

    const query = { userId };
    if (status) query.status = status;
    if (billType) query.billType = billType;

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(query);

    return {
      payments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    };
  }

  async getPaymentById(paymentId) {
    const payment = await Payment.findById(paymentId).populate(
      "userId",
      "username email phoneNumber",
    );

    if (!payment) {
      throw new ApiError(404, "Payment not found");
    }

    return payment;
  }

  async updatePaymentStatus(paymentId, updateData) {
    const { status, gatewayTransactionId, failureReason } = updateData;

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      throw new ApiError(404, "Payment not found");
    }

    payment.status = status;
    if (gatewayTransactionId)
      payment.gatewayTransactionId = gatewayTransactionId;
    if (failureReason) payment.failureReason = failureReason;

    await payment.save();

    // Update bill status if payment is successful
    if (status === "success") {
      await this.updateBillStatus(payment);
    }

    return payment;
  }

  async initiateRefund(paymentId, refundData) {
    const { refundAmount, reason } = refundData;

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      throw new ApiError(404, "Payment not found");
    }

    if (payment.status !== "success") {
      throw new ApiError(400, "Only successful payments can be refunded");
    }

    // Initiate refund with gateway (mock implementation)
    const refundId = this.generateRefundId();

    payment.status = "refunded";
    payment.refundId = refundId;
    payment.refundAmount = refundAmount;
    payment.refundDate = new Date();

    await payment.save();

    return payment;
  }

  async updateBillStatus(payment) {
    const { billType, billId, amount } = payment;

    try {
      // Determine service URL based on bill type
      const serviceUrl = this.getServiceUrl(billType);

      // Update bill status via service API
      await axios.patch(
        `${serviceUrl}/api/v1/${billType}/bills/${billId}/status`,
        {
          status: "paid",
          paymentId: payment._id,
          paidAmount: amount,
        },
      );
    } catch (error) {
      console.error("Error updating bill status:", error.message);
      // Don't throw error - payment already successful
    }
  }

  getServiceUrl(billType) {
    const serviceUrls = {
      electricity: process.env.ELECTRICITY_SERVICE_URL,
      gas: process.env.GAS_SERVICE_URL,
      water: process.env.WATER_SERVICE_URL,
      municipal: process.env.MUNICIPAL_SERVICE_URL,
    };

    return serviceUrls[billType] || process.env.ELECTRICITY_SERVICE_URL;
  }

  async initializePaymentGateway(transactionId, amount, gateway) {
    // Mock implementation - integrate with actual payment gateway
    return {
      paymentUrl: `https://payment-gateway.example.com/pay?txn=${transactionId}&amount=${amount}`,
      gatewayTransactionId: `GW${Date.now()}`,
    };
  }

  async verifyPaymentGateway(gatewayTransactionId) {
    // Mock implementation - verify with actual payment gateway
    return {
      status: "success",
      gatewayTransactionId,
    };
  }

  generateTransactionId() {
    const prefix = "TXN";
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `${prefix}${timestamp}${random}`;
  }

  generateRefundId() {
    const prefix = "REF";
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `${prefix}${timestamp}${random}`;
  }
}

module.exports = new PaymentService();
