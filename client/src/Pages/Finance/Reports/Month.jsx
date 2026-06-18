export default function getMonthsInRange(range) {
  // console.log("Received range:", range);

  if (!Array.isArray(range) || range.length !== 2) {
    throw new Error("Invalid range: Must be an array with two date objects");
  }

  // Extract the Date objects from the range
  const [startDate, endDate] = range;

  // Check if either of the dates is invalid
  if (isNaN(startDate) || isNaN(endDate)) {
    throw new Error("Invalid date format in the range");
  }

  const startMonth = startDate.toLocaleString("default", { month: "short" });
  const startYear = startDate.getFullYear();
  const endMonth = endDate.toLocaleString("default", { month: "short" });
  const endYear = endDate.getFullYear();

  // Case: Same year and same month
  if (startYear === endYear && startMonth === endMonth) {
    return `${startMonth} ${startYear}`;
  }

  // Case: Same year, multiple months
  else if (startYear === endYear) {
    // If the range spans from January to December of the same year, show just the year
    if (startMonth === "Jan" && endMonth === "Dec") {
      return `${startYear}`;
    }
    return `${startMonth} - ${endMonth} ${startYear}`;
  }

  // Case: Different years - Handle month range for different years
  else {
    return `${startMonth} ${endYear} - ${endMonth} ${startYear}`;
  }
}
