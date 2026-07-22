function cronIntervalMinutes(schedule) {
  const match = schedule.match(/^\*\/(\d+) \* \* \* \*$/);
  return match ? Number(match[1]) : 10;
}

module.exports = { cronIntervalMinutes };
