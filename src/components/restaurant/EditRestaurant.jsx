// /* eslint-disable react/jsx-no-duplicate-props */
// /* eslint-disable no-unused-vars */
// import React, { useState } from "react";
// import Header from "../Header";
// import Sidebar from "../Sidebar";
// import { favicon, imagesend } from "../imagepath";
// import { DatePicker} from "antd";
// import FeatherIcon from "feather-icons-react";
// import { Link } from "react-router-dom";
// import Select from "react-select";
// // import { TextField } from "@mui/material";
// import { TimePicker } from 'antd';

// const EditRestaurant = () => {
//   const [startTime, setStartTime] = useState();
//   // const [endTime, setEndTime] = useState();
//   const [value, setValue] = useState(null);
//   const [value2, setValue2] = useState(null);
//   const onChange1 = (time) => {
//     setValue(time);
//   };
//   const onChange2 = (time) => {
//     setValue2(time);
//   };
//   const [show, setShow] = useState(false);
//   const [selectedOption, setSelectedOption] = useState(null);
//   const [doctor, setDoctor] = useState([
//     // { value: 1, label: "Select Doctor" },
//     { value: 2, label: "Dr.Bernardo James" },
//     { value: 3, label: "Dr.Andrea Lalema" },
//     { value: 4, label: "Dr.William Stephin" },
//   ]);
//   const onChange = (date, dateString) => {
//     // console.log(date, dateString);
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
//         activeClassName="edit-appoinment"
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
//                       <Link style={{ color: "#403222" }} to="#">Restaurant </Link>
//                     </li>
//                     <li className="breadcrumb-item">
//                       <i className="feather-chevron-right">
//                         <FeatherIcon style={{ color: "#403222" }} icon="chevron-right" />
//                       </i>
//                     </li>
//                     <li style={{ color: "#c1a078" }} className="breadcrumb-item active">Edit Restaurant</li>
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
//                       <div className="row">
//                         <div className="col-12">
                          
//                         </div>
                        
                        
                        
                        
//                         <div className="col-12">
//                           <div className="form-heading">
//                             <h4>Appointment Details</h4>
//                           </div>
//                         </div>
//                         <div className="col-12 col-md-6 col-xl-4">
//                           <div className="form-group local-forms cal-icon">
//                             <label>
//                               Date of Appointment{" "}
//                               <span className="login-danger">*</span>
//                             </label>
//                             <DatePicker
//                               className="form-control datetimepicker"
//                               onChange={onChange}
//                               suffixIcon={null}
//                             />
//                             {/* <input
//                         className="form-control datetimepicker"
//                         type="text"
//                         defaultValue="26-11-22"
//                       /> */}
//                           </div>
//                         </div>
//                         <div className="col-12 col-md-6 col-xl-4">
//                           <div className="form-group local-forms">
//                             <label>
//                               From <span className="login-danger">*</span>
//                             </label>
//                             <TimePicker value={value} onChange={onChange1} className="form-control"
//                                 id="outlined-controlled"/>
//                           </div>
//                         </div>
//                         <div className="col-12 col-md-6 col-xl-4">
//                           <div className="form-group local-forms">
//                             <label>
//                               To <span className="login-danger">*</span>
//                             </label>
//                             <TimePicker value={value2} onChange={onChange2} className="form-control"
//                                 id="outlined-controlled"/>
//                           </div>
//                         </div>
//                         <div className="col-12 col-md-6 col-xl-6">
//                           <div className="form-group local-forms">
//                             <label>Consulting Doctor</label>
//                             <Select
//                               defaultValue={selectedOption}
//                               onChange={setSelectedOption}
//                               options={doctor}
//                               menuPortalTarget={document.body}
//                               id="search-commodity"
//                               components={{
//                                 IndicatorSeparator: () => null
//                               }}
//                               styles={{
//                                 menuPortal: base => ({ ...base, zIndex: 9999 }),
//                                 control: (baseStyles, state) => ({
//                                   ...baseStyles,
//                                   borderColor: state.isFocused ?'none' : '2px solid rgba(46, 55, 164, 0.1);',
//                                    boxShadow: state.isFocused ? '0 0 0 1px #2e37a4' : 'none',
//                                   '&:hover': {
//                                     borderColor: state.isFocused ? 'none' : '2px solid rgba(46, 55, 164, 0.1)',
//                                   },
//                                   borderRadius: '10px',
//                                   fontSize: "14px",
//                                     minHeight: "45px",
//                                 }),
//                                 dropdownIndicator: (base, state) => ({
//                                   ...base,
//                                   transform: state.selectProps.menuIsOpen ? 'rotate(-180deg)' : 'rotate(0)',
//                                   transition: '250ms',
//                                   width: '35px',
//                                   height: '35px',
//                                 }),
//                               }}

//                             />
//                             {/* <select className="form-control select">
//                         <option>Select Doctor</option>
//                         <option>Dr.Bernardo James</option>
//                         <option>Dr.Andrea Lalema</option>
//                         <option>Dr.William Stephin</option>
//                       </select> */}
//                           </div>
//                         </div>
//                         <div className="col-12 col-md-6 col-xl-6">
//                           <div className="form-group local-forms">
//                             <label>Treatment </label>
//                             <input
//                               className="form-control"
//                               type="text"
//                               defaultValue="Blood Pressure"
//                             />
//                           </div>
//                         </div>
//                         <div className="col-12 col-sm-12">
//                           <div className="form-group local-forms">
//                             <label>
//                               Notes <span className="login-danger">*</span>
//                             </label>
//                             <textarea
//                               className="form-control"
//                               rows={3}
//                               cols={30}
//                               defaultValue={
//                                 "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliquat enim ad minim veniam, quriesstrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
//                               }
//                             />
//                           </div>
//                         </div>
//                         <div className="col-12 col-md-6 col-xl-6">
//                           <div className="form-group local-top-form">
//                             <label className="local-top">
//                               Avatar <span className="login-danger">*</span>
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
//                                  <label htmlFor="file" className="upload">
//                                 Choose File
//                               </label>
//                             </div>
//                             <div
//                               className="upload-images upload-sizee"
//                               style={{ display: show ? "none" : "block" }}
//                             >
//                               <img src={favicon} alt="Image" />
//                               <Link to="#" className="btn-icon logo-hide-btn">
//                                 <i
//                                   className="feather-x-circle"
//                                   onClick={() => setShow((s) => !s)}
//                                 >
//                                   <FeatherIcon icon="x-circle" />
//                                 </i>
//                               </Link>
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
//           <div className="notification-box">
//             <div className="msg-sidebar notifications msg-noti">
              
//               <div className="drop-scroll msg-list-scroll" id="msg_list">
                
//               </div>
              
//             </div>
//           </div>
//         </div>
//         <div
//           id="delete_patient"
//           className="modal fade delete-modal"
//           role="dialog"
//         >
//           <div className="modal-dialog modal-dialog-centered">
//             <div className="modal-content">
//               <div className="modal-body text-center">
//                 <img src={imagesend} alt="#" width={50} height={46} />
//                 <h3>Are you sure want to delete this ?</h3>
//                 <div className="m-t-20">
//                   {" "}
//                   <Link to="#" className="btn btn-white me-2" data-bs-dismiss="modal">
//                     Close
//                   </Link>
//                   <button type="submit" className="btn btn-danger">
//                     Delete
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </>
//     </div>
//   );
// };

// export default EditRestaurant;
