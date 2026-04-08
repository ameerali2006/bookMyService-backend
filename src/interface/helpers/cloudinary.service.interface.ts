export interface ICloudinaryService {
  generateSignature(folder:string): {
    timestamp: number;
    signature: string;
    apiKey: string;
    cloudName: string;
    folder: string;
  };
}
