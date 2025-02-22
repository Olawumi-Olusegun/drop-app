
export const OTPEmailTemplate = (otp: string) => `
<!DOCTYPE html>  
<html lang="en">  
<head>  
    <meta charset="UTF-8">  
    <meta name="viewport" content="width=device-width, initial-scale=1.0">  
    <title>OTP Verification Code</title>  
    <style>  
        body {  
            font-family: Arial, sans-serif;  
            background: linear-gradient(to right, #e0eafc, #cfdef3); 
            margin: 0;  
            padding: 20px;  
            display: flex;  
            justify-content: center;  
            align-items: center;  
            height: 100vh;  
        }  

        .container {  
            background-color: #ffffff;  
            border-radius: 10px;  
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);  
            padding: 40px;  
            text-align: center;  
            max-width: 400px;  
            margin: auto;  
        }  

        .title {  
            font-size: 24px;  
            font-weight: bold;  
            color: #3a3a3a;
            margin: 0;  
            background: linear-gradient(to right, #ff6a00, #ee0979); /* Gradient color for title */  
            background-clip: text;  
            color: transparent;  
        }  

        .subtitle {  
            font-size: 20px;  
            color: #5a5a5a;
            margin: 10px 0 20px;  
        }  

        .greeting {  
            font-size: 16px;  
            color: #666;
            margin: 20px 0;  
        }  

        .otp-code {  
            font-size: 36px;  
            font-weight: bold;  
            color: #ff5722; 
            margin: 20px 0;  
        }  

        .warning {  
            font-size: 14px;  
            color: #666;
            margin: 20px 0;  
        }  

        .signature {  
            font-size: 16px;  
            color: #3a3a3a;
            margin: 30px 0 0;  
        }  
    </style>
</head>  
<body>
    <div class="container">
        <h1 class="title">YOUR OTP</h1>
        <h2 class="subtitle">VERIFICATION CODE</h2>
        <p class="greeting">Hello,<br>Thank you for using Drop app! To complete your account verification, please use the following One-Time Password (OTP):</p>  
        <div class="otp-code">${otp}</div>
        <p class="warning">Please do not share this code with anyone for security reasons. If you did not request this, please ignore this email or contact our support team.</p>  
        <p class="signature">Best Regards,<br>Drop Team</p>  
    </div>  
</body>  
</html>
`;
