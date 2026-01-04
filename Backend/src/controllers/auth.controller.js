import User from "../models/User.js";
import jwt from 'jsonwebtoken'
import { upsertStreamUser } from "../lib/stream.js";

export async function register(req,res){

    const {email,password,fullName} = req.body

    try{
        if(!email || !password || !fullName){
            return res.status(400).json({message: "All fields are required"})
        }

        if(password.length < 6){
            return res.status(400).json({message: "Password must be atleast 6 characters"})
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const existingUser = await User.findOne({ email })
        if(existingUser){
            return res.status(400).json({ message: "User already exist." });
        }

        const idx = Math.floor(Math.random() * 100) + 1
        const randomAvatar = `https://i.pravatar.cc/100/${idx}.png`

        const newUser = await User.create({
            email,
            fullName,
            password,
            profilepic: randomAvatar
        })

        try {
            await upsertStreamUser({
            id: newUser._id.toString(),
            name: newUser.fullName,
            image: newUser.profilepic || "",
        });
        console.log(`Stream user created for ${newUser.fullName}`);
        } catch (error) {
            console.log("Error creating Stream user:", error);
        }

        const token = jwt.sign({userId: newUser._id},process.env.JSON_WEB_TOKEN,{
            expiresIn: "7d"
        })

        res.cookie("jwt",token,{
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production"
        })

        res.status(200).json({success: true,user: newUser})
    }catch(error){
        console.log("Error in registration route: ",error)
        res.status(500).json({message: "Internal Server error"})
    }

}

export async function login(req,res){
    try{
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign({ userId: user._id }, process.env.JSON_WEB_TOKEN, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function onboard(req,res){
    try{
        const userId = req.user._id

        const {fullName,bio,language,location} = req.body

        if(!fullName || !bio || !language || !location){
            return res.status(400).json({
                message: "All fields are required",
                missingFields: [
                    !fullName && "fullName",
                    !bio && "bio",
                    !language && "language",
                    !location && "location"
                ].filter(Boolean)
            })
        }

        const updated = await User.findByIdAndUpdate(userId,{
            ...req.body,
            isOnboarded: true
        },{new: true})

        if(!updated){
            return res.status(400).json({ message: "Not updated user not found" })
        }

        try{
            await upsertStreamUser({
            id: updated._id.toString(),
            name: updated.fullName,
            image: updated.profilepic || ""
            })
            console.log(`Stream user details updated after onboarding of ${updated.fullName}`)
        }catch(error){
            console.log("Error in upstreaming user details: ",error)
        }

        res.status(200).json({ success: true,user: updated})
    }catch(error){
        console.log("Error in onboard controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function logout(req,res){
    res.clearCookie("jwt")
    res.status(200).json({success: true , message: "Logout success"})
}