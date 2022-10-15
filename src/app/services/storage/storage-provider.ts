export interface StorageProvider {
  // Save the key-value pair to an appropriate data store.
  put(key: string, value: any): Promise<void>;

  // Returns the value for a given key or null if not defined.
  get(key: string): Promise<any>;

  // Returns an object containing all key-value pairs saved by this app.
  getAll(): Promise<any>;
}
