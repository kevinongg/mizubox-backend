import express from "express";
import requireBody from "../middleware/requireBody";
import { createUser, getUserByCredentials } from '#db/queries/users';
const router = express.Router();
export default router;


// ----------------users register-------------

router.post("/register",
    requireBody(['name', 'email', 'password', 'role']),
    async (req,res) => {
        const {name, email, password, role} = req.body;
        const user = await createUser(name, email, password, role);
        const token = createToken({id: user.id });
        return res.status(201).json({user, token});
    }
);

// ----------------users login-------------


router.post("/login", 
    requireBody(['email', 'password']),
    async (req,res) => {
        const {email, password} = req.body; 
        const user = await getUserByEmail(email, password);
        if(!user) {
            return res.status(401).send("Invalid email or password");
        }
            const token = createToken ({id: user.id });
            return res.status(200).json({user, token});     
        });