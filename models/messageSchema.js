const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
   orderID: {
      type: String,
      required: true
   },
   from: {
      type: String
   },
   to: {
      type: String
   },
   quantity: {
      type: String,
      enum: ["1 ton", "2 ton", "3 ton"]
   },
   pickupAddress: {
      type: String
   },
   price: {
      type: String
   },
   manufacturer_id: {type: mongoose.SchemaTypes.ObjectId, index: true, required: true},
   transporter_id: {type: mongoose.SchemaTypes.ObjectId, index: true, required: true}
});

const Message = mongoose.model("Message", messageSchema);

module.exports = {
   Message: Message
};
