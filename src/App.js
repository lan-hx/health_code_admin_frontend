import {
  Alert,
  Avatar,
  Breadcrumb,
  Button,
  Checkbox,
  Dropdown,
  Form,
  Input,
  Layout,
  Menu,
  Modal,
  theme,
  Tooltip
} from 'antd';
import {useEffect, useState} from 'react';
import './App.css';
import {routes, tabs, tabsMap, tabsReverseMap} from "./pages/config";
import {Link, useLocation, useNavigate, useRoutes} from "react-router-dom";
import {LockOutlined, UserOutlined} from "@ant-design/icons";

const {Header, Content, Footer, Sider} = Layout;

const App = () => {
  const element = useRoutes(routes)
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false); // 导航栏折叠
  const keyPath = tabsReverseMap[location.pathname]
  const [openKeys, setOpenKeys] = useState([keyPath[keyPath.length - 1]]);
  const [modalOpen, setModalOpen] = useState(false)
  const [loginButtonLoading, setLoginButtonLoading] = useState(false)
  const [loginStatus, setLoginStatus] = useState(true)
  const onOpenChange = keys => setOpenKeys(keys.length ? [keys[keys.length - 1]] : [])
  const {
    token: {colorBgContainer},
  } = theme.useToken();

  const dropdownItems = [
    {
      key: '2',
      label: (
        <a rel="noopener noreferrer" onClick={() => setModalOpen(true)}>
          [debug]打开登录界面
        </a>
      ),
    },
    {
      key: '3',
      label: (
        <a rel="noopener noreferrer" href="#">
          测试
        </a>
      ),
      disabled: true,
    },
    {
      key: '1',
      danger: true,
      label: (
        <a href="#">退出</a>
      ),
    },
  ];

  const changeNav = item => {
    navigate(tabsMap[item.key * 1].path)
  }

  const breadcrumbItems = [{
    key: 'home',
    title: <Link to="/">Home</Link>,
  },].concat(keyPath.map((item) => {
    const url = tabsMap[item * 1].path ? tabsMap[item * 1].path : location.pathname
    return {
      key: item,
      title: tabsMap[item * 1].label
    }
  }).reverse())

  return (
    <Layout style={{minHeight: '100vh'}}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div className="leftTopLogo">假装Logo</div>
        <Menu theme="dark" selectedKeys={[keyPath[0]]} mode="inline" items={tabs}
              onClick={changeNav}
              openKeys={openKeys}
              onOpenChange={onOpenChange}/>
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            height: 60,
            display: "flex", flexDirection: "row", justifyContent: "flex-end", alignItems: "center", paddingRight: 30
          }}
        >
          <Dropdown menu={{items: dropdownItems}} placement="bottom" arrow>
            <Button style={{height: 36, display: "flex", alignItems: "center"}}>
              <Avatar size={24} icon={<UserOutlined/>} style={{marginRight: 10}}>User</Avatar>
              test
            </Button>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: '0 16px',
          }}
        >
          <Breadcrumb items={breadcrumbItems} style={{margin: '16px 0'}}/>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
            }}
          >
            {element}
          </div>
        </Content>
        <Footer
          style={{
            textAlign: 'center',
          }}
        >
          hahaha
        </Footer>
        <Modal
          title={<div style={{textAlign: "center", padding: 10}}>用户登录</div>}
          open={modalOpen}
          closable={false}
          centered={true}
          footer={null}
          bodyStyle={{display: "flex",flexDirection:"column", justifyContent: "center", alignItems: "stretch"}}
        >
          {loginStatus ? null : <Alert style={{marginBottom:24}} message="用户名或密码错误" type="error" showIcon />}
          <Form
            name="login"
            style={{width: '100%'}}
            initialValues={{
              remember: true,
            }}
            onFinish={async e => {
              console.log(e)
              setLoginButtonLoading(true)
              await new Promise(r => setTimeout(r, 1000))
              setLoginButtonLoading(false)
              if (e.username === 'test' && e.password === 'test') {
                setLoginStatus(true)
                setModalOpen(false)
              } else {
                setLoginStatus(false)
              }
            }}
          >
            <Form.Item
              name="username"
              rules={[
                {
                  required: true,
                  message: '请输入用户名',
                },
              ]}
            >
              <Input prefix={<UserOutlined/>} placeholder="用户名"/>
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: '请输入密码',
                },
              ]}
            >
              <Input
                prefix={<LockOutlined className="site-form-item-icon"/>}
                type="password"
                placeholder="密码"
              />
            </Form.Item>
            <Form.Item>
              <div style={{display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Tooltip title="请勿在公用电脑上勾选">
                    <Checkbox>记住用户名</Checkbox>
                  </Tooltip>
                </Form.Item>
                <Button type="link" onClick={() => {
                  alert("请联系管理员重置密码")
                }}>
                  忘记密码
                </Button>
              </div>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loginButtonLoading} style={{width: '100%'}}>
                Log in
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Layout>
    </Layout>
  )
    ;
};
export default App;
