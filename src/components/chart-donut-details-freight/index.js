// import React from "react";
// import { Pie } from "@ant-design/plots";

// export default function DonutGraph({ values }) {


//   const data = [
//     {
//       type: "Finalizadas com\nSucesso",
//       value: values.deliveredSuccessfull,
//     },
//     {
//       type: "Finalizadas com\nOcorrência",
//       value: values.deliveredWithOcorrency,
//     },

//     {
//       type: "Em Transito\nPendentes",
//       value: values.inTransitPending,
//     },
//     {
//       type: "Em Transito\ncom Ocorrência",
//       value: values.inTransitWithOcorrency,
//     },
//   ];
//   const config = {
//     appendPadding: 10,
//     data,
//     angleField: "value",
//     colorField: "type",
//     color: ["#0e8a16", "#f5425d", "#3186f5", "#fcfc14"],
//     radius: 1,
//     innerRadius: 0.64,

//     label: {
//       type: "inner",
//       offset: "-50%",
//       style: {
//         textAlign: "center",
//       },
//       autoRotate: false,
//       content: "{value}; ",
//     },

//     interactions: [
//       {
//         type: "element-selected",
//       },
//       {
//         type: "element-active",
//       },
//       {
//         type: "pie-statistic-active",
//       },
//     ],
//   };
//   return <Pie {...config} />;
// }
