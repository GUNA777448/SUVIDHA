const GasConnection = require("../models/GasConnection");
const {
  createConnectionSchema,
  updateConnectionSchema,
} = require("../validations");

// Get all connections for a user
const getUserConnections = async (req, res) => {
  try {
    const connections = await GasConnection.find({
      userId: req.user.id,
      isActive: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: connections,
      count: connections.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get connection by ID
const getConnectionById = async (req, res) => {
  try {
    const connection = await GasConnection.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isActive: true,
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        error: "Connection not found",
      });
    }

    res.status(200).json({
      success: true,
      data: connection,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get connection by consumer number
const getConnectionByConsumerNumber = async (req, res) => {
  try {
    const { consumerNumber } = req.params;

    const connection = await GasConnection.findOne({
      consumerNumber,
      isActive: true,
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        error: "Connection not found with this consumer number",
      });
    }

    // Only return connection if user owns it or is admin
    if (
      connection.userId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    res.status(200).json({
      success: true,
      data: connection,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Create new gas connection
const createConnection = async (req, res) => {
  try {
    const { error } = createConnectionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    // Check if user already has a connection with the same Aadhaar
    const existingConnection = await GasConnection.findOne({
      "customerDetails.aadhaarNumber": req.body.customerDetails.aadhaarNumber,
      isActive: true,
    });

    if (existingConnection) {
      return res.status(400).json({
        success: false,
        error: "A connection already exists with this Aadhaar number",
      });
    }

    const connectionData = {
      ...req.body,
      userId: req.user.id,
    };

    const connection = new GasConnection(connectionData);
    await connection.save();

    res.status(201).json({
      success: true,
      data: connection,
      message: "Gas connection application submitted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update connection
const updateConnection = async (req, res) => {
  try {
    const { error } = updateConnectionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const connection = await GasConnection.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isActive: true,
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        error: "Connection not found",
      });
    }

    // Update connection
    const updatedConnection = await GasConnection.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true },
    );

    res.status(200).json({
      success: true,
      data: updatedConnection,
      message: "Connection updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Transfer connection
const transferConnection = async (req, res) => {
  try {
    const { newOwnerDetails, reason } = req.body;

    if (!newOwnerDetails || !newOwnerDetails.aadhaarNumber) {
      return res.status(400).json({
        success: false,
        error: "New owner details with Aadhaar number required",
      });
    }

    const connection = await GasConnection.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isActive: true,
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        error: "Connection not found",
      });
    }

    // Create transfer request (in real-world, this would go through approval process)
    connection.customerDetails = {
      ...connection.customerDetails,
      ...newOwnerDetails,
    };
    connection.status = "PENDING_ACTIVATION";

    await connection.save();

    res.status(200).json({
      success: true,
      data: connection,
      message: "Connection transfer request submitted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Deactivate connection
const deactivateConnection = async (req, res) => {
  try {
    const connection = await GasConnection.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isActive: true,
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        error: "Connection not found",
      });
    }

    connection.status = "TERMINATED";
    connection.isActive = false;
    await connection.save();

    res.status(200).json({
      success: true,
      message: "Connection deactivated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  getUserConnections,
  getConnectionById,
  getConnectionByConsumerNumber,
  createConnection,
  updateConnection,
  transferConnection,
  deactivateConnection,
};
