export const MESSAGES = {
  // Authentication & User Management
  LOGIN_SUCCESS: 'Login successful.',
  LOGIN_FAILED: 'Login failed. Please check your credentials.',
  INVALID_CREDENTIALS: 'Invalid credentials.',
  UNAUTHORIZED_ACCESS: 'Unauthorized access. Please log in.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  USER_NOT_FOUND: 'User does not exist.',
  USER_ALREADY_EXISTS: 'User with this email already exists.',
  ACCOUNT_VERIFIED: 'Account successfully verified.',
  ACCOUNT_NOT_VERIFIED: 'Your account is not verified yet.',
  LOGOUT_SUCCESS: 'Logged out successfully.',

  // Account Status & Blocking
  USER_BLOCKED: 'Your account has been blocked. Please contact support.',
  USER_UNBLOCKED: 'User account has been unblocked successfully.',
  USER_SUSPENDED: 'User account has been suspended.',
  USER_BANNED: 'Your account has been permanently banned.',
  USER_DEACTIVATED: 'Your account has been deactivated. Please contact support to reactivate.',
  WORKER_BLOCKED: 'Worker account has been blocked.',
  WORKER_UNBLOCKED: 'Worker account has been unblocked successfully.',
  WORKER_SUSPENDED: 'Worker account suspended.',
  WORKER_REINSTATED: 'Worker account reinstated successfully.',

  // Registration & Profile
  REGISTRATION_SUCCESS: 'Registration successful.',
  REGISTRATION_FAILED: 'Registration failed. Please try again.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  PROFILE_UPDATE_FAILED: 'Failed to update profile.',
  PASSWORD_CHANGED: 'Password changed successfully.',
  PASSWORD_RESET_SENT: 'Password reset email sent.',
  PASSWORD_RESET_SUCCESS: 'Password reset successful.',
  PASSWORD_RESET_FAILED: 'Failed to reset password.',
  SAME_CURR_NEW_PASSWORD: 'New password must be different from current password.',

  // OTP / Verification
  EMAIL_VERIFICATION_SENT: 'Verification email sent successfully.',
  EMAIL_VERIFICATION_SUCCESS: 'Email successfully verified.',
  EMAIL_VERIFICATION_FAILED: 'Failed to verify email.',
  OTP_SENT: 'OTP sent successfully.',
  OTP_VERIFIED: 'OTP verified successfully.',
  OTP_INVALID: 'Invalid OTP. Please try again.',
  OTP_EXPIRED: 'OTP has expired. Please request a new one.',

  // Booking & Services
  BOOKING_SUCCESS: 'Service booked successfully.',
  BOOKING_FAILED: 'Failed to book service. Please try again.',
  BOOKING_CANCELLED: 'Booking cancelled successfully.',
  BOOKING_ALREADY_EXISTS: 'You already have a booking for this time slot.',
  BOOKING_NOT_FOUND: 'Booking not found.',
  SLOT_UNAVAILABLE: 'Selected slot is no longer available.',
  SERVICE_CREATED: 'Service created successfully.',
  SERVICE_UPDATED: 'Service updated successfully.',
  SERVICE_DELETED: 'Service deleted successfully.',
  SERVICE_NOT_FOUND: 'Service not found.',
  SERVICE_ALREADY_EXISTS: 'Service with this name already exists.',

  // Payment
  TRANSACTION_FAILED: 'Transaction failed.',
  PAYMENT_IN_PROGRESS: 'Payment already initiated for this booking. Please complete or cancel the previous payment.',
  PAYMENT_FAILED: 'Payment failed.',
  PAYMENT_SUCCESS: 'Payment successful.',
  REFUND_INITIATED: 'Refund initiated successfully.',
  REFUND_FAILED: 'Refund failed. Please contact support.',
  WALLET_BALANCE_LOW: 'Insufficient wallet balance.',

  // Notifications & Reminders
  NOTIFICATION_SENT: 'Notification sent successfully.',
  REMINDER_SENT: 'Reminder sent successfully.',
  REMINDER_FAILED: 'Failed to send reminder.',

  // Data Operations
  DATA_SENT_SUCCESS: 'Data sent successfully.',
  DATA_FETCH_SUCCESS: 'Data fetched successfully.',
  ALREADY_EXISTS: 'Data already exists.',
  CREATED: 'Created successfully.',
  UPDATE_SUCCESS: 'Updated successfully.',
  DELETE_SUCCESS: 'Deleted successfully.',

  // Feedback & Ratings
  REVIEW_SUBMITTED: 'Review submitted successfully.',
  REVIEW_UPDATED: 'Review updated successfully.',
  REVIEW_DELETED: 'Review deleted successfully.',
  RATING_SUBMITTED: 'Rating submitted successfully.',

  // System & Validation
  SERVER_ERROR: 'An unexpected error occurred.',
  BAD_REQUEST: 'Invalid request. Please check the input data.',
  RESOURCE_NOT_FOUND: 'Requested resource not found.',
  VALIDATION_ERROR: 'Validation failed. Please check your input.',
  TOKEN_EXPIRED: 'Token expired.',
  TOKEN_BLACKLISTED: 'Session is no longer valid.',
  INVALID_TOKEN: 'Invalid session. Please log in again.',
  TOO_MANY_REQUESTS: 'Too many requests. Please try again later.',
  MAINTENANCE_MODE: 'The system is under maintenance. Please try again later.',

  // General UI
  LOADING: 'Please wait...',
  ACTION_SUCCESS: 'Action completed successfully.',
  ACTION_FAILED: 'Action failed. Please try again.',
};
