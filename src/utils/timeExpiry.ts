
  export const expirationTime = (minutes: number = 10): Date => {
    const expiresAt = new Date(Date.now() + minutes * 60 * 1000);
    return expiresAt;
  };