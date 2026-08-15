import { BULK_UPLOAD_BATCH } from "@/Constant/Api";
import { postFormData } from "./ApiMethod";

interface BatchUploadResult {
  success: boolean;
  data?: any;
  message?: string;
}

export const BulkUploadBatch = async (formData: FormData): Promise<BatchUploadResult> => {
  try {
    const response = await postFormData(BULK_UPLOAD_BATCH, formData, 300000);
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || error?.message || 'Upload failed'
    };
  }
};
