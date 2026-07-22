const MINUTE_MS = 60 * 1000;

function expandToBuckets(startTimeUTC, endTimeUTC, durationMinutes) {
  const buckets = [];
  const stepMs = durationMinutes * MINUTE_MS;
  let cursor = startTimeUTC.getTime();
  const end = endTimeUTC.getTime();
  while (cursor + stepMs <= end) {
    buckets.push(new Date(cursor));
    cursor += stepMs;
  }
  return buckets;
}

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

function applyBuffer(bookingStart, bookingEnd, bufferBeforeMinutes, bufferAfterMinutes) {
  return {
    start: new Date(bookingStart.getTime() - bufferBeforeMinutes * MINUTE_MS),
    end: new Date(bookingEnd.getTime() + bufferAfterMinutes * MINUTE_MS)
  };
}

module.exports = { expandToBuckets, rangesOverlap, applyBuffer };
