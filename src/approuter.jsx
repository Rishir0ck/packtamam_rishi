import React from "react";
// eslint-disable-next-line no-unused-vars

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/pages/login";
// import config from "config";
import Addblog from "./components/pages/Blog/Addblog";
import Editblog from "./components/pages/Blog/Editblog";
import BlogView from "./components/pages/Blog/BlogView";
import Blogdetails from "./components/pages/Blog/Blogdetails";
//For Settings...
// import Settings from "./components/settings/Settings";
import Localization from "./components/settings/Localization";
import Paymentsetting from "./components/settings/Paymentsetting";
import Settingsemail from "./components/settings/Settingsemail";
import Settingssocialmedia from "./components/settings/Settingssocialmedia";
import Settingssociallinks from "./components/settings/Settingssociallinks";
import Settingsseo from "./components/settings/Settingsseo";
import SettingsThem from "./components/settings/SettingsThem";
import SettingsChangePassword from "./components/settings/SettingsChangePassword";
import SettingsOthers from "./components/settings/SettingsOthers";

//------------------Users-------------------
import DoctorList from "./components/users/DoctorList";
import AddDoctor from "./components/users/AddDoctor";
import EditDoctor from "./components/users/EditDoctor";
import DoctorProfile from "./components/users/DoctorProfile";

//----------------Restaurant--------------------
import RestaurantList from "./components/restaurant/RestaurantList";
import AddRestaurant from "./components/restaurant/AddRestaurant";
import EditRestaurant from "./components/restaurant/EditRestaurant";

//-----------------Pricing-----------------------
import ScheduleList from "./components/pricing/ScheduleList";
import AddSchedule from "./components/pricing/AddSchedule";
import EditSchedule from "./components/pricing/EditSchedule";


import ProvidentFund from "./components/accounts/ProvidentFund";
import ForgotPassword from "./components/pages/login/ForgotPassword";
import Signup from "./components/pages/login/Signup";
import Invoice from "./components/accounts/Invoice";
import Create_Invoice from "./components/accounts/Create_Invoice";
import Payments from "./components/accounts/Payments";
import Add_Payment from "./components/accounts/Add_Payment";
import Expenses from "./components/accounts/Expenses";
import Add_Expense from "./components/accounts/Add_Expense";
import Taxes from "./components/accounts/Taxes";
import Add_Tax from "./components/accounts/Add_Tax";

import Inbox from "./components/email/Inbox";
//--------------Inventory-------------------
import AddLeave from "./components/inventory/AddLeave";
import Attendence from "./components/inventory/Attendence";
import Leave from "./components/inventory/Leave";
import EditStaff from "./components/inventory/EditStaff";
import EditLeave from "./components/inventory/EditLeave";
import Holiday from "./components/inventory/Holiday";
import StaffList from "./components/inventory/StafList";
import StaffProfile from "./components/inventory/StaffProfile";



import ComposeMail from "./components/email/ComposeMail";
import MailView from "./components/email/MailView";
import UserActivity from "./components/activity/UserActivity";
import Chat from "./components/Chat/Chat";

import Add_ProviderFund from "./components/accounts/Add_ProviderFund";
import Register from "./components/pages/login/Register";
import LockScreen from "./components/pages/login/LockScreen";
import ChangePassword from "./components/pages/login/ChangePassword";
import Error from "./components/pages/login/Error";
import ServerError from "./components/pages/login/ServerError";

import Profile from "./components/pages/login/Profile";
import EditProfile from "./components/pages/login/EditProfile";
import BlankPage from "./components/pages/login/BlankPage";

//-----------Dashboard-------------------
import Admin_Dashboard from "./components/Dashboard/Admin_Dashboard/Admin_Dashboard";


import Edit_Provident from "./components/accounts/Edit_Provident";
import Edit_Taxes from "./components/accounts/Edit_Taxes";
import Edit_Payment from "./components/accounts/Edit_Payment";
import Setting from "./components/settings/Setting";
import GalleryImage from "./components/pages/Gallery/Gallery";

//Accounts
const Approuter = () => {
  // eslint-disable-next-line no-unused-vars
  // const config = "/react/template"
  return (
    <>
      <BrowserRouter basename="/">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/register" element={<Register />} />
          <Route path="/lockscreen" element={<LockScreen />} />
          <Route path="/changepassword" element={<ChangePassword />} />
          <Route path="/error" element={<Error />} />
          <Route path="/server-error" element={<ServerError />} />
          <Route path="/blankpage" element={<BlankPage />} />
          <Route path="/gallery" element={<GalleryImage />} />
          {/* Blog */}
          <Route path="/blog" element={<Blogdetails />} />
          <Route path="/addblog" element={<Addblog />} />
          <Route path="/editblog" element={<Editblog />} />
          <Route path="/blogview" element={<BlogView />} />
          {/* Settings */}
          <Route path="/settings" element={<Setting />} />
          <Route path="/localization" element={<Localization />} />
          <Route path="/paymentsetting" element={<Paymentsetting />} />
          <Route path="/settingsemail" element={<Settingsemail />} />
          <Route
            path="/settingssocialmedia"
            element={<Settingssocialmedia />}
          />
          <Route path="/settingssociallink" element={<Settingssociallinks />} />
          <Route path="/settingsseo" element={<Settingsseo />} />
          <Route path="/settingsthem" element={<SettingsThem />} />
          <Route
            path="/settingschangepassword"
            element={<SettingsChangePassword />}
          />
          <Route path="/settingsothers" element={<SettingsOthers />} />
         
          {/* Doctor  */}
          <Route path="/doctorlist" element={<DoctorList />} />
          <Route path="/add-doctor" element={<AddDoctor />} />
          <Route path="/editdoctor" element={<EditDoctor />} />
          <Route path="/doctorprofile" element={<DoctorProfile />} />
          {/* <Route path="/doctor-setting" element={<Doctor_Settings />} /> */}

         

          {/* ---------restaurant--------- */}
          <Route path="/restaurantList" element={<RestaurantList />} />
          <Route path="/addrestaurant" element={<AddRestaurant />} />
          <Route path="/editrestaurant" element={<EditRestaurant />} />

          {/* -------------pricing-------------- */}
          <Route path="/schedulelist" element={<ScheduleList />} />
          <Route path="/addschedule" element={<AddSchedule />} />
          <Route path="/editschedule" element={<EditSchedule />} />
          
          {/* ------inventory------- */}
          <Route path="/stafflist" element={<StaffList />} />
          <Route path="/editstaff" element={<EditStaff />} />
          <Route path="/staffprofile" element={<StaffProfile />} />
          <Route path="/leave" element={<Leave />} />
          <Route path="/add-leave" element={<AddLeave />} />
          <Route path="/editleave" element={<EditLeave />} />
          <Route path="/attendence" element={<Attendence />} />
          <Route path="/holiday" element={<Holiday />} />
          {/* Accounts */}
          <Route path="/providentfund" element={<ProvidentFund />} />
          <Route path="/add-providerfund" element={<Add_ProviderFund />} />
          <Route path="/invoicelist" element={<Invoice />} />
          <Route path="/createinvoice" element={<Create_Invoice />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/addpayment" element={<Add_Payment />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/addexpense" element={<Add_Expense />} />
          <Route path="/taxes" element={<Taxes />} />
          <Route path="/edit-taxes" element={<Edit_Taxes />} />
          <Route path="/addtax" element={<Add_Tax />} />
          <Route path="/edit-provident" element={<Edit_Provident />} />
          <Route path="/edit-payment" element={<Edit_Payment />} />
          

          {/* Email */}
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/compose-mail" element={<ComposeMail />} />
          <Route path="/mail-view" element={<MailView />} />
          {/* Activity */}
          <Route path="/user-activity" element={<UserActivity />} />
          
          {/* Chat */}
          <Route path="/chat" element={<Chat />} />
          
          
          
          {/* -------------Dashboard------------ */}
          <Route path="/admin-dashboard" element={<Admin_Dashboard />} />
        </Routes>
      </BrowserRouter>
      <div className="sidebar-overlay"></div>
    </>
  );
};

export default Approuter;
