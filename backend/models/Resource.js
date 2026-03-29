import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Resource = mongoose.model('Resource', resourceSchema);
export default Resource;
