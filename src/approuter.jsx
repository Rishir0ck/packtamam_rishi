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
//Assest
import Assests from "./components/assests/Assests";
import AddAsset from "./components/assests/AddAsset";
//Doctor
import DoctorList from "./components/doctor/DoctorList";
import AddDoctor from "./components/doctor/AddDoctor";
import EditDoctor from "./components/doctor/EditDoctor";
import DoctorProfile from "./components/doctor/DoctorProfile";
//Patients...
import PatientsList from "./components/patients/PatientsList";
import AddPatients from "./components/patients/AddPatients";
import EditPatients from "./components/patients/EditPatients";
import PatientsProfile from "./components/patients/PatientsProfile";
import AppoinmentList from "./components/appoinments/AppoinmentList";
import AddAppoinments from "./components/appoinments/AddAppoinments";
import EditAppoinments from "./components/appoinments/EditAppoinments";
//DoctorSchedule
import ScheduleList from "./components/doctorschedule/ScheduleList";

import AddSchedule from "./components/doctorschedule/AddSchedule";
import EditSchedule from "./components/doctorschedule/EditSchedule";
//Departments
import DepartmentList from "./components/department/DepartmentList";
import AddDepartment from "./components/department/AddDepartment";
import EditDepartment from "./components/department/EditDepartment";
import StaffList from "./components/staff/StafList";
import AddStaff from "./components/staff/Add-Staff";
import StaffProfile from "./components/staff/StaffProfile";
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
import EmployeeSalary from "./components/Payroll/EmployeeSalary/EmployeeSalary";

import Inbox from "./components/email/Inbox";
import AddLeave from "./components/staff/AddLeave";
import Attendence from "./components/staff/Attendence";
import Leave from "./components/staff/Leave";
import ComposeMail from "./components/email/ComposeMail";
import MailView from "./components/email/MailView";
import UserActivity from "./components/activity/UserActivity";
import AddEmployeeSalary from "./components/Payroll/EmployeeSalary/AddEmployeeSalary";
import Chat from "./components/Chat/Chat";
import VoiceCall from "./components/Call/VoiceCall";
import VideoCall from "./components/Call/VideoCall";
import EditStaff from "./components/staff/EditStaff";
import EditLeave from "./components/staff/EditLeave";
import Holiday from "./components/staff/Holiday";
import Add_ProviderFund from "./components/accounts/Add_ProviderFund";
import ExpensesReport from "./components/ExpenseReport/Expenses/ExpensesReport";
import AddExpenses from "./components/ExpenseReport/Expenses/AddExpenses";
import Invoice_Report from "./components/ExpenseReport/Invoice-report/Invoice_Report";
import OverDue from "./components/Invoice/Invoice-List/Overdue-Invoice/OverDue";
import InvoiceList from "./components/Invoice/Invoice-List/InvoiceList";
import Paid_Invoice from "./components/Invoice/Invoice-List/Paid-Invoice/Paid_Invoice";
import Draft_Invoice from "./components/Invoice/Invoice-List/Draft_Invoice/Draft_Invoice";
import Recurring_Invoice from "./components/Invoice/Invoice-List/Recurring_Invoice/Recurring_Invoice";
import Cancelled_Invoice from "./components/Invoice/Invoice-List/Cancelled_Invoice/Cancelled_Invoice";
import Invoice_Grid from "./components/Invoice/Invoices_Grid/Invoice_Grid";
import Add_Invoices from "./components/Invoice/Add_Invoices/Add_Invoices";
import Edit_Invoices from "./components/Invoice/Edit_Invoices/Edit_Invoices";
import Invoice_Details from "./components/Invoice/Invoice_Details/Invoice_Details";
import Invoice_GeneralSettings from "./components/Invoice/Invoice_Settings/General_Settings/Invoice_GeneralSettings";
import Tax_Settings from "./components/Invoice/Invoice_Settings/Tax_Settings/Tax_Settings";
import Bank_Settings from "./components/Invoice/Invoice_Settings/Bank_Settings/Bank_Settings";
import IncomingCall from "./components/Chat/IncomingCall";
import BasicInput from "./components/Forms/BasicInput";
import InputGroups from "./components/Forms/InputGroups";
import HorizontalForm from "./components/Forms/HorizontalForm";
import VerticalForm from "./components/Forms/VerticalForm";
import BasicTable from "./components/Tables/BasicTable";
import DataTable from "./components/Tables/DataTable";
import UiKit from "./components/Ui_Elements/UiKit";
import Typography from "./components/Ui_Elements/Typography";
import Tab from "./components/Ui_Elements/Tab";
import Edit_Assets from "./components/assests/Edit_Assets";
import Register from "./components/pages/login/Register";
import LockScreen from "./components/pages/login/LockScreen";
import ChangePassword from "./components/pages/login/ChangePassword";
import Error from "./components/pages/login/Error";
import ServerError from "./components/pages/login/ServerError";
import EditEmployeeSalery from "./components/Payroll/EmployeeSalary/EditEmployeeSalery";
import Calender from "./components/calender/Calender";
import Profile from "./components/pages/login/Profile";
import EditProfile from "./components/pages/login/EditProfile";
import BlankPage from "./components/pages/login/BlankPage";
import Doctor_Dashboard from "./components/Dashboard/Doctor_Dashboard/Doctor_Dashboard";
import Admin_Dashboard from "./components/Dashboard/Admin_Dashboard/Admin_Dashboard";
import Patient_Dashboard from "./components/Dashboard/Patient_Dashboard/Patient_Dashboard";
import Doctor_Settings from "./components/Dashboard/Doctor_Dashboard/Doctor_Settings";
import Patient_Settings from "./components/patients/Patient_Settings";
import Staff_Settings from "./components/staff/Staff-Settings";
import Edit_Provident from "./components/accounts/Edit_Provident";
import Edit_Taxes from "./components/accounts/Edit_Taxes";
import Edit_Expenses from "./components/ExpenseReport/Expenses/Edit_Expenses";
import Edit_Payment from "./components/accounts/Edit_Payment";
import Payslip from "./components/Payroll/Payslip";
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
          {/* Assests */}
          <Route path="/assests" element={<Assests />} />
          <Route path="/addasset" element={<AddAsset />} />
          <Route path="/edit-assets" element={<Edit_Assets />} />
          {/* Doctor  */}
          <Route path="/doctorlist" element={<DoctorList />} />
          <Route path="/add-doctor" element={<AddDoctor />} />
          <Route path="/editdoctor" element={<EditDoctor />} />
          <Route path="/doctorprofile" element={<DoctorProfile />} />
          <Route path="/doctor-setting" element={<Doctor_Settings />} />
          {/* Patients */}
          <Route path="/patientslist" element={<PatientsList />} />
          <Route path="/addpatients" element={<AddPatients />} />
          <Route path="/editpatients" element={<EditPatients />} />
          <Route path="/patientsprofile" element={<PatientsProfile />} />
          <Route path="/patient-settings" element={<Patient_Settings />} />
          {/* Appoinments */}
          <Route path="/appoinmentlist" element={<AppoinmentList />} />
          <Route path="/addappoinments" element={<AddAppoinments />} />
          <Route path="/editappoinments" element={<EditAppoinments />} />
          {/* DoctorSchedule */}
          <Route path="/schedulelist" element={<ScheduleList />} />
          <Route path="/addschedule" element={<AddSchedule />} />
          <Route path="/editschedule" element={<EditSchedule />} />
          {/* Department */}
          <Route path="/departmentlist" element={<DepartmentList />} />
          <Route path="/add-department" element={<AddDepartment />} />
          <Route path="/editdepartment" element={<EditDepartment />} />
          {/* Staff */}
          <Route path="/stafflist" element={<StaffList />} />
          <Route path="/addstaff" element={<AddStaff />} />
          <Route path="/editstaff" element={<EditStaff />} />
          <Route path="/staffprofile" element={<StaffProfile />} />
          <Route path="/leave" element={<Leave />} />
          <Route path="/add-leave" element={<AddLeave />} />
          <Route path="/editleave" element={<EditLeave />} />
          <Route path="/attendence" element={<Attendence />} />
          <Route path="/holiday" element={<Holiday />} />
          <Route path="/staff-settings" element={<Staff_Settings />} />
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
          {/* /* Payroll */}
          <Route path="/employeesalary" element={<EmployeeSalary />} />
          <Route path="/addsalary" element={<AddEmployeeSalary />} />
          <Route path="/editsalary" element={<EditEmployeeSalery />} />
          <Route path="/payslip" element={<Payslip />} />
          {/* Email */}
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/compose-mail" element={<ComposeMail />} />
          <Route path="/mail-view" element={<MailView />} />
          {/* Activity */}
          <Route path="/user-activity" element={<UserActivity />} />
          {/* ExpenseReport */}
          <Route path="/expense-Report" element={<ExpensesReport />} />
          <Route path="/add-expense" element={<AddExpenses />} />
          <Route path="/invoice-report" element={<Invoice_Report />} />
          <Route path="/edit-expenses" element={<Edit_Expenses />} />
          {/* Chat */}
          <Route path="/chat" element={<Chat />} />
          {/* Call */}
          <Route path="/voice-call" element={<VoiceCall />} />
          <Route path="/video-call" element={<VideoCall />} />
          <Route path="/incoming-call" element={<IncomingCall />} />
          {/* Invoice */}
          <Route path="/invoice-list" element={<InvoiceList />} />
          <Route path="/paid-invoice" element={<Paid_Invoice />} />
          <Route path="/overdue-invoice" element={<OverDue />} />
          <Route path="/draft-invoice" element={<Draft_Invoice />} />
          <Route path="/recurring-invoice" element={<Recurring_Invoice />} />
          <Route path="/cancelled-invoice" element={<Cancelled_Invoice />} />
          <Route path="/invoice-grid" element={<Invoice_Grid />} />
          <Route path="/add-invoice" element={<Add_Invoices />} />
          <Route path="/edit-invoice" element={<Edit_Invoices />} />
          <Route path="/invoice-details" element={<Invoice_Details />} />
          <Route
            path="/invoice-settings"
            element={<Invoice_GeneralSettings />}
          />
          <Route path="/tax-settings" element={<Tax_Settings />} />
          <Route path="/bank-settings" element={<Bank_Settings />} />
          {/* ui-elements */}
          <Route path="/ui-kit" element={<UiKit />} />
          <Route path="/typography" element={<Typography />} />
          <Route path="/tab" element={<Tab />} />
          {/* Forms */}
          <Route path="/basic-input" element={<BasicInput />} />
          <Route path="/inputgroup" element={<InputGroups />} />
          <Route path="/horizontal-form" element={<HorizontalForm />} />
          <Route path="/vertical-form" element={<VerticalForm />} />
          {/* Tables */}
          <Route path="/basic-table" element={<BasicTable />} />
          <Route path="/data-table" element={<DataTable />} />
          {/* Calender */}
          <Route path="/calender" element={<Calender />} />
          {/* Dashboard */}
          <Route path="/admin-dashboard" element={<Admin_Dashboard />} />
          <Route path="/doctor-dashboard" element={<Doctor_Dashboard />} />
          <Route path="/patient-dashboard" element={<Patient_Dashboard />} />
        </Routes>
      </BrowserRouter>
      <div className="sidebar-overlay"></div>
    </>
  );
};

export default Approuter;
