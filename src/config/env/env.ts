import { config } from 'dotenv';
import { envSchema } from './env.schema';

config();

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid env variable');
  console.error(parsed.error.format());
  process.exit(1);
} else {
  console.log('success env var  ');
}
export const ENV = parsed.data;
