import api from "../api";
import { FILE_UPLOAD_ENDPOINTS } from "../endpoint";

export const uploadSingleFile = (file, folder) => {
  const formData = new FormData();
  formData.append("file", file);

  if (folder) formData.append("folder", folder);

  return api.post(FILE_UPLOAD_ENDPOINTS.SINGLE, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
