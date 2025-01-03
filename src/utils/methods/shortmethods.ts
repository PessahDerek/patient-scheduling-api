import bcrypt from 'bcrypt'

export const getUniqueString = (length: number = 8): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({length}, () =>
        characters.charAt(Math.floor(Math.random() * characters.length))
    ).join('');
}

export const hashString = (str: string): string => {
    return bcrypt.hashSync(str, 20);
}
export const comparePassword = (password: string, hash: string) => {
    return bcrypt.compareSync(password, hash);
}

export const isValidPhoneNumber = (str: string): boolean => {
    // Check length is exactly 10
    if (str.length !== 10) throw new Error('Phone number must be 10 digits');

    // Check starts with 0
    if (!str.startsWith('0')) throw new Error('Phone number must start with 0');

    // Check all characters are digits
    if (str.split('').every(char => /\d/.test(char))) {
        return true;
    } else {
        throw new Error('Phone number must only have digits');
    }
};