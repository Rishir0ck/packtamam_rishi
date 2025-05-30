// /* eslint-disable react/jsx-no-duplicate-props */
// /* eslint-disable no-unused-vars */
// import React, { useState } from "react";
// import Header from "../Header";
// import Sidebar from "../Sidebar";
// import { DatePicker, Space } from "antd";
// import FeatherIcon from "feather-icons-react/build/FeatherIcon";
// import Select from "react-select";
// // import { TextField } from "@mui/material";
// import { Link } from "react-router-dom";
// import { TimePicker } from "antd";

// const AddRestaurant = () => {
//   const [isClicked, setIsClicked] = useState(false);
//   const [value, setValue] = useState(null);
//   const [value2, setValue2] = useState(null);
//   // const [startTime, setStartTime] = useState();
//   const [endTime, setEndTime] = useState();
//   const [selectedOption, setSelectedOption] = useState(null);
//   const [doctor, setDoctor] = useState([
//     // { value: 1, label: "Select Doctor" },
//     { value: 2, label: "Cloud Kitchen" },
//     { value: 3, label: "Kitchen" },
//     { value: 4, label: "Cafe" },
//   ]);
//   const onChange = (date, dateString) => {
//     // console.log(date, dateString);
//     setIsClicked(true);
//   };
//   const onChange1 = (time) => {
//     setValue(time);
//   };
//   const onChange2 = (time) => {
//     setValue2(time);
//   };
//   const loadFile = (event) => {
//     // Handle file loading logic here
//   };

//   return (
//     <div>
//       <Header />
//       <Sidebar
//         id="menu-item4"
//         id1="menu-items4"
//         activeClassName="add-appoinment"
//       />
//       <>
//         <div className="page-wrapper">
//           <div className="content">
//             {/* Page Header */}
//             <div className="page-header">
//               <div className="row">
//                 <div className="col-sm-12">
//                   <ul className="breadcrumb">
//                     <li className="breadcrumb-item">
//                       <Link style={{ color: "#403222" }} to="#">
//                         Restaurant{" "}
//                       </Link>
//                     </li>
//                     <li className="breadcrumb-item">
//                       <i className="feather-chevron-right">
//                         <FeatherIcon
//                           style={{ color: "#403222" }}
//                           icon="chevron-right"
//                         />
//                       </i>
//                     </li>
//                     <li
//                       style={{ color: "#c1a078" }}
//                       className="breadcrumb-item active"
//                     >
//                       Add Restaurant
//                     </li>
//                   </ul>
//                 </div>
//               </div>
//             </div>
//             {/* /Page Header */}
//             <div className="row">
//               <div className="col-sm-12">
//                 <div className="card">
//                   <div className="card-body">
//                     <form>
//                       {/* --------------------- */}
//                       <div className="row">
//                         {/* <div className="col-12">
//                           <div className="form-heading">
//                             <h4>Patient Details</h4>
//                           </div>
//                         </div>
//                         <div className="col-12 col-md-6 col-xl-4">
//                           <div className="form-group local-forms">
//                             <label>
//                               First Name <span className="login-danger">*</span>
//                             </label>
//                             <input className="form-control" type="text" />
//                           </div>
//                         </div>
//                         <div className="col-12 col-md-6 col-xl-4">
//                           <div className="form-group local-forms">
//                             <label>
//                               Last Name <span className="login-danger">*</span>
//                             </label>
//                             <input className="form-control" type="text" />
//                           </div>
//                         </div>
//                         <div className="col-12 col-md-6 col-xl-4">
//                           <div className="form-group select-gender">
//                             <label className="gen-label">
//                               Gender<span className="login-danger">*</span>
//                             </label>
//                             <div className="form-check-inline">
//                               <label className="form-check-label">
//                                 <input
//                                   type="radio"
//                                   name="gender"
//                                   className="form-check-input"
//                                 />
//                                 Male
//                               </label>
//                             </div>
//                             <div className="form-check-inline">
//                               <label className="form-check-label">
//                                 <input
//                                   type="radio"
//                                   name="gender"
//                                   className="form-check-input"
//                                 />
//                                 Female
//                               </label>
//                               </div>
//                           </div>
//                         </div>
//                                         <div className="col-12 col-md-6 col-xl-6">
//                           <div className="form-group local-forms">
//                             <label>
//                               Mobile <span className="login-danger">*</span>
//                             </label>
//                             <input className="form-control" type="text" />
//                           </div>
//                         </div>
//                         <div className="col-12 col-md-6 col-xl-6">
//                           <div className="form-group local-forms">
//                             <label>
//                               Email <span className="login-danger">*</span>
//                             </label>
//                             <input className="form-control" type="email" />
//                           </div>
//                         </div>
//                         <div className="col-12 col-sm-12">
//                           <div className="form-group local-forms">
//                             <label>
//                               Address <span className="login-danger">*</span>
//                             </label>
//                             <textarea
//                               className="form-control"
//                               rows={3}
//                               cols={30}
//                               defaultValue={""}
//                             />
//                           </div>
//                         </div> */}
//                         {/* --------------------------- */}
//                         <div className="col-12">
//                           <div className="form-heading">
//                             <h4>Restaurant Details</h4>
//                           </div>
//                         </div>
//                         <div className="col-12 col-md-6 col-xl-4">
//                           <div className="col-12 col-md-6 col-xl-4">
//                           <div className="form-group select-gender">
//                             <label className="gen-label">
//                               Business Type<span className="login-danger">*</span>
//                             </label>
//                             <div className="form-check-inline">
//                               <label style={{ color: "#403222" }} className="form-check-label">
//                                 <input
//                                   type="radio"
//                                   name="businessType"
//                                   className="form-check-input"
//                                 />
//                                 Restaurant
//                               </label>
//                             </div>
//                             <div className="form-check-inline">
//                               <label style={{ color: "#403222" }} className="form-check-label">
//                                 <input
//                                   type="radio"
//                                   name="businessType"
//                                   className="form-check-input"
//                                 />
//                                 Resort
//                               </label>
//                               </div>
//                           </div>
//                         </div>
//                         </div>
                        
//                         <div className="col-12 col-md-6 col-xl-4">
//                           <div className="form-group local-forms">
                           
//                             <div className="">
//                             </div>
//                           </div>
//                         </div>

//                         <div className="col-12 col-md-6 col-xl-6">
//                           <div className="form-group local-forms">
//                             <label>Outlet Type</label>
//                             <Select
//                               defaultValue={selectedOption}
//                               onChange={setSelectedOption}
//                               options={doctor}
//                               menuPortalTarget={document.body}
//                               id="search-commodity"
//                               components={{
//                                 IndicatorSeparator: () => null,
//                               }}
//                               styles={{
//                                 menuPortal: (base) => ({
//                                   ...base,
//                                   zIndex: 9999,
//                                 }),
//                                 control: (baseStyles, state) => ({
//                                   ...baseStyles,
//                                   borderColor: state.isFocused
//                                     ? "none"
//                                     : "2px solid rgba(46, 55, 164, 0.1);",
//                                   boxShadow: state.isFocused
//                                     ? "0 0 0 1px #2e37a4"
//                                     : "none",
//                                   "&:hover": {
//                                     borderColor: state.isFocused
//                                       ? "none"
//                                       : "2px solid rgba(46, 55, 164, 0.1)",
//                                   },
//                                   borderRadius: "10px",
//                                   fontSize: "14px",
//                                   minHeight: "45px",
//                                 }),
//                                 dropdownIndicator: (base, state) => ({
//                                   ...base,
//                                   transform: state.selectProps.menuIsOpen
//                                     ? "rotate(-180deg)"
//                                     : "rotate(0)",
//                                   transition: "250ms",
//                                   width: "35px",
//                                   height: "35px",
//                                 }),
//                               }}
//                             />
//                           </div>
//                         </div>
//                         <div className="col-12 col-md-6 col-xl-6">
//                           <div className="form-group local-forms">
//                             <label>Business Name </label>
//                             <input className="form-control" type="text" />
//                           </div>
//                         </div>
                        
//                         <div className="col-12 col-md-6 col-xl-6">
//                           <div className="form-group local-forms">
//                             <label>GST NO. </label>
//                             <input className="form-control" type="text" />
//                           </div>
//                         </div>
                        
//                         <div className="col-12 col-md-6 col-xl-6">
//                           <div className="form-group local-forms">
//                             <label>FSSAI NO. </label>
//                             <input className="form-control" type="text" />
//                           </div>
//                         </div>
                        
//                         <div className="col-12 col-md-6 col-xl-6">
//                           <div className="form-group local-top-form">
//                             <label className="local-top">
//                               Image <span className="login-danger">*</span>
//                             </label>
//                             <div className="settings-btn upload-files-avator">
//                               <input
//                                 type="file"
//                                 accept="image/*"
//                                 name="image"
//                                 id="file"
//                                 onChange={loadFile}
//                                 className="hide-input"
//                               />
//                               <label htmlFor="file" className="upload">
//                                 Choose File
//                               </label>
//                             </div>
//                           </div>
//                         </div>
//                         <div className="col-12">
//                           <div className="doctor-submit text-end">
//                             <button
//                               type="submit"
//                               className="btn btn-primary submit-form me-2"
//                             >
//                               Submit
//                             </button>
//                             <button
//                               type="submit"
//                               className="btn btn-primary cancel-form"
//                             >
//                               Cancel
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     </form>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
          
//         </div>
//       </>
//     </div>
//   );
// };

// export default AddRestaurant;
