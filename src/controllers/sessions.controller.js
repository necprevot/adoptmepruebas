import { usersService } from "../services/index.js";
import { createHash, passwordValidation } from "../utils/index.js";
import jwt from 'jsonwebtoken';
import UserDTO from '../dto/User.dto.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'tokenSecretJWT';
const COOKIE_NAME = process.env.COOKIE_NAME || 'coderCookie';
const COOKIE_MAX_AGE = parseInt(process.env.COOKIE_MAX_AGE) || 3600000;

const register = async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;
        if (!first_name || !last_name || !email || !password) {
            return res.status(400).send({ status: "error", error: "Incomplete values" });
        }
        const exists = await usersService.getUserByEmail(email);
        if (exists) {
            return res.status(400).send({ status: "error", error: "User already exists" });
        }
        const hashedPassword = await createHash(password);
        const user = {
            first_name,
            last_name,
            email,
            password: hashedPassword,
            documents: [],
            last_connection: new Date()
        }
        let result = await usersService.create(user);
        console.log(result);
        res.send({ status: "success", payload: result._id });
    } catch (error) {
        res.status(500).send({ status: "error", error: error.message });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send({ status: "error", error: "Incomplete values" });
        }
        const user = await usersService.getUserByEmail(email);
        if (!user) {
            return res.status(404).send({ status: "error", error: "User doesn't exist" });
        }
        const isValidPassword = await passwordValidation(user, password);
        if (!isValidPassword) {
            return res.status(400).send({ status: "error", error: "Incorrect password" });
        }

        // Actualizar last_connection
        await usersService.update(user._id, { last_connection: new Date() });

        const userDto = UserDTO.getUserTokenFrom(user);
        const token = jwt.sign(userDto, JWT_SECRET, { expiresIn: "1h" });
        res.cookie(COOKIE_NAME, token, { maxAge: COOKIE_MAX_AGE })
            .send({ status: "success", message: "Logged in" });
    } catch (error) {
        res.status(500).send({ status: "error", error: error.message });
    }
}

const logout = async (req, res) => {
    try {
        const cookie = req.cookies[COOKIE_NAME];
        if (cookie) {
            const user = jwt.verify(cookie, JWT_SECRET);
            
            // Buscar usuario por email y actualizar last_connection
            const userInDb = await usersService.getUserByEmail(user.email);
            if (userInDb) {
                await usersService.update(userInDb._id, { last_connection: new Date() });
            }
        }

        res.clearCookie(COOKIE_NAME);
        return res.send({ status: "success", message: "Logged out" });
    } catch (error) {
        res.clearCookie(COOKIE_NAME);
        return res.send({ status: "success", message: "Logged out" });
    }
}

const current = async (req, res) => {
    const cookie = req.cookies[COOKIE_NAME];
    if (!cookie) {
        return res.status(401).send({ status: "error", error: "No token provided" });
    }
    try {
        const user = jwt.verify(cookie, JWT_SECRET);
        return res.send({ status: "success", payload: user });
    } catch (error) {
        return res.status(401).send({ status: "error", error: "Invalid token" });
    }
}

const unprotectedLogin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send({ status: "error", error: "Incomplete values" });
    }
    const user = await usersService.getUserByEmail(email);
    if (!user) {
        return res.status(404).send({ status: "error", error: "User doesn't exist" });
    }
    const isValidPassword = await passwordValidation(user, password);
    if (!isValidPassword) {
        return res.status(400).send({ status: "error", error: "Incorrect password" });
    }

    // Actualizar last_connection
    await usersService.update(user._id, { last_connection: new Date() });

    const token = jwt.sign(user.toObject(), JWT_SECRET, { expiresIn: "1h" });
    res.cookie('unprotectedCookie', token, { maxAge: COOKIE_MAX_AGE })
        .send({ status: "success", message: "Unprotected Logged in" });
}

const unprotectedCurrent = async (req, res) => {
    const cookie = req.cookies['unprotectedCookie'];
    if (!cookie) {
        return res.status(401).send({ status: "error", error: "No token provided" });
    }
    try {
        const user = jwt.verify(cookie, JWT_SECRET);
        return res.send({ status: "success", payload: user });
    } catch (error) {
        return res.status(401).send({ status: "error", error: "Invalid token" });
    }
}

export default {
    current,
    login,
    logout,
    register,
    unprotectedLogin,
    unprotectedCurrent
};