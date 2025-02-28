const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();
const sendEmailService = async (email, emailContent) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Thông báo từ hệ thống",
      text: `Các sản phẩm trong kho sắp hết:\n\n${emailContent}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email gửi thành công:", info);
    return { success: true, message: "Email đã được gửi", info };
  } catch (error) {
    console.error("Lỗi khi gửi email:", error); // Log lỗi chi tiết
    return {
      success: false,
      message: "Gửi email thất bại",
      error: error.message,
    };
  }
};

module.exports = sendEmailService;
