var express = require("express");
var cors = require("cors");

const dotenv = require("dotenv");
var connectDb = require("./models/connectionDB");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const https = require("https");
const fs = require("fs");
const {Message} = require("./models/messageSchema");
var app = express();
const dirname = path.resolve();

const server = require("http").createServer(app);
const io = require("socket.io")(server, {
   cors: {
      origin: "*",
      methods: ["GET", "POST"]
   }
});
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
dotenv.config();
connectDb();
var port = process.env.PORT || 5000;

app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

if (process.env.NODE_ENV === "production") {
   app.use(express.static(path.join(__dirname, "/frontend/build")));

   app.get("/", (req, res) =>
      res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"))
   );
} else {
   app.get("/", (req, res) => {
      res.send("API is running....");
   });
}



const Router = express.Router(app);
app.get("/", (req, res) => {
   res.send("API is running....");
});
app.use("/api", Router);

const {signup, login} = require("./controllers/register");
const {
   getAllMessages,
   manufacturerSend,
   transporterSend,
   getDetails,
   transporters,
   getOrderId,
   previousChats
} = require("./controllers/messages");
const {verifyToken} = require("./middlewares/authentication");
const shortid = require("shortid");

Router.post("/signup", signup);
Router.post("/login", login);
Router.get("/messages", getAllMessages);
Router.post("/send-message", verifyToken, manufacturerSend);
Router.post("/send-reply", verifyToken, transporterSend);
Router.get("/getDetails", verifyToken, getDetails); //address
Router.get("/transporters", verifyToken, transporters);
Router.get("/getOrderId", verifyToken, getOrderId);
Router.get("/previousChats/:transporterId", previousChats);

// Handle incoming socket connections
io.on("connection", socket => {
   console.log("User connected:", socket.id);

   // Handle transporter selection and previous chats fetch
   socket.on("selectTransporter", async transporterId => {
      try {
         const previousChats = await Message.find({transporter_id: transporterId});
         //  const messages = await Message.find({ transporter_id: transporterId })
         //  .sort({ createdAt: 1 }); // 1 for ascending order, -1 for descending order
         console.log("pc ", previousChats);
         socket.emit("previousChats", previousChats);
      } catch (error) {
         console.error("Error fetching previous chats:", error);
      }
   });

   socket.on("selectManufacturer", async manufacturerId => {
      try {
         const previousChats = await Message.find({manufacturer_id: manufacturerId});
         //  const messages = await Message.find({ transporter_id: transporterId })
         //  .sort({ createdAt: 1 }); // 1 for ascending order, -1 for descending order
         console.log("pc ", previousChats);
         socket.emit("previousChats", previousChats);
      } catch (error) {
         console.error("Error fetching previous chats:", error);
      }
   });

   socket.on("newMessage", async newMessage => {
      try {
         // Save the new message to the database
         const role =newMessage.role;

         if(role=='m'){
         const orderID = shortid.generate();
         const {from, to, quantity, pickupAddress, transporter_id,manufacturer_id} = newMessage;
         const data = {
            from,
            to,
            quantity,
            pickupAddress,
            transporter_id,
            manufacturer_id,
            orderID
         };
         console.log("ddATA",data);
         const savedMessage = await new Message(data).save();
         console.log("sm ",savedMessage);
         io.emit("newMessage", savedMessage);
        }else if(role=='t'){
          const {price, transporter_id,manufacturer_id ,orderID} = newMessage;
          const data = {
          price,
          transporter_id,
          manufacturer_id,
          orderID
         };
         console.log("ddATA",data);
         const savedMessage = await new Message(data).save();
         console.log("sm ",savedMessage);
         io.emit("newMessage", savedMessage);
        }
         // Emit the new message to all connected clients, including the sender
         
      } catch (error) {
         console.error("Error saving new message:", error);
      }
   });

   // Handle disconnect
   socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
   });
});

server.listen(port, () => console.log(`Server is running on port ${port}`));
// Start the server
