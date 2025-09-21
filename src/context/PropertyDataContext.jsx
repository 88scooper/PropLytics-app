import React, { createContext, useContext } from 'react';
import { getAllProperties } from '@/lib/propertyData';

// Get all properties from the centralized data source
const allPropertiesData = getAllProperties();

// For backward compatibility, also provide the first property as the default
const richmondPropertyData = {
  id: 1,
  address: "403-311 Richmond St E",
  purchasePrice: 492000,
  interestRate: 5.2,
  currentBalance: 353258.23,
  paymentAmount: 1102.28,
  paymentHistory: [
    {
      date: "2027-01-28",
      principal: -738.28,
      interest: -364.0,
      remaining: 353258.23,
      total: -1102.28
    },
    {
      date: "2027-01-14",
      principal: -737.53,
      interest: -364.75,
      remaining: 353996.51,
      total: -1102.28
    },
    {
      date: "2026-12-31",
      principal: -736.77,
      interest: -365.51,
      remaining: 354734.04,
      total: -1102.28
    },
    {
      date: "2026-12-17",
      principal: -736.01,
      interest: -366.27,
      remaining: 355470.81,
      total: -1102.28
    },
    {
      date: "2026-12-03",
      principal: -735.26,
      interest: -367.02,
      remaining: 356206.82,
      total: -1102.28
    },
    {
      date: "2026-11-19",
      principal: -734.5,
      interest: -367.78,
      remaining: 356942.08,
      total: -1102.28
    },
    {
      date: "2026-11-05",
      principal: -733.75,
      interest: -368.53,
      remaining: 357676.58,
      total: -1102.28
    },
    {
      date: "2026-10-22",
      principal: -732.99,
      interest: -369.29,
      remaining: 358410.33,
      total: -1102.28
    },
    {
      date: "2026-10-08",
      principal: -732.24,
      interest: -370.04,
      remaining: 359143.32,
      total: -1102.28
    },
    {
      date: "2026-09-24",
      principal: -731.49,
      interest: -370.79,
      remaining: 359875.56,
      total: -1102.28
    },
    {
      date: "2026-09-10",
      principal: -730.74,
      interest: -371.54,
      remaining: 360607.05,
      total: -1102.28
    },
    {
      date: "2026-08-27",
      principal: -729.98,
      interest: -372.3,
      remaining: 361337.79,
      total: -1102.28
    },
    {
      date: "2026-08-13",
      principal: -729.23,
      interest: -373.05,
      remaining: 362067.77,
      total: -1102.28
    },
    {
      date: "2026-07-30",
      principal: -728.49,
      interest: -373.79,
      remaining: 362797.0,
      total: -1102.28
    },
    {
      date: "2026-07-16",
      principal: -727.74,
      interest: -374.54,
      remaining: 363525.49,
      total: -1102.28
    },
    {
      date: "2026-07-02",
      principal: -726.99,
      interest: -375.29,
      remaining: 364253.23,
      total: -1102.28
    },
    {
      date: "2026-06-18",
      principal: -726.24,
      interest: -376.04,
      remaining: 364980.22,
      total: -1102.28
    },
    {
      date: "2026-06-04",
      principal: -725.5,
      interest: -376.78,
      remaining: 365706.46,
      total: -1102.28
    },
    {
      date: "2026-05-21",
      principal: -724.75,
      interest: -377.53,
      remaining: 366431.96,
      total: -1102.28
    },
    {
      date: "2026-05-07",
      principal: -724.01,
      interest: -378.27,
      remaining: 367156.71,
      total: -1102.28
    },
    {
      date: "2026-04-23",
      principal: -723.26,
      interest: -379.02,
      remaining: 367880.72,
      total: -1102.28
    },
    {
      date: "2026-04-09",
      principal: -722.52,
      interest: -379.76,
      remaining: 368603.98,
      total: -1102.28
    },
    {
      date: "2026-03-26",
      principal: -721.78,
      interest: -380.5,
      remaining: 369326.5,
      total: -1102.28
    },
    {
      date: "2026-03-12",
      principal: -721.04,
      interest: -381.24,
      remaining: 370048.28,
      total: -1102.28
    },
    {
      date: "2026-02-26",
      principal: -720.3,
      interest: -381.98,
      remaining: 370769.32,
      total: -1102.28
    },
    {
      date: "2026-02-12",
      principal: -719.56,
      interest: -382.72,
      remaining: 371489.62,
      total: -1102.28
    },
    {
      date: "2026-01-29",
      principal: -718.82,
      interest: -383.46,
      remaining: 372209.18,
      total: -1102.28
    },
    {
      date: "2026-01-15",
      principal: -718.08,
      interest: -384.2,
      remaining: 372928.0,
      total: -1102.28
    },
    {
      date: "2026-01-01",
      principal: -717.34,
      interest: -384.94,
      remaining: 373646.08,
      total: -1102.28
    },
    {
      date: "2025-12-18",
      principal: -716.6,
      interest: -385.68,
      remaining: 374363.42,
      total: -1102.28
    },
    {
      date: "2025-12-04",
      principal: -715.87,
      interest: -386.41,
      remaining: 375080.02,
      total: -1102.28
    },
    {
      date: "2025-11-20",
      principal: -715.13,
      interest: -387.15,
      remaining: 375795.89,
      total: -1102.28
    },
    {
      date: "2025-11-06",
      principal: -714.4,
      interest: -387.88,
      remaining: 376511.02,
      total: -1102.28
    },
    {
      date: "2025-10-23",
      principal: -713.67,
      interest: -388.61,
      remaining: 377225.42,
      total: -1102.28
    },
    {
      date: "2025-10-09",
      principal: -712.93,
      interest: -389.35,
      remaining: 377939.09,
      total: -1102.28
    },
    {
      date: "2025-09-25",
      principal: -712.2,
      interest: -390.08,
      remaining: 378652.02,
      total: -1102.28
    },
    {
      date: "2025-09-11",
      principal: -711.47,
      interest: -390.81,
      remaining: 379364.22,
      total: -1102.28
    },
    {
      date: "2025-08-28",
      principal: -710.74,
      interest: -391.54,
      remaining: 380075.69,
      total: -1102.28
    },
    {
      date: "2025-08-14",
      principal: -710.01,
      interest: -392.27,
      remaining: 380786.43,
      total: -1102.28
    },
    {
      date: "2025-07-31",
      principal: -709.28,
      interest: -393.0,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2025-07-17",
      principal: -708.55,
      interest: -393.73,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2025-07-03",
      principal: -707.82,
      interest: -394.46,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2025-06-19",
      principal: -707.09,
      interest: -395.19,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2025-06-05",
      principal: -706.37,
      interest: -395.91,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2025-05-22",
      principal: -705.64,
      interest: -396.64,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2025-05-08",
      principal: -704.92,
      interest: -397.36,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2025-04-24",
      principal: -704.19,
      interest: -398.09,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2025-04-10",
      principal: -703.47,
      interest: -398.81,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2025-03-27",
      principal: -702.75,
      interest: -399.53,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2025-03-13",
      principal: -702.03,
      interest: -400.25,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2025-02-27",
      principal: -701.3,
      interest: -400.98,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2025-02-13",
      principal: -700.58,
      interest: -401.7,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2025-01-30",
      principal: -699.86,
      interest: -402.42,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2025-01-16",
      principal: -699.15,
      interest: -403.13,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2025-01-02",
      principal: -698.43,
      interest: -403.85,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2024-12-19",
      principal: -697.71,
      interest: -404.57,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2024-12-05",
      principal: -696.99,
      interest: -405.29,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2024-11-21",
      principal: -696.28,
      interest: -406.0,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2024-11-07",
      principal: -695.56,
      interest: -406.72,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2024-10-24",
      principal: -694.85,
      interest: -407.43,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2024-10-10",
      principal: -694.13,
      interest: -408.15,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2024-09-26",
      principal: -693.42,
      interest: -408.86,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2024-09-12",
      principal: -692.71,
      interest: -409.57,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2024-08-29",
      principal: -692.0,
      interest: -410.28,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2024-08-15",
      principal: -691.29,
      interest: -410.99,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2024-08-01",
      principal: -690.58,
      interest: -411.7,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2024-07-18",
      principal: -689.87,
      interest: -412.41,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2024-07-04",
      principal: -689.16,
      interest: -413.12,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2024-06-20",
      principal: -688.45,
      interest: -413.83,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2024-06-06",
      principal: -687.74,
      interest: -414.54,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2024-05-23",
      principal: -687.04,
      interest: -415.24,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2024-05-09",
      principal: -686.33,
      interest: -415.95,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2024-04-25",
      principal: -685.63,
      interest: -416.65,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2024-04-11",
      principal: -684.92,
      interest: -417.36,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2024-03-28",
      principal: -684.22,
      interest: -418.06,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2024-03-14",
      principal: -683.52,
      interest: -418.76,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2024-02-29",
      principal: -682.81,
      interest: -419.47,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2024-02-15",
      principal: -682.11,
      interest: -420.17,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2024-02-01",
      principal: -681.41,
      interest: -420.87,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2024-01-18",
      principal: -680.71,
      interest: -421.57,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2024-01-04",
      principal: -680.01,
      interest: -422.27,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2023-12-21",
      principal: -679.31,
      interest: -422.97,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2023-12-07",
      principal: -678.62,
      interest: -423.66,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2023-11-23",
      principal: -677.92,
      interest: -424.36,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2023-11-09",
      principal: -677.22,
      interest: -425.06,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2023-10-26",
      principal: -676.53,
      interest: -425.75,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2023-10-12",
      principal: -675.83,
      interest: -426.45,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2023-09-28",
      principal: -675.14,
      interest: -427.14,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2023-09-14",
      principal: -674.44,
      interest: -427.84,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2023-08-31",
      principal: -673.75,
      interest: -428.53,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2023-08-17",
      principal: -673.06,
      interest: -429.22,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2023-08-03",
      principal: -672.37,
      interest: -429.91,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2023-07-20",
      principal: -671.68,
      interest: -430.6,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2023-07-06",
      principal: -670.99,
      interest: -431.29,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2023-06-22",
      principal: -670.3,
      interest: -431.98,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2023-06-08",
      principal: -669.61,
      interest: -432.67,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2023-05-25",
      principal: -668.92,
      interest: -433.36,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2023-05-11",
      principal: -668.23,
      interest: -434.05,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2023-04-27",
      principal: -667.55,
      interest: -434.73,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2023-04-13",
      principal: -666.86,
      interest: -435.42,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2023-03-30",
      principal: -666.18,
      interest: -436.1,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2023-03-16",
      principal: -665.49,
      interest: -436.79,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2023-03-02",
      principal: -664.81,
      interest: -437.47,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2023-02-16",
      principal: -664.13,
      interest: -438.15,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2023-02-02",
      principal: -663.44,
      interest: -438.84,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2023-01-19",
      principal: -662.76,
      interest: -439.52,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2023-01-05",
      principal: -662.08,
      interest: -440.2,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2022-12-22",
      principal: -661.4,
      interest: -440.88,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2022-12-08",
      principal: -660.72,
      interest: -441.56,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2022-11-24",
      principal: -660.04,
      interest: -442.24,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2022-11-10",
      principal: -659.37,
      interest: -442.91,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2022-10-27",
      principal: -658.69,
      interest: -443.59,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2022-10-13",
      principal: -658.01,
      interest: -444.27,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2022-09-29",
      principal: -657.34,
      interest: -444.94,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2022-09-15",
      principal: -656.66,
      interest: -445.62,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2022-09-01",
      principal: -655.99,
      interest: -446.29,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2022-08-18",
      principal: -655.31,
      interest: -446.97,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2022-08-04",
      principal: -654.64,
      interest: -447.64,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2022-07-21",
      principal: -653.97,
      interest: -448.31,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2022-07-07",
      principal: -653.3,
      interest: -448.98,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2022-06-23",
      principal: -652.62,
      interest: -449.66,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2022-06-09",
      principal: -651.95,
      interest: -450.33,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2022-05-26",
      principal: -651.28,
      interest: -451.0,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2022-05-12",
      principal: -650.62,
      interest: -451.66,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2022-04-28",
      principal: -649.95,
      interest: -452.33,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2022-04-14",
      principal: -649.28,
      interest: -453.0,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2022-03-31",
      principal: -648.61,
      interest: -453.67,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2022-03-17",
      principal: -647.95,
      interest: -454.33,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2022-03-03",
      principal: -647.28,
      interest: -455.0,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2022-02-17",
      principal: -646.62,
      interest: -455.66,
      remaining: 0.0,
      total: -1102.28
    },
    {
      date: "2022-02-03",
      principal: -734.67,
      interest: -255.2,
      remaining: 0.0,
      total: -989.87
    },
    {
      date: "2022-01-20",
      principal: -734.24,
      interest: -255.63,
      remaining: 0.0,
      total: -989.87
    },
    {
      date: "2022-01-06",
      principal: -733.82,
      interest: -256.05,
      remaining: 0.0,
      total: -989.87
    },
    {
      date: "2021-12-23",
      principal: -733.4,
      interest: -256.47,
      remaining: 0.0,
      total: -989.87
    },
    {
      date: "2021-12-09",
      principal: -732.98,
      interest: -256.89,
      remaining: 0.0,
      total: -989.87
    },
    {
      date: "2021-11-25",
      principal: -732.56,
      interest: -257.31,
      remaining: 0.0,
      total: -989.87
    },
    {
      date: "2021-11-11",
      principal: -732.14,
      interest: -257.73,
      remaining: 0.0,
      total: -989.87
    },
    {
      date: "2021-10-28",
      principal: -731.72,
      interest: -258.15,
      remaining: 0.0,
      total: -989.87
    },
    {
      date: "2021-10-14",
      principal: -731.3,
      interest: -258.57,
      remaining: 0.0,
      total: -989.87
    },
    {
      date: "2021-09-30",
      principal: -730.88,
      interest: -258.99,
      remaining: 0.0,
      total: -989.87
    },
    {
      date: "2021-09-16",
      principal: -730.46,
      interest: -259.41,
      remaining: 0.0,
      total: -989.87
    },
    {
      date: "2021-09-02",
      principal: -730.04,
      interest: -259.83,
      remaining: 0.0,
      total: -989.87
    },
    {
      date: "2021-08-19",
      principal: -729.62,
      interest: -260.25,
      remaining: 0.0,
      total: -989.87
    },
    {
      date: "2021-08-05",
      principal: -729.2,
      interest: -260.67,
      remaining: 0.0,
      total: -989.87
    },
    {
      date: "2021-07-22",
      principal: -728.78,
      interest: -261.09,
      remaining: 0.0,
      total: -989.87
    },
    {
      date: "2021-07-08",
      principal: -728.36,
      interest: -261.51,
      remaining: 0.0,
      total: -989.87
    },
    {
      date: "2021-06-24",
      principal: -727.94,
      interest: -261.93,
      remaining: 0.0,
      total: -989.87
    },
    {
      date: "2021-06-10",
      principal: -727.52,
      interest: -262.35,
      remaining: 0.0,
      total: -989.87
    },
    {
      date: "2021-05-27",
      principal: -727.11,
      interest: -262.76,
      remaining: 0.0,
      total: -989.87
    },
    {
      date: "2021-05-13",
      principal: -726.69,
      interest: -263.18,
      remaining: 0.0,
      total: -989.87
    },
    {
      date: "2021-04-29",
      principal: -726.27,
      interest: -263.6,
      remaining: 0.0,
      total: -989.87
    },
    {
      date: "2021-04-15",
      principal: -725.85,
      interest: -264.02,
      remaining: 0.0,
      total: -989.87
    },
    {
      date: "2021-04-01",
      principal: -725.44,
      interest: -264.43,
      remaining: 0.0,
      total: -989.87
    },
    {
      date: "2021-03-18",
      principal: -725.02,
      interest: -264.85,
      remaining: 0.0,
      total: -989.87
    },
    {
      date: "2021-03-04",
      principal: -724.6,
      interest: -265.27,
      remaining: 0.0,
      total: -989.87
    },
    {
      date: "2021-02-18",
      principal: -724.19,
      interest: -265.68,
      remaining: 0.0,
      total: -989.87
    },
    {
      date: "2021-02-18",
      principal: 0.0,
      interest: 0.0,
      remaining: 0.0,
      total: -90.0
    },
    {
      date: "2021-02-04",
      principal: -1402.15,
      interest: -577.59,
      remaining: 0.0,
      total: -1979.74
    },
    {
      date: "2021-01-04",
      principal: -1400.41,
      interest: -579.33,
      remaining: 0.0,
      total: -1979.74
    },
    {
      date: "2020-12-04",
      principal: -1398.66,
      interest: -581.08,
      remaining: 0.0,
      total: -1979.74
    },
    {
      date: "2020-11-04",
      principal: -1396.92,
      interest: -582.82,
      remaining: 0.0,
      total: -1979.74
    },
    {
      date: "2020-10-04",
      principal: -1395.18,
      interest: -584.56,
      remaining: 0.0,
      total: -1979.74
    },
    {
      date: "2020-09-04",
      principal: -1393.45,
      interest: -586.29,
      remaining: 0.0,
      total: -1979.74
    },
    {
      date: "2020-08-04",
      principal: -1391.71,
      interest: -588.03,
      remaining: 0.0,
      total: -1979.74
    },
    {
      date: "2020-07-04",
      principal: -1389.98,
      interest: -589.76,
      remaining: 0.0,
      total: -1979.74
    },
    {
      date: "2020-06-04",
      principal: -1388.25,
      interest: -591.49,
      remaining: 0.0,
      total: -1979.74
    },
    {
      date: "2020-05-04",
      principal: -1386.52,
      interest: -593.22,
      remaining: 0.0,
      total: -1979.74
    },
    {
      date: "2020-04-04",
      principal: -1351.67,
      interest: -976.7,
      remaining: 0.0,
      total: -2328.37
    },
    {
      date: "2020-03-04",
      principal: -1139.42,
      interest: -1188.95,
      remaining: 0.0,
      total: -2328.37
    },
    {
      date: "2020-02-04",
      principal: -1136.59,
      interest: -1191.78,
      remaining: 0.0,
      total: -2328.37
    },
    {
      date: "2020-01-04",
      principal: -1133.78,
      interest: -1194.59,
      remaining: 0.0,
      total: -2328.37
    },
    {
      date: "2019-12-04",
      principal: -1130.97,
      interest: -1197.4,
      remaining: 0.0,
      total: -2328.37
    },
    {
      date: "2019-11-04",
      principal: -1128.16,
      interest: -1200.21,
      remaining: 0.0,
      total: -2328.37
    },
    {
      date: "2019-10-04",
      principal: -1125.37,
      interest: -1203.0,
      remaining: 0.0,
      total: -2328.37
    },
    {
      date: "2019-09-04",
      principal: -1122.58,
      interest: -1205.79,
      remaining: 0.0,
      total: -2328.37
    },
    {
      date: "2019-08-04",
      principal: -1119.8,
      interest: -1208.57,
      remaining: 0.0,
      total: -2328.37
    },
    {
      date: "2019-07-04",
      principal: -1117.02,
      interest: -1211.35,
      remaining: 0.0,
      total: -2328.37
    },
    {
      date: "2019-06-04",
      principal: -1114.25,
      interest: -1214.12,
      remaining: 0.0,
      total: -2328.37
    },
    {
      date: "2019-05-04",
      principal: -1111.49,
      interest: -1216.88,
      remaining: 0.0,
      total: -2328.37
    },
    {
      date: "2019-04-04",
      principal: -1108.74,
      interest: -1219.63,
      remaining: 0.0,
      total: -2328.37
    },
    {
      date: "2019-03-04",
      principal: -1105.99,
      interest: -1222.38,
      remaining: 0.0,
      total: -2328.37
    },
    {
      date: "2019-02-04",
      principal: 492000.0,
      interest: 0.0,
      remaining: 0.0,
      total: 492000.0
    }
  ]
};

// Create the React Context
const PropertyDataContext = createContext();

// Create the Provider component
export const PropertyDataProvider = ({ children }) => {
  // Provide both the legacy single property and all properties
  const contextValue = {
    // Legacy single property (for backward compatibility)
    ...richmondPropertyData,
    // All properties array
    allProperties: allPropertiesData,
    // Individual properties for easy access
    properties: allPropertiesData
  };
  
  return (
    <PropertyDataContext.Provider value={contextValue}>
      {children}
    </PropertyDataContext.Provider>
  );
};

// Custom hook to use the property data context
export const usePropertyData = () => {
  const context = useContext(PropertyDataContext);
  if (context === undefined) {
    throw new Error('usePropertyData must be used within a PropertyDataProvider');
  }
  return context;
};

// Export the context for direct use if needed
export { PropertyDataContext };

// To use this data in any component:
// 1. Wrap your App in <PropertyDataProvider> in your main index.js or App.js.
// 2. In the component that needs the data, import useContext and PropertyDataContext.
// 3. Call `const propertyData = useContext(PropertyDataContext);`
// 4. You can now access `propertyData.currentBalance`, `propertyData.paymentHistory`, etc.
//
// Example usage:
// import { usePropertyData } from './context/PropertyDataContext';
// 
// function MyComponent() {
//   const propertyData = usePropertyData();
//   
//   return (
//     <div>
//       <h2>{propertyData.address}</h2>
//       <p>Current Balance: ${propertyData.currentBalance.toLocaleString()}</p>
//       <p>Monthly Payment: ${propertyData.paymentAmount.toLocaleString()}</p>
//       <p>Interest Rate: {propertyData.interestRate}%</p>
//     </div>
//   );
// }
