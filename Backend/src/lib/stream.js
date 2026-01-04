import { StreamChat } from "stream-chat";
import "dotenv/config"

const API_KEY = process.env.STEAM_API_KEY
const API_SECRET = process.env.STEAM_API_SECRET


const streamClient = StreamChat.getInstance(API_KEY,API_SECRET)


export const upsertStreamUser = async (userData) => {
    try {
        await streamClient.upsertUser(userData)
        return userData
    } catch(error){
        console.log("Error creating stream user",error)

    }
}

export const generateStreamToken = (userId) => {
  try {
    const userIdStr = userId.toString();
    return streamClient.createToken(userIdStr);
  } catch (error) {
    console.error("Error generating Stream token:", error);
  }
};

