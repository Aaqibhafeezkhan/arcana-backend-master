const mongoose = require('mongoose');
const Product = require('./models/Product');

// Standalone script to update product images
// Run: node updateProductImages.js

const updateImages = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Example: Update specific product images
    // Modify this to match your actual product names and image URLs
    const updates = [
      { name: 'Arcana Crest Tee', image: 'https://res.cloudinary.com/db8mcyukl/image/upload/v1/arcana/crest-tee.jpg' },
      { name: 'Bold Sweatpants', image: 'https://res.cloudinary.com/db8mcyukl/image/upload/v1/arcana/bold-sweats.jpg' },
    ];

    for (const update of updates) {
      await Product.findOneAndUpdate(
        { name: update.name },
        { image: update.image }
      );
      console.log(`Updated image for ${update.name}`);
    }

    console.log('Product images updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating images:', error);
    process.exit(1);
  }
};

// Only run if executed directly
if (require.main === module) {
  require('dotenv').config();
  updateImages();
}

module.exports = updateImages;
