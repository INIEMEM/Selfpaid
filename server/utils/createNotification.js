const Notification = require("../models/Notification");
const { getIO } = require("../socket");

const createNotification = async (recipientId, type, message, taskRef = null) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      type,
      message,
      taskRef,
    });

    try {
      const io = getIO();
      if (io) {
        io.to(recipientId.toString()).emit("new_notification", {
          _id: notification._id,
          type,
          message,
          taskRef,
          isRead: false,
          createdAt: notification.createdAt,
        });
      }
    } catch (socketError) {
      // getIO might throw if socket is not initialized yet in testing, safe to catch
      console.error("Socket error emitting notification:", socketError.message);
    }

    return notification;
  } catch (error) {
    console.error("DB error creating notification:", error.message);
  }
};

module.exports = createNotification;
