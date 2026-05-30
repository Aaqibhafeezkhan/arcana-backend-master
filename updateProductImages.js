const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const updates = [
  {
    name: "Mystic Tee",
    image: "https://res.cloudinary.com/db8mcyukl/image/upload/vXYZ/mystic_tee.jpg"
  },
  {
    name: "Shadow Tee",
    image: "https://res.cloudinary.com/db8mcyukl/image/upload/v1750802824/shadow_tee_ofrork.png"
  },
  {
    name: "Shadow Shorts",
    image: "https://res.cloudinary.com/db8mcyukl/image/upload/v1750802843/shadow_shorts_vu6p57.png"
  },
  {
    name: "Shadow Flex Hoodie",
    image: "https://res.cloudinary.com/db8mcyukl/image/upload/v1750802862/Shadow_Flex_xqy1u0.png"
  },
  {
    name: "Astral Set",
    image: "https://res.cloudinary.com/db8mcyukl/image/upload/v1750802876/astral_set_lnkqaz.png"
  }
];

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB ✅');

    for (const update of updates) {
      const res = await Product.findOneAndUpdate(
        { name: update.name },
        { image: update.image },
        { new: true }
      );

      if (res) {
        console.log(`✅ Updated: ${res.name}`);
      } else {
        console.log(`❌ Not found: ${update.name}`);
      }
    }

    mongoose.disconnect();
    console.log('Update completed and disconnected from DB ✅');
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

run();
//   node updateProductImages.js });