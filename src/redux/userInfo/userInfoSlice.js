import { createSlice } from '@reduxjs/toolkit';

export const userInfoSlice = createSlice({
  name: 'userInfo',
  initialState: {
    info: {name: ''}
  },
  reducers: {
    setUserInfo: (state, action) => {
      // notice: can be mutate
      state.info = action.payload
    },
  },
});

// 为每个 case reducer 函数生成 Action creators
export const {setUserInfo} = userInfoSlice.actions;

export default userInfoSlice.reducer;