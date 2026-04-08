import { injectable } from 'tsyringe';
import { ICloudinaryService } from '../../interface/helpers/cloudinary.service.interface';
import cloudinary from '../../config/cloudinary';
import { ENV } from '../../config/env/env';

@injectable()
export class CloudinaryService implements ICloudinaryService {
  generateSignature(folder:string) {
    const timestamp = Math.floor(Date.now() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      ENV.CLOUDINARY_API_SECRET!,
    );

    return {
      timestamp,
      signature,
      apiKey: ENV.CLOUDINARY_API_KEY!,
      cloudName: ENV.CLOUDINARY_CLOUD_NAME!,
      folder,
    };
  }
}
