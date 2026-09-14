import api from "../api";

export const getEmailTemplates = async () => {
  const response = await api.get("/admin-email-templates/show");
  // Backend returns { status: 200, message: "...", data: [...] }
  return response?.data || [];
};

export const updateEmailTemplate = async (id, payload) => {
  const response = await api.put(`/admin-email-templates/update/${id}`, payload);
  return response;
};
