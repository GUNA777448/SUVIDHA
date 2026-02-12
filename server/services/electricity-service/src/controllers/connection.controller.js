const connectionService = require("../services/connection.service");
const { ApiResponse } = require("../../../../shared/common/utils/ApiResponse");

class ConnectionController {
  async getConnections(req, res, next) {
    try {
      const { userId } = req.user;
      const result = await connectionService.getConnections(userId);

      return res
        .status(200)
        .json(new ApiResponse(200, result, "Connections fetched successfully"));
    } catch (error) {
      next(error);
    }
  }

  async getConnectionById(req, res, next) {
    try {
      const { connectionId } = req.params;
      const result = await connectionService.getConnectionById(connectionId);

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            result,
            "Connection details fetched successfully",
          ),
        );
    } catch (error) {
      next(error);
    }
  }

  async createConnection(req, res, next) {
    try {
      const { userId } = req.user;
      const connectionData = { ...req.body, userId };
      const result = await connectionService.createConnection(connectionData);

      return res
        .status(201)
        .json(new ApiResponse(201, result, "Connection created successfully"));
    } catch (error) {
      next(error);
    }
  }

  async updateConnection(req, res, next) {
    try {
      const { connectionId } = req.params;
      const result = await connectionService.updateConnection(
        connectionId,
        req.body,
      );

      return res
        .status(200)
        .json(new ApiResponse(200, result, "Connection updated successfully"));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ConnectionController();
