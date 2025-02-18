import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";


export interface User extends Document {
  fullName?: string;
  email?: string;
  password?: string;
  phoneNumber?: string;
  googleId?: string;
  isPhoneNumberVerified: boolean;
  homeAddress?: string;
  addressCoordinates: {
    longitude?: number;
    latitude?: number;
  };
  isEmailVerified: boolean;
  isNotification: boolean;
  onlineStatus: 'online' | 'offline';
  role: 'rider' | 'driver' | 'admin';
  modeOfRegisteration: 'phoneNumber' | 'email' | 'googleId';
  country?: string;
  city?: string;
  phoneNumberOTP: string;
  resetToken: string;
  accessToken: string;
  refreshToken: string;
  profileImage?: string;
  isUserVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  isValidPassword: (password: string) => Promise<boolean>;
}

const userSchema = new Schema<User>(
  {
    fullName: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    phoneNumber: { type: String, unique: true },
    googleId: { type: String, unique: true },
    isPhoneNumberVerified: { type: Boolean, default: false },
    homeAddress: { type: String },
    addressCoordinates: {
      longitude: { type: Number },
      latitude: { type: Number },
    },
    isEmailVerified: { type: Boolean, default: false },
    isNotification: { type: Boolean, default: false },
    onlineStatus: { type: String, enum: ['online', 'offline'], default: 'offline' },
    role: { type: String, enum: ['rider', 'driver', 'admin'], required: true },
    modeOfRegisteration: { type: String, enum: ['phoneNumber', 'email', 'googleId'], required: true },
    country: { type: String },
    city: { type: String },
    phoneNumberOTP: { type: String },
    resetToken: { type: String },
    accessToken: { type: String },
    refreshToken: { type: String },
    profileImage: { type: String },
    isUserVerified: { type: Boolean, default: false },
  }, { timestamps: true });

userSchema.pre("save" , async function(next) {
    if(this.isModified("password")) {
      const salt = await bcrypt.genSalt(12);
        if(this.password) {
          this.password = await bcrypt.hash(this.password, salt);
        }
    }
    next();
});

userSchema.methods.isValidPassword = async function(password: string) {
  return await bcrypt.compare(password, this.password);
}

export default mongoose.model<User>("User", userSchema);
