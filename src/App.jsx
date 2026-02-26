import { useEffect, useState, useRef } from 'react';

import axios from 'axios';
import * as bootstrap from 'bootstrap';
import './assets/style.css';
import ProductModal from './components/ProductModal';
import Pagination from './components/Pagination';
import Login from './views/Login';

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
  star: '',
};

function App() {
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
  // 分頁功能
  const [pagination, setPagination] = useState({});

  // 串接API
  // 設定取得產品資料列表 API (get)
  const getProducts = async (page = 1) => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/products?page=${page}`,
      );
      setProducts(response.data.products);
      setPagination(response.data.pagination); //分頁功能
      console.log('產品列表載入成功：', response.data.products);
    } catch (error) {
      console.log('取得產品列表失敗：', error.response?.data?.message);
      alert(
        '取得產品列表失敗：' + (error.response?.data?.message || error.message),
      );
    }
  };

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
    setTemplateProduct({
      ...INITIAL_TEMPLATE_DATA, //每次都從乾淨的初始狀態開始
      ...product,
    });
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
        <Login getProducts={getProducts} setIsAuth={setIsAuth} />
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
          <Pagination pagination={pagination} onChangePage={getProducts} />
        </div>
      )}
      {/*!-- Modal互動視窗 --*/}
      <ProductModal
        modalType={modalType}
        templateProduct={templateProduct}
        getProducts={getProducts}
        closeModal={closeModal}
      />
    </>
  );
}

export default App;
