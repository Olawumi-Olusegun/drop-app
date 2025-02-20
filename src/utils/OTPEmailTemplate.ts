
export const OTPEmailTemplate = (otp: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <h2 style="color: #333;">Your OTP Code</h2>
    <p style="font-size: 16px;">Use the OTP below to complete your verification:</p>
    <h3 style="background: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; border-radius: 5px;">${otp}</h3>
    <p style="font-size: 14px; color: #555;">This OTP expires in 10 minutes. Do not share it with anyone.</p>
    <p style="font-size: 14px;">If you did not request this, please ignore this email.</p>
  </div>
`;
