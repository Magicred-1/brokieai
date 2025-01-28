export const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        const base64 = reader.result?.toString().split(",")[1];
        if (base64) resolve(base64);
        else reject(new Error("Failed to convert Blob to Base64"));
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
    });
};
    