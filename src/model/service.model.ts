import { model, Schema } from 'mongoose';
import { IService } from '../interface/model/service.model.interface';

const serviceSchema = new Schema <IService>(
  {
    category: { type: String, required: true },
    description: { type: String, required: true },

    price: { type: Number, required: true },
    priceUnit: { type: String, enum: ['per hour', 'per job', 'per item'], required: true },
    duration: { type: Number, required: true },
    image: [{ type: String, required: true }],

    status: { type: String, enum: ['active', 'inactive'], default: 'active' },

  },
  {
    timestamps: true,
  },
);
export const ServiceModel = model<IService>('Service', serviceSchema);
