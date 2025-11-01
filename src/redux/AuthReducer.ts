import { createSlice } from "@reduxjs/toolkit";
import { UserData, AuthState } from "../types";

const initialState: AuthState = {
  auth: "",
  user: {},
};

const AuthSlice = createSlice({
  name: "authSlice",
  initialState,
  reducers: {
    AddAuth: (state, action) => {
      state.auth = action.payload || "";
    },
    AddUser: (state, action) => {
      state.user = action.payload || "";
    },
  },
});

export const { AddAuth, AddUser } = AuthSlice.actions;

export default AuthSlice.reducer;
