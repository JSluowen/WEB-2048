function Axios() {
  // 定义axios请求的基础配置信息
  // axios.defaults.baseURL = 'https://api.example.com';
  axios.defaults.baseURL = 'http://127.0.0.1:7002/api';
  axios.defaults.timeOut = 10000;
  axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
  //允许axio请求携带cookies
  axios.defaults.withCredentials = true;
  //允许axio请求携带cookies
  axios.defaults.withCredentials = true;
  //请求拦截器
  axios.interceptors.request.use(
    (config) => {
      if (config.method === 'post') {
        config.data = qs.stringify(config.data);
      }
      if (sessionStorage.token) {
        config.headers.Authorization = sessionStorage.token || sessionStorage.admin;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  // 响应拦截器
  axios.interceptors.response.use(
    (response) => {
      if (response.status === 200) {
        return Promise.resolve(response);
      } else {
        return Promise.reject(response);
      }
    },
    (error) => {
      if (error.response.status) {
        switch (error.response.status) {
          case 403:
            message.error('登录过期，请重新登录');
            sessionStorage.removeItem('token');
            hashHistory.push('/login')
            break;
          case 404:
            message.error("资源不存在");
            break;
          default:
            message.error('请求有误');
        }
      }
    }
  );
  this.axios = axios
  // 定义请求的API
  this.api = {
    initTop: '/2048/initTop',// 初始化排行榜
    login: '/2048/login',
  }
}

// 检测Cookies中是否存在着用户的信息
Axios.prototype.checkCookies = function () {
  if (this.getCookies('id') && this.getCookies('password')) {
    return true
  }
  return false

}
// 获取Cookies的值 
Axios.prototype.getCookies = function (c_name) {
  if (document.cookie.length > 0) {
    let c_start = document.cookie.indexOf(c_name + "=")
    //如果document.cookie对象里面有cookie则查找是否有指定的cookie，如果有则返回指定的cookie值，如果没有则返回空字符串
    if (c_start != -1) {
      c_start = c_start + c_name.length + 1
      let c_end = document.cookie.indexOf(";", c_start)
      if (c_end == -1) c_end = document.cookie.length
      return unescape(document.cookie.substring(c_start, c_end))
    }
  }
  return false;
}
// 设置Cokies的值
Axios.prototype.setCookies = function (data) {
  const { entries } = Object;
  let expdate = new Date();
  expdate.setTime(expdate.getTime() + 72 * 60 * 60 * 1000);
  for (let [key, values] of entries(data)) {
    document.cookie = `${key}=${values};expires=${expdate.toGMTString()};path='/'`;
  }
}
// 初始化排行榜的信息
Axios.prototype.initTop = function () {
  return new Promise((resolve, reject) => {
    this.axios.get(this.api.initTop).then(res => {
      resolve(res.data)
    }).catch(err => {
      reject(err)
    })
  })
}
