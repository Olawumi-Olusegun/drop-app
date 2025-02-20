import bcrypt from "bcryptjs"

export const hashPassword = async (password: string) => {
    try {
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    } catch (error) {
        throw error;
    }
}

export const isPasswordValid = async (password: string, appPassword: string) => {
    try {
        return await bcrypt.compare(password, appPassword);
    } catch (error) {
        throw error;
    }
}