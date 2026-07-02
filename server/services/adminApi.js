import api from "./api";

export const loginAdmin = async (email, password) => {
  const res = await api.post("/admin/login", {
    email,
    password,
  });

  return res.data;
};