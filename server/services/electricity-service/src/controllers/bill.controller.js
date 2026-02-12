const billService = require("../services/bill.service");
const { ApiResponse } = require("../../../../shared/common/utils/ApiResponse");

class BillController {
  async getBills(req, res, next) {
    try {
      const { userId } = req.user;
      const { page = 1, limit = 10, status } = req.query;

      const result = await billService.getBills(userId, {
        page,
        limit,
        status,
      });

      return res
        .status(200)
        .json(new ApiResponse(200, result, "Bills fetched successfully"));
    } catch (error) {
      next(error);
    }
  }

  async getBillByNumber(req, res, next) {
    try {
      const { billNumber } = req.params;
      const result = await billService.getBillByNumber(billNumber);

      return res
        .status(200)
        .json(
          new ApiResponse(200, result, "Bill details fetched successfully"),
        );
    } catch (error) {
      next(error);
    }
  }

  async getBillByConsumerNumber(req, res, next) {
    try {
      const { consumerNumber } = req.params;
      const result = await billService.getBillByConsumerNumber(consumerNumber);

      return res
        .status(200)
        .json(new ApiResponse(200, result, "Bills fetched successfully"));
    } catch (error) {
      next(error);
    }
  }

  async generateBill(req, res, next) {
    try {
      const billData = req.body;
      const result = await billService.generateBill(billData);

      return res
        .status(201)
        .json(new ApiResponse(201, result, "Bill generated successfully"));
    } catch (error) {
      next(error);
    }
  }

  async updateBillStatus(req, res, next) {
    try {
      const { billId } = req.params;
      const { status, paymentId, paidAmount } = req.body;

      const result = await billService.updateBillStatus(billId, {
        status,
        paymentId,
        paidAmount,
      });

      return res
        .status(200)
        .json(new ApiResponse(200, result, "Bill status updated successfully"));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BillController();
