const Complaint = require("../models/Complaint");
const GasConnection = require("../models/GasConnection");
const CylinderBooking = require("../models/CylinderBooking");
const {
  createComplaintSchema,
  updateComplaintSchema,
} = require("../validations");

// Get all complaints for a user
const getUserComplaints = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, priority } = req.query;

    const query = {
      userId: req.user.id,
      isActive: true,
    };

    if (status) {
      query.status = status;
    }

    if (category) {
      query["complaintDetails.category"] = category;
    }

    if (priority) {
      query["complaintDetails.priority"] = priority;
    }

    const complaints = await Complaint.find(query)
      .populate("connectionId", "consumerNumber gasAgency")
      .populate("bookingId", "bookingNumber")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Complaint.countDocuments(query);

    res.status(200).json({
      success: true,
      data: complaints,
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

// Get complaint by ID
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isActive: true,
    })
      .populate("connectionId")
      .populate("bookingId");

    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: "Complaint not found",
      });
    }

    res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Create new complaint
const createComplaint = async (req, res) => {
  try {
    const { error } = createComplaintSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const { connectionId, bookingId, consumerNumber } = req.body;

    // Verify consumer number exists and user owns it
    let connection = null;
    if (connectionId) {
      connection = await GasConnection.findOne({
        _id: connectionId,
        userId: req.user.id,
        isActive: true,
      });
    } else {
      connection = await GasConnection.findOne({
        consumerNumber,
        userId: req.user.id,
        isActive: true,
      });
    }

    if (!connection) {
      return res.status(404).json({
        success: false,
        error: "Gas connection not found",
      });
    }

    // If booking ID is provided, verify it belongs to user
    if (bookingId) {
      const booking = await CylinderBooking.findOne({
        _id: bookingId,
        userId: req.user.id,
        isActive: true,
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          error: "Cylinder booking not found",
        });
      }
    }

    // Set priority based on category
    let priority = req.body.complaintDetails.priority || "MEDIUM";
    if (
      ["SAFETY_CONCERN", "PIPELINE_LEAK", "CYLINDER_DEFECT"].includes(
        req.body.complaintDetails.category,
      )
    ) {
      priority = "HIGH";
    }
    if (req.body.complaintDetails.category === "PIPELINE_LEAK") {
      priority = "CRITICAL";
    }

    const complaintData = {
      ...req.body,
      userId: req.user.id,
      connectionId: connection._id,
      consumerNumber: connection.consumerNumber,
      complaintDetails: {
        ...req.body.complaintDetails,
        priority,
      },
    };

    // Add initial timeline entry
    complaintData.timeline = [
      {
        status: "OPEN",
        description: "Complaint registered",
        timestamp: new Date(),
      },
    ];

    const complaint = new Complaint(complaintData);
    await complaint.save();

    await complaint.populate("connectionId", "consumerNumber gasAgency");
    if (bookingId) {
      await complaint.populate("bookingId", "bookingNumber");
    }

    res.status(201).json({
      success: true,
      data: complaint,
      message: "Complaint registered successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update complaint (Admin/Staff only)
const updateComplaint = async (req, res) => {
  try {
    if (!["admin", "staff", "technician"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "Access denied. Staff privileges required.",
      });
    }

    const { error } = updateComplaintSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const complaint = await Complaint.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: "Complaint not found",
      });
    }

    const oldStatus = complaint.status;

    // Update complaint fields
    if (req.body.status) {
      complaint.status = req.body.status;
    }

    if (req.body.assignmentDetails) {
      complaint.assignmentDetails = {
        ...complaint.assignmentDetails,
        ...req.body.assignmentDetails,
        assignedAt: new Date(),
      };
    }

    if (req.body.resolution) {
      complaint.resolution = {
        ...complaint.resolution,
        ...req.body.resolution,
        resolutionDate: new Date(),
        resolvedBy: {
          employeeId: req.user.employeeId || req.user.id,
          name: req.user.name || req.user.email,
        },
      };

      if (complaint.status !== "RESOLVED") {
        complaint.status = "RESOLVED";
      }
    }

    // Add timeline entry if status changed
    if (req.body.status && oldStatus !== req.body.status) {
      complaint.timeline.push({
        status: req.body.status,
        description: `Status changed from ${oldStatus} to ${req.body.status}`,
        updatedBy: {
          employeeId: req.user.employeeId || req.user.id,
          name: req.user.name || req.user.email,
        },
        timestamp: new Date(),
      });
    }

    await complaint.save();

    res.status(200).json({
      success: true,
      data: complaint,
      message: "Complaint updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Add comment to complaint
const addComment = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Comment message is required",
      });
    }

    const complaint = await Complaint.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: "Complaint not found",
      });
    }

    // Verify user owns this complaint or is staff
    if (
      complaint.userId.toString() !== req.user.id &&
      !["admin", "staff", "technician"].includes(req.user.role)
    ) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    complaint.timeline.push({
      status: complaint.status,
      description: message,
      updatedBy: {
        employeeId: req.user.employeeId || req.user.id,
        name: req.user.name || req.user.email,
      },
      timestamp: new Date(),
    });

    await complaint.save();

    res.status(200).json({
      success: true,
      message: "Comment added successfully",
      data: complaint.timeline[complaint.timeline.length - 1],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Escalate complaint
const escalateComplaint = async (req, res) => {
  try {
    const { reason } = req.body;

    const complaint = await Complaint.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isActive: true,
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: "Complaint not found",
      });
    }

    if (complaint.status === "RESOLVED" || complaint.status === "CLOSED") {
      return res.status(400).json({
        success: false,
        error: "Cannot escalate a resolved or closed complaint",
      });
    }

    // Increase escalation level
    complaint.escalation.level += 1;
    complaint.escalation.escalatedAt = new Date();
    complaint.escalation.reason = reason || "Escalated by customer";
    complaint.status = "ESCALATED";

    // Add timeline entry
    complaint.timeline.push({
      status: "ESCALATED",
      description: `Complaint escalated to level ${complaint.escalation.level}. Reason: ${complaint.escalation.reason}`,
      updatedBy: {
        employeeId: req.user.id,
        name: req.user.name || req.user.email,
      },
      timestamp: new Date(),
    });

    await complaint.save();

    res.status(200).json({
      success: true,
      data: complaint,
      message: `Complaint escalated to level ${complaint.escalation.level}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Rate complaint resolution
const rateComplaint = async (req, res) => {
  try {
    const { rating, feedback } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: "Rating must be between 1 and 5",
      });
    }

    const complaint = await Complaint.findOne({
      _id: req.params.id,
      userId: req.user.id,
      status: { $in: ["RESOLVED", "CLOSED"] },
      isActive: true,
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: "Resolved/Closed complaint not found",
      });
    }

    if (complaint.customerSatisfaction.ratedAt) {
      return res.status(400).json({
        success: false,
        error: "You have already rated this complaint resolution",
      });
    }

    complaint.customerSatisfaction = {
      rating,
      feedback: feedback || "",
      ratedAt: new Date(),
    };

    // Close complaint if it was just resolved
    if (complaint.status === "RESOLVED") {
      complaint.status = "CLOSED";
    }

    await complaint.save();

    res.status(200).json({
      success: true,
      message: "Rating submitted successfully",
      data: complaint.customerSatisfaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get complaint statistics (Admin only)
const getComplaintStats = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Access denied. Admin privileges required.",
      });
    }

    const stats = await Complaint.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          open: { $sum: { $cond: [{ $eq: ["$status", "OPEN"] }, 1, 0] } },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "IN_PROGRESS"] }, 1, 0] },
          },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "RESOLVED"] }, 1, 0] },
          },
          closed: { $sum: { $cond: [{ $eq: ["$status", "CLOSED"] }, 1, 0] } },
          escalated: {
            $sum: { $cond: [{ $eq: ["$status", "ESCALATED"] }, 1, 0] },
          },
        },
      },
    ]);

    const categoryStats = await Complaint.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$complaintDetails.category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const priorityStats = await Complaint.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$complaintDetails.priority",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {
          total: 0,
          open: 0,
          inProgress: 0,
          resolved: 0,
          closed: 0,
          escalated: 0,
        },
        byCategory: categoryStats,
        byPriority: priorityStats,
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
  getUserComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
  addComment,
  escalateComplaint,
  rateComplaint,
  getComplaintStats,
};
