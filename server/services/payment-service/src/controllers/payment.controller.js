const paymentService = require("../services/payment.service");
const { ApiResponse } = require("../../../../shared/common/utils/ApiResponse");

class PaymentController {
  async initiatePayment(req, res, next) {
    try {
      const { userId } = req.user;
      const paymentData = { ...req.body, userId };

      const result = await paymentService.initiatePayment(paymentData);

      return res
        .status(201)
        .json(new ApiResponse(201, result, "Payment initiated successfully"));
    } catch (error) {
      next(error);
    }
  }

  async verifyPayment(req, res, next) {
    try {
      const { transactionId } = req.params;
      const result = await paymentService.verifyPayment(transactionId);

      return res
        .status(200)
        .json(new ApiResponse(200, result, "Payment verified successfully"));
    } catch (error) {
      next(error);
    }
  }

  async getPayments(req, res, next) {
    try {
      const { userId } = req.user;
      const { page = 1, limit = 10, status, billType } = req.query;

      const result = await paymentService.getPayments(userId, {
        page,
        limit,
        status,
        billType,
      });

      return res
        .status(200)
        .json(new ApiResponse(200, result, "Payments fetched successfully"));
    } catch (error) {
      next(error);
    }
  }

  async getPaymentById(req, res, next) {
    try {
      const { paymentId } = req.params;
      const result = await paymentService.getPaymentById(paymentId);

      return res
        .status(200)
        .json(
          new ApiResponse(200, result, "Payment details fetched successfully"),
        );
    } catch (error) {
      next(error);
    }
  }

  async updatePaymentStatus(req, res, next) {
    try {
      const { paymentId } = req.params;
      const { status, gatewayTransactionId, failureReason } = req.body;

      const result = await paymentService.updatePaymentStatus(paymentId, {
        status,
        gatewayTransactionId,
        failureReason,
      });

      return res
        .status(200)
        .json(
          new ApiResponse(200, result, "Payment status updated successfully"),
        );
    } catch (error) {
      next(error);
    }
  }

  async initiateRefund(req, res, next) {
    try {
      const { paymentId } = req.params;
      const { refundAmount, reason } = req.body;

      const result = await paymentService.initiateRefund(paymentId, {
        refundAmount,
        reason,
      });

      return res
        .status(200)
        .json(new ApiResponse(200, result, "Refund initiated successfully"));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();
