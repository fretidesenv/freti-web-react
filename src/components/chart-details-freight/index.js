// import React from "react";
// import { Gauge } from "@ant-design/plots";

// const GaugeGraphic = ({value}) => {
  
//   const config = {
//     percent: value / 100,
//     range: {
//       color: "#30BF78",
//     },
//     indicator: {
//       pointer: {
//         style: {
//           stroke: "#D0D0D0",
//         },
//       },
//       pin: {
//         style: {
//           stroke: "#D0D0D0",
//         },
//       },
//     },
//     axis: {
//       label: {
//         formatter(v) {

//           console.log(v)
//           return Number(v) * 100;
//         },
//       },
//       subTickLine: {
//         count: 3,
//       },
//     },
//     statistic: {
//       content: {
//         formatter: ({ percent }) => `${(percent * 100).toFixed(0)}`,
//         style: {
//           color: "rgba(0,0,0,0.65)",
//           fontSize: 18,
//         },
//       },
//     },
//   };
//   return <Gauge {...config} />;
// };

// export default GaugeGraphic;
