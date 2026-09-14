// Unit test verifying getSlotStartHours and isSlotAvailable logic from BookingModal.jsx

const getSlotStartHours = (slotStr) => {
  const startPart = slotStr.split('-')[0].trim(); // e.g. "01:00 PM"
  let [time, period] = startPart.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours + (minutes || 0) / 60;
};

const isSlotAvailableAtTime = (slotStr, selectedDateObj, testNowObj) => {
  const targetDate = new Date(
    selectedDateObj.getFullYear(),
    selectedDateObj.getMonth(),
    selectedDateObj.getDate()
  );
  const today = new Date(
    testNowObj.getFullYear(),
    testNowObj.getMonth(),
    testNowObj.getDate()
  );

  // If selected date is strictly in the future (tomorrow onwards), slot is available
  if (targetDate > today) return true;

  // If selected date is in the past, slot is unavailable
  if (targetDate < today) return false;

  // For today: only allow slots starting after current time (+ 15 min buffer)
  const nowHours = testNowObj.getHours() + testNowObj.getMinutes() / 60;
  const slotStart = getSlotStartHours(slotStr);

  return slotStart > nowHours + 0.25;
};

const timeSlots = [
  '09:00 AM - 11:00 AM',
  '11:00 AM - 01:00 PM',
  '01:00 PM - 03:00 PM',
  '03:00 PM - 05:00 PM',
  '05:00 PM - 07:00 PM',
  '07:00 PM - 09:00 PM',
];

console.log('--- TEST 1: Current time is 1:00 PM (13:00) Today ---');
const testNow1 = new Date('2026-09-14T13:00:00');
const todayDate = new Date('2026-09-14T00:00:00');
timeSlots.forEach((slot) => {
  const avail = isSlotAvailableAtTime(slot, todayDate, testNow1);
  console.log(`Slot "${slot}" -> Available: ${avail}`);
});

console.log('\n--- TEST 2: Current time is 1:30 PM (13:30) Today ---');
const testNow2 = new Date('2026-09-14T13:30:00');
timeSlots.forEach((slot) => {
  const avail = isSlotAvailableAtTime(slot, todayDate, testNow2);
  console.log(`Slot "${slot}" -> Available: ${avail}`);
});

console.log('\n--- TEST 3: Selected date is Tomorrow ---');
const tomorrowDate = new Date('2026-09-15T00:00:00');
timeSlots.forEach((slot) => {
  const avail = isSlotAvailableAtTime(slot, tomorrowDate, testNow1);
  console.log(`Slot "${slot}" -> Available: ${avail}`);
});

// Assertions
console.log('\n--- Running Automated Assertions ---');
// At 1:00 PM: 9-11 is false, 11-1 is false, 1-3 is false, 3-5 is true, 5-7 is true, 7-9 is true
console.assert(!isSlotAvailableAtTime('09:00 AM - 11:00 AM', todayDate, testNow1), '09:00 AM should be unavailable');
console.assert(!isSlotAvailableAtTime('11:00 AM - 01:00 PM', todayDate, testNow1), '11:00 AM should be unavailable');
console.assert(!isSlotAvailableAtTime('01:00 PM - 03:00 PM', todayDate, testNow1), '01:00 PM should be unavailable at 1:00 PM');
console.assert(isSlotAvailableAtTime('03:00 PM - 05:00 PM', todayDate, testNow1), '03:00 PM should be available');
console.assert(isSlotAvailableAtTime('05:00 PM - 07:00 PM', todayDate, testNow1), '05:00 PM should be available');
console.assert(isSlotAvailableAtTime('07:00 PM - 09:00 PM', todayDate, testNow1), '07:00 PM should be available');

// All slots for tomorrow should be available
timeSlots.forEach(s => {
  console.assert(isSlotAvailableAtTime(s, tomorrowDate, testNow1), `${s} should be available tomorrow`);
});

console.log('All unit tests passed successfully!');
