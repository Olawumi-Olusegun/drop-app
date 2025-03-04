import { formatInTimeZone } from "date-fns-tz";

export const convertToUserTimezone = (date: Date, userTimezone: string) => {
    return formatInTimeZone(date, userTimezone, "yyyy-MM-dd HH:mm:ssXXX");
  };