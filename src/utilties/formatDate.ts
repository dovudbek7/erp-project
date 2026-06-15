import moment from "moment";

function formatDate(date: any) {
  return moment(date).format("MMM D YYYY");
}

export default formatDate;
