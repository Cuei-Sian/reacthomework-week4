import { useEffect, useState } from 'react';
import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function ProductModal({ modalType, templateProduct, getProducts, closeModal }) {
  const [tempData, setTempData] = useState(templateProduct);

  useEffect(() => {
    setTempData(templateProduct);
  }, [templateProduct]);

  //modalType
  //表單狀態更新
  const handleModalInputChange = (e) => {
    const { name, value, checked, type } = e.target;

    // console.log(name, value);//測試用
    setTempData((preData) => ({
      ...preData, //保留原有屬性
      [name]: type === 'checkbox' ? checked : value, //更新特定屬性
    }));
  };

  //圖片狀態更新
  const handleModalImageChange = (index, value) => {
    setTempData((pre) => {
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
    setTempData((pre) => {
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
    setTempData((pre) => {
      const newImage = [...pre.imagesUrl]; // 複製陣列
      newImage.pop(); //刪除最後一個

      return {
        // 回傳新狀態
        ...pre,
        imagesUrl: newImage,
      };
    });
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
    // 送出前檢查必填欄位，未填欄位跳提醒
    if (!tempData.title || !tempData.category || !tempData.unit) {
      alert('請填寫標題、分類和單位！');
      return;
    }
    // 設定需要轉成數字及布林值資料，並且如果IMG圖片是空白時不顯示
    const productData = {
      data: {
        ...tempData,
        origin_price: Number(tempData.origin_price), // 轉換為數字
        price: Number(tempData.price), // 轉換為數字
        is_enabled: tempData.is_enabled ? 1 : 0, // 轉換為數字
        imagesUrl: [...(tempData.imagesUrl || []).filter((url) => url !== '')], //過濾空白,就算 imagesUrl 意外是 undefined 也不會崩潰
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

  // 串接API---上傳圖片檔案
  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file-to-upload', file);
      // API
      const response = await axios.post(
        `${API_BASE}/api/${API_PATH}/admin/upload`,
        formData,
      );

      setTempData((pre) => ({
        ...pre,
        imageUrl: response.data.imageUrl,
      }));
    } catch (error) {
      console.log(error.response);
    }
  };

  return (
    <div
      className="modal fade"
      id="productModal"
      tabIndex="-1"
      aria-labelledby="productModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-xl">
        <div className="modal-content border-0">
          <div
            className={`modal-header bg-${modalType === 'delete' ? 'danger' : 'dark'} text-white`}
          >
            <h5 id="productModalLabel" className="modal-title">
              <span>
                {modalType === 'delete'
                  ? '刪除'
                  : modalType === 'edit'
                    ? '編輯'
                    : '新增'}
                產品
              </span>
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {modalType === 'delete' ? (
              <p className="fs-4">
                確定要刪除
                <span className="text-danger">{tempData.title}</span>
                嗎？
              </p>
            ) : (
              <div className="row">
                <div className="col-sm-4">
                  <div className="mb-2">
                    <div className="mb-3">
                      <label htmlFor="fileUpload" className="form-label">
                        上傳圖片
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        name="fileUpload"
                        id="fileUpload"
                        accept=".jpg,.jpeg,.png"
                        onChange={(e) => uploadImage(e)}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="imageUrl" className="form-label">
                        輸入圖片網址
                      </label>
                      <input
                        type="text"
                        id="imageUrl"
                        name="imageUrl"
                        className="form-control"
                        placeholder="請輸入圖片連結"
                        value={tempData.imageUrl}
                        onChange={(e) => handleModalInputChange(e)}
                      />
                    </div>
                    {tempData.imageUrl && (
                      <img
                        className="img-fluid"
                        src={tempData.imageUrl}
                        alt="主圖"
                      />
                    )}
                  </div>
                  <div>
                    {tempData.imagesUrl.map((url, index) => (
                      <div key={index}>
                        <label htmlFor="imageUrl" className="form-label">
                          輸入圖片網址
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder={`圖片網址${index + 1}`}
                          value={url}
                          onChange={(e) =>
                            handleModalImageChange(index, e.target.value)
                          }
                        />
                        {url && (
                          <img
                            className="img-fluid"
                            src={url}
                            alt={`副圖${index + 1}`}
                          />
                        )}
                      </div>
                    ))}
                    {tempData.imagesUrl.length < 5 &&
                      tempData.imagesUrl[tempData.imagesUrl.length - 1] !==
                        '' && (
                        <button
                          className="btn btn-outline-primary btn-sm d-block w-100"
                          onClick={() => handleAddImage()}
                        >
                          新增圖片
                        </button>
                      )}
                  </div>
                  <div>
                    {/*刪除圖片時，最少留下最後一張圖*/}
                    {tempData.imagesUrl.length >= 1 && (
                      <button
                        className="btn btn-outline-danger btn-sm d-block w-100"
                        onClick={() => handleRemoveImage()}
                      >
                        刪除圖片
                      </button>
                    )}
                  </div>
                </div>
                <div className="col-sm-8">
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                      標題
                    </label>
                    <input
                      name="title"
                      id="title"
                      type="text"
                      className="form-control"
                      placeholder="請輸入標題"
                      value={tempData.title}
                      onChange={(e) => handleModalInputChange(e)}
                    />
                  </div>

                  <div className="row">
                    <div className="mb-3 col-md-6">
                      <label htmlFor="category" className="form-label">
                        分類
                      </label>
                      <input
                        name="category"
                        id="category"
                        type="text"
                        className="form-control"
                        placeholder="請輸入分類"
                        value={tempData.category}
                        onChange={(e) => handleModalInputChange(e)}
                      />
                    </div>
                    <div className="mb-3 col-md-6">
                      <label htmlFor="unit" className="form-label">
                        單位
                      </label>
                      <input
                        name="unit"
                        id="unit"
                        type="text"
                        className="form-control"
                        placeholder="請輸入單位"
                        value={tempData.unit}
                        onChange={(e) => handleModalInputChange(e)}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="mb-3 col-md-6">
                      <label htmlFor="origin_price" className="form-label">
                        原價
                      </label>
                      <input
                        name="origin_price"
                        id="origin_price"
                        type="number"
                        min="0"
                        className="form-control"
                        placeholder="請輸入原價"
                        value={tempData.origin_price}
                        onChange={(e) => handleModalInputChange(e)}
                      />
                    </div>
                    <div className="mb-3 col-md-6">
                      <label htmlFor="price" className="form-label">
                        售價
                      </label>
                      <input
                        name="price"
                        id="price"
                        type="number"
                        min="0"
                        className="form-control"
                        placeholder="請輸入售價"
                        value={tempData.price}
                        onChange={(e) => handleModalInputChange(e)}
                      />
                    </div>
                  </div>
                  <hr />

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      產品描述
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      className="form-control"
                      placeholder="請輸入產品描述"
                      value={tempData.description}
                      onChange={(e) => handleModalInputChange(e)}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="content" className="form-label">
                      說明內容
                    </label>
                    <textarea
                      name="content"
                      id="content"
                      className="form-control"
                      placeholder="請輸入說明內容"
                      value={tempData.content}
                      onChange={(e) => handleModalInputChange(e)}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        name="is_enabled"
                        id="is_enabled"
                        className="form-check-input"
                        type="checkbox"
                        checked={tempData.is_enabled}
                        onChange={(e) => handleModalInputChange(e)}
                      />
                      <label className="form-check-label" htmlFor="is_enabled">
                        是否啟用
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            {modalType === 'delete' ? (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => delProduct(tempData.id)}
              >
                刪除
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  data-bs-dismiss="modal"
                  onClick={() => closeModal()}
                >
                  取消
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => updateProductData(tempData.id)}
                >
                  確認
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductModal;
