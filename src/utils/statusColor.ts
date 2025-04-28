import { StatusEnum } from "./enums";

export const getStatusColor = (status: StatusEnum) => {
  switch (status) {
    case StatusEnum.Waiting:
      return "#A0A0A0";
    case StatusEnum.TableReady:
      return "#2196F3";
    case StatusEnum.InLine:
      return "#FFC107";
    case StatusEnum.Seated:
      return "#4CAF50";
    case StatusEnum.Cancelled:
      return "#F44336";
    default:
      return "#999";
  }
};
export const getCompleteStatusColor = (status: StatusEnum) => {
  switch (status) {
    case StatusEnum.Seated:
      return "#4CAF50";
    case StatusEnum.Cancelled:
      return "#F44336";
    default:
      return "#999";
  }
};
export const getStatusIcon = (status: StatusEnum) => {
  switch (status) {
    case StatusEnum.Seated:
      return "check-circle";
    case StatusEnum.Cancelled:
      return "cancel";
    default:
      return "info";
  }
};
