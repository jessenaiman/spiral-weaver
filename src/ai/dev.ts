import { config } from 'dotenv';
config();

// Make sure to specify your project ID in firebase-config.ts
import { firebaseConfig } from '@/lib/firebase-config';
if (firebaseConfig.projectId === 'PROJECT_ID') {
  throw new Error(
    'Please specify your Firebase project ID in src/lib/firebase-config.ts'
  );
}

import '@/ai/flows/apply-restrictions-to-scene.ts';
import '@/ai/flows/generate-scene-from-moment.ts';
