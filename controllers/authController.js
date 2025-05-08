const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dbConnection = require("../config/dbConnection");

/**
 * Handles user registration.
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - Contains username and password
 * @param {string} req.body.username - The desired username of the user
 * @param {string} req.body.password - The desired password of the user
 * @returns {Object} JSON response with success or error message
 */
exports.register = async (req, res) => {

    try {
        const { username = "", password = "" } = req?.body;

        //Validate the username and password
        if (!username || !password) {
            return res
                .status(400)
                .json({ error: "Username and password are required." });
        }

        if (password.length < 6 || password.length > 20) {
            return res
                .status(400)
                .json({ error: "Password length must be between 6 to 20 characters." });
        }

        //check for existing username
        const [[user]] = await dbConnection.query(
            "SELECT * FROM users WHERE username = ?",
            [username]
        );
        if (user)
            return res.status(401).json({ error: "Username already exists." });

        //hash the password
        const passwordHash = await bcrypt.hash(password, 10);

        //insert the new user's info
        await dbConnection.query("INSERT INTO users (username, password) VALUES (?, ?)", [
            username,
            passwordHash,
        ]);
        res.status(201).json({ message: "User registered successfully." });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

/**
 * Handles user registration.
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - Contains username and password
 * @param {string} req.body.username - The username of the user
 * @param {string} req.body.password - The password of the user
 * @returns {Object} JWT token
 */
exports.login = async (req, res) => {
    const { username, password } = req.body;

    //validate the username and password
    if (!username || !password) {
        return res
            .status(400)
            .json({ error: "Username and password are required" });
    }

    try {
        const [[user]] = await dbConnection.query(
            "SELECT * FROM users WHERE username = ?",
            [username]
        );
        if (!user) return res.status(401).json({ error: "User not found." });

        //match the password
        if (!(await bcrypt.compare(password, user.password)))
            return res.status(401).json({ error: "Invalid credentials" });

        //generate token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET
        );
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
