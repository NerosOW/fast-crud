import { daterangeFormatter, datetimerangeFormatter, shortcuts } from "../functions";
import { uiContext } from "../../ui";

export default function () {
  const ui = uiContext.get();
  return {
    datetime: {
      form: {
        component: {
          //el-date-picker,a-date-picker
          ...ui.datePicker.buildDateType("datetime"),
          vModel: ui.datePicker.modelValue
        }
      },
      column: {
        width: "170px",
        component: { name: "fs-date-format" }
      }
    },
    date: {
      form: {
        component: {
          //el-date-picker,a-date-picker
          ...ui.datePicker.buildDateType("date"),
          vModel: ui.datePicker.modelValue
        }
      },
      column: {
        align: "center",
        width: 120,
        component: { name: "fs-date-format", format: "YYYY-MM-DD" }
      }
    },
    daterange: {
      form: {
        component: {
          //el-date-picker,a-date-picker
          ...ui.datePicker.buildDateType("daterange"),
          vModel: ui.datePicker.modelValue
        }
      },
      column: { width: 210, formatter: daterangeFormatter }
    },
    datetimerange: {
      form: {
        component: {
          ...ui.datePicker.buildDateType("datetimerange"),
          vModel: ui.datePicker.modelValue
        }
      },
      column: {
        width: 340,
        formatter: datetimerangeFormatter
      }
    },
    time: {
      form: {
        component: {
          //el-time-picker,a-time-picker
          name: ui.timePicker.name,
          vModel: ui.timePicker.modelValue
        }
      },
      column: {
        width: 100,
        align: "center",
        component: { name: "fs-date-format", format: "HH:mm:ss" }
      }
    }
  };
}
