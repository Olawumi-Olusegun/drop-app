
/**
 * @openapi
 * /api/v1/auth/signup-with-email:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Signup with email
 *     description: |
 *         - Create a new user account using an email address.
 *         - Register with email and role ("rider", "driver", "admin").
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "hustiyitru@gufum.com"
 *                 description: The email associated with the account.
 *               role:
 *                 type: string
 *                 example: "rider"
 *     responses:
 *       200:
 *         description: User successfully signed up
 *       400:
 *         description: Validation error
 */


/**
 * @openapi
 * /api/v1/auth/signup-with-phone-number:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Signup with phone number
 *     description: |
 *         - Create a new user account using a phone number.
 *         - Register with phoneNumber and role ("rider", "driver", "admin").
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "+2348758738673"
 *               role:
 *                 type: string
 *                 example: "rider"
 *     responses:
 *       200:
 *         description: User successfully signed up
 *       400:
 *         description: Validation error
 */


/**
 * @openapi
 * /api/v1/auth/signin-with-email:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User login
 *     description: |
 *       - Sign in with an identifier and password.
 *       - The identifier can be either an email or a phone number used during signup.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email or phone number used during signup
 *               password:
 *                 type: string
 *                 description: User's password
 *           examples:
 *             loginWithEmail:
 *               summary: Login with email
 *               description: Use email as the identifier
 *               value:
 *                 identifier: "johndoe@gmail.com"
 *                 password: "strongPassword123!"
 *             loginWithPhone:
 *               summary: Login with phone number
 *               description: Use phone number as the identifier
 *               value:
 *                 identifier: "+2347065064345"
 *                 password: "strongPassword12345!"
 *     responses:
 *       200:
 *         description: User successfully signed in
 *       401:
 *         description: Unauthorized
 */



/**
 * @swagger
 * /api/v1/signin-with-phone-number:
 *   post:
 *     summary: Sign in with a phone number
 *     description: Authenticates a user using their phone number.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "+2348012345678"
 *                 description: User's phone number in international format.
 *     responses:
 *       "200":
 *         description: Successfully signed in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "A 4 digit OTP has been sent to your phone"
 *       "400":
 *         description: Invalid request (e.g., missing phone number)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Phone number is required"
 *       "401":
 *         description: Unauthorized (e.g., invalid credentials)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid phone number"
 *       "500":
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */


/**
 * @swagger
 * /api/v1/auth/resend-new-otp:
 *   post:
 *     summary: Request a password reset
 *     description: |
 *       This endpoint allows a user to resend and get new OTP.
 *       The user must provide either an `email` or a `phoneNumber`.
 *       - If `email` is provided, `phoneNumber` should be omitted.
 *       - If `phoneNumber` is provided, `email` should be omitted.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               phoneNumber:
 *                 type: string
 *                 example: "+2348123456789"
 *             oneOf:
 *               - required: [email]
 *               - required: [phoneNumber]
 *           examples:
 *             ExampleWithEmail:
 *               summary: Resend OTP with email
 *               value:
 *                 email: "user@example.com"
 *             ExampleWithPhone:
 *               summary: Resend OTP with phone number
 *               value:
 *                 phoneNumber: "+2348123456789"
 *     responses:
 *       200:
 *         description: OTP sent successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Kindly check your phone or email for new OTP"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       400:
 *         description: Bad request (invalid input)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Either email or phoneNumber is required"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */



/**
 * @openapi
 * /api/v1/auth/verify-signup-with-phone-number:
 *   post:
 *     tags:
 *       - Verification
 *     summary: Verify phone number
 *     description: Verifies a user's phone number using OTP .
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "+1234567890"
 *               phoneNumberOTP:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: Phone number successfully verified
 *       400:
 *         description: Validation error or incorrect OTP
 *       401:
 *         description: Unauthorized request
 */


/**
 * @openapi
 * /api/v1/auth/verify-email:
 *   post:
 *     tags:
 *       - Verification
 *     summary: Verify email address
 *     description: Verifies a user's email address using OTP.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               emailOTP:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: Email successfully verified
 *       400:
 *         description: Validation error or incorrect OTP
 *       401:
 *         description: Unauthorized request
 */


/**
 * @openapi
 * /api/v1/auth/verify-signin-with-phone-number:
 *   post:
 *     tags:
 *       - Verification
 *     summary: Verify sign-in with phone number
 *     description: Verifies user login using a phone number and OTP.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - otp
 *               - role
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "+2349012345678"
 *                 description: The phone number used for sign-in.
 *               otp:
 *                 type: string
 *                 example: "1234"
 *                 description: The one-time password (OTP) sent to the user.
 *               role:
 *                 type: string
 *                 example: "rider"
 *                 description: The role of the user signing in.
 *     responses:
  *       200:
 *         description: Successfully verified the OTP and signed in.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sign-in successful"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     fullName:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                     phoneNumber:
 *                       type: string
 *                       example: "+2349012345678"
 *                     googleId:
 *                       type: string
 *                       example: "google-oauth-id-123"
 *                     isPhoneNumberVerified:
 *                       type: boolean
 *                       example: true
 *                     homeAddress:
 *                       type: string
 *                       example: "123 Street, Lagos"
 *                     longitude:
 *                       type: number
 *                       format: float
 *                       example: 3.3792
 *                     latitude:
 *                       type: number
 *                       format: float
 *                       example: 6.5244
 *                     isEmailVerified:
 *                       type: boolean
 *                       example: false
 *                     isNotification:
 *                       type: boolean
 *                       example: true
 *                     onlineStatus:
 *                       type: string
 *                       enum: ["online", "offline"]
 *                       example: "online"
 *                     role:
 *                       type: string
 *                       enum: ["rider", "driver", "admin"]
 *                       example: "rider"
 *                     modeOfRegistration:
 *                       type: string
 *                       enum: ["email", "phoneNumber", "googleId"]
 *                       example: "phoneNumber"
 *                     country:
 *                       type: string
 *                       example: "Nigeria"
 *                     city:
 *                       type: string
 *                       example: "Lagos"
 *                     accessToken:
 *                       type: string
 *                       example: "access-token-here"
 *                     profileImage:
 *                       type: string
 *                       example: "https://example.com/profile.jpg"
 *                     isUserVerified:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-02-21T10:00:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-02-21T12:00:00.000Z"
 *       400:
 *         description: Invalid OTP or missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid OTP"
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */


/**
 * @openapi
 * /api/v1/auth/create-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Create a password for the user
 *     description: Allows users to create a password after signing up with Google or phone number.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               googleId:
 *                 type: string
 *                 example: "google-oauth-id-123"
 *               phoneNumber:
 *                 type: string
 *                 example: "+1234567890"
 *               password:
 *                 type: string
 *                 example: "SecurePassword123!"
 *               confirmPassword:
 *                 type: string
 *                 example: "SecurePassword123!"
 *               modeOfRegistration:
 *                 type: string
 *                 example: "email"
 *                 description: Mode of registeration either email or phoneNumber.
 *     responses:
 *       200:
 *         description: Password successfully created
 *       400:
 *         description: Validation error (e.g., passwords do not match)
 *       401:
 *         description: Unauthorized request
 */


/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Request a password reset
 *     description: |
 *       This endpoint allows a user to request a password reset.
 *       The user must provide either an `email` or a `phoneNumber`.
 *       - If `email` is provided, `phoneNumber` should be omitted.
 *       - If `phoneNumber` is provided, `email` should be omitted.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               phoneNumber:
 *                 type: string
 *                 example: "+2348123456789"
 *             oneOf:
 *               - required: [email]
 *               - required: [phoneNumber]
 *           examples:
 *             ExampleWithEmail:
 *               summary: Forgot password with email
 *               value:
 *                 email: "user@example.com"
 *             ExampleWithPhone:
 *               summary: Forgot password with phone number
 *               value:
 *                 phoneNumber: "+2348123456789"
 *     responses:
 *       200:
 *         description: Password reset request successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password reset instructions sent successfully"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       400:
 *         description: Bad request (invalid input)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Either email or phoneNumber is required"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */



/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Reset user password
 *     description: Allows users to reset their password using an OTP.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *               - password
 *               - confirmPassword
 *             properties:
 *               otp:
 *                 type: string
 *                 example: "5423"
 *                 description: One-time password (OTP) sent to the user.
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "password@123"
 *                 description: New password for the user.
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: "password@123"
 *                 description: Confirm the new password.
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password reset successfully"
 *       400:
 *         description: Bad request (invalid or expired OTP, or passwords do not match)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid OTP or password mismatch"
 *       404:
 *         description: User not found or OTP not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found or invalid OTP"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */


/**
 * @openapi
 * /api/v1/auth/refresh-token:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Refresh authentication token
 *     description: Generates a new access token using your old accessToken.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Unauthorized
 */


/**
 * @openapi
 * /api/v1/auth/create-username:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Create user's fullname
 *     description: |
 *       - Create username with an identifier and fullName.
 *       - The identifier can be either an email or a phone number used during signup.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email or phone number used during signup
 *               fullName:
 *                 type: string
 *                 description: User's fullName
 *           examples:
 *             CreateUserWithThereEmail:
 *               summary: Create fullName with email address
 *               description: Use email as the identifier
 *               value:
 *                 identifier: "johndoe@gmail.com"
 *                 fullName: "John Doe"
 *             CreateUserWithTherePhoneNumber:
 *               summary: Create fullName with phone number
 *               description: Use phone number as the identifier
 *               value:
 *                 identifier: "+2347065064345"
 *                 fullName: "John Doe"
 *     responses:
 *       200:
 *         description: Username created successfully
 *       401:
 *         description: Unauthorized
 */


/**
 * @openapi
 * /api/v1/auth/add-user-phone-number:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Add phone number to a user account
 *     description: Allows a user to add a phone number to their account using providing an email, phone number along with a role.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *                 description: The email of the user is required.
 *               phoneNumber:
 *                 type: string
 *                 example: "+2349012345678"
 *                 description: The phone number of the user is required.
 *               role:
 *                 type: string
 *                 enum: ["rider", "driver", "admin"]
 *                 example: "rider"
 *                 description: The role of the user is required.
 *     responses:
 *       200:
 *         description: A 4-digit OTP has been sent to your phone.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Phone number added successfully"
 *       400:
 *         description: Bad request (missing required fields or invalid input).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email, phoneNumber and user role are required"
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */




/**
 * @openapi
 * /api/v1/auth/verify-phone-number:
 *   post:
 *     tags:
 *       - Verification
 *     summary: Verify phone number using OTP
 *     description: Verifies user's phone number using OTP.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - phoneNumberOTP
 *               - role
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "+2349012345678"
 *                 description: User's phone number
 *               phoneNumberOTP:
 *                 type: string
 *                 example: "1234"
 *                 description: OTP that was sent to the user.
 *               role:
 *                 type: string
 *                 example: "rider"
 *                 description: The role of the user.
 *     responses:
 *       200:
 *         description: OTP verified successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You phone number is now verified"
 *       400:
 *         description: Invalid OTP or missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid OTP"
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */



/**
 * @swagger
 * /api/v1/auth/update-profile:
 *   patch:
 *     summary: Update user profile
 *     description: Allows an authenticated user to update their profile details.
 *     tags:
 *       - User
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "Adetiba Kayode"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *       400:
 *         description: Bad request, missing or invalid parameters
 *       401:
 *         description: Unauthorized, user is not authenticated
 *       500:
 *         description: Internal server error
 */





