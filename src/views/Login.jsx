import { useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function Login({ getProducts, setIsAuth }) {
  // 表單資料狀態(儲存登入表單輸入)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  //表單輸入處理
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // console.log(name, value);//測試用
    setFormData((preData) => ({
      ...preData, //保留原有屬性
      [name]: value, //更新特定屬性
    }));
  };

  //串接API
  const onSubmit = async (e) => {
    e.preventDefault(); //停止onSubmit的預設事件，為避免原生的預設事件發生
    try {
      //登入成功
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      // console.log(response.data);
      // 設定cookie
      const { token, expired } = response.data;
      //儲存Token到Cookie
      document.cookie = `hexToken=${token};expires=${new Date(expired)};`;
      // 登入成功後，請將 Token 設定到 axios 的預設 Header，之後所有 API 請求都會自動帶上 Token
      axios.defaults.headers.common['Authorization'] = token;

      getProducts(); //登入成功後，進入產品列表頁，呼叫函式，取得產品列表的資料
      setIsAuth(true); //登入成功，設定控制畫面參數為TRUE
    } catch (error) {
      setIsAuth(false); //登入失敗，設定控制畫面參數為false
      console.log(error.response);
    }
  };
  return (
    <div className="container login">
      <div className="row justify-content-center">
        <h1 className="h3 mb-3 font-weight-normal">請先登入</h1>
        <div className="col-8"></div>
        <form className="form-floating" onSubmit={(e) => onSubmit(e)}>
          <div className="form-floating mb-3">
            <input
              type="email"
              className="form-control"
              id="username"
              name="username"
              placeholder="name@example.com"
              value={formData.username}
              onChange={(e) => handleInputChange(e)}
              required
              autoFocus
            />
            <label htmlFor="username">Email address</label>
          </div>
          <div className="form-floating">
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            <label htmlFor="password">Password</label>
          </div>
          <button type="submit" className="btn btn-lg btn-primary w-100 mt-3">
            登入
          </button>
        </form>
      </div>
      <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
    </div>
  );
}

export default Login;
