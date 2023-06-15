import { configureStore } from '@reduxjs/toolkit';
import userReducer from './user/userSlice'
import userInfoReducer from './userInfo/userInfoSlice'

export default configureStore({
  reducer: {
    user: userReducer,
    userInfo: userInfoReducer
  },
});