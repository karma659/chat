const {Message} = require("../models/messageSchema");
const shortid = require("shortid");
const {User} = require("../models/userSchema");

const getAllMessages = async (req, res) => {
   console.log("jj");
   const messages = await Message.find().populate();
   res.json(messages);
};

const manufacturerSend = async (req, res) => {
   const {from, to, quantity, pickupAddress, transporter_id} = req.body;

   const orderID = shortid.generate();
   const manufacturer_id = req.userId;
   const message = new Message({
      orderID,
      from,
      to,
      quantity,
      pickupAddress,
      manufacturer_id,
      transporter_id
   });
   console.log("pppppppppp",message);
   await message.save();

   res.send({success: true , orderID:orderID });
};

// Route for sending a reply from Transporter to Manufacturer
const transporterSend = async (req, res) => {
   const {orderID, price, manufacturer_id} = req.body;
   const transporter_id = req.userId;
   const message = new Message({orderID, price, manufacturer_id, transporter_id});
   await message.save();
   res.send({success: true});
};

const getDetails = async (req, res) => {
   const userId = req.userId;
   try {
      const user = await User.findById(userId);
      if (!user) {
         return res.status(404).json({error: "User not found"});
      }
      console.log("d",user);
      res.json({address: user.address,myId: user._id});
   } catch (error) {
      console.error("Error fetching user address:", error);
      res.status(500).json({error: "Internal server error"});
   }
};

const getOrderId = async (req, res) => {
   const transporterId = req.userId;

   try {
      const messages = await Message.find({transporter_id: transporterId});

      const uniqueMessages = {};

      messages.forEach(message => {
         uniqueMessages[message.orderID] = message.manufacturer_id;
      });

      const result = Object.keys(uniqueMessages).map(orderID => ({
         orderID,
         manufacturer_id: uniqueMessages[orderID]
      }));
       console.log("result ",result);
      res.json({data:result,myId:transporterId});
   } catch (error) {
      console.error("Error fetching unique messages:", error);
      res.status(500).json({error: "Internal server error"});
   }
};

const transporters = async (req, res) => {
   try {
      const transporters = await User.find({userType: "Transporter"});
    
   
     
      res.json(transporters);
   } catch (error) {
      console.error("Error fetching transporters:", error);
      res.status(500).json({error: "Internal server error"});
   }
};

const previousChats = async (req, res) => {
   const transporterId = req.params.transporterId;

   try {
      const previousChats = await Message.find({transporter_id: transporterId});
      console.log("pp", previousChats);
      res.json(previousChats);
   } catch (error) {
      console.error("Error fetching previous chats:", error);
      res.status(500).json({error: "Internal server error"});
   }
};

module.exports = {
   getAllMessages: getAllMessages,
   manufacturerSend: manufacturerSend,
   transporterSend: transporterSend,
   getDetails: getDetails,
   transporters: transporters,
   getOrderId: getOrderId,
   previousChats: previousChats
};
