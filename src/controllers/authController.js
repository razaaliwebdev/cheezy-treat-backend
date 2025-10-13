import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import { generateToken } from "../utils/generateToken.js";
import { generateOtp } from "../utils/generateOtp.js";
import { sendEmail } from "../utils/sendEmail.js";

// Register Controller
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "All the fields are required",
      });
    }

    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      address,
    });

    const toEmail = user.email;
    const otp = generateOtp();
    user.otp = {
      code: otp,
      expiresAt: Date.now() + 15 * 60 * 1000,
    };
    await user.save();

    // Send Verification Email  OTP
    const subject = "Verify Your Email Address";
    const htmlContent = `<div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f9fafc; padding: 30px;">
    <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); overflow: hidden;">
      <div style="background: linear-gradient(90deg, #FF914D, #FFB84D); padding: 20px; text-align: center;">
        <h2 style="color: #fff; margin: 0; font-size: 22px;">🍕 Cheezy Treat</h2>
      </div>
      <div style="padding: 30px; text-align: center;">
        <h3 style="color: #333; font-size: 20px; margin-bottom: 10px;">Verify Your Email</h3>
        <p style="color: #555; font-size: 15px; margin-bottom: 25px;">
          Hi <strong>${name}</strong>, <br/>
          Please use the following OTP to verify your email address. It will expire in <b>10 minutes</b>.
        </p>
        <div style="display: inline-block; background-color: #FF914D; color: #fff; font-size: 26px; font-weight: bold; padding: 12px 25px; border-radius: 8px; letter-spacing: 3px;">
          ${otp}
        </div>
        <p style="color: #888; font-size: 13px; margin-top: 25px;">
          Didn’t request this? You can safely ignore this email.
        </p>
      </div>
      <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;">
        © ${new Date().getFullYear()} Cheezy Treat. All rights reserved.
      </div>
    </div>
  </div>`;

    try {
      await sendEmail({ toEmail, subject, htmlContent });
      // console.log("Email sent successfully");
    } catch (error) {
      console.log("Failed to send email", error);
      return res.status(500).json({
        success: false,
        message: "Failed to send email",
      });
    }

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.log("Failed to register", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Login Controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User is not verified.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user,
    });
  } catch (error) {
    console.log("Failed to login", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Forgot Password Controller  Send Otp
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found.",
      });
    }

    const otp = generateOtp();
    user.otp = {
      code: otp,
      expiresAt: Date.now() + 15 * 60 * 1000,
    };

    await user.save();

    // Send Otp Via Email
    const toEmail = user.email;
    const subject = "Verify Your Email Address";
    const htmlContent = `<div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f9fafc; padding: 30px;">
    <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); overflow: hidden;">
      <div style="background: linear-gradient(90deg, #FF914D, #FFB84D); padding: 20px; text-align: center;">
        <h2 style="color: #fff; margin: 0; font-size: 22px;">🍕 Cheezy Treat</h2>
      </div>
      <div style="padding: 30px; text-align: center;">
        <h3 style="color: #333; font-size: 20px; margin-bottom: 10px;">Verify Your Email</h3>
        <p style="color: #555; font-size: 15px; margin-bottom: 25px;">
          Hi <strong>${user.name}</strong>, <br/>
          Please use the following OTP to verify your email address. It will expire in <b>10 minutes</b>.
        </p>
        <div style="display: inline-block; background-color: #FF914D; color: #fff; font-size: 26px; font-weight: bold; padding: 12px 25px; border-radius: 8px; letter-spacing: 3px;">
          ${otp}
        </div>
        <p style="color: #888; font-size: 13px; margin-top: 25px;">
          Didn’t request this? You can safely ignore this email.
        </p>
      </div>
      <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;">
        © ${new Date().getFullYear()} Cheezy Treat. All rights reserved.
      </div>
    </div>
  </div>`;

    try {
      await sendEmail({ toEmail, subject, htmlContent });
    } catch (error) {
      console.log("Failed to send email", error);
      return res.status(500).json({
        success: false,
        message: "Failed to send email",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Otp sent successfully",
    });
  } catch (error) {
    console.log("Failed to send otp", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Verify Otp
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and Otp are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.otp || !user.otp.code) {
      return res.status(400).json({
        success: false,
        message: "No OTP found for this user. Please request again.",
      });
    }

    if (user.otp.code !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.otp.expiresAt < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request again.",
      });
    }

    user.isVerified = true;
    user.otp = null;
    await user.save();

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "User verified successfully",
      user,
    });
  } catch (error) {
    console.log("Failed to verify otp", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Reset Password Controller
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;
    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New Password and Confirm Password are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New Password and Confirm Password do not match",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    await user.save();

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
      user,
    });
  } catch (error) {
    console.log(`Failed to reset password.`, error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// current user logged in .  getMe
export const getMe = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found."
      })
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully.",
      user
    })

  } catch (error) {
    console.log("Failed to fetched user", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    })
  }
};

// Logout Controller
export const logout = async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
