const CylinderBooking = require("../models/CylinderBooking");
const GasConnection = require("../models/GasConnection");
const {
  createBookingSchema,
  updateBookingStatusSchema,
} = require("../validations");

// Get all bookings for a user
const getUserBookings = async (req, res) => {
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

    const bookings = await CylinderBooking.find(query)
      .populate("connectionId", "consumerNumber gasAgency")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await CylinderBooking.countDocuments(query);

    res.status(200).json({
      success: true,
      data: bookings,
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

// Get booking by ID
const getBookingById = async (req, res) => {
  try {
    const booking = await CylinderBooking.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isActive: true,
    }).populate("connectionId");

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Create new cylinder booking
const createBooking = async (req, res) => {
  try {
    const { error } = createBookingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const { connectionId } = req.body;

    // Verify user owns this connection
    const connection = await GasConnection.findOne({
      _id: connectionId,
      userId: req.user.id,
      status: "ACTIVE",
      isActive: true,
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        error: "Active gas connection not found",
      });
    }

    // Check for existing pending bookings
    const pendingBooking = await CylinderBooking.findOne({
      connectionId,
      status: { $in: ["PENDING", "CONFIRMED", "ASSIGNED", "OUT_FOR_DELIVERY"] },
      isActive: true,
    });

    if (pendingBooking) {
      return res.status(400).json({
        success: false,
        error:
          "You have a pending cylinder booking. Please wait for it to be delivered before placing a new order.",
      });
    }

    // Check monthly booking limit (government regulation)
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const nextMonth = new Date(thisMonth);
    nextMonth.setMonth(thisMonth.getMonth() + 1);

    const monthlyBookings = await CylinderBooking.countDocuments({
      connectionId,
      createdAt: { $gte: thisMonth, $lt: nextMonth },
      status: { $ne: "CANCELLED" },
      isActive: true,
    });

    // For subsidized cylinders, limit to 12 per year (1 per month average)
    if (
      req.body.cylinderDetails.cylinderType === "SUBSIDIZED" &&
      monthlyBookings >= 1
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Monthly subsidized cylinder limit reached. You can book non-subsidized cylinders.",
      });
    }

    // Calculate pricing
    const pricing = calculateCylinderPricing(req.body.cylinderDetails);

    const bookingData = {
      ...req.body,
      userId: req.user.id,
      consumerNumber: connection.consumerNumber,
      pricing,
    };

    const booking = new CylinderBooking(bookingData);
    await booking.save();

    await booking.populate("connectionId", "consumerNumber gasAgency");

    res.status(201).json({
      success: true,
      data: booking,
      message: "Cylinder booking created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update booking status
const updateBookingStatus = async (req, res) => {
  try {
    const { error } = updateBookingStatusSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const booking = await CylinderBooking.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    // Verify user owns this booking or is admin/agency
    if (
      booking.userId.toString() !== req.user.id &&
      !["admin", "agency", "delivery_person"].includes(req.user.role)
    ) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    const oldStatus = booking.status;

    // Update tracking information based on status
    if (
      req.body.status === "CONFIRMED" &&
      !booking.trackingInfo.orderAcceptedAt
    ) {
      booking.trackingInfo.orderAcceptedAt = new Date();
    } else if (
      req.body.status === "ASSIGNED" &&
      !booking.trackingInfo.cylinderDispatchedAt
    ) {
      booking.trackingInfo.cylinderDispatchedAt = new Date();
    } else if (
      req.body.status === "OUT_FOR_DELIVERY" &&
      !booking.trackingInfo.outForDeliveryAt
    ) {
      booking.trackingInfo.outForDeliveryAt = new Date();
    } else if (
      req.body.status === "DELIVERED" &&
      !booking.trackingInfo.deliveredAt
    ) {
      booking.trackingInfo.deliveredAt = new Date();
      booking.paymentDetails.paymentStatus = "PAID";
    }

    // Handle cancellation
    if (req.body.status === "CANCELLED") {
      booking.cancellation = {
        ...req.body.cancellation,
        cancelledAt: new Date(),
      };
    }

    // Update delivery details if provided
    if (req.body.deliveryDetails) {
      booking.deliveryDetails = {
        ...booking.deliveryDetails,
        ...req.body.deliveryDetails,
      };
    }

    booking.status = req.body.status;
    await booking.save();

    res.status(200).json({
      success: true,
      data: booking,
      message: `Booking status updated from ${oldStatus} to ${req.body.status}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: "Cancellation reason is required",
      });
    }

    const booking = await CylinderBooking.findOne({
      _id: req.params.id,
      userId: req.user.id,
      status: { $in: ["PENDING", "CONFIRMED", "ASSIGNED"] },
      isActive: true,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found or cannot be cancelled at this stage",
      });
    }

    booking.status = "CANCELLED";
    booking.cancellation = {
      reason,
      cancelledBy: "CUSTOMER",
      cancelledAt: new Date(),
    };

    // Process refund if payment was made
    if (booking.paymentDetails.paymentStatus === "PAID") {
      booking.cancellation.refundAmount = booking.pricing.finalAmount;
      booking.cancellation.refundStatus = "PENDING";
    }

    await booking.save();

    res.status(200).json({
      success: true,
      data: booking,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Track booking
const trackBooking = async (req, res) => {
  try {
    const { bookingNumber } = req.params;

    const booking = await CylinderBooking.findOne({
      bookingNumber,
      isActive: true,
    })
      .populate("connectionId", "consumerNumber gasAgency")
      .select(
        "bookingNumber status trackingInfo deliveryDetails estimatedDeliveryTime",
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    // Create tracking timeline
    const timeline = [];

    if (booking.trackingInfo.orderAcceptedAt) {
      timeline.push({
        status: "CONFIRMED",
        timestamp: booking.trackingInfo.orderAcceptedAt,
        description: "Order confirmed by gas agency",
      });
    }

    if (booking.trackingInfo.cylinderDispatchedAt) {
      timeline.push({
        status: "ASSIGNED",
        timestamp: booking.trackingInfo.cylinderDispatchedAt,
        description: "Cylinder assigned for delivery",
      });
    }

    if (booking.trackingInfo.outForDeliveryAt) {
      timeline.push({
        status: "OUT_FOR_DELIVERY",
        timestamp: booking.trackingInfo.outForDeliveryAt,
        description: "Out for delivery",
      });
    }

    if (booking.trackingInfo.deliveredAt) {
      timeline.push({
        status: "DELIVERED",
        timestamp: booking.trackingInfo.deliveredAt,
        description: "Delivered successfully",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        bookingNumber: booking.bookingNumber,
        currentStatus: booking.status,
        timeline,
        deliveryDetails: booking.deliveryDetails,
        estimatedDeliveryTime: booking.deliveryDetails.estimatedDeliveryTime,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Rate delivery service
const rateDelivery = async (req, res) => {
  try {
    const { deliveryRating, serviceRating, feedback } = req.body;

    if (!deliveryRating && !serviceRating) {
      return res.status(400).json({
        success: false,
        error: "At least one rating is required",
      });
    }

    const booking = await CylinderBooking.findOne({
      _id: req.params.id,
      userId: req.user.id,
      status: "DELIVERED",
      isActive: true,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Delivered booking not found",
      });
    }

    if (booking.customerRating.ratedAt) {
      return res.status(400).json({
        success: false,
        error: "You have already rated this delivery",
      });
    }

    booking.customerRating = {
      deliveryRating: deliveryRating || booking.customerRating.deliveryRating,
      serviceRating: serviceRating || booking.customerRating.serviceRating,
      feedback: feedback || booking.customerRating.feedback,
      ratedAt: new Date(),
    };

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Rating submitted successfully",
      data: booking.customerRating,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Helper function to calculate cylinder pricing
const calculateCylinderPricing = (cylinderDetails) => {
  const { capacity, quantity, cylinderType } = cylinderDetails;

  // Base prices (these would come from a pricing service in real world)
  const basePrices = {
    5: { SUBSIDIZED: 300, NON_SUBSIDIZED: 400, COMMERCIAL: 450 },
    14.2: { SUBSIDIZED: 850, NON_SUBSIDIZED: 1100, COMMERCIAL: 1200 },
    19: { SUBSIDIZED: 1100, NON_SUBSIDIZED: 1400, COMMERCIAL: 1500 },
    47.5: { SUBSIDIZED: 2500, NON_SUBSIDIZED: 3200, COMMERCIAL: 3500 },
  };

  const unitPrice = basePrices[capacity][cylinderType];
  const subsidyAmount = cylinderType === "SUBSIDIZED" ? unitPrice * 0.3 : 0; // 30% subsidy
  const deliveryCharges = capacity >= 19 ? 50 : 30; // Higher delivery charge for larger cylinders

  const totalAmount = unitPrice * quantity + deliveryCharges;
  const finalAmount = totalAmount - subsidyAmount;

  return {
    unitPrice,
    subsidyAmount,
    deliveryCharges,
    totalAmount,
    finalAmount,
  };
};

module.exports = {
  getUserBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  cancelBooking,
  trackBooking,
  rateDelivery,
};
