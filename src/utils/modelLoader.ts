import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';

// Singleton model loader - loads once and shares across all cameras
class ModelLoader {
  private static instance: ModelLoader;
  private model: cocoSsd.ObjectDetection | null = null;
  private loading: Promise<cocoSsd.ObjectDetection> | null = null;

  private constructor() {}

  public static getInstance(): ModelLoader {
    if (!ModelLoader.instance) {
      ModelLoader.instance = new ModelLoader();
    }
    return ModelLoader.instance;
  }

  public async loadModel(): Promise<cocoSsd.ObjectDetection> {
    // If already loaded, return it
    if (this.model) {
      console.log('Model already loaded, returning existing instance');
      return this.model;
    }

    // If currently loading, wait for that to finish
    if (this.loading) {
      console.log('Model is currently loading, waiting...');
      return this.loading;
    }

    // Start loading
    console.log('Starting to load COCO-SSD model...');
    this.loading = cocoSsd.load({
      base: 'mobilenet_v2'
    });

    try {
      this.model = await this.loading;
      console.log('✅ COCO-SSD model loaded successfully!');
      return this.model;
    } catch (error) {
      console.error('❌ Error loading COCO-SSD model:', error);
      this.loading = null; // Reset so we can try again
      throw error;
    }
  }

  public getModel(): cocoSsd.ObjectDetection | null {
    return this.model;
  }
}

export default ModelLoader.getInstance();
