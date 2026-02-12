const AuditLog = require("../models/AuditLog");

class AuditService {
  /**
   * Log an auth event
   * @param {string} event - Event type (e.g., 'LOGIN_SUCCESS')
   * @param {object} data - Event data
   * @param {string} [data.userId] - User ID
   * @param {string} [data.identifier] - Login identifier
   * @param {string} [data.loginType] - Login type (M/A/C)
   * @param {string} [data.ipAddress] - Client IP
   * @param {string} [data.userAgent] - Client user agent
   * @param {object} [data.details] - Additional details
   * @param {boolean} [data.success] - Whether the action succeeded
   */
  async log(event, data = {}) {
    try {
      await AuditLog.create({
        event,
        userId: data.userId || null,
        identifier: data.identifier || null,
        loginType: data.loginType || null,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
        details: data.details || null,
        success: data.success !== undefined ? data.success : true,
      });
    } catch (error) {
      // Never let audit logging failures break the main flow
      console.error(`Audit log failed for event ${event}:`, error.message);
    }
  }

  /**
   * Get audit logs for a user
   */
  async getLogsByUser(userId, limit = 50) {
    return AuditLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Get recent auth events (for admin dashboard)
   */
  async getRecentEvents(limit = 100) {
    return AuditLog.find().sort({ createdAt: -1 }).limit(limit).lean();
  }

  /**
   * Get failed login attempts for an identifier
   */
  async getFailedAttempts(identifier, minutes = 30) {
    const since = new Date(Date.now() - minutes * 60 * 1000);
    return AuditLog.countDocuments({
      identifier,
      event: { $in: ["OTP_FAILED", "OTP_LOCKED", "LOGIN_FAILED"] },
      createdAt: { $gte: since },
    });
  }
}

module.exports = new AuditService();
