export async function getStorage(key: string): Promise<any> {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (result) => {
      resolve(result[key]);
    });
  });
}

export async function setStorage(key: string, value: any): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, () => {
      resolve();
    });
  });
}

export async function getSessionStorage(key: string): Promise<any> {
  return new Promise((resolve) => {
    chrome.storage.session.get(key, (result) => {
      resolve(result[key]);
    });
  });
}

export async function setSessionStorage(key: string, value: any): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.session.set({ [key]: value }, () => {
      resolve();
    });
  });
} 
