import { useEffect, useState, useRef } from 'react';

import axios from 'axios';
import * as bootstrap from 'bootstrap';
import './assets/style.css';
import ProductModal from './components/ProductModal';

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

// 建立初始化的資料
const INITIAL_TEMPLATE_DATA = {
  id: '',
  title: '',
  category: '',
  origin_price: '',
  price: '',
  unit: '',
  description: '',
  content: '',
  is_enabled: false,
  imageUrl: '',
  imagesUrl: [],
};

function App() {
  // 表單資料狀態(儲存登入表單輸入)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  //登入狀態管理(控制顯示登入或產品頁)
  const [isAuth, setIsAuth] = useState(false);

  // 產品資料列表的API狀態
  const [products, setProducts] = useState([]);
  // 目前選中的產品
  // const [tempProduct, setTempProduct] = useState();
  // 正確引入設定綁定DOM元素, Modal 控制相關狀態
  const productModalRef = useRef(null);
  // 產品表單資料模板
  const [templateProduct, setTemplateProduct] = useState(INITIAL_TEMPLATE_DATA);
  // 狀態驅動畫面的典型應用,Modal 本身只負責「顯示」,行為由 modalType 決定（create / edit / delete）
  const [modalType, setModalType] = useState(''); // "create", "edit", "delete"
  //modalType
  //表單輸入處理
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // console.log(name, value);//測試用
    setFormData((preData) => ({
      ...preData, //保留原有屬性
      [name]: value, //更新特定屬性
    }));
  };

  //表單狀態更新
  const handleModalInputChange = (e) => {
    const { name, value, checked, type } = e.target;

    // console.log(name, value);//測試用
    setTemplateProduct((preData) => ({
      ...preData, //保留原有屬性
      [name]: type === 'checkbox' ? checked : value, //更新特定屬性
    }));
  };

  //圖片狀態更新
  const handleModalImageChange = (index, value) => {
    setTemplateProduct((pre) => {
      const newImage = [...pre.imagesUrl]; // 複製陣列
      newImage[index] = value; // 更新特定索引
      //優化：新增後自動再新增一個空白輸入框及增加產品照片最多新增五筆
      if (
        value !== '' &&
        index === newImage.length - 1 &&
        newImage.length < 5
      ) {
        newImage.push('');
      }
      //優化：清空輸入框時，移除最後的空白輸入框
      if (
        value === '' &&
        newImage.length > 1 &&
        newImage[newImage.length - 1] === ''
      ) {
        newImage.pop();
      }

      return {
        // 回傳新狀態
        ...pre,
        imagesUrl: newImage,
      };
    });
  };

  //新增資料內的新增圖片按鈕
  const handleAddImage = () => {
    setTemplateProduct((pre) => {
      const newImage = [...pre.imagesUrl]; // 複製陣列
      newImage.push(''); //新增資料

      return {
        // 回傳新狀態
        ...pre,
        imagesUrl: newImage,
      };
    });
  };

  //新增資料內的刪除圖片按鈕
  const handleRemoveImage = () => {
    setTemplateProduct((pre) => {
      const newImage = [...pre.imagesUrl]; // 複製陣列
      newImage.pop(); //刪除最後一個

      return {
        // 回傳新狀態
        ...pre,
        imagesUrl: newImage,
      };
    });
  };
  // 串接API
  // 設定取得產品資料列表 API (get)
  const getProducts = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/products`,
      );
      setProducts(response.data.products);
      console.log('產品列表載入成功：', response.data.products);
    } catch (error) {
      console.log('取得產品列表失敗：', error.response?.data?.message);
      alert(
        '取得產品列表失敗：' + (error.response?.data?.message || error.message),
      );
    }
  };

  // 串接API---新增/更新產品
  const updateProductData = async (id) => {
    // 決定 API 端點和方法
    let url = `${API_BASE}/api/${API_PATH}/admin/product`;
    let method = 'post';
    //因為只有新增/更新兩種，就用if...else if 就可以了
    if (modalType === 'edit') {
      url = `${API_BASE}/api/${API_PATH}/admin/product/${id}`;
      method = 'put';
    } else if (modalType === 'create') {
      url = `${API_BASE}/api/${API_PATH}/admin/product`;
      method = 'post';
    }
    // 設定需要轉成數字及布林值資料，並且如果IMG圖片是空白時不顯示
    const productData = {
      data: {
        ...templateProduct,
        origin_price: Number(templateProduct.origin_price), // 轉換為數字
        price: Number(templateProduct.price), // 轉換為數字
        is_enabled: templateProduct.is_enabled ? 1 : 0, // 轉換為數字
        imagesUrl: [...templateProduct.imagesUrl.filter((url) => url !== '')], //過濾空白
      },
    };

    try {
      // const response = await axios.post(url, productData);可以優化成下面程式碼
      const response = await axios[method](url, productData);
      console.log(response.data);
      // 關閉 Modal 並重新載入資料
      closeModal(); // 關閉 Modal
      getProducts(); // 重新取得API更新畫面
    } catch (error) {
      console.log(error.response);
    }
  };

  // 串接API---刪除產品
  const delProduct = async (id) => {
    try {
      const response = await axios.delete(
        `${API_BASE}/api/${API_PATH}/admin/product/${id}`,
      );
      console.log(response.data);
      // 關閉 Modal 並重新載入資料
      closeModal(); // 關閉 Modal
      getProducts(); // 重新取得API更新畫面
    } catch (error) {
      console.log(error.response);
    }
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

  // 登入驗證
  // const checkLogin = async () => {
  //   try {
  //     // 放到useEffect
  // 取得Token
  // const token = document.cookie
  //   .split('; ')
  //   .find((row) => row.startsWith('hexToken='))
  //   ?.split('=')[1];
  // // 登入成功後，請將 Token 設定到 axios 的預設 Header，之後所有 API 請求都會自動帶上 Token
  // // 修改實體建立時所指派的預設配置
  // axios.defaults.headers.common['Authorization'] = token;

  //放入useEffect
  //     const response = await axios.post(`${API_BASE}/api/user/check`);
  //     console.log(response.data);
  //   } catch (error) {
  //     console.log(error.response?.data.message);
  //   }
  // };

  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('hexToken='))
      ?.split('=')[1];
    // 登入成功後，將Token設定到axios的預設Header，之後所有API請求都會自動帶上Token
    // 修改實體建立時所指派的預設配置
    if (token) {
      // 如果真的有取到token才會放入Header上面
      axios.defaults.headers.common['Authorization'] = token;
    }
    // 取得DOM元素
    productModalRef.current = new bootstrap.Modal('#productModal', {
      keybord: false,
    });

    // 登入驗證
    const checkLogin = async () => {
      try {
        const response = await axios.post(`${API_BASE}/api/user/check`);
        console.log(response.data);
        setIsAuth(true);
        getProducts();
      } catch (error) {
        console.log(error.response?.data.message);
      }
    };
    //呼叫checkLogin
    checkLogin();
  }, []);

  //寫一個openModal的方式，使用 ref 控制 Modal(互動視窗)
  const openModal = (type, product) => {
    // console.log(product);
    // 設定 Modal 類型並顯示
    setModalType(type);
    // 正確：用 setState 並回傳新物件
    setTemplateProduct((pre) => ({
      ...pre, //pre = 更新前的舊資料
      ...product,
    }));
    productModalRef.current.show();
  };
  // 寫一個closeModal的方式，使用 ref 控制 Modal(互動視窗)
  const closeModal = () => {
    productModalRef.current.hide();
  };

  return (
    <>
      {/* 登入表單頁面 */}
      {!isAuth ? (
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
              <button
                type="submit"
                className="btn btn-lg btn-primary w-100 mt-3"
              >
                登入
              </button>
            </form>
          </div>
          <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
        </div>
      ) : (
        <div className="container">
          <h2>產品列表</h2>
          {/* 新增產品按鈕 */}
          <div className="text-end mt-4">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => openModal('create', INITIAL_TEMPLATE_DATA)}
            >
              建立新的產品
            </button>
          </div>
          {/* 產品列表表格 */}
          <table className="table">
            <thead>
              <tr>
                <th scope="col">分類</th>
                <th scope="col">產品名稱</th>
                <th scope="col">原價</th>
                <th scope="col">售價</th>
                <th scope="col">是否啟用</th>
                <th scope="col">編輯</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item) => (
                <tr key={item.id}>
                  <td>{item.category}</td>
                  <th scope="row">{item.title}</th>
                  <td>{item.origin_price}</td>
                  <td>{item.price}</td>
                  <td className={`${item.is_enabled && 'text-success'}`}>
                    {item.is_enabled ? '啟用' : '未啟用'}
                  </td>
                  <td>
                    <div
                      className="btn-group"
                      role="group"
                      aria-label="Basic example"
                    >
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => openModal('edit', item)}
                      >
                        編輯
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => openModal('delete', item)}
                      >
                        刪除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/*!-- Modal互動視窗 --*/}
      <ProductModal
        modalType={modalType}
        templateProduct={templateProduct}
        handleModalInputChange={handleModalInputChange}
        handleModalImageChange={handleModalImageChange}
        handleAddImage={handleAddImage}
        handleRemoveImage={handleRemoveImage}
        updateProductData={updateProductData}
        delProduct={delProduct}
        closeModal={closeModal}
      />
    </>
  );
}

export default App;
