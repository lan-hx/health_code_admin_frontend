import {Navigate} from "react-router-dom";
import {BranchesOutlined, ControlOutlined, HomeOutlined, UserOutlined} from "@ant-design/icons";
import Root from "./Root";
import HealthCode from "./HealthCode";
import LocationCode from "./LocationCode";
import Vaccine from "./Vaccine";
import VaccineAppointment from "./VaccineAppointment";
import Complain from "./Complain";
import User from "./User";
import Locations from "./Locations";
import TestPoint from "./TestPoint";
import VaccinePoint from "./VaccinePoint";
import AdminUser from "./AdminUser";
import About from "./About";
import Tests from "./Tests";

export const tabsMap = {
  1: {label: "首页", path: '/', element: <Root/>},
  2: {label: "用户信息管理",},
  3: {label: "公共信息管理",},
  4: {label: "关于", path: '/about', element: <About/>},
  21: {label: "健康码管理", path: '/healthcode', element: <HealthCode/>},
  22: {label: "到访场所管理", path: '/locationcode', element: <LocationCode/>},
  23: {label: "核酸检测管理", path: '/tests', element: <Tests/>},
  24: {label: "疫苗接种管理", path: '/vaccine', element: <Vaccine/>},
  25: {label: "疫苗接种预约管理", path: '/vaccineappointment', element: <VaccineAppointment/>},
  26: {label: "健康码申诉管理", path: '/complain', element: <Complain/>},
  27: {label: "个人信息管理", path: '/user', element: <User/>},
  31: {label: "场所管理", path: '/locations', element: <Locations/>},
  32: {label: "核酸检测点管理", path: '/testpoint', element: <TestPoint/>},
  33: {label: "疫苗接种点管理", path: '/vaccinepoint', element: <VaccinePoint/>},
  34: {label: "管理员用户管理", path: '/adminuser', element: <AdminUser/>},
}
export const tabsReverseMap = {
  '/': ['1'],
  '/about': ['4'],
  '/healthcode': ['21', '2'],
  '/locationcode': ['22', '2'],
  '/tests': ['23', '2'],
  '/vaccine': ['24', '2'],
  '/vaccineappointment': ['25', '2'],
  '/complain': ['26', '2'],
  '/user': ['27', '2'],
  '/locations': ['31', '3'],
  '/testpoint': ['32', '3'],
  '/vaccinepoint': ['33', '3'],
  '/adminuser': ['34', '3'],
}
export const routes = [...Object.values(tabsMap).reduce((pre, item) => item.path ? [...pre, {
  path: item.path,
  element: item.element
}] : pre, []), {
  path: '*', element: <Navigate to="/"/>, replace: true
}]

// export const routes = [{
//   path: '/', element: <Root/>
// }, {
//   path: '/healthcode', element: <HealthCode/>
// }, {
//   path: '/locationcode', element: <LocationCode/>
// }, {
//   path: '/vaccine', element: <Vaccine/>
// }, {
//   path: '/vaccineappointment', element: <VaccineAppointment/>
// }, {
//   path: '/complain', element: <Complain/>
// }, {
//   path: '/user', element: <User/>
// }, {
//   path: '/locations', element: <Locations/>
// }, {
//   path: '/testpoint', element: <TestPoint/>
// }, {
//   path: '/vaccinepoint', element: <VaccinePoint/>
// }, {
//   path: '/adminuser', element: <AdminUser/>
// }, {
//   path: '/about', element: <About/>
// }, {
//   path: '*', element: <Navigate to="/"/>, replace: true
// },]

export const tabs = [
  {key: 1, label: tabsMap[1].label, icon: <HomeOutlined/>},
  {
    key: 2, label: tabsMap[2].label, icon: <UserOutlined/>, children: [
      {key: 21, label: tabsMap[21].label},
      {key: 22, label: tabsMap[22].label},
      {key: 23, label: tabsMap[23].label},
      {key: 24, label: tabsMap[24].label},
      {key: 25, label: tabsMap[25].label},
      {key: 26, label: tabsMap[26].label},
      {key: 27, label: tabsMap[27].label},
    ]
  },
  {
    key: 3, label: tabsMap[3].label, icon: <ControlOutlined/>, children: [
      {key: 31, label: tabsMap[31].label},
      {key: 32, label: tabsMap[32].label},
      {key: 33, label: tabsMap[33].label},
      {key: 34, label: tabsMap[34].label},
    ]
  },
  {key: 4, label: tabsMap[4].label, icon: <BranchesOutlined/>},
]
