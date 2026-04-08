import { model, Schema } from 'mongoose';
import { IAddress } from '../interface/model/address.model.interface';

const addressSchema = new Schema<IAddress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    label: { type: String, trim: true, default: 'Home' },
    buildingName: { type: String, trim: true },
    street: { type: String, trim: true },
    area: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    pinCode: { type: String, required: true, trim: true },
    landmark: { type: String, trim: true },
    formattedAddress: { type: String, trim: true, default: '' },
    isPrimary: { type: Boolean, default: false },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
        index: '2dsphere',
      },
    },

  },
  { timestamps: true },
);

export const AddressModel = model<IAddress>('Address', addressSchema);
