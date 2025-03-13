import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {AppError, AuthError} from "../../libs/@types/global";
import {DateTimeType, Platform} from "@mikro-orm/core";
import {AbstractSqlPlatform, MySqlPlatform} from "@mikro-orm/mysql";
import express from "express";

export const getUniqueString = (length: number = 8): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({length}, () =>
        characters.charAt(Math.floor(Math.random() * characters.length))
    ).join('');
}

export const generateAuthToken = (data: object) => {
    return jwt.sign(data, process.env.JWT ?? "", {expiresIn: '60m'})
}

export const hashString = (str: string): string => {
    return bcrypt.hashSync(str, 10);
}
export const passwordsMatch = (password: string, hash: string) => {
    return bcrypt.compareSync(password, hash);
}

export const verifyFields = (fields: string[], body: any) => {
    for (const field of fields)
        if (!body[field]) {
            throw new AuthError(`Expected field: ${field}`, 400)
        }
}

export const isValidPhoneNumber = (str: string): boolean => {
    // Check length is exactly 10
    console.log("length: ", str)
    if (str.length !== 10) throw new AppError('Phone number must be 10 digits', 400);

    // Check starts with 0
    if (!str.startsWith('0')) throw new AppError('Phone number must start with 0', 400);

    // Check all characters are digits
    if (str.split('').every(char => /\d/.test(char))) {
        return true;
    } else {
        throw new AppError('Phone number must only have digits', 400);
    }
};


export const convertToDateTime = (time: `${string}:${string}`) => {
    let [hours, minutes] = time.split(':');
    if (!hours || !minutes)
        throw new AppError("Invalid time format! Please check your input", 400);
    const date = new Date()
    const ready = new Date(date.getFullYear(), date.getMonth(), date.getDate(), parseInt(hours), parseInt(minutes), 0);
    const x = new DateTimeType()
    const val = x.convertToDatabaseValue(ready, new MySqlPlatform())
    return ready
}

export const handleError = (err: unknown | Error, res: express.Response, message: string = "Sorry something went wrong! Please try again!") => {
    if (err instanceof AppError)
        return res.status(err.status).json({message: err.message}).end()
    console.log("\tError: ", err)
    res.status(500).json({message}).end()
}