const Connection = require("../models/Connection");
const { ApiError } = require("../../../../shared/common/utils/ApiError");

class ConnectionService {
  async getConnections(userId) {
    const connections = await Connection.find({ userId }).sort({
      createdAt: -1,
    });

    return connections;
  }

  async getConnectionById(connectionId) {
    const connection = await Connection.findById(connectionId).populate(
      "userId",
      "username email phoneNumber",
    );

    if (!connection) {
      throw new ApiError(404, "Connection not found");
    }

    return connection;
  }

  async createConnection(connectionData) {
    const connection = await Connection.create(connectionData);
    return connection;
  }

  async updateConnection(connectionId, updateData) {
    const connection = await Connection.findByIdAndUpdate(
      connectionId,
      updateData,
      { new: true, runValidators: true },
    );

    if (!connection) {
      throw new ApiError(404, "Connection not found");
    }

    return connection;
  }
}

module.exports = new ConnectionService();
