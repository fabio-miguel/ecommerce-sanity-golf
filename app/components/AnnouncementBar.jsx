// import {useEffect, useState} from 'react';

// const AnnouncementBar = () => {
//   const [countDays, setCountDays] = useState(0);
//   const [countHours, setCountHours] = useState(0);
//   const [countMinutes, setCountMinutes] = useState(0);
//   const [countSeconds, setCountSeconds] = useState(0);

//   useEffect(() => {
//     setInterval(function () {
//       const countdownDate = new Date('2023-09-19T00:00:00Z').getTime();
//       const countNow = new Date().getTime();
//       const countTimeToDate = countdownDate - countNow;
//       setCountDays(Math.floor(countTimeToDate / (1000 * 60 * 60 * 24)));
//       setCountHours(
//         Math.floor(
//           (countTimeToDate % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
//         ),
//       );
//       setCountMinutes(
//         Math.floor((countTimeToDate % (1000 * 60 * 60)) / (1000 * 60)),
//       );
//       setCountSeconds(Math.floor((countTimeToDate % (1000 * 60)) / 1000));
//     }, 1000);
//   }, []);

//   return (
//     <div className="bg-slate-900 flex w-full px-4 py-4 ">
//       <div className="flex justify-start w-1/2 text-white m-auto">
//         Buy three, get 30 percent off
//       </div>
//       <div className="flex justify-end w-1/2 gap-2">
//         <div className="text-white text-center">
//           <span className="block">{countDays}</span>
//           <span className="block">Days</span>
//         </div>
//         <div className="text-white text-center">
//           <span className="block">{countHours}</span>
//           <span className="block">Hours</span>
//         </div>
//         <div className="text-white text-center">
//           <span className="block">{countMinutes}</span>
//           <span className="block">Minutes</span>
//         </div>
//         <div className="text-white text-center">
//           <span className="block">{countSeconds}</span>
//           <span className="block">Seconds</span>
//         </div>
//       </div>
//     </div>
//   );
// };
// export default AnnouncementBar;
