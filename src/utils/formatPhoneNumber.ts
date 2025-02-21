import parsePhoneNumberFromString, { CountryCode } from "libphonenumber-js"


export const formatPhoneNumber = (phoneNumber: string, countryCode: CountryCode = "NG") => {
    const formattedPhoneNumber = parsePhoneNumberFromString(phoneNumber, countryCode);
    return formattedPhoneNumber && formattedPhoneNumber.isValid() 
        ? formattedPhoneNumber.formatInternational().replace(/\s+/g, "") 
        : null;
};
