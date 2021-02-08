import React from 'react';
import type { Settings as LayoutSettings } from '@ant-design/pro-layout';
import { PageLoading } from '@ant-design/pro-layout';
import { notification } from 'antd';
import type { RequestConfig, RunTimeLayoutConfig } from 'umi';
import { history } from 'umi';
import RightContent from '@/components/RightContent';
import Footer from '@/components/Footer';
import type {RequestOptionsInit, ResponseError } from 'umi-request';
import { queryCurrent,queryMenuData } from './services/user';
import defaultSettings from '../config/defaultSettings';
import { SmileOutlined, HeartOutlined,GiftTwoTone,HomeOutlined,AccountBookOutlined,MoneyCollectOutlined
  ,SyncOutlined,PayCircleOutlined,ShopOutlined,TransactionOutlined,SettingOutlined} from '@ant-design/icons';
import {MenuDataItem} from "@@/plugin-layout/runtime";
//使用到什么图标才取
const IconMap = {
  smile: <SmileOutlined spin={false} />,
  heart: <HeartOutlined spin={false}/>,
  gift:<GiftTwoTone spin={false} />,
  home:<HomeOutlined spin={false} />,
  account:<AccountBookOutlined spin={false} />,
  collection:<MoneyCollectOutlined spin={false} />,
  exchange:<SyncOutlined spin={false} />,
  payment:<PayCircleOutlined spin={false} />,
  shop:<ShopOutlined spin={false} />,
  transfer:<TransactionOutlined spin={false} />,
  setting:<SettingOutlined spin={false} />,

};


/**
 * 获取用户信息比较慢的时候会展示一个 loading
 */
export const initialStateConfig = {
  loading: <PageLoading />,
};
//全局初始数据在 umi 的运行时配置
export async function getInitialState(): Promise<{
  settings?: LayoutSettings;
  currentUser?: API.CurrentUser;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
  fetchMenuData?: () => Promise<any|undefined>;
  fetchTokenInfo?: () => Promise<any|undefined>;
  menuData?: any;
  token?: any;
}> {
  // +++-------------------------start

  const fetchTokenInfo = async ()=>{
   const  token=localStorage.getItem("token");
   return token;
  }
  // +++-------------------------end
  const fetchUserInfo = async () => {
    try {
      const currentUser = await queryCurrent();
      console.info("currentUser",currentUser);
      return currentUser;
    } catch (error) {
      history.push('/user/login');
    }
    return undefined;
  };
  // 获取菜单数据
  const fetchMenuData = async () => {
    try {
      const menuData = await queryMenuData();
      return menuData;
    } catch (error) {
      console.error("error",error);
      history.push('/user/login');
    }
    return undefined;
  };

  const token= "";
  // 如果是登录页面，不执行
  if (history.location.pathname !== '/user/login') {
    //const currentUser = await fetchUserInfo();
    const menuData = await fetchMenuData();

    console.info("menuData"+menuData);
    const currentUser = await fetchUserInfo();
    console.debug("currentUser"+currentUser);

    const token  =await fetchTokenInfo();


    return {
      fetchUserInfo,
      fetchTokenInfo,
     // fetchMenuData,
      currentUser,
      menuData,
      token,
      settings: defaultSettings,
    };
  }
  return {
    fetchUserInfo,
    fetchTokenInfo,
    menuData: [],
    settings: defaultSettings,
    token,
  };
}
//菜单icon变更
const loopMenuItem = (menus: MenuDataItem[]): MenuDataItem[] =>
  menus.map(({ icon, children, ...item }) => ({
    ...item,
    icon: icon && IconMap[icon as string],
    children: children && loopMenuItem(children),
  }));
export const layout: RunTimeLayoutConfig = ({ initialState, }) => {


  return {
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
   // menuDataRender: () => initialState?.menuData,
    menuDataRender: () => loopMenuItem(initialState?.menuData),
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== '/user/login'&&location.pathname !== '/user/register') {
        history.push('/user/login');
      }

      //如果kyc没有通过

    },

    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible kyc开始</div>,
    ...initialState?.settings,
  };

};



const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  405: '请求方法不被允许。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

/**
 * 异常处理程序
 */
const errorHandler = (error: ResponseError) => {
  const { response } = error;
  if (response && response.status) {
    const errorText = codeMessage[response.status] || response.statusText;
    const { status, url } = response;

    notification.error({
      message: `请求错误 ${status}: ${url}`,
      description: errorText,
    });
  }

  if (!response) {
    notification.error({
      description: '您的网络发生异常，无法连接服务器',
      message: '网络异常',
    });
  }
  throw error;
};


const authHeaderInterceptor = (  url: string, options: RequestOptionsInit ) => {

 // alert("hahahahha"+token);

  const  token = localStorage.getItem("token");





  //alert("initialState"+initialState().initialState?.token);
  //console.log("initialState111",initialState().initialState?.token)

  const authHeader = {'Authorization': 'Bearer '+token}
  return {
    url: `${url}`,
    options: { ...options , interceptors: true, headers: authHeader},
  };
}
export const request: RequestConfig = {
  errorHandler,
  // 新增自动添加AccessToken的请求前拦截器
  requestInterceptors: [authHeaderInterceptor],
};
