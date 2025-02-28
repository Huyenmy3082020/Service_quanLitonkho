const NotificationService = require("../service/NotificationService");

const createNotification = async (req, res) => {
  try {
    const newNotification = await NotificationService.saveNotification(
      req.body
    );

    console.log("Notification created", req.body);
    return res.status(201).json({
      message: "Notification created successfully",
      notification: newNotification,
    });
  } catch (err) {
    console.error("Error creating notification:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
const getLatestNotifications = async (req, res) => {
  try {
    const notifications = await NotificationService.getLatestNotifications();
    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({ error: "Error fetching notifications" });
  }
};

module.exports = { createNotification, getLatestNotifications };
