import { io } from "socket.io-client"

const URL = process.env.NODE_ENV === "production" ? undefined : "http://localhost:5005";

// export const socket = io(URL);
export const socket = null